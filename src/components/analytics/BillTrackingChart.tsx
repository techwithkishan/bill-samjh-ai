import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from 'recharts';
import { BillDataPoint, BillPrediction } from '@/hooks/useAnalytics';
import { BarChart3, Zap, IndianRupee } from 'lucide-react';

interface BillTrackingChartProps {
  data: BillDataPoint[];
  prediction: BillPrediction | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1.5 text-sm">
        {payload.map((entry: any, index: number) => {
          if (entry.dataKey === 'units') {
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-3 w-3" style={{ color: entry.color }} />
                  Units Consumed
                </span>
                <span className="font-medium">{entry.value} kWh</span>
              </div>
            );
          }
          if (entry.dataKey === 'amount') {
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <IndianRupee className="h-3 w-3" style={{ color: entry.color }} />
                  Total Bill
                </span>
                <span className="font-medium">₹{entry.value}</span>
              </div>
            );
          }
          return null;
        })}
        {dataPoint?.perUnitRate && (
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-border mt-1">
            <span className="text-muted-foreground">Per Unit Rate</span>
            <span className="font-medium">₹{dataPoint.perUnitRate}/kWh</span>
          </div>
        )}
      </div>
    </div>
  );
};

const BillTrackingChart = ({ data, prediction }: BillTrackingChartProps) => {
  const [showUnits, setShowUnits] = useState(true);
  const [showAmount, setShowAmount] = useState(true);

  // Add prediction as a dashed line continuation
  const chartDataWithPrediction = [...data];
  if (prediction && data.length > 0) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthName = nextMonth.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    
    chartDataWithPrediction.push({
      month: `${nextMonthName} (Est.)`,
      units: prediction.predictedUnits,
      amount: prediction.predictedAmount,
      perUnitRate: prediction.predictedAmount / prediction.predictedUnits,
      fixedCharges: 0,
      date: nextMonthName,
      rawDate: nextMonth,
      isPrediction: true,
    } as BillDataPoint & { isPrediction: boolean });
  }

  const chartConfig = {
    units: {
      label: 'Units (kWh)',
      color: 'hsl(var(--primary))',
    },
    amount: {
      label: 'Amount (₹)',
      color: 'hsl(var(--success))',
    },
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Monthly Electricity Usage & Cost
          </CardTitle>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch 
                id="show-units" 
                checked={showUnits} 
                onCheckedChange={setShowUnits}
              />
              <Label htmlFor="show-units" className="text-sm flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary" />
                Units
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="show-amount" 
                checked={showAmount} 
                onCheckedChange={setShowAmount}
              />
              <Label htmlFor="show-amount" className="text-sm flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-success" />
                Amount
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartDataWithPrediction} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                yAxisId="units"
                orientation="left"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                label={{ value: 'Units (kWh)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
              />
              <YAxis 
                yAxisId="amount"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                label={{ value: 'Amount (₹)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => value === 'units' ? 'Units Consumed (kWh)' : 'Bill Amount (₹)'}
              />
              
              {showUnits && (
                <Line
                  yAxisId="units"
                  type="monotone"
                  dataKey="units"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                  activeDot={{ r: 7, fill: 'hsl(var(--primary))' }}
                  strokeDasharray={prediction ? "5 5" : undefined}
                />
              )}
              
              {showAmount && (
                <Bar
                  yAxisId="amount"
                  dataKey="amount"
                  fill="hsl(var(--success))"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        {prediction && (
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">📊 Forecast:</span> The dotted line shows next month's predicted consumption based on your usage patterns.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillTrackingChart;
