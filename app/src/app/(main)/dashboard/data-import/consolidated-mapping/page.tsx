'use client';

import * as React from "react"
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, FileSpreadsheet, ArrowRight, Loader2, Eye, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ColumnDetection {
  columnName: string;
  suggestedField: string;
  confidence: number;
  dataType: string;
  sampleValues?: string[];
}

interface FileMapping {
  fileId: string;
  fileName: string;
  status: string;
  columnDetections: ColumnDetection[];
}

interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  isRequired: boolean;
  confidence: number;
  fileId: string;
  fileName: string;
}

// Standard field definitions with context distinction
const STANDARD_FIELDS = {
  inventory: [
    { value: 'item_name', label: 'Item Name (Inventory)', required: true, context: 'Stock items being tracked' },
    { value: 'sku_code', label: 'SKU Code (Inventory)', required: false, context: 'Inventory item identifier' },
    { value: 'quantity', label: 'Stock Quantity', required: true, context: 'Current stock level' },
    { value: 'unit_of_measure', label: 'Stock Unit (each, box, kg)', required: false, context: 'How inventory is counted' },
    { value: 'unit_cost', label: 'Unit Cost (Inventory)', required: false, context: 'Cost per inventory unit' },
    { value: 'location', label: 'Storage Location', required: false, context: 'Where inventory is stored' },
    { value: 'supplier_name', label: 'Supplier (Inventory)', required: false, context: 'Inventory supplier' },
  ],
  recipes: [
    { value: 'item_name', label: 'Recipe/Menu Item Name', required: true, context: 'Final dish or product name' },
    { value: 'ingredient_name', label: 'Recipe Ingredient', required: true, context: 'Ingredient used in recipe' },
    { value: 'quantity', label: 'Recipe Quantity', required: true, context: 'Amount needed for recipe' },
    { value: 'unit_of_measure', label: 'Recipe Unit (cups, grams, oz)', required: true, context: 'Measurement unit in recipe' },
    { value: 'size_modifier', label: 'Size Modifier (S/M/L)', required: false, context: 'Recipe portion size' },
    { value: 'modifier_quantity', label: 'Modifier Quantity', required: false, context: 'Quantity adjustment for size' },
  ],
  ingredients: [
    { value: 'name', label: 'Ingredient Name (Master)', required: true, context: 'Master ingredient record' },
    { value: 'sku_code', label: 'Ingredient SKU', required: false, context: 'Ingredient identifier code' },
    { value: 'unit_cost', label: 'Ingredient Cost', required: false, context: 'Cost per ingredient unit' },
    { value: 'package_size', label: 'Package Size', required: false, context: 'How ingredient is packaged' },
    { value: 'unit_of_measure', label: 'Purchase Unit (lb, kg, case)', required: true, context: 'Unit when purchasing' },
    { value: 'shelf_life_days', label: 'Shelf Life (Days)', required: false, context: 'How long ingredient lasts' },
    { value: 'storage_location', label: 'Storage Location', required: false, context: 'Where ingredient is stored' },
    { value: 'supplier_name', label: 'Ingredient Supplier', required: false, context: 'Who supplies this ingredient' },
  ],
  menu_items: [
    { value: 'product_name', label: 'Menu Item Name', required: true, context: 'Name on menu' },
    { value: 'product_category', label: 'Menu Category', required: false, context: 'Menu section (appetizers, mains, etc.)' },
    { value: 'selling_price', label: 'Menu Price', required: true, context: 'Price customers pay' },
    { value: 'pos_item_id', label: 'POS Item ID', required: false, context: 'Point of sale system ID' },
    { value: 'is_active', label: 'Menu Item Active', required: false, context: 'Currently available on menu' },
  ],
  orders: [
    { value: 'order_id', label: 'Order ID', required: true, context: 'Unique order identifier' },
    { value: 'customer_name', label: 'Customer (Orders)', required: false, context: 'Who placed the order' },
    { value: 'order_date', label: 'Order Date', required: true, context: 'When order was placed' },
    { value: 'item_name', label: 'Ordered Item', required: true, context: 'What was ordered' },
    { value: 'quantity', label: 'Order Quantity', required: true, context: 'How many were ordered' },
    { value: 'unit_price', label: 'Order Unit Price', required: false, context: 'Price per item ordered' },
    { value: 'total_amount', label: 'Order Total', required: false, context: 'Total for this line item' },
  ],
  suppliers: [
    { value: 'supplier_name', label: 'Supplier Name', required: true, context: 'Vendor company name' },
    { value: 'contact_email', label: 'Supplier Email', required: false, context: 'Supplier contact email' },
    { value: 'contact_phone', label: 'Supplier Phone', required: false, context: 'Supplier contact phone' },
    { value: 'address', label: 'Supplier Address', required: false, context: 'Supplier business address' },
  ],
  customers: [
    { value: 'customer_name', label: 'Customer Name', required: true, context: 'Customer full name' },
    { value: 'email', label: 'Customer Email', required: false, context: 'Customer contact email' },
    { value: 'phone', label: 'Customer Phone', required: false, context: 'Customer contact phone' },
    { value: 'address', label: 'Customer Address', required: false, context: 'Customer address' },
  ]
};

