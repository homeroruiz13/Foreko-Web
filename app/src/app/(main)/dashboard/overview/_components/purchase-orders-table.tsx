'use client';

import { useState, useEffect, useCallback } from "react";
import { useAuth } from '@/hooks/use-auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, MoreHorizontal, Package, Truck, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Mail, MapPin, Phone, Calendar, DollarSign, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface PurchaseOrder {
  id: string;
  po_number: string;
  product_name: string;
  product_category: string;
  unit_price: number;
  quantity: number;
  unit_of_measure: string;
  est_delivery_date: string;
  actual_delivery_date: string | null;
  status: string;
  status_display: string;
  supplier_name: string;
  supplier_email: string;
  supplier_phone: string;
  line_total: number;
  currency: string;
  order_total: number;
  days_until_delivery: number | null;
  is_expedited: boolean;
  priority_level: string;
  completion_percentage: number;
  order_date: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PurchaseOrdersTableProps {
  loading?: boolean;
}

export function PurchaseOrdersTable({ loading }: PurchaseOrdersTableProps) {
  const { auth, isAuthenticated, getAuthParams } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Fetch orders from API with pagination
  const fetchOrders = async (page: number = 1) => {
    if (!isAuthenticated || !auth) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const authParams = getAuthParams();
      const url = `/api/executive/purchase-orders?${params}&${authParams}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.purchaseOrders || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Effect for initial load and when filters change
  useEffect(() => {
    if (isAuthenticated && auth) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, isAuthenticated, auth]);

  // Effect for page changes (including initial load)
  useEffect(() => {
    if (isAuthenticated && auth && currentPage >= 1) {
      fetchOrders(currentPage);
    }
  }, [currentPage, isAuthenticated, auth]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  // Action handlers
  const handleViewDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleContactSupplier = (order: PurchaseOrder) => {
    // Create mailto link
    const subject = encodeURIComponent(`Regarding PO ${order.po_number}`);
    const body = encodeURIComponent(`Dear ${order.supplier_name},\n\nI am contacting you regarding Purchase Order ${order.po_number} for ${order.product_name}.\n\nBest regards`);
    window.location.href = `mailto:${order.supplier_email}?subject=${subject}&body=${body}`;
    toast.success("Opening email client...");
  };

  const handleTrackShipment = (order: PurchaseOrder) => {
    // In a real app, this would open a tracking page or modal
    toast.info(`Tracking shipment for PO ${order.po_number}`, {
      description: `Status: ${order.status_display}`,
      action: order.status === 'in_transit' ? {
        label: "View Map",
        onClick: () => console.log("Opening tracking map...")
      } : undefined
    });
  };

  const handleExpediteOrder = (order: PurchaseOrder) => {
    toast.warning(`Expedite request sent for PO ${order.po_number}`, {
      description: "Supplier will be notified of the urgent requirement"
    });
    // In a real app, this would send an API request to expedite the order
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_transit':
        return <Truck className="h-4 w-4" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string, statusDisplay: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-gray-100 text-gray-800 border-gray-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'in_transit': 'bg-purple-100 text-purple-800 border-purple-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'delayed': 'bg-red-100 text-red-800 border-red-200',
      'cancelled': 'bg-gray-100 text-gray-500 border-gray-200',
      'partial_delivered': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'quality_hold': 'bg-orange-100 text-orange-800 border-orange-200',
    };

    return (
      <Badge variant="outline" className={cn("gap-1", statusColors[status] || statusColors['pending'])}>
        {getStatusIcon(status)}
        {statusDisplay}
      </Badge>
    );
  };

  if (loading || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>Active and recent purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>
              Active and recent purchase orders
              {pagination && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({pagination.totalRecords} total)
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("confirmed")}>
                  Confirmed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in_transit")}>
                  In Transit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("delayed")}>
                  Delayed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.po_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.product_name}</div>
                        <div className="text-xs text-muted-foreground">{order.product_category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{order.supplier_name}</div>
                    </TableCell>
                    <TableCell>
                      {order.quantity} {order.unit_of_measure}
                    </TableCell>
                    <TableCell>
                      {order.currency} {order.line_total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status, order.status_display)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.est_delivery_date ? new Date(order.est_delivery_date).toLocaleDateString() : '--'}
                      </div>
                      {order.days_until_delivery !== null && (
                        <div className={cn(
                          "text-xs",
                          order.days_until_delivery < 0 ? "text-red-600" : "text-muted-foreground"
                        )}>
                          {order.days_until_delivery < 0 
                            ? `${Math.abs(order.days_until_delivery)} days overdue`
                            : order.days_until_delivery === 0
                            ? 'Due today'
                            : `In ${order.days_until_delivery} days`
                          }
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleContactSupplier(order)}>
                            Contact Supplier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTrackShipment(order)}>
                            Track Shipment
                          </DropdownMenuItem>
                          {order.status === 'delayed' && (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleExpediteOrder(order)}
                            >
                              Expedite Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{' '}
              {pagination.totalRecords} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    return page === 1 || 
                           page === pagination.totalPages || 
                           Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {/* Add ellipsis if there's a gap */}
                      {index > 0 && array[index - 1] < page - 1 && (
                        <span className="px-2 py-1 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="min-w-[2rem]"
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>
              PO Number: {selectedOrder?.po_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Product:</span>
                    <p className="font-medium">{selectedOrder.product_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{selectedOrder.product_category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <p className="font-medium">{selectedOrder.quantity} {selectedOrder.unit_of_measure}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Unit Price:</span>
                    <p className="font-medium">{selectedOrder.currency} {selectedOrder.unit_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Amount:</span>
                    <p className="font-medium text-lg">{selectedOrder.currency} {selectedOrder.line_total.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      {getStatusBadge(selectedOrder.status, selectedOrder.status_display)}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Supplier Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Supplier Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{selectedOrder.supplier_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedOrder.supplier_email}`} className="text-blue-600 hover:underline">
                      {selectedOrder.supplier_email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedOrder.supplier_phone}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Delivery Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Delivery Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order Date:</span>
                    <p className="font-medium">
                      {new Date(selectedOrder.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Est. Delivery:</span>
                    <p className="font-medium">
                      {selectedOrder.est_delivery_date 
                        ? new Date(selectedOrder.est_delivery_date).toLocaleDateString()
                        : 'Not specified'}
                    </p>
                  </div>
                  {selectedOrder.actual_delivery_date && (
                    <div>
                      <span className="text-muted-foreground">Actual Delivery:</span>
                      <p className="font-medium">
                        {new Date(selectedOrder.actual_delivery_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Days Until Delivery:</span>
                    <p className={cn(
                      "font-medium",
                      selectedOrder.days_until_delivery && selectedOrder.days_until_delivery < 0 
                        ? "text-red-600" 
                        : "text-green-600"
                    )}>
                      {selectedOrder.days_until_delivery !== null
                        ? selectedOrder.days_until_delivery < 0 
                          ? `${Math.abs(selectedOrder.days_until_delivery)} days overdue`
                          : selectedOrder.days_until_delivery === 0
                          ? 'Due today'
                          : `${selectedOrder.days_until_delivery} days remaining`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleContactSupplier(selectedOrder)} className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Supplier
                </Button>
                <Button onClick={() => handleTrackShipment(selectedOrder)} variant="outline" className="flex-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  Track Shipment
                </Button>
                {selectedOrder.status === 'delayed' && (
                  <Button 
                    onClick={() => handleExpediteOrder(selectedOrder)} 
                    variant="destructive" 
                    className="flex-1"
                  >
                    Expedite Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}