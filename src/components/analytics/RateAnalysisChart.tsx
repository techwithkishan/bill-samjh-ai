import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RateAnalysis } from '@/hooks/useAnalytics';
import { TrendingUp, TrendingDown, AlertTriangle, IndianRupee } from 'lucide-react';

interface RateAnalysisChartProps {
  data: RateAnalysis[];
  avgRate: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload as RateAnalysis;
  
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[180px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Per Unit Rate</span>
          <span className="font-bold text-foreground">₹{dataPoint.rate}</span>
        </div>
        {dataPoint.changePercent !== null && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Change</span>
            <span className={`font-medium flex items-center gap-1 ${
              dataPoint.changePercent > 0 ? 'text-destructive' : 'text-success'
            }`}>
              {dataPoint.changePercent > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {dataPoint.changePercent > 0 ? '+' : ''}{dataPoint.changePercent}%
            </span>
          </div>
        )}
        {dataPoint.isSpike && (
          <div className="flex items-center gap-1 text-warning mt-1 pt-1 border-t border-border">
            <AlertTriangle className="h-3 w-3" />
            <span className="text-xs">Abnormal spike detected</span>
          </div>
        )}
      </div>
    </div>
  );
};

const RateAnalysisChart = ({ data, avgRate }: RateAnalysisChartProps) => {
  const spikeMonths = data.filter(d => d.isSpike);
  const latestChange = data.length > 1 ? data[data.length - 1]?.changePercent : null;

  const chartConfig = {
    rate: {
      label: 'Rate (₹/kWh)',
      color: 'hsl(var(--warning))',
    },
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IndianRupee className="h-5 w-5 text-warning" />
            Per-Unit Electricity Rate Trend
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              Avg: ₹{avgRate}/kWh
            </Badge>
            {latestChange !== null && (
              <Badge 
                variant={latestChange > 0 ? 'destructive' : 'default'}
                className={`text-xs ${latestChange <= 0 ? 'bg-success text-success-foreground' : ''}`}
              >
                {latestChange > 0 ? '+' : ''}{latestChange}% this month
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(value) => `₹${value}`}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={avgRate} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5" 
                label={{ value: 'Avg', position: 'right', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                fill="url(#rateGradient)"
                dot={(props: any) => {
                  const isSpike = props.payload?.isSpike;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={isSpike ? 6 : 4}
                      fill={isSpike ? 'hsl(var(--destructive))' : 'hsl(var(--warning))'}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Rate Change Indicators */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.slice(-4).map((item, index) => (
            <div 
              key={item.month} 
              className={`p-3 rounded-lg border ${
                item.isSpike 
                  ? 'border-destructive/30 bg-destructive/5' 
                  : 'border-border bg-muted/30'
              }`}
            >
              <p className="text-xs text-muted-foreground truncate">{item.month}</p>
              <p className="font-semibold text-foreground">₹{item.rate}</p>
              {item.changePercent !== null && (
                <p className={`text-xs flex items-center gap-0.5 ${
                  item.changePercent > 0 ? 'text-destructive' : 'text-success'
                }`}>
                  {item.changePercent > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {item.changePercent > 0 ? '+' : ''}{item.changePercent}%
                </p>
              )}
            </div>
          ))}
        </div>

        {spikeMonths.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Abnormal Rate Spikes Detected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rate increased by more than 15% in: {spikeMonths.map(m => m.month).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RateAnalysisChart;
