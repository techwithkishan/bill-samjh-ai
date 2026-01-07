import { Lightbulb, IndianRupee } from 'lucide-react';
import { SavingsTip } from '@/types/bill';

interface SavingsTipsCardProps {
  tips: SavingsTip[];
}

const SavingsTipsCard = ({ tips }: SavingsTipsCardProps) => {
  return (
    <div className="insight-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="insight-card-header">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Savings Suggestions
        </h3>
      </div>
      <div className="insight-card-body">
        <div className="space-y-4">
          {tips.map((tip) => (
            <div key={tip.id} className="tip-card">
              <div className="text-3xl flex-shrink-0">{tip.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{tip.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                  <IndianRupee className="h-3 w-3" />
                  Potential Savings: {tip.potentialSavings}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Potential Savings */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="bg-success/10 rounded-lg p-4 text-center">
            <p className="text-sm text-success mb-1">Total Potential Monthly Savings</p>
            <p className="text-2xl font-bold text-success">₹530 - ₹1,100</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsTipsCard;
