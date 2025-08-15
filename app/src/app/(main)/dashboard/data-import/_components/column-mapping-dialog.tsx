'use client';

import { useState } from 'react';
import { Check, AlertCircle, Brain, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ColumnDetection {
  columnName: string;
  suggestedField: string;
  confidence: number;
  dataType: string;
  sampleValues?: string[];
}

interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  isRequired: boolean;
  confidence: number;
}

interface ColumnMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
  fileName: string;
  columnDetections: ColumnDetection[];
  onConfirmMapping: (mappings: ColumnMapping[]) => void;
}

// Standard field definitions based on your schema
const STANDARD_FIELDS = {
  inventory: [
    { value: 'item_name', label: 'Item Name', required: true },
    { value: 'sku_code', label: 'SKU Code', required: false },
    { value: 'quantity', label: 'Quantity', required: true },
    { value: 'unit_of_measure', label: 'Unit of Measure', required: true },
    { value: 'unit_cost', label: 'Unit Cost', required: false },
    { value: 'location', label: 'Storage Location', required: false },
    { value: 'supplier_name', label: 'Supplier', required: false },
  ],
  recipes: [
    { value: 'item_name', label: 'Recipe/Menu Item', required: true },
    { value: 'ingredient_name', label: 'Ingredient Name', required: true },
    { value: 'quantity', label: 'Quantity', required: true },
    { value: 'unit_of_measure', label: 'Unit of Measure', required: true },
    { value: 'size_modifier', label: 'Size Modifier', required: false },
    { value: 'modifier_quantity', label: 'Modifier Quantity', required: false },
  ],
  ingredients: [
    { value: 'name', label: 'Ingredient Name', required: true },
    { value: 'sku_code', label: 'SKU Code', required: false },
    { value: 'unit_cost', label: 'Unit Cost', required: false },
    { value: 'package_size', label: 'Package Size', required: false },
    { value: 'unit_of_measure', label: 'Unit of Measure', required: true },
    { value: 'shelf_life_days', label: 'Shelf Life (Days)', required: false },
    { value: 'storage_location', label: 'Storage Location', required: false },
    { value: 'supplier_name', label: 'Supplier', required: false },
  ],
  menu_items: [
    { value: 'product_name', label: 'Product Name', required: true },
    { value: 'product_category', label: 'Category', required: false },
    { value: 'selling_price', label: 'Selling Price', required: true },
    { value: 'pos_item_id', label: 'POS Item ID', required: false },
    { value: 'is_active', label: 'Is Active', required: false },
  ],
  orders: [
    { value: 'order_id', label: 'Order ID', required: true },
    { value: 'customer_name', label: 'Customer', required: false },
    { value: 'order_date', label: 'Order Date', required: true },
    { value: 'item_name', label: 'Item Name', required: true },
    { value: 'quantity', label: 'Quantity', required: true },
    { value: 'unit_price', label: 'Unit Price', required: false },
    { value: 'total_amount', label: 'Total Amount', required: false },
  ],
  suppliers: [
    { value: 'supplier_name', label: 'Supplier Name', required: true },
    { value: 'contact_email', label: 'Contact Email', required: false },
    { value: 'contact_phone', label: 'Contact Phone', required: false },
    { value: 'address', label: 'Address', required: false },
  ],
  customers: [
    { value: 'customer_name', label: 'Customer Name', required: true },
    { value: 'email', label: 'Email', required: false },
    { value: 'phone', label: 'Phone', required: false },
    { value: 'address', label: 'Address', required: false },
  ]
};

export function ColumnMappingDialog({
  open,
  onOpenChange,
  fileId,
  fileName,
  columnDetections,
  onConfirmMapping
}: ColumnMappingDialogProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>(() =>
    columnDetections.map(detection => ({
      sourceColumn: detection.columnName,
      targetField: detection.suggestedField,
      isRequired: false,
      confidence: detection.confidence
    }))
  );

  // Detect entity type based on suggested fields
  const detectedEntityType = columnDetections.length > 0 
    ? detectEntityType(columnDetections.map(d => d.suggestedField))
    : 'inventory';

  const availableFields = STANDARD_FIELDS[detectedEntityType as keyof typeof STANDARD_FIELDS] || STANDARD_FIELDS.inventory;

  function detectEntityType(suggestedFields: string[]): string {
    const fieldCounts = Object.entries(STANDARD_FIELDS).map(([entityType, fields]) => {
      const matchCount = suggestedFields.filter(field => 
        fields.some(f => f.value === field)
      ).length;
      return { entityType, matchCount };
    });

    return fieldCounts.reduce((best, current) => 
      current.matchCount > best.matchCount ? current : best
    ).entityType;
  }

  const updateMapping = (sourceColumn: string, targetField: string) => {
    setMappings(prev => prev.map(mapping =>
      mapping.sourceColumn === sourceColumn
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

  const requiredFieldsMapped = availableFields
    .filter(field => field.required)
    .every(field => mappings.some(mapping => mapping.targetField === field.value));

  const mappingProgress = (mappings.filter(m => m.targetField !== '').length / mappings.length) * 100;

  const handleConfirm = () => {
    const validMappings = mappings.filter(mapping => mapping.targetField !== '');
    onConfirmMapping(validMappings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Configure Column Mapping
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Map your data columns to standard fields for {fileName}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mapping Progress</span>
              <span>{Math.round(mappingProgress)}% Complete</span>
            </div>
            <Progress value={mappingProgress} />
          </div>

          {/* Entity type detection */}
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="capitalize">
                {detectedEntityType.replace('_', ' ')} Data
              </Badge>
              <span className="text-sm text-muted-foreground">
                Auto-detected based on your column names
              </span>
            </div>
          </div>

          {/* Column mappings */}
          <div className="space-y-4">
            <h3 className="font-medium">Column Mappings</h3>
            <div className="grid gap-4">
              {columnDetections.map((detection, index) => {
                const mapping = mappings.find(m => m.sourceColumn === detection.columnName);
                const selectedField = availableFields.find(f => f.value === mapping?.targetField);
                
                return (
                  <Card key={detection.columnName} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      {/* Source column */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Source Column</h4>
                        <div className="p-3 bg-muted rounded-md">
                          <p className="font-medium">{detection.columnName}</p>
                          {detection.sampleValues && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Sample: {detection.sampleValues.slice(0, 3).join(', ')}
                              {detection.sampleValues.length > 3 && '...'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Mapping arrow and confidence */}
                      <div className="flex flex-col items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant="outline" 
                            className={getConfidenceColor(detection.confidence)}
                          >
                            {getConfidenceLabel(detection.confidence)} ({detection.confidence}%)
                          </Badge>
                        </div>
                      </div>

                      {/* Target field selection */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">Target Field</h4>
                          {selectedField?.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <Select
                          value={mapping?.targetField || '__none__'}
                          onValueChange={(value) => updateMapping(detection.columnName, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Don't map this column</SelectItem>
                            {availableFields.map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{field.label}</span>
                                  {field.required && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Required fields validation */}
          {!requiredFieldsMapped && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Missing Required Fields</span>
              </div>
              <p className="text-sm text-yellow-700">
                Please map all required fields before proceeding. Required fields are marked with a red badge.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  // Reset to AI suggestions
                  setMappings(columnDetections.map(detection => ({
                    sourceColumn: detection.columnName,
                    targetField: detection.suggestedField,
                    isRequired: false,
                    confidence: detection.confidence
                  })));
                }}
              >
                Reset to AI Suggestions
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={!requiredFieldsMapped}
                className="min-w-[120px]"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirm Mapping
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}