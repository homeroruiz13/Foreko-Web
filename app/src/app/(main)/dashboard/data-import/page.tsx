'use client';

import * as React from "react"
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  Upload, 
  Plus, 
  X, 
  FileSpreadsheet, 
  Database,
  MoreHorizontal,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  RotateCcw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'analyzing' | 'mapping_required' | 'processing' | 'review_required' | 'completed' | 'failed';
  progress: number;
  errors?: string[];
  columnDetections?: Array<{
    columnName: string;
    suggestedField: string;
    confidence: number;
    dataType: string;
  }>;
  uploadedAt?: string;
}

export default function DataImportPage() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { auth, isAuthenticated, getAuthParams } = useAuth();

  // Load existing uploaded files when component mounts
  useEffect(() => {
    const loadExistingFiles = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      try {
        const authParams = getAuthParams();
        const response = await fetch(`/api/data-ingestion/upload?${authParams}`);
        if (response.ok) {
          const result = await response.json();
          
          const existingFiles: FileUpload[] = [];
          for (const upload of result.uploads) {
            let columnDetections = undefined;
            
            if (upload.status === 'review_required' || upload.status === 'mapping_required') {
              try {
                const statusResponse = await fetch(`/api/data-ingestion/status/${upload.id}?${authParams}`);
                if (statusResponse.ok) {
                  const statusData = await statusResponse.json();
                  columnDetections = statusData.columnDetections;
                }
              } catch (error) {
                console.error('Failed to fetch column detections for', upload.id, error);
              }
            }
            
            existingFiles.push({
              id: upload.id,
              name: upload.originalFilename,
              size: upload.fileSizeBytes,
              type: upload.fileType,
              status: upload.status as FileUpload['status'],
              progress: 100,
              columnDetections: columnDetections || undefined,
              uploadedAt: upload.uploadedAt,
            });
          }

          setFiles(existingFiles);
          
          if (existingFiles.length > 0) {
            toast({
              title: "Files loaded",
              description: `Found ${existingFiles.length} previously uploaded file${existingFiles.length === 1 ? '' : 's'}.`,
            });
          }
          
          existingFiles.forEach(file => {
            if (!['completed', 'failed', 'review_required', 'mapping_required'].includes(file.status)) {
              pollFileStatus(file.id);
            }
          });
        }
      } catch (error) {
        console.error('Error loading existing files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingFiles();
  }, [isAuthenticated, getAuthParams]);

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

    // Close dialog immediately when files are selected
    setUploadDialogOpen(false);

    for (const file of fileList) {
      if (!supportedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported format. Please use CSV, Excel, JSON, XML, or TXT files.`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
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
        uploadedAt: new Date().toISOString(),
      };

      setFiles(prev => [...prev, newFile]);
      await uploadFile(file, newFile.id);
    }
  };

  const uploadFile = async (file: File, fileId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('priority', 'normal');

      const updateProgress = (progress: number) => {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress, status: progress === 100 ? 'analyzing' : 'uploading' } : f
        ));
      };

      for (let i = 0; i <= 100; i += 20) {
        updateProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const authParams = getAuthParams();
      const response = await fetch(`/api/data-ingestion/upload?${authParams}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const backendFileId = result.fileUpload.id;
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          id: backendFileId,
          status: 'analyzing',
          progress: 100,
        } : f
      ));

      setFiles(prev => prev.map(f => 
        f.id === backendFileId ? { 
          ...f, 
          status: 'processing'
        } : f
      ));
      
      try {
        const pipelineResponse = await fetch(`/api/data-ingestion/complete-pipeline/${backendFileId}?${authParams}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (pipelineResponse.ok) {
          const pipelineResult = await pipelineResponse.json();
          
          const analyzeResponse = await fetch(`/api/data-ingestion/analyze/${backendFileId}?${authParams}`, {
            method: 'POST'
          });
          
          let columnDetections = [];
          if (analyzeResponse.ok) {
            const analyzeResult = await analyzeResponse.json();
            columnDetections = analyzeResult.mappingSuggestions?.map((s: any) => ({
              columnName: s.sourceColumn,
              suggestedField: s.targetField,
              confidence: s.confidence,
              dataType: 'text',
              reasoning: s.reasoning
            })) || [];
          }
          
          setFiles(prev => prev.map(f => 
            f.id === backendFileId ? { 
              ...f, 
              status: 'review_required',
              columnDetections
            } : f
          ));
          
          toast({
            title: "🤖 AI Processing Complete!",
            description: `${file.name} has been automatically processed. Created ${pipelineResult.pipeline_summary?.step3_processing?.processed_records || 0} records.`,
          });
          
        } else {
          const errorResult = await pipelineResponse.json();
          throw new Error(errorResult.details || 'AI processing failed');
        }
      } catch (pipelineError) {
        console.error('Auto-pipeline error:', pipelineError);
        
        const analyzeResponse = await fetch(`/api/data-ingestion/analyze/${backendFileId}`, {
          method: 'POST'
        });
        
        if (analyzeResponse.ok) {
          const analyzeResult = await analyzeResponse.json();
          
          setFiles(prev => prev.map(f => 
            f.id === backendFileId ? { 
              ...f, 
              status: 'review_required',
              columnDetections: analyzeResult.mappingSuggestions?.map((s: any) => ({
                columnName: s.sourceColumn,
                suggestedField: s.targetField,
                confidence: s.confidence,
                dataType: 'text',
                reasoning: s.reasoning
              }))
            } : f
          ));
        }
      }

      pollFileStatus(backendFileId);

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
      const authParams = getAuthParams();
      const response = await fetch(`/api/data-ingestion/status/${fileId}?${authParams}`);
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

      if (!['completed', 'failed', 'cancelled', 'review_required', 'mapping_required'].includes(status.status)) {
        setTimeout(() => pollFileStatus(fileId), 2000);
      }
    } catch (error) {
      console.error('Status polling error:', error);
    }
  }, [getAuthParams]);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      const authParams = getAuthParams();
      const response = await fetch(`/api/data-ingestion/clear-data?${authParams}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        setFiles([]);
        toast({
          title: "Data cleared successfully",
          description: `Deleted ${result.details.s3FilesDeleted} files from S3 and all database records.`,
        });
      } else {
        throw new Error('Failed to clear data');
      }
    } catch (error) {
      console.error('Clear data error:', error);
      toast({
        title: "Error clearing data",
        description: "Failed to clear all data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'analyzing':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'review_required':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'mapping_required':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'uploaded': return 'Upload complete';
      case 'analyzing': return 'Analyzing file...';
      case 'review_required': return 'Ready for review';
      case 'mapping_required': return 'Mapping required';
      case 'processing': return 'Processing...';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'analyzing':
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'review_required':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">Ready for Review</Badge>;
      case 'mapping_required':
        return <Badge variant="outline">Mapping Required</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Import</h2>
          <p className="text-muted-foreground">
            Upload and process your business data files with AI-powered column mapping.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">
                Uploaded Files
              </CardTitle>
              <CardDescription>
                {files.length === 0 ? 'No files uploaded yet' : `${files.length} file${files.length === 1 ? '' : 's'} uploaded`}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {files.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllData}
                  disabled={isClearing}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  {isClearing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Clear All
                </Button>
              )}
              
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upload Data Files</DialogTitle>
                    <DialogDescription>
                      Drag and drop files or click to select. Supports CSV, Excel, JSON, XML, and TXT files up to 50MB.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div
                      className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                        dragActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium">
                            Choose files or drag and drop
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            CSV, Excel, JSON, XML, TXT up to 50MB
                          </span>
                        </Label>
                        <Input
                          ref={fileInputRef}
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".csv,.xlsx,.xls,.json,.xml,.txt,.tsv"
                          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                          className="sr-only"
                        />
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                  <h3 className="font-semibold">No files uploaded</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by uploading your first data file.
                  </p>
                  <Button onClick={() => setUploadDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>
                            {getStatusIcon(file.status)}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                              <span>{file.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(file.status)}
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              {formatDate(file.uploadedAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {(file.status === 'uploading' || file.status === 'processing') ? (
                              <div className="w-[100px]">
                                <Progress value={file.progress} className="h-2" />
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                {getStatusText(file.status)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => removeFile(file.id)}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Review All Mappings Button */}
                {files.some(f => f.status === 'review_required' || f.status === 'mapping_required') && (
                  <div className="flex justify-center mt-6 pt-6 border-t">
                    <Button 
                      size="lg"
                      onClick={() => window.location.href = '/dashboard/data-import/consolidated-mapping'}
                      className="px-8 py-3 text-base font-semibold"
                    >
                      <Database className="w-5 h-5 mr-2" />
                      Review All Mappings & Complete Import
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}