// app/src/services/data-ingestion-pipeline.ts
import { sql } from '@/lib/db';
import { ClaudeMappingService } from './claude-mapping-service';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export interface PipelineOptions {
  autoMap?: boolean;
  autoValidate?: boolean;
  autoSync?: boolean;
  requireUserConfirmation?: boolean;
  qualityThreshold?: number;
}

export interface PipelineResult {
  success: boolean;
  fileId: string;
  status: string;
  recordsProcessed?: number;
  errors?: any[];
  qualityScore?: number;
  dashboards?: string[];
}

export class DataIngestionPipeline {
  private claudeService: ClaudeMappingService;
  private s3Client: S3Client;

  constructor() {
    this.claudeService = new ClaudeMappingService(process.env.ANTHROPIC_API_KEY!);
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Main pipeline execution method
   */
  async executePipeline(
    fileId: string,
    companyId: string,
    options: PipelineOptions = {}
  ): Promise<PipelineResult> {
    const steps = [
      { name: 'fetch', handler: this.fetchFile.bind(this) },
      { name: 'analyze', handler: this.analyzeFile.bind(this) },
      { name: 'map', handler: this.mapColumns.bind(this) },
      { name: 'validate', handler: this.validateData.bind(this) },
      { name: 'process', handler: this.processRecords.bind(this) },
      { name: 'quality', handler: this.assessQuality.bind(this) },
      { name: 'sync', handler: this.syncToDashboards.bind(this) },
    ];

    let currentStep = 0;
    let result: any = { fileId, companyId, options };

    try {
      for (const step of steps) {
        // Update processing queue
        await this.updateProcessingQueue(fileId, step.name, 'processing');
        
        // Execute step
        result = await step.handler(result);
        
        // Update progress
        currentStep++;
        const progress = (currentStep / steps.length) * 100;
        await this.updateProgress(fileId, progress, step.name);
        
        // Check if we should stop (e.g., user confirmation required)
        if (result.requiresUserAction) {
          break;
        }
      }

      return {
        success: true,
        fileId,
        status: result.status || 'completed',
        recordsProcessed: result.recordsProcessed,
        errors: result.errors,
        qualityScore: result.qualityScore,
        dashboards: result.dashboards,
      };

    } catch (error) {
      await this.handlePipelineError(fileId, error);
      return {
        success: false,
        fileId,
        status: 'failed',
        errors: [error instanceof Error ? error.message : 'Pipeline failed'],
      };
    }
  }

  /**
   * Step 1: Fetch file from storage
   */
  private async fetchFile(context: any) {
    const { fileId } = context;
    
    const fileResult = await sql`
      SELECT * FROM data_ingestion.file_uploads
      WHERE id = ${fileId}
    `;

    if (fileResult.length === 0) {
      throw new Error('File not found');
    }

    const file = fileResult[0];
    
    // Get file from S3
    const s3Key = file.storage_path.replace('s3://', '').split('/');
    const bucket = s3Key.shift();
    const key = s3Key.join('/');

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    
    const fileContent = Buffer.concat(chunks);

    return {
      ...context,
      file,
      fileContent,
    };
  }

  /**
   * Step 2: Analyze file structure and detect entity type
   */
  private async analyzeFile(context: any) {
    const { fileId, file, fileContent } = context;
    
    // Parse file to extract columns
    const { columns, sampleData } = await this.parseFileContent(
      fileContent,
      file.file_type
    );

    // Use Claude to detect entity type
    const entityDetection = await this.claudeService.detectEntityType(
      columns,
      file.original_filename,
      { companyId: file.company_id }
    );

    // Store analysis results
    await sql`
      UPDATE data_ingestion.file_uploads
      SET 
        detected_entity_type = ${entityDetection.entityType},
        detected_row_count = ${sampleData.length},
        detected_column_count = ${columns.length},
        status = 'analyzing'
      WHERE id = ${fileId}
    `;

    return {
      ...context,
      columns,
      sampleData,
      entityType: entityDetection.entityType,
    };
  }

  /**
   * Step 3: Map columns to standard fields
   */
  private async mapColumns(context: any) {
    const { fileId, columns, entityType, companyId, options } = context;
    
    // Get AI mapping suggestions
    const mappingSuggestions = await this.claudeService.suggestColumnMappings(
      columns,
      entityType,
      companyId
    );

    // Store AI suggestions
    for (const suggestion of mappingSuggestions) {
      await sql`
        INSERT INTO data_ingestion.ai_column_detection (
          file_upload_id,
          detected_column_name,
          suggested_standard_field,
          confidence_score,
          suggestion_reasoning
        ) VALUES (
          ${fileId},
          ${suggestion.sourceColumn},
          ${suggestion.targetField},
          ${suggestion.confidence},
          ${suggestion.reasoning}
        )
        ON CONFLICT (file_upload_id, detected_column_name) 
        DO UPDATE SET
          suggested_standard_field = ${suggestion.targetField},
          confidence_score = ${suggestion.confidence}
      `;
    }

    // Check if user confirmation is required
    const lowConfidenceMappings = mappingSuggestions.filter(m => m.confidence < 80);
    
    if (options.requireUserConfirmation && lowConfidenceMappings.length > 0) {
      await sql`
        UPDATE data_ingestion.file_uploads
        SET status = 'mapping_required'
        WHERE id = ${fileId}
      `;
      
      return {
        ...context,
        mappingSuggestions,
        requiresUserAction: true,
        status: 'mapping_required',
      };
    }

    // Auto-confirm high confidence mappings if enabled
    if (options.autoMap) {
      for (const suggestion of mappingSuggestions) {
        if (suggestion.confidence >= 80) {
          await sql`
            INSERT INTO data_ingestion.user_column_mappings (
              file_upload_id,
              source_column,
              target_field,
              is_required,
              confidence_score
            ) VALUES (
              ${fileId},
              ${suggestion.sourceColumn},
              ${suggestion.targetField},
              false,
              ${suggestion.confidence}
            )
            ON CONFLICT (file_upload_id, source_column)
            DO UPDATE SET
              target_field = ${suggestion.targetField},
              confidence_score = ${suggestion.confidence}
          `;
        }
      }
    }

    return {
      ...context,
      mappingSuggestions,
    };
  }

  /**
   * Step 4: Validate data against rules
   */
  private async validateData(context: any) {
    const { fileId, sampleData, mappingSuggestions, entityType } = context;
    
    // Get validation rules for entity type
    const validationRules = await sql`
      SELECT * FROM data_ingestion.validation_rules
      WHERE entity_type = ${entityType}
        AND is_active = true
    `;

    // Validate using Claude
    const { valid, errors } = await this.claudeService.validateAndTransformData(
      sampleData,
      mappingSuggestions,
      entityType
    );

    // Store validation errors
    for (const error of errors) {
      await sql`
        INSERT INTO data_ingestion.processing_errors (
          file_upload_id,
          row_number,
          error_type,
          error_message,
          severity_level
        ) VALUES (
          ${fileId},
          ${error.rowNumber},
          'validation_error',
          ${error.issue},
          'warning'
        )
      `;
    }

    return {
      ...context,
      validatedData: valid,
      validationErrors: errors,
    };
  }

  /**
   * Step 5: Process records into standardized format
   */
  private async processRecords(context: any) {
    const { fileId, validatedData, entityType, companyId } = context;
    
    let processedCount = 0;
    const targetDashboards = this.determineTargetDashboards(entityType);

    // Begin transaction for batch processing
    const batchSize = 100;
    
    for (let i = 0; i < validatedData.length; i += batchSize) {
      const batch = validatedData.slice(i, i + batchSize);
      
      for (const record of batch) {
        await sql`
          INSERT INTO data_ingestion.processed_records (
            file_upload_id,
            company_id,
            source_row_number,
            entity_type,
            standardized_data,
            target_dashboards,
            validation_status,
            data_quality_score
          ) VALUES (
            ${fileId},
            ${companyId},
            ${processedCount + 1},
            ${entityType},
            ${JSON.stringify(record)},
            ${targetDashboards},
            'passed',
            ${this.calculateRecordQuality(record)}
          )
        `;
        
        processedCount++;
      }
      
      // Update progress
      const progress = (processedCount / validatedData.length) * 100;
      await this.updateProgress(fileId, progress, 'processing_records');
    }

    return {
      ...context,
      recordsProcessed: processedCount,
      dashboards: targetDashboards,
    };
  }

  /**
   * Step 6: Assess overall data quality
   */
  private async assessQuality(context: any) {
    const { fileId, recordsProcessed, validationErrors } = context;
    
    const totalRecords = recordsProcessed + validationErrors.length;
    const qualityScore = (recordsProcessed / totalRecords) * 100;

    await sql`
      INSERT INTO data_ingestion.data_quality_metrics (
        file_upload_id,
        overall_quality_score,
        total_records,
        valid_records,
        error_records
      ) VALUES (
        ${fileId},
        ${qualityScore},
        ${totalRecords},
        ${recordsProcessed},
        ${validationErrors.length}
      )
    `;

    // Update file with quality score
    await sql`
      UPDATE data_ingestion.file_uploads
      SET data_quality_score = ${qualityScore}
      WHERE id = ${fileId}
    `;

    return {
      ...context,
      qualityScore,
    };
  }

  /**
   * Step 7: Sync to target dashboards
   */
  private async syncToDashboards(context: any) {
    const { fileId, dashboards, options } = context;
    
    if (!options.autoSync) {
      return context;
    }

    for (const dashboard of dashboards) {
      await sql`
        INSERT INTO data_ingestion.dashboard_sync_status (
          file_upload_id,
          dashboard_name,
          sync_status,
          last_sync_at
        ) VALUES (
          ${fileId},
          ${dashboard},
          'synced',
          NOW()
        )
        ON CONFLICT (file_upload_id, dashboard_name)
        DO UPDATE SET
          sync_status = 'synced',
          last_sync_at = NOW()
      `;

      // Trigger dashboard-specific export
      await this.exportToDashboard(fileId, dashboard);
    }

    // Mark file as exported
    await sql`
      UPDATE data_ingestion.file_uploads
      SET status = 'exported'
      WHERE id = ${fileId}
    `;

    return {
      ...context,
      status: 'exported',
    };
  }

  // Helper methods

  private async parseFileContent(content: Buffer, fileType: string) {
    // Implementation similar to the one in process-file-api
    // Returns { columns, sampleData }
    return { columns: [], sampleData: [] };
  }

  private determineTargetDashboards(entityType: string): string[] {
    const dashboardMap: Record<string, string[]> = {
      'inventory': ['inventory', 'executive'],
      'ingredients': ['inventory', 'recipes'],
      'recipes': ['recipes', 'inventory'],
      'menu_items': ['recipes', 'orders'],
      'orders': ['orders', 'executive', 'financial'],
      'suppliers': ['suppliers', 'executive'],
      'customers': ['customer', 'orders'],
      'financial': ['financial', 'executive'],
      'logistics': ['logistics', 'orders'],
    };
    
    return dashboardMap[entityType] || ['executive'];
  }

  private calculateRecordQuality(record: any): number {
    const fields = Object.values(record);
    const nonNullFields = fields.filter(f => f != null && f !== '');
    return (nonNullFields.length / fields.length) * 100;
  }

  private async updateProcessingQueue(fileId: string, step: string, status: string) {
    await sql`
      UPDATE data_ingestion.processing_queue
      SET 
        current_step = ${step},
        updated_at = NOW()
      WHERE file_upload_id = ${fileId}
    `;
  }

  private async updateProgress(fileId: string, progress: number, currentStep: string) {
    await sql`
      UPDATE data_ingestion.processing_queue
      SET 
        progress_percentage = ${progress},
        current_step = ${currentStep},
        updated_at = NOW()
      WHERE file_upload_id = ${fileId}
    `;
  }

  private async handlePipelineError(fileId: string, error: any) {
    await sql`
      UPDATE data_ingestion.file_uploads
      SET 
        status = 'failed',
        error_message = ${error instanceof Error ? error.message : 'Pipeline error'},
        processing_completed_at = NOW()
      WHERE id = ${fileId}
    `;

    await sql`
      INSERT INTO data_ingestion.processing_errors (
        file_upload_id,
        error_type,
        error_message,
        severity_level
      ) VALUES (
        ${fileId},
        'pipeline_error',
        ${error instanceof Error ? error.message : 'Unknown error'},
        'critical'
      )
    `;
  }

  private async exportToDashboard(fileId: string, dashboard: string) {
    // Dashboard-specific export logic
    const records = await sql`
      SELECT standardized_data
      FROM data_ingestion.processed_records
      WHERE file_upload_id = ${fileId}
        AND ${dashboard} = ANY(target_dashboards)
    `;

    // Transform and insert into dashboard-specific tables
    switch (dashboard) {
      case 'inventory':
        // Insert into inventory tables
        break;
      case 'orders':
        // Insert into orders tables
        break;
      case 'financial':
        // Insert into financial tables
        break;
      // Add other dashboards
    }
  }
}

export default DataIngestionPipeline;