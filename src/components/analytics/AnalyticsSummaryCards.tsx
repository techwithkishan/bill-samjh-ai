import { Card, CardContent } from '@/components/ui/card';
import { Zap, IndianRupee, TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';

interface AnalyticsSummaryCardsProps {
  stats: {
    avgUnits: number;
    avgAmount: number;
    avgRate: number;
    totalBills: number;
    maxUnits: number;
    minUnits: number;
  };
  trends: {
    unitsChange: number | null;
    amountChange: number | null;
    rateChange: number | null;
  };
}

const AnalyticsSummaryCards = ({ stats, trends }: AnalyticsSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Average Units */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Avg. Consumption</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">{stats.avgUnits}</p>
                <span className="text-xs text-muted-foreground">kWh</span>
              </div>
              {trends.unitsChange !== null && (
                <p className={`text-xs flex items-center gap-0.5 mt-0.5 ${
                  trends.unitsChange > 0 ? 'text-destructive' : 'text-success'
                }`}>
                  {trends.unitsChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trends.unitsChange > 0 ? '+' : ''}{trends.unitsChange}% vs last
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Bill */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-success/10 rounded-lg">
              <IndianRupee className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Avg. Bill Amount</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{stats.avgAmount.toLocaleString('en-IN')}
              </p>
              {trends.amountChange !== null && (
                <p className={`text-xs flex items-center gap-0.5 mt-0.5 ${
                  trends.amountChange > 0 ? 'text-destructive' : 'text-success'
                }`}>
                  {trends.amountChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trends.amountChange > 0 ? '+' : ''}{trends.amountChange}% vs last
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Rate */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-warning/10 rounded-lg">
              <Target className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Avg. Per Unit Rate</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-foreground">₹{stats.avgRate}</p>
                <span className="text-xs text-muted-foreground">/kWh</span>
              </div>
              {trends.rateChange !== null && (
                <p className={`text-xs flex items-center gap-0.5 mt-0.5 ${
                  trends.rateChange > 0 ? 'text-destructive' : 'text-success'
                }`}>
                  {trends.rateChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trends.rateChange > 0 ? '+' : ''}{trends.rateChange}%
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Range */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent rounded-lg">
              <BarChart3 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Usage Range</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.minUnits}-{stats.maxUnits}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.totalBills} bills analyzed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSummaryCards;
