/**
 * Bill Comparison Page
 * Main page for comparing utility bills across months with bill type filtering
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GitCompare, Upload, Trash2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BillSelector, MultiBillSelector, BillTypeFilter } from '@/components/comparison/BillSelector';
import { ComparisonTable } from '@/components/comparison/ComparisonTable';
import { InsightsPanel } from '@/components/comparison/InsightsPanel';
import { useBillComparison } from '@/hooks/useBillComparison';
import { useToast } from '@/hooks/use-toast';
import { billTypeConfig, BillType } from '@/types/bill';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Compare = () => {
  const { toast } = useToast();
  const { bills, isLoading, comparison, compareBills, clearComparison, deleteBill, excludedBills } = useBillComparison();
  
  const [currentBillId, setCurrentBillId] = useState<string>('');
  const [comparisonBillIds, setComparisonBillIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [billTypeFilter, setBillTypeFilter] = useState<string>('all');

  // Filter out excluded bills
  const availableBills = bills.filter(b => !excludedBills.has(b.id));

  // Get bill type counts
  const billTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableBills.forEach(bill => {
      const type = bill.bill_type || 'electricity';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [availableBills]);

  const handleCompare = () => {
    if (!currentBillId) {
      toast({
        title: 'Select a bill',
        description: 'Please select the bill you want to compare.',
        variant: 'destructive',
      });
      return;
    }

    if (comparisonBillIds.length === 0) {
      toast({
        title: 'Select comparison months',
        description: 'Please select at least one previous month to compare with.',
        variant: 'destructive',
      });
      return;
    }

    compareBills(currentBillId, comparisonBillIds);
  };

  const handleClear = () => {
    setCurrentBillId('');
    setComparisonBillIds([]);
    clearComparison();
  };

  const handleBillTypeChange = (newType: string) => {
    setBillTypeFilter(newType);
    // Clear selections when changing bill type filter
    setCurrentBillId('');
    setComparisonBillIds([]);
    clearComparison();
  };

  const handleDeleteBill = async () => {
    if (!billToDelete) return;
    
    const success = await deleteBill(billToDelete);
    if (success) {
      toast({
        title: 'Bill deleted',
        description: 'The bill has been removed from your history.',
      });
      if (currentBillId === billToDelete) {
        setCurrentBillId('');
      }
      setComparisonBillIds(prev => prev.filter(id => id !== billToDelete));
      clearComparison();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete the bill. Please try again.',
        variant: 'destructive',
      });
    }
    setBillToDelete(null);
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <Link 
              to="/history" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <GitCompare className="h-8 w-8 text-primary" />
                  Compare Bills
                </h1>
                <p className="text-muted-foreground mt-1">
                  Compare your utility bills across months to track changes and spot anomalies.
                </p>
              </div>
              {/* Bill Type Summary */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(billTypeCounts).map(([type, count]) => {
                  const config = billTypeConfig[type as BillType];
                  return (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {config?.icon} {config?.label}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          {/* No Bills State */}
          {availableBills.length < 2 ? (
            <Card className="text-center py-12">
              <CardContent>
                <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {availableBills.length === 0 ? 'No Bills Yet' : 'Need More Bills'}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {availableBills.length === 0 
                    ? "Upload your utility bills to start tracking and comparing them."
                    : "You need at least 2 bills to compare. Upload another bill to enable comparison."
                  }
                </p>
                <Button asChild>
                  <Link to="/upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload a Bill
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Bill Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Bills to Compare</CardTitle>
                  <CardDescription>
                    Filter by bill type and choose bills to compare (same type recommended)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bill Type Filter */}
                  <BillTypeFilter 
                    value={billTypeFilter} 
                    onChange={handleBillTypeChange}
                    bills={availableBills}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <BillSelector
                      bills={availableBills}
                      selectedId={currentBillId}
                      onChange={(id) => {
                        setCurrentBillId(id);
                        setComparisonBillIds(prev => prev.filter(cid => cid !== id));
                      }}
                      excludeIds={comparisonBillIds}
                      label="Which bill do you want to compare?"
                      placeholder="Select your current bill"
                      billTypeFilter={billTypeFilter}
                    />

                    <MultiBillSelector
                      bills={availableBills}
                      selectedIds={comparisonBillIds}
                      onChange={setComparisonBillIds}
                      excludeIds={currentBillId ? [currentBillId] : []}
                      label="Select past months to compare with"
                      maxSelections={3}
                      billTypeFilter={billTypeFilter}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleCompare}
                      disabled={!currentBillId || comparisonBillIds.length === 0}
                    >
                      <GitCompare className="h-4 w-4 mr-2" />
                      Compare Bills
                    </Button>
                    {(currentBillId || comparisonBillIds.length > 0) && (
                      <Button variant="outline" onClick={handleClear}>
                        Clear Selection
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Results */}
              {comparison && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  {/* Comparison Table */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Comparison Results</CardTitle>
                          <CardDescription>
                            Comparing {comparison.current.billing_month} with {comparison.comparisons.map(c => c.billing_month).join(', ')}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {billTypeConfig[comparison.current.bill_type as BillType]?.icon}{' '}
                          {billTypeConfig[comparison.current.bill_type as BillType]?.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ComparisonTable comparison={comparison} />
                    </CardContent>
                  </Card>

                  {/* Insights */}
                  <InsightsPanel 
                    insights={comparison.insights} 
                    anomalies={comparison.anomalies} 
                  />
                </div>
              )}

              {/* Bill List (for deletion) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manage Your Bills</CardTitle>
                  <CardDescription>
                    View all your uploaded bills or remove ones you no longer need
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {availableBills.map((bill) => {
                      const config = billTypeConfig[bill.bill_type as BillType];
                      return (
                        <div key={bill.id} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-4">
                            <span className="text-xl">{config?.icon || '📄'}</span>
                            <div>
                              <p className="font-medium">{bill.billing_month}</p>
                              <p className="text-sm text-muted-foreground">
                                {bill.total_units} {config?.unit || 'units'} • ₹{bill.total_amount.toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {config?.label || bill.bill_type}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setBillToDelete(bill.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this bill?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this bill from your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBill}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Compare;
