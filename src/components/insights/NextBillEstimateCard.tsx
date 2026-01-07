import { TrendingUp, Info, Zap } from 'lucide-react';
import { NextBillEstimate } from '@/types/bill';

interface NextBillEstimateCardProps {
  data: NextBillEstimate;
}

const NextBillEstimateCard = ({ data }: NextBillEstimateCardProps) => {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-success text-success-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="insight-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="insight-card-header">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Next Bill Estimate
        </h3>
      </div>
      <div className="insight-card-body">
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Estimated Units */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Estimated Units</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{data.estimatedUnits}</span>
              <span className="text-muted-foreground">kWh</span>
            </div>
          </div>

          {/* Estimated Amount */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <span className="text-sm">Estimated Amount</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                ₹{data.estimatedAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Prediction Confidence:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getConfidenceColor(data.confidence)}`}>
            {data.confidence}
          </span>
        </div>

        {/* Methodology */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">How We Calculate</h4>
              <p className="text-sm text-muted-foreground">{data.methodology}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextBillEstimateCard;
