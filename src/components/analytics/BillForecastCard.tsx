import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BillPrediction } from '@/hooks/useAnalytics';
import { TrendingUp, Zap, IndianRupee, Info, Lightbulb, Calendar } from 'lucide-react';

interface BillForecastCardProps {
  prediction: BillPrediction;
}

const BillForecastCard = ({ prediction }: BillForecastCardProps) => {
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return { bg: 'bg-success', text: 'text-success', percent: 90 };
      case 'medium':
        return { bg: 'bg-warning', text: 'text-warning', percent: 70 };
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', percent: 50 };
    }
  };

  const confidence = getConfidenceColor(prediction.confidenceLevel);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthName = nextMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Next Month Bill Forecast
        </CardTitle>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          Prediction for {nextMonthName}
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Main Predictions */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Predicted Units */}
          <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {prediction.predictedUnits.toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Predicted Units (kWh)</p>
          </div>

          {/* Predicted Amount */}
          <div className="text-center p-4 rounded-xl bg-success/5 border border-success/20">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-3">
              <IndianRupee className="h-6 w-6 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              ₹{prediction.predictedAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Estimated Bill Amount</p>
          </div>
        </div>

        {/* Confidence Range */}
        <div className="p-4 rounded-lg bg-muted/50 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Confidence Range</span>
            <Badge 
              variant="outline" 
              className={`capitalize ${confidence.text} border-current`}
            >
              {prediction.confidenceLevel} confidence
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              ₹{prediction.confidenceRange.min.toLocaleString('en-IN')}
            </span>
            <div className="flex-1">
              <Progress value={confidence.percent} className="h-2" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              ₹{prediction.confidenceRange.max.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Your bill is expected to be within ±{Math.round((prediction.confidenceRange.max - prediction.predictedAmount) / prediction.predictedAmount * 100)}% of the estimate
          </p>
        </div>

        {/* Factors Considered */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            Factors Considered
          </h4>
          <ul className="space-y-1.5">
            {prediction.factors.map((factor, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>

        {/* Methodology Note */}
        <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {prediction.methodology}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground mt-4 italic">
          This estimate is based on your past electricity usage trends and may vary with actual consumption.
        </p>
      </CardContent>
    </Card>
  );
};

export default BillForecastCard;
