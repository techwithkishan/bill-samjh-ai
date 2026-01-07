import Layout from '@/components/layout/Layout';
import { useBillHistory } from '@/hooks/useBillHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Zap, IndianRupee, Calendar, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const History = () => {
  const { history, isLoading } = useBillHistory();

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
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Bill History & Trends
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track your electricity consumption patterns over time and identify savings opportunities.
            </p>
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
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((record, index) => {
                          const prevRecord = history[index + 1];
                          const change = prevRecord
                            ? ((record.total_amount - prevRecord.total_amount) / prevRecord.total_amount * 100).toFixed(1)
                            : null;
                          return (
                            <tr key={record.id} className="border-b last:border-0">
                              <td className="py-3 px-2 font-medium">{record.billing_month}</td>
                              <td className="text-right py-3 px-2">{record.total_units} kWh</td>
                              <td className="text-right py-3 px-2">₹{record.total_amount}</td>
                              <td className={`text-right py-3 px-2 ${change && parseFloat(change) > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                {change ? `${parseFloat(change) > 0 ? '+' : ''}${change}%` : '-'}
                              </td>
                              <td className="text-right py-3 px-2 text-muted-foreground">
                                {format(new Date(record.created_at), 'dd MMM yyyy')}
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
