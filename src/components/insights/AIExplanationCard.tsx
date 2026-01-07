import { Brain, MessageCircle, CheckCircle } from 'lucide-react';
import { AIExplanation } from '@/types/bill';

interface AIExplanationCardProps {
  data: AIExplanation;
}

const AIExplanationCard = ({ data }: AIExplanationCardProps) => {
  return (
    <div className="insight-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="insight-card-header">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Explanation
        </h3>
      </div>
      <div className="insight-card-body space-y-6">
        {/* Summary */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Summary</h4>
          <p className="text-foreground">{data.summary}</p>
        </div>

        {/* Hinglish Explanation */}
        <div className="bg-secondary rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">
                Simple Explanation (Hinglish)
              </h4>
              <p className="text-foreground italic">"{data.hinglishExplanation}"</p>
            </div>
          </div>
        </div>

        {/* Key Factors */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Key Factors</h4>
          <ul className="space-y-2">
            {data.factors.map((factor, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIExplanationCard;
