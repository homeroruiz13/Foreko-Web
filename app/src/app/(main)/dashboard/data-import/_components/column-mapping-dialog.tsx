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

  // Combine ALL fields from ALL domains instead of restricting to one entity type
  const availableFields = [
    // Add domain headers for organization
    ...Object.entries(STANDARD_FIELDS).flatMap(([domain, fields]) => 
      fields.map(field => ({
        ...field,
        domain: domain,
        label: `${field.label}`, // Keep original label
        groupLabel: domain.charAt(0).toUpperCase() + domain.slice(1) // For grouping
      }))
    )
  ].sort((a, b) => {
    // Sort by domain first, then by required status, then alphabetically
    if (a.domain !== b.domain) {
      return a.domain.localeCompare(b.domain);
    }
    if (a.required !== b.required) {
      return b.required ? 1 : -1; // Required fields first
    }
    return a.label.localeCompare(b.label);
  });

  // Detect which domains are being used based on mapped fields
  const getUsedDomains = () => {
    const mappedFields = mappings.filter(m => m.targetField && m.targetField !== '__none__');
    const domains = new Set<string>();
    
    mappedFields.forEach(mapping => {
      const field = availableFields.find(f => f.value === mapping.targetField);
      if (field?.domain) {
        domains.add(field.domain);
      }
    });
    
    return Array.from(domains);
  };

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
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            Review AI Results
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            AI has automatically processed {fileName}. Review and adjust the column mappings if needed.
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

          {/* Domain detection based on mapped fields */}
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {getUsedDomains().length > 0 ? (
                <>
                  <span className="text-sm font-medium">Mapped Domains:</span>
                  {getUsedDomains().map(domain => (
                    <Badge key={domain} variant="secondary" className="capitalize">
                      {domain.replace('_', ' ')}
                    </Badge>
                  ))}
                  <span className="text-sm text-muted-foreground">
                    Data will be available in these dashboard areas
                  </span>
                </>
              ) : (
                <>
                  <Badge variant="outline">
                    Multi-Domain Mapping Available
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Map columns to fields from any dashboard domain
                  </span>
                </>
              )}
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
                  <Card key={detection.columnName} className="p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
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

                      {/* Target field selection - spans 2 columns for better width */}
                      <div className="space-y-2 lg:col-span-2">
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
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select field..." />
                          </SelectTrigger>
                          <SelectContent className="w-full max-h-96">
                            <SelectItem value="__none__">
                              <span className="text-muted-foreground">Don't map this column</span>
                            </SelectItem>
                            
                            {/* Group fields by domain */}
                            {Object.entries(
                              availableFields.reduce((groups, field) => {
                                const domain = field.domain || 'other';
                                if (!groups[domain]) groups[domain] = [];
                                groups[domain].push(field);
                                return groups;
                              }, {} as Record<string, typeof availableFields>)
                            ).map(([domain, domainFields]) => (
                              <div key={domain}>
                                {/* Domain separator */}
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                                  📊 {domain.toUpperCase()} FIELDS
                                </div>
                                
                                {/* Fields in this domain */}
                                {domainFields.map(field => (
                                  <SelectItem key={field.value} value={field.value}>
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
                                        {(field as any).is_kpi_field && (
                                          <Badge variant="outline" className="text-xs">
                                            KPI
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        {mapping?.targetField && mapping.targetField !== '__none__' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            AI matched this with {detection.confidence}% confidence
                          </p>
                        )}
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
✅ Approve & Complete Pipeline
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}