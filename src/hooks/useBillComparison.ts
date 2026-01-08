/**
 * Bill Comparison Hook
 * Handles fetching bills, calculating differences, detecting anomalies, and generating insights
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { getSupabaseWithSession } from '@/lib/supabaseWithSession';
import { useSessionId } from './useSessionId';
import { BillRecord, ComparisonResult, DifferenceData, Anomaly, COMPARISON_ROWS } from '@/types/comparison';

interface UseBillComparisonReturn {
  bills: BillRecord[];
  isLoading: boolean;
  comparison: ComparisonResult | null;
  compareBills: (currentId: string, comparisonIds: string[]) => void;
  clearComparison: () => void;
  deleteBill: (billId: string) => Promise<boolean>;
  excludedBills: Set<string>;
  toggleExcludeBill: (billId: string) => void;
}

export const useBillComparison = (): UseBillComparisonReturn => {
  const sessionId = useSessionId();
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [excludedBills, setExcludedBills] = useState<Set<string>>(new Set());

  // Create supabase client with session headers
  const supabase = useMemo(() => getSupabaseWithSession(), []);

  // Fetch all bills for this session
  const fetchBills = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('bill_analyses')
      .select('id, billing_month, bill_type, total_units, total_amount, taxes_gst, fixed_charges, additional_charges, due_amount, previous_units, previous_amount, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Map with default values for new columns
      const mappedBills: BillRecord[] = data.map(bill => ({
        id: bill.id,
        billing_month: bill.billing_month,
        bill_type: bill.bill_type || 'electricity',
        total_units: bill.total_units,
        total_amount: Number(bill.total_amount),
        taxes_gst: Number(bill.taxes_gst) || 0,
        fixed_charges: Number(bill.fixed_charges) || 0,
        additional_charges: Number(bill.additional_charges) || 0,
        due_amount: bill.due_amount ? Number(bill.due_amount) : null,
        previous_units: bill.previous_units,
        previous_amount: bill.previous_amount ? Number(bill.previous_amount) : null,
        created_at: bill.created_at,
      }));
      setBills(mappedBills);
    }
    setIsLoading(false);
  }, [sessionId, supabase]);

  // Initial fetch
  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Calculate percentage change
  const calcPercentChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Detect anomalies in the comparison
  const detectAnomalies = (current: BillRecord, comparisons: BillRecord[]): Anomaly[] => {
    const anomalies: Anomaly[] = [];
    
    // Check for usage spikes (>30% increase)
    comparisons.forEach(comp => {
      const usageChange = calcPercentChange(current.total_units, comp.total_units);
      if (usageChange > 30) {
        anomalies.push({
          type: 'spike',
          severity: usageChange > 50 ? 'high' : 'medium',
          message: `Usage increased by ${usageChange.toFixed(0)}% compared to ${comp.billing_month}`,
          field: 'total_units',
        });
      }
    });

    // Check for unexpected additional charges
    const avgAdditional = comparisons.reduce((sum, c) => sum + c.additional_charges, 0) / comparisons.length;
    if (current.additional_charges > 0 && avgAdditional === 0) {
      anomalies.push({
        type: 'unexpected_charge',
        severity: 'medium',
        message: `New additional charges of ₹${current.additional_charges} appeared this month`,
        field: 'additional_charges',
      });
    } else if (current.additional_charges > avgAdditional * 2 && avgAdditional > 0) {
      anomalies.push({
        type: 'unexpected_charge',
        severity: 'high',
        message: `Additional charges doubled compared to average (₹${current.additional_charges} vs ₹${avgAdditional.toFixed(0)})`,
        field: 'additional_charges',
      });
    }

    // Check for tax inconsistencies
    const avgTaxRate = comparisons.length > 0 
      ? comparisons.reduce((sum, c) => sum + (c.taxes_gst / c.total_amount), 0) / comparisons.length
      : 0;
    const currentTaxRate = current.taxes_gst / current.total_amount;
    if (avgTaxRate > 0 && Math.abs(currentTaxRate - avgTaxRate) > 0.05) {
      anomalies.push({
        type: 'inconsistency',
        severity: 'low',
        message: `Tax rate seems different this month (${(currentTaxRate * 100).toFixed(1)}% vs avg ${(avgTaxRate * 100).toFixed(1)}%)`,
        field: 'taxes_gst',
      });
    }

    return anomalies;
  };

  // Generate human-readable insights
  const generateInsights = (current: BillRecord, comparisons: BillRecord[], anomalies: Anomaly[]): string[] => {
    const insights: string[] = [];
    
    if (comparisons.length === 0) return insights;

    // Overall amount change
    const avgAmount = comparisons.reduce((sum, c) => sum + c.total_amount, 0) / comparisons.length;
    const amountChange = calcPercentChange(current.total_amount, avgAmount);
    if (Math.abs(amountChange) > 5) {
      const direction = amountChange > 0 ? 'increased' : 'decreased';
      insights.push(`Your total bill has ${direction} by ${Math.abs(amountChange).toFixed(0)}% compared to the average of selected months.`);
    } else {
      insights.push(`Your bill amount is similar to your recent average.`);
    }

    // Usage insight
    const avgUnits = comparisons.reduce((sum, c) => sum + c.total_units, 0) / comparisons.length;
    const unitsChange = calcPercentChange(current.total_units, avgUnits);
    if (Math.abs(unitsChange) > 10) {
      const direction = unitsChange > 0 ? 'increased' : 'decreased';
      insights.push(`Your electricity usage has ${direction} by ${Math.abs(unitsChange).toFixed(0)}% compared to previous months.`);
    }

    // Fixed charges insight
    const prevFixed = comparisons[0]?.fixed_charges || 0;
    if (current.fixed_charges !== prevFixed && prevFixed > 0) {
      const fixedChange = current.fixed_charges - prevFixed;
      insights.push(`Fixed charges have ${fixedChange > 0 ? 'increased' : 'decreased'} by ₹${Math.abs(fixedChange).toFixed(0)}.`);
    }

    // Add anomaly-based insights
    anomalies.forEach(anomaly => {
      if (anomaly.type === 'unexpected_charge') {
        insights.push(anomaly.message);
      }
    });

    return insights.slice(0, 4); // Max 4 insights
  };

  // Compare selected bills
  const compareBills = useCallback((currentId: string, comparisonIds: string[]) => {
    const current = bills.find(b => b.id === currentId);
    const comparisons = bills.filter(b => comparisonIds.includes(b.id));

    if (!current || comparisons.length === 0) {
      setComparison(null);
      return;
    }

    // Calculate differences for each row
    const differences: DifferenceData[] = COMPARISON_ROWS.map(row => ({
      label: row.label,
      currentValue: current[row.key] as number,
      comparisonValues: comparisons.map(comp => ({
        month: comp.billing_month,
        value: comp[row.key] as number,
        diff: (current[row.key] as number) - (comp[row.key] as number),
        percentChange: calcPercentChange(current[row.key] as number, comp[row.key] as number),
      })),
    }));

    const anomalies = detectAnomalies(current, comparisons);
    const insights = generateInsights(current, comparisons, anomalies);

    setComparison({
      current,
      comparisons,
      differences,
      insights,
      anomalies,
    });
  }, [bills]);

  // Clear comparison
  const clearComparison = useCallback(() => {
    setComparison(null);
  }, []);

  // Delete a bill
  const deleteBill = useCallback(async (billId: string): Promise<boolean> => {
    if (!sessionId) return false;
    
    const { error } = await supabase
      .from('bill_analyses')
      .delete()
      .eq('id', billId);

    if (!error) {
      setBills(prev => prev.filter(b => b.id !== billId));
      return true;
    }
    return false;
  }, [sessionId, supabase]);

  // Toggle bill exclusion from comparison
  const toggleExcludeBill = useCallback((billId: string) => {
    setExcludedBills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(billId)) {
        newSet.delete(billId);
      } else {
        newSet.add(billId);
      }
      return newSet;
    });
  }, []);

  return {
    bills,
    isLoading,
    comparison,
    compareBills,
    clearComparison,
    deleteBill,
    excludedBills,
    toggleExcludeBill,
  };
};
