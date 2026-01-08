/**
 * Bill Comparison Page
 * Allows users to compare bills from history or upload new ones
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GitCompare, ArrowRight, RotateCcw, History, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SimpleUploadCard from '@/components/comparison/SimpleUploadCard';
import { useBillAnalysis } from '@/hooks/useBillAnalysis';
import { useBillHistory } from '@/hooks/useBillHistory';
import { BillInsights, BillType } from '@/types/bill';

interface AnalyzedBillData {
  insights: BillInsights;
}

const Compare = () => {
  const { analyzeBill, isProcessing } = useBillAnalysis();
  const { history, isLoading: historyLoading } = useBillHistory();
  
  const [bill1, setBill1] = useState<AnalyzedBillData | null>(null);
  const [bill2, setBill2] = useState<AnalyzedBillData | null>(null);
  const [file1, setFile1] = useState<{ file: File; billType: BillType } | null>(null);
  const [file2, setFile2] = useState<{ file: File; billType: BillType } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedHistoryBill1, setSelectedHistoryBill1] = useState<string>('');
  const [selectedHistoryBill2, setSelectedHistoryBill2] = useState<string>('');

  const hasEnoughHistory = history.length >= 2;

  // Convert history record to BillInsights format
  const historyToBillInsights = (record: typeof history[0]): BillInsights => ({
    billData: {
      billType: (record.bill_type || 'electricity') as BillType,
      billingMonth: record.billing_month,
      totalUnits: record.total_units,
      totalAmount: record.total_amount,
      previousUnits: record.previous_units || 0,
      previousAmount: record.previous_amount || 0,
      tariffCategory: record.tariff_category || 'Domestic',
      consumerNumber: record.consumer_number || 'N/A',
      dueDate: record.due_date || 'N/A',
    },
    aiExplanation: {
      summary: record.ai_summary || 'Analysis from your saved bill history.',
      hinglishExplanation: record.ai_hinglish_explanation || '',
      factors: record.ai_factors || [],
    },
    nextBillEstimate: {
      estimatedUnits: record.estimated_units || record.total_units,
      estimatedAmount: record.estimated_amount || record.total_amount,
      methodology: record.estimation_methodology || 'Based on historical data',
      confidence: (record.estimation_confidence as 'low' | 'medium' | 'high') || 'medium',
    },
    savingsTips: Array.isArray(record.savings_tips) ? record.savings_tips : [],
  });

  // Handle history selection
  useEffect(() => {
    if (selectedHistoryBill1) {
      const record = history.find(h => h.id === selectedHistoryBill1);
      if (record) {
        setBill1({ insights: historyToBillInsights(record) });
      }
    } else {
      setBill1(null);
    }
  }, [selectedHistoryBill1, history]);

  useEffect(() => {
    if (selectedHistoryBill2) {
      const record = history.find(h => h.id === selectedHistoryBill2);
      if (record) {
        setBill2({ insights: historyToBillInsights(record) });
      }
    } else {
      setBill2(null);
    }
  }, [selectedHistoryBill2, history]);

  const handleFile1Selected = (file: File, billType: BillType) => {
    setFile1({ file, billType });
    setBill1(null); // Reset analyzed bill when new file selected
  };

  const handleFile2Selected = (file: File, billType: BillType) => {
    setFile2({ file, billType });
    setBill2(null); // Reset analyzed bill when new file selected
  };

  const handleAnalyzeAndCompare = async () => {
    if (!file1 || !file2) return;
    
    setIsAnalyzing(true);
    try {
      const [result1, result2] = await Promise.all([
        analyzeBill(file1.file, 'english', file1.billType),
        analyzeBill(file2.file, 'english', file2.billType),
      ]);
      
      if (result1) setBill1({ insights: result1 });
      if (result2) setBill2({ insights: result2 });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setBill1(null);
    setBill2(null);
    setFile1(null);
    setFile2(null);
    setSelectedHistoryBill1('');
    setSelectedHistoryBill2('');
  };

  const handleClearBill1 = () => {
    setBill1(null);
    setFile1(null);
  };

  const handleClearBill2 = () => {
    setBill2(null);
    setFile2(null);
  };

  const canCompare = bill1 && bill2;
  const canAnalyze = file1 && file2 && !canCompare;

  // Parse billing month to get date for comparison
  // Handles formats like "January 2024", "Jan 2024", "05/2024", "2024-05", etc.
  const parseBillingMonth = (billingMonth: string): Date => {
    if (!billingMonth) return new Date(0);
    
    // Try "Month Year" format (e.g., "January 2024" or "Jan 2024")
    const monthYearMatch = billingMonth.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (monthYearMatch) {
      const date = new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`);
      if (!isNaN(date.getTime())) return date;
    }
    
    // Try "MM/YYYY" or "YYYY-MM" formats
    const numericMatch = billingMonth.match(/(\d{1,2})[\/\-](\d{4})|(\d{4})[\/\-](\d{1,2})/);
    if (numericMatch) {
      const month = numericMatch[1] || numericMatch[4];
      const year = numericMatch[2] || numericMatch[3];
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      if (!isNaN(date.getTime())) return date;
    }
    
    // Fallback: try direct parsing
    const directDate = new Date(billingMonth);
    if (!isNaN(directDate.getTime())) return directDate;
    
    return new Date(0); // fallback for unparseable dates
  };

  // Get sorted bills: older on left, latest on right
  const getSortedBills = () => {
    if (!bill1 || !bill2) return { olderBill: null, latestBill: null };
    
    const date1 = parseBillingMonth(bill1.insights.billData.billingMonth);
    const date2 = parseBillingMonth(bill2.insights.billData.billingMonth);
    
    if (date1 <= date2) {
      return { olderBill: bill1, latestBill: bill2 };
    } else {
      return { olderBill: bill2, latestBill: bill1 };
    }
  };

  const { olderBill, latestBill } = getSortedBills();

  // Calculate differences from latest bill's perspective (latest - older)
  const getDiff = (latestVal: number, olderVal: number) => {
    const diff = latestVal - olderVal;
    const percent = olderVal !== 0 ? ((diff / olderVal) * 100).toFixed(1) : '0';
    return { diff, percent };
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <Link 
              to="/analytics" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Analytics
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <GitCompare className="h-8 w-8 text-primary" />
                  Compare Bills
                </h1>
                <p className="text-muted-foreground mt-1">
                  {hasEnoughHistory 
                    ? 'Select bills from history or upload new ones to compare'
                    : 'Upload two bills to compare them side by side'}
                </p>
              </div>
              {(bill1 || bill2) && (
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              )}
            </div>
          </div>

          {/* History Selection (if 2+ bills in history) */}
          {hasEnoughHistory && (
            <Card className="bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Compare from History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Bill 1 (Base)
                    </label>
                    <Select value={selectedHistoryBill1} onValueChange={setSelectedHistoryBill1}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bill from history" />
                      </SelectTrigger>
                      <SelectContent>
                        {history.map((record) => (
                          <SelectItem 
                            key={record.id} 
                            value={record.id}
                            disabled={record.id === selectedHistoryBill2}
                          >
                            {record.billing_month} - ₹{record.total_amount.toLocaleString()} ({record.total_units} units)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Bill 2 (Compare To)
                    </label>
                    <Select value={selectedHistoryBill2} onValueChange={setSelectedHistoryBill2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bill from history" />
                      </SelectTrigger>
                      <SelectContent>
                        {history.map((record) => (
                          <SelectItem 
                            key={record.id} 
                            value={record.id}
                            disabled={record.id === selectedHistoryBill1}
                          >
                            {record.billing_month} - ₹{record.total_amount.toLocaleString()} ({record.total_units} units)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Or upload new bills below to compare
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upload Section */}
          {!selectedHistoryBill1 && !selectedHistoryBill2 && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <SimpleUploadCard
                  title="Bill 1"
                  billNumber={1}
                  onFileSelected={handleFile1Selected}
                  onClear={handleClearBill1}
                  isProcessing={isAnalyzing}
                  analyzedBill={bill1?.insights || null}
                  selectedFile={file1?.file || null}
                />
                
                <SimpleUploadCard
                  title="Bill 2"
                  billNumber={2}
                  onFileSelected={handleFile2Selected}
                  onClear={handleClearBill2}
                  isProcessing={isAnalyzing}
                  analyzedBill={bill2?.insights || null}
                  selectedFile={file2?.file || null}
                />
              </div>

              {/* Single Analyze & Compare Button */}
              {canAnalyze && (
                <div className="flex justify-center">
                  <Button 
                    size="lg" 
                    onClick={handleAnalyzeAndCompare}
                    disabled={isAnalyzing}
                    className="px-8"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Analyzing Bills...
                      </>
                    ) : (
                      <>
                        <GitCompare className="h-5 w-5 mr-2" />
                        Analyze & Compare
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Comparison Results */}
          {canCompare && olderBill && latestBill && (
            <Card className="animate-in fade-in-50 duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-primary" />
                  Comparison Results
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {olderBill.insights.billData.billingMonth} (Older) → {latestBill.insights.billData.billingMonth} (Latest)
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Metric</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                            {olderBill.insights.billData.billingMonth}
                            <span className="block text-xs font-normal">(Older)</span>
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-primary">
                            {latestBill.insights.billData.billingMonth}
                            <span className="block text-xs font-normal">(Latest)</span>
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Total Units */}
                        <tr className="border-b">
                          <td className="py-3 px-4 text-sm font-medium">Usage Units</td>
                          <td className="text-right py-3 px-4 text-sm">
                            {olderBill.insights.billData.totalUnits} kWh
                          </td>
                          <td className="text-right py-3 px-4 text-sm font-semibold">
                            {latestBill.insights.billData.totalUnits} kWh
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {(() => {
                              const { diff, percent } = getDiff(
                                latestBill.insights.billData.totalUnits,
                                olderBill.insights.billData.totalUnits
                              );
                              return (
                                <span className={diff > 0 ? 'text-destructive' : diff < 0 ? 'text-success' : ''}>
                                  {diff > 0 ? '+' : ''}{diff} ({percent}%)
                                </span>
                              );
                            })()}
                          </td>
                        </tr>

                        {/* Total Amount */}
                        <tr className="border-b">
                          <td className="py-3 px-4 text-sm font-medium">Total Amount</td>
                          <td className="text-right py-3 px-4 text-sm">
                            ₹{olderBill.insights.billData.totalAmount.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-sm font-semibold">
                            ₹{latestBill.insights.billData.totalAmount.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {(() => {
                              const { diff, percent } = getDiff(
                                latestBill.insights.billData.totalAmount,
                                olderBill.insights.billData.totalAmount
                              );
                              return (
                                <span className={diff > 0 ? 'text-destructive' : diff < 0 ? 'text-success' : ''}>
                                  {diff > 0 ? '+' : ''}₹{diff.toLocaleString()} ({percent}%)
                                </span>
                              );
                            })()}
                          </td>
                        </tr>

                        {/* Previous Units */}
                        <tr className="border-b">
                          <td className="py-3 px-4 text-sm font-medium">Previous Units</td>
                          <td className="text-right py-3 px-4 text-sm">
                            {olderBill.insights.billData.previousUnits} kWh
                          </td>
                          <td className="text-right py-3 px-4 text-sm font-semibold">
                            {latestBill.insights.billData.previousUnits} kWh
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {(() => {
                              const { diff, percent } = getDiff(
                                latestBill.insights.billData.previousUnits,
                                olderBill.insights.billData.previousUnits
                              );
                              return (
                                <span className={diff > 0 ? 'text-destructive' : diff < 0 ? 'text-success' : ''}>
                                  {diff > 0 ? '+' : ''}{diff} ({percent}%)
                                </span>
                              );
                            })()}
                          </td>
                        </tr>

                        {/* Previous Amount */}
                        <tr className="border-b">
                          <td className="py-3 px-4 text-sm font-medium">Previous Amount</td>
                          <td className="text-right py-3 px-4 text-sm">
                            ₹{olderBill.insights.billData.previousAmount.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-sm font-semibold">
                            ₹{latestBill.insights.billData.previousAmount.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {(() => {
                              const { diff, percent } = getDiff(
                                latestBill.insights.billData.previousAmount,
                                olderBill.insights.billData.previousAmount
                              );
                              return (
                                <span className={diff > 0 ? 'text-destructive' : diff < 0 ? 'text-success' : ''}>
                                  {diff > 0 ? '+' : ''}₹{diff.toLocaleString()} ({percent}%)
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Quick Insights */}
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="text-sm font-semibold mb-2">{olderBill.insights.billData.billingMonth} Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {olderBill.insights.aiExplanation.summary || 'No AI summary available.'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="text-sm font-semibold mb-2">{latestBill.insights.billData.billingMonth} Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {latestBill.insights.aiExplanation.summary || 'No AI summary available.'}
                      </p>
                    </div>
                  </div>

                  {/* Overall Assessment */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mt-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      Overall Assessment
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const amountDiff = latestBill.insights.billData.totalAmount - olderBill.insights.billData.totalAmount;
                        const unitsDiff = latestBill.insights.billData.totalUnits - olderBill.insights.billData.totalUnits;
                        const olderMonth = olderBill.insights.billData.billingMonth;
                        const latestMonth = latestBill.insights.billData.billingMonth;
                        
                        if (amountDiff > 0 && unitsDiff > 0) {
                          return `Your ${latestMonth} bill is ₹${amountDiff.toLocaleString()} higher than ${olderMonth}, with ${unitsDiff} more units consumed. Consider reviewing your usage patterns.`;
                        } else if (amountDiff < 0 && unitsDiff < 0) {
                          return `Great news! Your ${latestMonth} bill is ₹${Math.abs(amountDiff).toLocaleString()} lower than ${olderMonth}, with ${Math.abs(unitsDiff)} fewer units consumed. Keep up the good work!`;
                        } else if (amountDiff > 0 && unitsDiff <= 0) {
                          return `Your ${latestMonth} bill is ₹${amountDiff.toLocaleString()} higher despite using similar or fewer units. Check for rate changes or additional charges.`;
                        } else {
                          return `Your ${latestMonth} bill has ${unitsDiff > 0 ? 'higher' : 'lower'} usage but ${amountDiff > 0 ? 'higher' : 'lower'} charges compared to ${olderMonth}.`;
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Text */}
          {!canCompare && (
            <div className="text-center text-sm text-muted-foreground p-4 rounded-lg bg-muted/50">
              {hasEnoughHistory 
                ? 'Select two bills from history above, or upload new bills to compare.'
                : 'Upload both bills to see the comparison results.'}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Compare;
