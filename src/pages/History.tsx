import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useBillHistory } from '@/hooks/useBillHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap, IndianRupee, Calendar, BarChart3, GitCompare, Trash2, Eye } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { billTypeConfig, BillType } from '@/types/bill';
import { useToast } from '@/hooks/use-toast';

const History = () => {
  const { history, isLoading, deleteBill } = useBillHistory();
  const { toast } = useToast();
  const navigate = useNavigate();

  const viewBillInsights = (record: typeof history[0]) => {
    // Store bill data in sessionStorage for the Insights page
    const insights = {
      totalUnits: record.total_units,
      totalAmount: record.total_amount,
      billingMonth: record.billing_month,
      previousUnits: record.previous_units,
      previousAmount: record.previous_amount,
      estimatedUnits: record.estimated_units,
      estimatedAmount: record.estimated_amount,
      savingsTips: record.savings_tips || [],
      billType: record.bill_type || 'electricity',
      language: record.language || 'english',
      fixedCharges: record.fixed_charges,
      taxesGst: record.taxes_gst,
      additionalCharges: record.additional_charges,
      dueAmount: record.due_amount,
      dueDate: record.due_date,
      consumerNumber: record.consumer_number,
      tariffCategory: record.tariff_category,
      aiSummary: record.ai_summary,
      aiHinglishExplanation: record.ai_hinglish_explanation,
      aiFactors: record.ai_factors,
      estimationMethodology: record.estimation_methodology,
      estimationConfidence: record.estimation_confidence,
    };
    sessionStorage.setItem('billInsights', JSON.stringify(insights));
    sessionStorage.setItem('selectedLanguage', record.language || 'english');
    sessionStorage.setItem('hasStoredFile', 'false'); // No file, viewing from history
    navigate('/insights');
  };

  const chartData = [...history]
    .reverse()
    .map((record) => ({
      month: record.billing_month,
      units: record.total_units,
      amount: record.total_amount,
      date: format(new Date(record.created_at), 'dd MMM'),
    }));

  const chartConfig = {
    units: {
      label: 'Units (kWh)',
      color: 'hsl(var(--primary))',
    },
    amount: {
      label: 'Amount (₹)',
      color: 'hsl(var(--accent))',
    },
  };

  // Calculate trends
  const latestRecord = history[0];
  const previousRecord = history[1];
  const unitsTrend = latestRecord && previousRecord 
    ? ((latestRecord.total_units - previousRecord.total_units) / previousRecord.total_units * 100).toFixed(1)
    : null;
  const amountTrend = latestRecord && previousRecord
    ? ((latestRecord.total_amount - previousRecord.total_amount) / previousRecord.total_amount * 100).toFixed(1)
    : null;

  // Calculate averages
  const avgUnits = history.length > 0 
    ? Math.round(history.reduce((sum, r) => sum + r.total_units, 0) / history.length)
    : 0;
  const avgAmount = history.length > 0
    ? Math.round(history.reduce((sum, r) => sum + r.total_amount, 0) / history.length)
    : 0;

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Bill History & Trends
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Track your electricity consumption patterns over time and identify savings opportunities.
              </p>
            </div>
            {history.length >= 2 && (
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/compare">
                  <GitCompare className="h-5 w-5 mr-2" />
                  Compare Bills
                </Link>
              </Button>
            )}
          </div>

          {history.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No History Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first electricity bill to start tracking your consumption trends.
                </p>
                <a href="/upload" className="text-primary hover:underline font-medium">
                  Upload a Bill →
                </a>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Units</p>
                        <p className="text-2xl font-bold">{avgUnits}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <IndianRupee className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Bill</p>
                        <p className="text-2xl font-bold">₹{avgAmount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${unitsTrend && parseFloat(unitsTrend) > 0 ? 'bg-destructive/10' : 'bg-green-100'}`}>
                        {unitsTrend && parseFloat(unitsTrend) > 0 
                          ? <TrendingUp className="h-5 w-5 text-destructive" />
                          : <TrendingDown className="h-5 w-5 text-green-600" />
                        }
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Units Trend</p>
                        <p className={`text-2xl font-bold ${unitsTrend && parseFloat(unitsTrend) > 0 ? 'text-destructive' : 'text-green-600'}`}>
                          {unitsTrend ? `${parseFloat(unitsTrend) > 0 ? '+' : ''}${unitsTrend}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Bills</p>
                        <p className="text-2xl font-bold">{history.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Units Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Units Consumption Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px]">
                      <LineChart data={chartData}>
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="units"
                          stroke="var(--color-units)"
                          strokeWidth={3}
                          dot={{ fill: 'var(--color-units)', r: 4 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Amount Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-accent" />
                      Bill Amount Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px]">
                      <BarChart data={chartData}>
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* History Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis History</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Billing Month</th>
                          <th className="text-right py-3 px-2">Units</th>
                          <th className="text-right py-3 px-2">Amount</th>
                          <th className="text-right py-3 px-2">Change</th>
                          <th className="text-right py-3 px-2">Analyzed On</th>
                          <th className="text-right py-3 px-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((record, index) => {
                          const prevRecord = history[index + 1];
                          const change = prevRecord
                            ? ((record.total_amount - prevRecord.total_amount) / prevRecord.total_amount * 100).toFixed(1)
                            : null;
                          const config = billTypeConfig[(record.bill_type || 'electricity') as BillType];
                          return (
                            <tr 
                              key={record.id} 
                              className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => viewBillInsights(record)}
                            >
                              <td className="py-3 px-2 font-medium">
                                <span className="flex items-center gap-2">
                                  <span>{config?.icon || '⚡'}</span>
                                  {record.billing_month}
                                </span>
                              </td>
                              <td className="text-right py-3 px-2">
                                {record.total_units} {config?.unit || 'kWh'}
                              </td>
                              <td className="text-right py-3 px-2">₹{record.total_amount}</td>
                              <td className={`text-right py-3 px-2 ${change && parseFloat(change) > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                {change ? `${parseFloat(change) > 0 ? '+' : ''}${change}%` : '-'}
                              </td>
                              <td className="text-right py-3 px-2 text-muted-foreground">
                                {format(new Date(record.created_at), 'dd MMM yyyy')}
                              </td>
                              <td className="text-right py-3 px-2">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      viewBillInsights(record);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const deleted = await deleteBill(record.id);
                                      if (deleted) {
                                        toast({
                                          title: 'Bill Deleted',
                                          description: 'The bill has been removed from your history.',
                                        });
                                      } else {
                                        toast({
                                          title: 'Delete Failed',
                                          description: 'Could not delete the bill. Please try again.',
                                          variant: 'destructive',
                                        });
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default History;
