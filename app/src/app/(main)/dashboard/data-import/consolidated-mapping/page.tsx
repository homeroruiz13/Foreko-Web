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
import { useAuth } from '@/hooks/use-auth';

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

// Standard field definitions with context distinction - ALL BACKEND FIELDS
const STANDARD_FIELDS = {
  inventory: [
    // Core Fields
    { value: 'item_name', label: 'Item Name', required: true, context: 'Stock item/product name' },
    { value: 'ingredient_name', label: 'Ingredient Name', required: false, context: 'Ingredient/component name' },
    { value: 'sku_code', label: 'SKU Code', required: false, context: 'Stock keeping unit code' },
    { value: 'category', label: 'Category', required: false, context: 'Product category' },
    { value: 'unit_of_measure', label: 'Unit of Measure', required: true, context: 'Measurement unit (each, box, kg)' },
    { value: 'unit_cost', label: 'Unit Cost', required: false, context: 'Cost per unit' },
    { value: 'package_size', label: 'Package Size', required: false, context: 'Package/container size' },
    { value: 'shelf_life_days', label: 'Shelf Life (Days)', required: false, context: 'Product shelf life' },
    { value: 'storage_location', label: 'Storage Location', required: false, context: 'Storage/bin location' },
    { value: 'supplier_name', label: 'Supplier Name', required: false, context: 'Primary supplier' },
    // Inventory Management
    { value: 'quantity', label: 'Current Quantity', required: true, context: 'Current stock level' },
    { value: 'current_quantity', label: 'Current Stock', required: false, context: 'Current inventory level' },
    { value: 'book_quantity', label: 'Book Quantity', required: false, context: 'System book quantity' },
    { value: 'physical_quantity', label: 'Physical Count', required: false, context: 'Physical count quantity' },
    { value: 'variance_quantity', label: 'Variance', required: false, context: 'Count variance amount' },
    { value: 'reorder_point', label: 'Reorder Point', required: false, context: 'Minimum reorder level' },
    { value: 'safety_stock', label: 'Safety Stock', required: false, context: 'Safety stock level' },
    { value: 'minimum_quantity', label: 'Min Quantity', required: false, context: 'Minimum stock allowed' },
    { value: 'maximum_quantity', label: 'Max Quantity', required: false, context: 'Maximum stock allowed' },
    // Velocity & Analytics
    { value: 'average_daily_usage', label: 'Avg Daily Usage', required: false, context: 'Daily usage rate' },
    { value: 'usage_variability', label: 'Usage Variability', required: false, context: 'Usage pattern variability' },
    { value: 'days_of_supply', label: 'Days of Supply', required: false, context: 'Days of supply available' },
    { value: 'turnover_rate', label: 'Turnover Rate', required: false, context: 'Inventory turnover rate' },
    { value: 'current_value', label: 'Current Value', required: false, context: 'Current inventory value' },
    { value: 'dead_stock_value', label: 'Dead Stock Value', required: false, context: 'Value of dead stock' },
    { value: 'last_movement_date', label: 'Last Movement', required: false, context: 'Last movement date' },
    { value: 'days_without_movement', label: 'Days No Movement', required: false, context: 'Days without activity' },
    // Cycle Count
    { value: 'count_date', label: 'Count Date', required: false, context: 'Physical count date' },
    { value: 'counted_by', label: 'Counted By', required: false, context: 'Person who counted' },
    { value: 'count_reason', label: 'Count Reason', required: false, context: 'Reason for count' },
    { value: 'is_accurate', label: 'Is Accurate', required: false, context: 'Count accuracy flag' },
    { value: 'accuracy_method', label: 'Count Method', required: false, context: 'Counting method used' },
    { value: 'tolerance_percentage', label: 'Tolerance %', required: false, context: 'Acceptable variance %' },
  ],
  orders: [
    // Order Identification
    { value: 'order_number', label: 'Order Number', required: false, context: 'Order number' },
    { value: 'order_id', label: 'Order ID', required: true, context: 'Unique order identifier' },
    { value: 'order_type', label: 'Order Type', required: false, context: 'Sales/purchase order' },
    { value: 'reference_number', label: 'Reference Number', required: false, context: 'Reference number' },
    { value: 'invoice_number', label: 'Invoice Number', required: false, context: 'Invoice number' },
    { value: 'po_number', label: 'PO Number', required: false, context: 'Purchase order number' },
    // Customer/Supplier Info
    { value: 'customer_name', label: 'Customer Name', required: false, context: 'Customer name' },
    { value: 'customer_code', label: 'Customer Code', required: false, context: 'Customer code' },
    { value: 'customer_email', label: 'Customer Email', required: false, context: 'Customer email' },
    { value: 'supplier_name', label: 'Supplier Name', required: false, context: 'Supplier/vendor name' },
    { value: 'supplier_code', label: 'Supplier Code', required: false, context: 'Supplier code' },
    // Order Items
    { value: 'item_name', label: 'Item Name', required: true, context: 'Ordered item name' },
    { value: 'quantity', label: 'Quantity', required: true, context: 'Order quantity' },
    { value: 'unit_price', label: 'Unit Price', required: false, context: 'Price per unit' },
    // Order Dates
    { value: 'order_date', label: 'Order Date', required: true, context: 'Order placement date' },
    { value: 'requested_date', label: 'Requested Date', required: false, context: 'Requested delivery date' },
    { value: 'promised_date', label: 'Promised Date', required: false, context: 'Promised delivery date' },
    { value: 'shipped_date', label: 'Shipped Date', required: false, context: 'Shipment date' },
    { value: 'delivered_date', label: 'Delivered Date', required: false, context: 'Delivery date' },
    { value: 'expected_delivery', label: 'Expected Delivery', required: false, context: 'Expected delivery date' },
    { value: 'actual_delivery', label: 'Actual Delivery', required: false, context: 'Actual delivery date' },
    // Order Status
    { value: 'order_status', label: 'Order Status', required: false, context: 'Order status' },
    { value: 'fulfillment_status', label: 'Fulfillment Status', required: false, context: 'Fulfillment status' },
    { value: 'payment_status', label: 'Payment Status', required: false, context: 'Payment status' },
    { value: 'priority', label: 'Priority', required: false, context: 'Order priority' },
    { value: 'is_urgent', label: 'Is Urgent', required: false, context: 'Urgent flag' },
    { value: 'is_expedited', label: 'Is Expedited', required: false, context: 'Expedited flag' },
    // Financial
    { value: 'subtotal', label: 'Subtotal', required: false, context: 'Subtotal amount' },
    { value: 'tax_amount', label: 'Tax Amount', required: false, context: 'Tax amount' },
    { value: 'shipping_cost', label: 'Shipping Cost', required: false, context: 'Shipping cost' },
    { value: 'discount_amount', label: 'Discount', required: false, context: 'Discount amount' },
    { value: 'total_amount', label: 'Total Amount', required: false, context: 'Total order value' },
    { value: 'currency', label: 'Currency', required: false, context: 'Currency code' },
    { value: 'payment_terms', label: 'Payment Terms', required: false, context: 'Payment terms' },
  ],
  financial: [
    // Transaction Identification
    { value: 'transaction_id', label: 'Transaction ID', required: false, context: 'Transaction identifier' },
    { value: 'transaction_number', label: 'Transaction Number', required: false, context: 'Transaction number' },
    { value: 'invoice_number', label: 'Invoice Number', required: false, context: 'Invoice number' },
    { value: 'payment_id', label: 'Payment ID', required: false, context: 'Payment identifier' },
    { value: 'account', label: 'Account', required: true, context: 'Financial account' },
    { value: 'account_code', label: 'Account Code', required: false, context: 'Account code' },
    { value: 'account_name', label: 'Account Name', required: false, context: 'Account name' },
    // Transaction Details
    { value: 'transaction_type', label: 'Transaction Type', required: true, context: 'Type of transaction' },
    { value: 'transaction_category', label: 'Category', required: false, context: 'Transaction category' },
    { value: 'transaction_date', label: 'Transaction Date', required: true, context: 'Transaction date' },
    { value: 'posting_date', label: 'Posting Date', required: false, context: 'GL posting date' },
    { value: 'payment_date', label: 'Payment Date', required: false, context: 'Payment date' },
    // Financial Amounts
    { value: 'amount', label: 'Amount', required: false, context: 'Transaction amount' },
    { value: 'debit_amount', label: 'Debit Amount', required: false, context: 'Debit amount' },
    { value: 'credit_amount', label: 'Credit Amount', required: false, context: 'Credit amount' },
    { value: 'tax_amount', label: 'Tax Amount', required: false, context: 'Tax amount' },
    { value: 'total_amount', label: 'Total Amount', required: false, context: 'Total amount' },
    { value: 'currency', label: 'Currency', required: false, context: 'Currency code' },
    // Revenue & Expenses
    { value: 'revenue', label: 'Revenue', required: false, context: 'Revenue amount' },
    { value: 'gross_revenue', label: 'Gross Revenue', required: false, context: 'Gross revenue' },
    { value: 'net_revenue', label: 'Net Revenue', required: false, context: 'Net revenue' },
    { value: 'expense', label: 'Expense', required: false, context: 'Expense amount' },
    { value: 'operating_expense', label: 'Operating Expense', required: false, context: 'Operating expense' },
    { value: 'cogs', label: 'Cost of Goods Sold', required: false, context: 'COGS amount' },
    // Profit Metrics
    { value: 'gross_profit', label: 'Gross Profit', required: false, context: 'Gross profit' },
    { value: 'operating_profit', label: 'Operating Profit', required: false, context: 'Operating profit' },
    { value: 'net_profit', label: 'Net Profit', required: false, context: 'Net profit' },
    { value: 'profit_margin', label: 'Profit Margin %', required: false, context: 'Profit margin percentage' },
    // Budget & Forecast
    { value: 'budget_amount', label: 'Budget Amount', required: false, context: 'Budget amount' },
    { value: 'forecast_amount', label: 'Forecast Amount', required: false, context: 'Forecast amount' },
    { value: 'variance_amount', label: 'Variance Amount', required: false, context: 'Budget variance' },
    { value: 'budget_period', label: 'Budget Period', required: false, context: 'Budget period' },
  ],
  logistics: [
    // Shipment Identification
    { value: 'shipment_id', label: 'Shipment ID', required: false, context: 'Shipment identifier' },
    { value: 'tracking_number', label: 'Tracking Number', required: true, context: 'Tracking number' },
    { value: 'waybill_number', label: 'Waybill Number', required: false, context: 'Waybill number' },
    { value: 'reference_number', label: 'Reference Number', required: false, context: 'Reference number' },
    // Carrier Information
    { value: 'carrier', label: 'Carrier', required: true, context: 'Shipping carrier name' },
    { value: 'carrier_service', label: 'Service Type', required: false, context: 'Carrier service type' },
    { value: 'shipping_method', label: 'Shipping Method', required: false, context: 'Shipping method' },
    { value: 'service_type', label: 'Service Level', required: false, context: 'Service level' },
    { value: 'delivery_type', label: 'Delivery Type', required: false, context: 'Delivery type' },
    // Dates & Timing
    { value: 'ship_date', label: 'Ship Date', required: false, context: 'Shipment date' },
    { value: 'scheduled_delivery_date', label: 'Scheduled Delivery', required: false, context: 'Scheduled delivery date' },
    { value: 'actual_delivery_date', label: 'Actual Delivery', required: false, context: 'Actual delivery date' },
    { value: 'pickup_time', label: 'Pickup Time', required: false, context: 'Pickup time' },
    { value: 'delivery_time', label: 'Delivery Time', required: false, context: 'Delivery time' },
    { value: 'transit_days', label: 'Transit Days', required: false, context: 'Days in transit' },
    // Status & Tracking
    { value: 'shipment_status', label: 'Shipment Status', required: false, context: 'Current shipment status' },
    { value: 'delivery_status', label: 'Delivery Status', required: false, context: 'Delivery status' },
    { value: 'tracking_status', label: 'Tracking Status', required: false, context: 'Tracking status' },
    { value: 'is_delivered', label: 'Is Delivered', required: false, context: 'Delivered flag' },
    { value: 'is_delayed', label: 'Is Delayed', required: false, context: 'Delayed flag' },
    { value: 'is_exception', label: 'Has Exception', required: false, context: 'Exception flag' },
    // Location Information
    { value: 'origin_address', label: 'Origin Address', required: false, context: 'Shipment origin address' },
    { value: 'origin_city', label: 'Origin City', required: false, context: 'Origin city' },
    { value: 'origin_state', label: 'Origin State', required: false, context: 'Origin state/province' },
    { value: 'destination_address', label: 'Destination Address', required: false, context: 'Destination address' },
    { value: 'destination_city', label: 'Destination City', required: false, context: 'Destination city' },
    { value: 'destination_state', label: 'Destination State', required: false, context: 'Destination state/province' },
    // Package Details
    { value: 'package_count', label: 'Package Count', required: false, context: 'Number of packages' },
    { value: 'weight', label: 'Weight', required: false, context: 'Package weight' },
    { value: 'weight_unit', label: 'Weight Unit', required: false, context: 'Weight unit (lbs, kg)' },
    { value: 'volume', label: 'Volume', required: false, context: 'Package volume' },
    { value: 'package_type', label: 'Package Type', required: false, context: 'Package type' },
    // Cost Information
    { value: 'shipping_cost', label: 'Shipping Cost', required: false, context: 'Shipping cost' },
    { value: 'fuel_surcharge', label: 'Fuel Surcharge', required: false, context: 'Fuel surcharge' },
    { value: 'total_cost', label: 'Total Cost', required: false, context: 'Total shipping cost' },
  ],
  recipes: [
    { value: 'item_name', label: 'Recipe/Menu Item Name', required: true, context: 'Final dish or product name' },
    { value: 'ingredient_name', label: 'Recipe Ingredient', required: true, context: 'Ingredient used in recipe' },
    { value: 'quantity', label: 'Recipe Quantity', required: true, context: 'Amount needed for recipe' },
    { value: 'unit_of_measure', label: 'Recipe Unit', required: true, context: 'Measurement unit (cups, grams, oz)' },
    { value: 'size_modifier', label: 'Size Modifier', required: false, context: 'Recipe portion size (S/M/L)' },
    { value: 'modifier_quantity', label: 'Modifier Quantity', required: false, context: 'Quantity adjustment for size' },
  ],
  ingredients: [
    { value: 'name', label: 'Ingredient Name', required: true, context: 'Master ingredient record' },
    { value: 'ingredient_name', label: 'Ingredient Name (Alt)', required: false, context: 'Alternative ingredient name' },
    { value: 'sku_code', label: 'Ingredient SKU', required: false, context: 'Ingredient identifier code' },
    { value: 'unit_cost', label: 'Ingredient Cost', required: false, context: 'Cost per ingredient unit' },
    { value: 'package_size', label: 'Package Size', required: false, context: 'How ingredient is packaged' },
    { value: 'unit_of_measure', label: 'Purchase Unit', required: true, context: 'Unit when purchasing (lb, kg, case)' },
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
  suppliers: [
    { value: 'supplier_name', label: 'Supplier Name', required: true, context: 'Vendor company name' },
    { value: 'supplier_code', label: 'Supplier Code', required: false, context: 'Supplier identifier' },
    { value: 'vendor_name', label: 'Vendor Name', required: false, context: 'Alternative vendor name' },
    { value: 'vendor_id', label: 'Vendor ID', required: false, context: 'Vendor identifier' },
    { value: 'contact_email', label: 'Supplier Email', required: false, context: 'Supplier contact email' },
    { value: 'contact_phone', label: 'Supplier Phone', required: false, context: 'Supplier contact phone' },
    { value: 'address', label: 'Supplier Address', required: false, context: 'Supplier business address' },
    { value: 'lead_time_days', label: 'Lead Time (Days)', required: false, context: 'Supplier lead time' },
    { value: 'minimum_order_value', label: 'Min Order Value', required: false, context: 'Minimum order requirement' },
    { value: 'payment_terms', label: 'Payment Terms', required: false, context: 'Supplier payment terms' },
    { value: 'performance_score', label: 'Performance Score', required: false, context: 'Supplier performance rating' },
  ],
  customers: [
    { value: 'customer_name', label: 'Customer Name', required: true, context: 'Customer full name' },
    { value: 'customer_code', label: 'Customer Code', required: false, context: 'Customer identifier' },
    { value: 'customer_id', label: 'Customer ID', required: false, context: 'Customer ID' },
    { value: 'email', label: 'Customer Email', required: false, context: 'Customer contact email' },
    { value: 'contact_email', label: 'Contact Email', required: false, context: 'Alternative email' },
    { value: 'phone', label: 'Customer Phone', required: false, context: 'Customer contact phone' },
    { value: 'contact_phone', label: 'Contact Phone', required: false, context: 'Alternative phone' },
    { value: 'address', label: 'Customer Address', required: false, context: 'Customer address' },
    { value: 'customer_type', label: 'Customer Type', required: false, context: 'Customer classification' },
    { value: 'customer_segment', label: 'Customer Segment', required: false, context: 'Customer segment' },
    { value: 'billing_address', label: 'Billing Address', required: false, context: 'Billing address' },
    { value: 'shipping_address', label: 'Shipping Address', required: false, context: 'Shipping address' },
    { value: 'payment_terms', label: 'Payment Terms', required: false, context: 'Customer payment terms' },
    { value: 'credit_limit', label: 'Credit Limit', required: false, context: 'Customer credit limit' },
    { value: 'tax_id', label: 'Tax ID', required: false, context: 'Tax identification number' },
    { value: 'is_active', label: 'Is Active', required: false, context: 'Active customer flag' },
  ],
  common: [
    { value: 'notes', label: 'Notes', required: false, context: 'General notes or comments' },
    { value: 'tags', label: 'Tags', required: false, context: 'Tags or labels' },
    { value: 'description', label: 'Description', required: false, context: 'Item description' },
    { value: 'status', label: 'Status', required: false, context: 'General status field' },
    { value: 'is_active', label: 'Is Active', required: false, context: 'Active flag' },
    { value: 'created_at', label: 'Created Date', required: false, context: 'Record creation date' },
    { value: 'updated_at', label: 'Updated Date', required: false, context: 'Last update date' },
    { value: 'name', label: 'Name (Generic)', required: false, context: 'Generic name field' },
    { value: 'code', label: 'Code (Generic)', required: false, context: 'Generic code field' },
    { value: 'id', label: 'ID (Generic)', required: false, context: 'Generic ID field' },
  ]
};

export default function ConsolidatedMappingPage() {
  const [fileMappings, setFileMappings] = useState<FileMapping[]>([]);
  const [allMappings, setAllMappings] = useState<ColumnMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { getAuthParams, isAuthenticated, isLoading: authLoading } = useAuth();

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
    // Wait for auth to be loaded
    if (authLoading) return;
    
    // Check if authenticated
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting...');
      router.push('/login');
      return;
    }
    
    const loadAllFileMappings = async () => {
      try {
        const authParams = getAuthParams();
        console.log('Auth params:', authParams);
        
        const response = await fetch(`/api/data-ingestion/upload?${authParams}`);
        console.log('Fetching uploads, response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Uploads found:', result.uploads?.length || 0);
          console.log('Upload statuses:', result.uploads?.map((u: any) => ({ id: u.id, status: u.status })));
          
          const mappings: FileMapping[] = [];
          const consolidatedMappings: ColumnMapping[] = [];
          
          for (const upload of result.uploads || []) {
            if (upload.status === 'review_required' || upload.status === 'mapping_required' || upload.status === 'completed') {
              try {
                const statusResponse = await fetch(`/api/data-ingestion/status/${upload.id}?${authParams}`);
                console.log(`Fetching status for ${upload.id}, response:`, statusResponse.status);
                
                if (statusResponse.ok) {
                  const statusData = await statusResponse.json();
                  console.log(`Status data for ${upload.id}:`, { 
                    hasColumnDetections: !!statusData.columnDetections,
                    detectionsCount: statusData.columnDetections?.length 
                  });
                  
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
  }, [authLoading, isAuthenticated, getAuthParams, router]);

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
      const authParams = getAuthParams();
      
      // Process each file
      for (const fileMapping of fileMappings) {
        const fileMappings = allMappings.filter(m => m.fileId === fileMapping.fileId && m.targetField);
        
        if (fileMappings.length > 0) {
          // Update column mappings
          for (const mapping of fileMappings) {
            await fetch(`/api/data-ingestion/status/${fileMapping.fileId}?${authParams}`, {
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
          await fetch(`/api/data-ingestion/status/${fileMapping.fileId}?${authParams}`, {
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
        router.push('/dashboard/overview');
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

  if (isLoading || authLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex h-[450px] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">
              {authLoading ? 'Authenticating...' : 'Loading all file mappings...'}
            </p>
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
                                ).map(([domain, domainFields]) => {
                                  const domainIcons: Record<string, string> = {
                                    inventory: '📦',
                                    orders: '🛒',
                                    financial: '💰',
                                    logistics: '🚚',
                                    suppliers: '🏭',
                                    customers: '👥',
                                    recipes: '📋',
                                    ingredients: '🥘',
                                    menu_items: '🍽️',
                                    common: '⚙️'
                                  };
                                  const icon = domainIcons[domain] || '📊';
                                  return (
                                  <div key={domain}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 border-b">
                                      {icon} {domain.toUpperCase().replace('_', ' ')} FIELDS
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
                                )})}
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