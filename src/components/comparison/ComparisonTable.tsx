/**
 * Comparison Table Component
 * Displays side-by-side bill comparison with visual indicators
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ComparisonResult, COMPARISON_ROWS } from '@/types/comparison';

interface ComparisonTableProps {
  comparison: ComparisonResult;
}

export const ComparisonTable = ({ comparison }: ComparisonTableProps) => {
  const { current, comparisons, differences } = comparison;

  const formatValue = (value: number, format: 'number' | 'currency'): string => {
    if (format === 'currency') {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    return value.toLocaleString('en-IN');
  };

  const getDiffIndicator = (diff: number, percentChange: number) => {
    if (Math.abs(percentChange) < 1) {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    if (diff > 0) {
      return <TrendingUp className="h-4 w-4 text-destructive" />;
    }
    return <TrendingDown className="h-4 w-4 text-green-600" />;
  };

  const getDiffColor = (diff: number, percentChange: number, isPositiveGood: boolean = false): string => {
    if (Math.abs(percentChange) < 1) return 'text-muted-foreground';
    
    // For most metrics, decrease is good (green) and increase is bad (red)
    // isPositiveGood reverses this logic if needed
    if (isPositiveGood) {
      return diff > 0 ? 'text-green-600' : 'text-destructive';
    }
    return diff > 0 ? 'text-destructive' : 'text-green-600';
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="text-right font-semibold bg-primary/5">
              {current.billing_month}
              <span className="block text-xs font-normal text-muted-foreground">(Current)</span>
            </TableHead>
            {comparisons.map((comp) => (
              <TableHead key={comp.id} className="text-right font-semibold">
                {comp.billing_month}
              </TableHead>
            ))}
            <TableHead className="text-right font-semibold">Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {differences.map((diff, index) => {
            const row = COMPARISON_ROWS[index];
            // Use the first comparison for the difference column
            const mainComparison = diff.comparisonValues[0];
            
            return (
              <TableRow key={row.key}>
                <TableCell className="font-medium">{diff.label}</TableCell>
                <TableCell className="text-right bg-primary/5 font-semibold">
                  {formatValue(diff.currentValue, row.format)}
                  {row.key === 'total_units' && <span className="text-xs text-muted-foreground ml-1">kWh</span>}
                </TableCell>
                {diff.comparisonValues.map((compVal, i) => (
                  <TableCell key={i} className="text-right">
                    {formatValue(compVal.value, row.format)}
                    {row.key === 'total_units' && <span className="text-xs text-muted-foreground ml-1">kWh</span>}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  {mainComparison && (
                    <div className={`flex items-center justify-end gap-1 ${getDiffColor(mainComparison.diff, mainComparison.percentChange)}`}>
                      {getDiffIndicator(mainComparison.diff, mainComparison.percentChange)}
                      <span className="font-medium">
                        {mainComparison.diff >= 0 ? '+' : ''}
                        {row.format === 'currency' ? `₹${Math.abs(mainComparison.diff).toLocaleString('en-IN')}` : mainComparison.diff}
                      </span>
                      <span className="text-xs">
                        ({mainComparison.percentChange >= 0 ? '+' : ''}{mainComparison.percentChange.toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
