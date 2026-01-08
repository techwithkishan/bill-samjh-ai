/**
 * Insights Panel Component
 * Displays auto-generated insights and anomaly alerts
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Anomaly } from '@/types/comparison';

interface InsightsPanelProps {
  insights: string[];
  anomalies: Anomaly[];
}

export const InsightsPanel = ({ insights, anomalies }: InsightsPanelProps) => {
  const getSeverityIcon = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: Anomaly['severity']): 'default' | 'destructive' => {
    return severity === 'high' ? 'destructive' : 'default';
  };

  return (
    <div className="space-y-4">
      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Things to Check
          </h4>
          {anomalies.map((anomaly, index) => (
            <Alert key={index} variant={getSeverityVariant(anomaly.severity)}>
              {getSeverityIcon(anomaly.severity)}
              <AlertTitle className="text-sm capitalize">{anomaly.type.replace('_', ' ')}</AlertTitle>
              <AlertDescription className="text-sm">{anomaly.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            What This Means
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Select bills to compare and see insights.
            </p>
          ) : (
            <ul className="space-y-3">
              {insights.map((insight, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="text-primary font-bold">•</span>
                  <span className="text-muted-foreground">{insight}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