export default function ConsolidatedMappingPage() {
  const [fileMappings, setFileMappings] = useState<FileMapping[]>([]);
  const [allMappings, setAllMappings] = useState<ColumnMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Combine ALL fields from ALL domains
  const availableFields = [
    ...Object.entries(STANDARD_FIELDS).flatMap(([domain, fields]) => 
      fields.map(field => ({
        ...field,
        domain: domain,
        label: `${field.label}`,
        groupLabel: domain.charAt(0).toUpperCase() + domain.slice(1)
      }))
    )
  ].sort((a, b) => {
    if (a.domain !== b.domain) {
      return a.domain.localeCompare(b.domain);
    }
    if (a.required !== b.required) {
      return b.required ? 1 : -1;
    }
    return a.label.localeCompare(b.label);
  });

  // Load all files with their mappings
  useEffect(() => {
    const loadAllFileMappings = async () => {
      try {
        const response = await fetch('/api/data-ingestion/upload');
        if (response.ok) {
          const result = await response.json();
          
          const mappings: FileMapping[] = [];
          const consolidatedMappings: ColumnMapping[] = [];
          
          for (const upload of result.uploads) {
            if (upload.status === 'review_required' || upload.status === 'mapping_required' || upload.status === 'completed') {
              try {
                const statusResponse = await fetch(`/api/data-ingestion/status/${upload.id}`);
                if (statusResponse.ok) {
                  const statusData = await statusResponse.json();
                  
                  const fileMapping: FileMapping = {
                    fileId: upload.id,
                    fileName: upload.originalFilename,
                    status: upload.status,
                    columnDetections: statusData.columnDetections || []
                  };
                  
                  mappings.push(fileMapping);
                  
                  // Add to consolidated mappings
                  if (statusData.columnDetections) {
                    for (const detection of statusData.columnDetections) {
                      consolidatedMappings.push({
                        sourceColumn: detection.columnName,
                        targetField: detection.suggestedField,
                        isRequired: false,
                        confidence: detection.confidence,
                        fileId: upload.id,
                        fileName: upload.originalFilename
                      });
                    }
                  }
                }
              } catch (error) {
                console.error('Failed to fetch mappings for', upload.id, error);
              }
            }
          }
          
          setFileMappings(mappings);
          setAllMappings(consolidatedMappings);
        }
      } catch (error) {
        console.error('Error loading file mappings:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load file mappings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAllFileMappings();
  }, []);

  const updateMapping = (fileId: string, sourceColumn: string, targetField: string) => {
    setAllMappings(prev => prev.map(mapping =>
      mapping.fileId === fileId && mapping.sourceColumn === sourceColumn
        ? { ...mapping, targetField: targetField === '__none__' ? '' : targetField }
        : mapping
    ));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'High';
    if (confidence >= 70) return 'Medium';
    return 'Low';
  };

  // Get domains being used
  const getUsedDomains = () => {
    const mappedFields = allMappings.filter(m => m.targetField && m.targetField !== '__none__');
    const domains = new Set<string>();
    
    mappedFields.forEach(mapping => {
      const field = availableFields.find(f => f.value === mapping.targetField);
      if (field?.domain) {
        domains.add(field.domain);
      }
    });
    
    return Array.from(domains);
  };

  const handleApproveAll = async () => {
    setIsProcessing(true);
    
    try {
      // Process each file
      for (const fileMapping of fileMappings) {
        const fileMappings = allMappings.filter(m => m.fileId === fileMapping.fileId && m.targetField);
        
        if (fileMappings.length > 0) {
          // Update column mappings
          for (const mapping of fileMappings) {
            await fetch(`/api/data-ingestion/status/${fileMapping.fileId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'confirm_mapping',
                columnMappings: [{
                  sourceColumn: mapping.sourceColumn,
                  targetField: mapping.targetField,
                  transformationRules: null
                }]
              })
            });
          }
          
          // Mark as completed
          await fetch(`/api/data-ingestion/status/${fileMapping.fileId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_completed' })
          });
        }
      }
      
      toast({
        title: "✅ All Files Processed!",
        description: `Successfully processed ${fileMappings.length} files. Redirecting to dashboard overview...`,
      });
      
      // Navigate to dashboard overview page
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000); // 2 second delay to show the success message
      
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Processing failed",
        description: "Failed to process all files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex h-[450px] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading all file mappings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (fileMappings.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Column Mappings</h2>
            <p className="text-muted-foreground">
              Review and approve column mappings for all uploaded files
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-[300px] text-center">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg mb-2">No files ready for mapping</CardTitle>
            <p className="text-muted-foreground mb-4">Upload some files first to see their column mappings here.</p>
            <Button onClick={() => router.push('/dashboard/data-import')}>
              Go to Data Import
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Column Mappings</h2>
            <p className="text-muted-foreground">
              Review and approve column mappings for all uploaded files
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Files summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fileMappings.length}</div>
              <p className="text-xs text-muted-foreground">
                Files ready for mapping
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Columns</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allMappings.length}</div>
              <p className="text-xs text-muted-foreground">
                Columns to be mapped
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dashboard Domains</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUsedDomains().length}</div>
              <p className="text-xs text-muted-foreground">
                Target domains
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ready</div>
              <p className="text-xs text-muted-foreground">
                All mappings loaded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Domain detection */}
        {getUsedDomains().length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Mapped Domains</CardTitle>
              <CardDescription>
                Data will be available in these dashboard areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {getUsedDomains().map(domain => (
                  <Badge key={domain} variant="secondary" className="capitalize">
                    {domain.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4">
        {/* All column mappings in table format */}
        <Card>
          <CardHeader>
            <CardTitle>Column Mappings</CardTitle>
            <CardDescription>
              Review and adjust AI-suggested column mappings for all files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source File</TableHead>
                    <TableHead>Source Column</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Target Field</TableHead>
                    <TableHead className="w-[400px]">Mapping</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileMappings.map((fileMapping) => {
                    const fileMappings = allMappings.filter(m => m.fileId === fileMapping.fileId);
                    
                    return fileMappings.map((mapping, index) => {
                      const selectedField = availableFields.find(f => f.value === mapping.targetField);
                      const isFirstForFile = index === 0;
                      
                      return (
                        <TableRow key={`${mapping.fileId}-${mapping.sourceColumn}`}>
                          <TableCell className="font-medium">
                            {isFirstForFile ? (
                              <div className="flex items-center space-x-2">
                                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{fileMapping.fileName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {fileMappings.length} columns
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">↳ same file</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{mapping.sourceColumn}</div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getConfidenceColor(mapping.confidence)}
                            >
                              {getConfidenceLabel(mapping.confidence)} ({mapping.confidence}%)
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {selectedField ? (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{selectedField.label}</span>
                                {selectedField.required && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                                <Badge variant="outline" className="text-xs capitalize">
                                  {selectedField.domain}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not mapped</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={mapping.targetField || '__none__'}
                              onValueChange={(value) => updateMapping(mapping.fileId, mapping.sourceColumn, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select field..." />
                              </SelectTrigger>
                              <SelectContent className="w-full max-h-96">
                                <SelectItem value="__none__">
                                  <span className="text-muted-foreground">Don't map this column</span>
                                </SelectItem>
                                
                                {Object.entries(
                                  availableFields.reduce((groups, field) => {
                                    const domain = field.domain || 'other';
                                    if (!groups[domain]) groups[domain] = [];
                                    groups[domain].push(field);
                                    return groups;
                                  }, {} as Record<string, typeof availableFields>)
                                ).map(([domain, domainFields]) => (
                                  <div key={domain}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 border-b">
                                      📊 {domain.toUpperCase()} FIELDS
                                    </div>
                                    
                                    {domainFields.map(field => (
                                      <SelectItem key={field.value} value={field.value} className="pl-4">
                                        <div className="flex flex-col items-start w-full">
                                          <div className="flex items-center justify-between w-full">
                                            <span className={field.required ? 'font-medium' : ''}>
                                              {field.label}
                                            </span>
                                            <div className="flex gap-1 ml-2">
                                              {field.required && (
                                                <Badge variant="destructive" className="text-xs">
                                                  Required
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                          {(field as any).context && (
                                            <span className="text-xs text-muted-foreground mt-1">
                                              {(field as any).context}
                                            </span>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Ready to complete the import of {fileMappings.length} file{fileMappings.length === 1 ? '' : 's'}
          </p>
          <p className="text-xs text-muted-foreground">
            {allMappings.filter(m => m.targetField && m.targetField !== '__none__').length} of {allMappings.length} columns mapped
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            onClick={handleApproveAll}
            disabled={isProcessing || allMappings.filter(m => m.targetField).length === 0}
            size="lg"
            className="px-8"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Import & Go to Dashboard
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}