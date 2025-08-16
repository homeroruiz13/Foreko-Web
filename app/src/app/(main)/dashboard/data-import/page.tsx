'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Clock, Plus, Rocket, FileSpreadsheet, Database, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ColumnMappingDialog } from "./_components/column-mapping-dialog";

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'analyzing' | 'mapping_required' | 'processing' | 'completed' | 'failed';
  progress: number;
  entityType?: string;
  errors?: string[];
  columnDetections?: Array<{
    columnName: string;
    suggestedField: string;
    confidence: number;
    dataType: string;
  }>;
}

export default function DataImportPage() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [selectedFileForMapping, setSelectedFileForMapping] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = async (fileList: File[]) => {
    const supportedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json',
      'text/xml',
      'application/xml',
      'text/plain',
      'text/tab-separated-values'
    ];

    for (const file of fileList) {
      if (!supportedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported format. Please use CSV, Excel, JSON, XML, or TXT files.`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 50MB limit.`,
          variant: "destructive",
        });
        continue;
      }

      const newFile: FileUpload = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        entityType: (selectedEntityType && selectedEntityType !== 'auto') ? selectedEntityType : undefined,
      };

      setFiles(prev => [...prev, newFile]);
      await uploadFile(file, newFile.id);
    }
  };

  const uploadFile = async (file: File, fileId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedEntityType && selectedEntityType !== 'auto') {
        formData.append('entityType', selectedEntityType);
      }
      formData.append('priority', 'normal');

      // Simulate upload progress
      const updateProgress = (progress: number) => {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress, status: progress === 100 ? 'analyzing' : 'uploading' } : f
        ));
      };

      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        updateProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const response = await fetch('/api/data-ingestion/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'uploaded',
          progress: 100,
          entityType: result.fileUpload.detectedEntityType
        } : f
      ));

      // Start polling for status updates
      pollFileStatus(fileId);

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded and is being analyzed.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'failed',
          errors: [error instanceof Error ? error.message : 'Unknown error']
        } : f
      ));

      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const pollFileStatus = useCallback(async (fileId: string) => {
    try {
      const response = await fetch(`/api/data-ingestion/status/${fileId}`);
      const status = await response.json();

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: status.status,
          progress: status.progress,
          errors: status.errors?.map((e: any) => e.message),
          columnDetections: status.columnDetections
        } : f
      ));

      // Continue polling if not in final state
      if (!['completed', 'failed', 'cancelled'].includes(status.status)) {
        setTimeout(() => pollFileStatus(fileId), 2000);
      }
    } catch (error) {
      console.error('Status polling error:', error);
    }
  }, []);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'analyzing':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'mapping_required':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'uploaded': return 'Upload complete';
      case 'analyzing': return 'Analyzing file...';
      case 'mapping_required': return 'Requires column mapping';
      case 'processing': return 'Processing data...';
      case 'completed': return 'Processing complete';
      case 'failed': return 'Processing failed';
      default: return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleOpenMapping = (fileId: string) => {
    setSelectedFileForMapping(fileId);
    setMappingDialogOpen(true);
  };

  const handleConfirmMapping = async (mappings: Array<{sourceColumn: string; targetField: string; isRequired: boolean; confidence: number}>) => {
    if (!selectedFileForMapping) return;

    try {
      const response = await fetch(`/api/data-ingestion/status/${selectedFileForMapping}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'confirm_mapping',
          columnMappings: mappings
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm mapping');
      }

      const result = await response.json();

      setFiles(prev => prev.map(f => 
        f.id === selectedFileForMapping ? { 
          ...f, 
          status: 'processing',
          progress: 0
        } : f
      ));

      // Start polling for processing status
      pollFileStatus(selectedFileForMapping);

      toast({
        title: "Mapping confirmed",
        description: "Your file is now being processed with the confirmed mappings.",
      });

    } catch (error) {
      console.error('Mapping confirmation error:', error);
      toast({
        title: "Mapping failed",
        description: "Failed to confirm column mappings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Import Data</h1>
          <p className="text-muted-foreground">Upload and process your business data files</p>
        </div>
      </div>

        {files.length === 0 ? (
          /* No data state - following proper design system */
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="max-w-2xl text-center space-y-8">
              {/* Main illustration */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-background rounded-full flex items-center justify-center">
                    <img src="/images/ForekoLogo.png" alt="Foreko Logo" className="w-24 h-24" />
                  </div>
                </div>
              </div>

              {/* Main heading */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">No data</h2>
                <p className="text-muted-foreground text-lg">
                  You may need
                </p>
              </div>

              {/* Action items matching reference design */}
              <div className="flex flex-col gap-6 max-w-md mx-auto">
                {/* Launch product */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground mb-1">Launch product</h3>
                    <p className="text-sm text-muted-foreground">
                      If you haven't launched your product yet, come back when you do.
                    </p>
                  </div>
                </div>

                {/* Waiting for data */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground mb-1">Waiting for data</h3>
                    <p className="text-sm text-muted-foreground">
                      Wait for your product running data.
                    </p>
                  </div>
                </div>

                {/* Adding data - clickable */}
                <div 
                  className="flex items-start gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Plus className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground mb-1">Adding data</h3>
                    <p className="text-sm text-muted-foreground">
                      Please add data manually on other pages.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data type selection */}
              <div className="space-y-4">
                <div className="max-w-sm mx-auto">
                  <label className="text-sm font-medium mb-2 block">Data type (optional)</label>
                  <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="recipes">Recipes/BOM</SelectItem>
                      <SelectItem value="ingredients">Ingredients</SelectItem>
                      <SelectItem value="menu_items">Menu Items</SelectItem>
                      <SelectItem value="orders">Orders</SelectItem>
                      <SelectItem value="suppliers">Suppliers</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="purchases">Purchases</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Drag and drop overlay */}
              <div
                className={`fixed inset-0 flex items-center justify-center transition-all duration-200 z-50 ${
                  dragActive 
                    ? 'bg-background/80 backdrop-blur-sm opacity-100' 
                    : 'opacity-0 pointer-events-none'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Card className="max-w-md mx-4">
                  <CardContent className="text-center space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-primary" />
                    <div className="space-y-2">
                      <CardTitle>Drop your files here</CardTitle>
                      <CardDescription>
                        Supports CSV, Excel, JSON, XML, TXT files up to 50MB
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.xlsx,.xls,.json,.xml,.txt,.tsv"
                onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          /* Files uploaded state */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Uploaded Files</h3>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Plus className="w-4 h-4 mr-2" />
                Add More Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.xlsx,.xls,.json,.xml,.txt,.tsv"
                onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                className="hidden"
              />
            </div>

            {files.map((file) => (
              <Card key={file.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {getStatusText(file.status)}
                        </p>
                      </div>
                    </div>
                    
                    {file.entityType && (
                      <Badge variant="secondary" className="capitalize">
                        {file.entityType.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="w-32">
                        <Progress value={file.progress} />
                      </div>
                    )}
                    
                    {file.status === 'mapping_required' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenMapping(file.id)}
                      >
                        Configure Mapping
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {file.errors && file.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800 font-medium mb-1">Errors:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {file.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

      {/* Column mapping dialog */}
        {selectedFileForMapping && (
          <ColumnMappingDialog
            open={mappingDialogOpen}
            onOpenChange={setMappingDialogOpen}
            fileId={selectedFileForMapping}
            fileName={files.find(f => f.id === selectedFileForMapping)?.name || ''}
            columnDetections={files.find(f => f.id === selectedFileForMapping)?.columnDetections || []}
            onConfirmMapping={handleConfirmMapping}
          />
        )}
    </div>
  );
}