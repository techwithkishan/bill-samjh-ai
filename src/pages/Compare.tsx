/**
 * Bill Comparison Page
 * Allows users to compare bills from history or upload new ones
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GitCompare, ArrowRight, RotateCcw, History } from 'lucide-react';
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
  const [activeAnalysis, setActiveAnalysis] = useState<1 | 2 | null>(null);
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

  const handleAnalyze1 = async (file: File, billType: BillType) => {
    setActiveAnalysis(1);
    const result = await analyzeBill(file, 'english', billType);
    setActiveAnalysis(null);
    return result;
  };

  const handleAnalyze2 = async (file: File, billType: BillType) => {
    setActiveAnalysis(2);
    const result = await analyzeBill(file, 'english', billType);
    setActiveAnalysis(null);
    return result;
  };

  const handleBill1Analyzed = (insights: BillInsights) => {
    setBill1({ insights });
  };

  const handleBill2Analyzed = (insights: BillInsights) => {
    setBill2({ insights });
  };

  const handleReset = () => {
    setBill1(null);
    setBill2(null);
    setSelectedHistoryBill1('');
    setSelectedHistoryBill2('');
  };

  const canCompare = bill1 && bill2;

  // Calculate differences
  const getDiff = (val1: number, val2: number) => {
    const diff = val1 - val2;
    const percent = val2 !== 0 ? ((diff / val2) * 100).toFixed(1) : '0';
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
            <div className="grid md:grid-cols-2 gap-6">
              <SimpleUploadCard
                title="Bill 1 (Base)"
                billNumber={1}
                onBillAnalyzed={handleBill1Analyzed}
                isProcessing={activeAnalysis === 1}
                onAnalyze={handleAnalyze1}
                analyzedBill={bill1?.insights || null}
              />
              
              <SimpleUploadCard
                title="Bill 2 (Compare To)"
                billNumber={2}
                onBillAnalyzed={handleBill2Analyzed}
                isProcessing={activeAnalysis === 2}
                onAnalyze={handleAnalyze2}
                analyzedBill={bill2?.insights || null}
              />
            </div>
          )}

          {/* Comparison Results */}
          {canCompare && (
            <Card className="animate-in fade-in-50 duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-primary" />
                  Comparison Results
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {bill1.insights.billData.billingMonth} vs {bill2.insights.billData.billingMonth}
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
                          <th className="text-right py-3 px-4 text-sm font-medium text-primary">
                            {bill1.insights.billData.billingMonth}
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                            {bill2.insights.billData.billingMonth}
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Total Units */}
                        <tr className="border-b">
                          <td className="py-3 px-4 text-sm font-medium">Usage Units</td>
                          <td className="text-right py-3 px-4 text-sm font-semibold">
                            {bill1.insights.billData.totalUnits} kWh
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {bill2.insights.billData.totalUnits} kWh
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {(() => {
                              const { diff, percent } = getDiff(
                                bill1.insights.billData.totalUnits,
                                bill2.insights.billData.totalUnits
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
                          <td className="text-right py-3 px-4 text-sm font-semibold">
                            ₹{bill1.insights.billData.totalAmount.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            ₹{bill2.insights.billData.totalAmount.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {(() => {
                              const { diff, percent } = getDiff(
                                bill1.insights.billData.totalAmount,
                                bill2.insights.billData.totalAmount
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
                          <td className="text-right py-3 px-4 text-sm font-semibold">
                            {bill1.insights.billData.previousUnits} kWh
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {bill2.insights.billData.previousUnits} kWh
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {(() => {
                              const { diff, percent } = getDiff(
                                bill1.insights.billData.previousUnits,
                                bill2.insights.billData.previousUnits
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
                          <td className="text-right py-3 px-4 text-sm font-semibold">
                            ₹{bill1.insights.billData.previousAmount.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            ₹{bill2.insights.billData.previousAmount.toLocaleString()}
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {(() => {
                              const { diff, percent } = getDiff(
                                bill1.insights.billData.previousAmount,
                                bill2.insights.billData.previousAmount
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
                      <h4 className="text-sm font-semibold mb-2">Bill 1 Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {bill1.insights.aiExplanation.summary || 'No AI summary available.'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="text-sm font-semibold mb-2">Bill 2 Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {bill2.insights.aiExplanation.summary || 'No AI summary available.'}
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
                        const amountDiff = bill1.insights.billData.totalAmount - bill2.insights.billData.totalAmount;
                        const unitsDiff = bill1.insights.billData.totalUnits - bill2.insights.billData.totalUnits;
                        const month1 = bill1.insights.billData.billingMonth;
                        const month2 = bill2.insights.billData.billingMonth;
                        
                        if (amountDiff > 0 && unitsDiff > 0) {
                          return `Your ${month1} bill is ₹${amountDiff.toLocaleString()} higher than ${month2}, with ${unitsDiff} more units consumed. Consider reviewing your usage patterns.`;
                        } else if (amountDiff < 0 && unitsDiff < 0) {
                          return `Great news! Your ${month1} bill is ₹${Math.abs(amountDiff).toLocaleString()} lower than ${month2}, with ${Math.abs(unitsDiff)} fewer units consumed. Keep up the good work!`;
                        } else if (amountDiff > 0 && unitsDiff <= 0) {
                          return `Your ${month1} bill is ₹${amountDiff.toLocaleString()} higher despite using similar or fewer units. Check for rate changes or additional charges.`;
                        } else {
                          return `Your bills show a mixed pattern. ${month1} has ${unitsDiff > 0 ? 'higher' : 'lower'} usage but ${amountDiff > 0 ? 'higher' : 'lower'} charges compared to ${month2}.`;
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
