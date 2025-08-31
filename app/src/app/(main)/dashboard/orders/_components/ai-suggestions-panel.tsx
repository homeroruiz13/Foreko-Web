'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles,
  Zap, 
  TrendingUp, 
  Package,
  Check,
  Edit2,
  X,
  AlertCircle,
  DollarSign,
  Search,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AISuggestion {
  id: number;
  priority: 'high' | 'medium' | 'low';
  title: string;
  confidence: number;
  potentialSaving: number;
  description: string;
}

interface AISuggestionsPanelProps {
  suggestions: AISuggestion[];
  loading?: boolean;
}

export function AISuggestionsPanel({ suggestions: initialSuggestions, loading = false }: AISuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSuggestion, setEditingSuggestion] = useState<AISuggestion | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    quantity: 1,
    notes: ''
  });

  const handleApproveSuggestion = async (suggestion: AISuggestion) => {
    setProcessingIds(prev => [...prev, suggestion.id]);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Order Created Successfully`, {
      description: `${suggestion.title} has been processed and order created`,
      action: {
        label: "View Order",
        onClick: () => console.log("Viewing order...")
      }
    });
    
    // Remove the suggestion after approval
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setProcessingIds(prev => prev.filter(id => id !== suggestion.id));
  };

  const handleEditSuggestion = (suggestion: AISuggestion) => {
    setEditingSuggestion(suggestion);
    setEditForm({
      title: suggestion.title,
      description: suggestion.description,
      quantity: 1,
      notes: ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSuggestion) return;
    
    setProcessingIds(prev => [...prev, editingSuggestion.id]);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Order Placed Successfully`, {
      description: `${editForm.title} - Quantity: ${editForm.quantity}`,
      action: {
        label: "View Order",
        onClick: () => console.log("Viewing order...")
      }
    });
    
    // Remove the suggestion after placing order
    setSuggestions(prev => prev.filter(s => s.id !== editingSuggestion.id));
    setProcessingIds(prev => prev.filter(id => id !== editingSuggestion.id));
    setEditingSuggestion(null);
  };

  const handleDismissSuggestion = (suggestion: AISuggestion) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    toast.info(`Suggestion dismissed`, {
      description: `${suggestion.title} has been removed from suggestions`,
      action: {
        label: "Undo",
        onClick: () => {
          setSuggestions(prev => [...prev, suggestion].sort((a, b) => a.id - b.id));
          toast.success("Suggestion restored");
        }
      }
    });
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            AI Order Suggestions
          </CardTitle>
          <CardDescription>Intelligent order recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-8 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Zap className="h-3 w-3" />;
      case 'medium':
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <Package className="h-3 w-3" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 75) return 'text-amber-600 dark:text-amber-400';
    return 'text-muted-foreground';
  };

  // Filter suggestions based on search
  const filteredSuggestions = suggestions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered suggestions by priority
  const highPriority = filteredSuggestions.filter(s => s.priority === 'high');
  const otherSuggestions = filteredSuggestions.filter(s => s.priority !== 'high');

  return (
    <Card className="h-[720px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              AI Order Suggestions
            </CardTitle>
            <CardDescription>Intelligent order recommendations</CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            {filteredSuggestions.length} Active
          </Badge>
        </div>
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suggestions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-6 pb-2">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {/* High Priority Section */}
            {highPriority.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    High Priority ({highPriority.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {highPriority.map((suggestion) => (
                    <Card key={suggestion.id} className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm">{suggestion.title}</CardTitle>
                              <Badge variant={getPriorityBadgeVariant(suggestion.priority)} className="h-5">
                                {getPriorityIcon(suggestion.priority)}
                                <span className="ml-1 text-xs">{suggestion.priority}</span>
                              </Badge>
                            </div>
                            <CardDescription className="text-xs">
                              {suggestion.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4 text-xs">
                            <span className={cn("font-medium flex items-center gap-1", getConfidenceColor(suggestion.confidence))}>
                              <TrendingUp className="h-3 w-3" />
                              {suggestion.confidence}% confidence
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Save ${suggestion.potentialSaving}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="h-7 text-xs flex-1"
                            onClick={() => handleApproveSuggestion(suggestion)}
                            disabled={processingIds.includes(suggestion.id)}
                          >
                            {processingIds.includes(suggestion.id) ? (
                              <>
                                <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Processing
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Place Order
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-2"
                            onClick={() => handleEditSuggestion(suggestion)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 px-2"
                            onClick={() => handleDismissSuggestion(suggestion)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {highPriority.length > 0 && otherSuggestions.length > 0 && (
              <Separator />
            )}

            {/* Other Suggestions */}
            {otherSuggestions.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium">
                    Other Suggestions ({otherSuggestions.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {otherSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} className={cn(
                      "border-l-4",
                      suggestion.priority === 'medium' ? "border-l-amber-500" : "border-l-blue-500"
                    )}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm">{suggestion.title}</CardTitle>
                              <Badge variant={getPriorityBadgeVariant(suggestion.priority)} className="h-5">
                                {getPriorityIcon(suggestion.priority)}
                                <span className="ml-1 text-xs">{suggestion.priority}</span>
                              </Badge>
                            </div>
                            <CardDescription className="text-xs">
                              {suggestion.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4 text-xs">
                            <span className={cn("font-medium", getConfidenceColor(suggestion.confidence))}>
                              {suggestion.confidence}% confident
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              +${suggestion.potentialSaving}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs flex-1"
                            onClick={() => handleApproveSuggestion(suggestion)}
                            disabled={processingIds.includes(suggestion.id)}
                          >
                            {processingIds.includes(suggestion.id) ? (
                              <>
                                <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                                Processing
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Quick Order
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 px-2"
                            onClick={() => handleDismissSuggestion(suggestion)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      {/* Summary Stats - Outside scroll area */}
      <div className="px-6 py-3 border-t mt-auto flex-shrink-0">
        <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Savings</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                ${suggestions.reduce((sum, s) => sum + s.potentialSaving, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
              <p className="text-lg font-semibold">
                {suggestions.length > 0 
                  ? (suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      
      {/* Edit Suggestion Dialog */}
      <Dialog open={!!editingSuggestion} onOpenChange={(open) => !open && setEditingSuggestion(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit & Place Order</DialogTitle>
            <DialogDescription>
              Review and modify the AI suggestion before placing the order
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Product
              </Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 1 })}
                className="col-span-3"
                min="1"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right mt-2">
                Details
              </Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-notes" className="text-right mt-2">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="col-span-3"
                placeholder="Additional notes (optional)"
                rows={2}
              />
            </div>
            {editingSuggestion && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm text-muted-foreground">Savings</div>
                <div className="col-span-3 text-green-600 font-medium">
                  ${editingSuggestion.potentialSaving * editForm.quantity}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSuggestion(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={processingIds.includes(editingSuggestion?.id || 0)}
            >
              {processingIds.includes(editingSuggestion?.id || 0) ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Place Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}