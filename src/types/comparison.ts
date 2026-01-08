/**
 * Bill Comparison Types
 * Defines interfaces for the bill comparison feature
 */

export interface BillRecord {
  id: string;
  billing_month: string;
  bill_type: string;
  total_units: number;
  total_amount: number;
  taxes_gst: number;
  fixed_charges: number;
  additional_charges: number;
  due_amount: number | null;
  previous_units: number | null;
  previous_amount: number | null;
  created_at: string;
}

export interface ComparisonRow {
  label: string;
  key: keyof Pick<BillRecord, 'total_units' | 'total_amount' | 'taxes_gst' | 'fixed_charges' | 'additional_charges'>;
  unit: string;
  format: 'number' | 'currency';
}

export interface ComparisonResult {
  current: BillRecord;
  comparisons: BillRecord[];
  differences: DifferenceData[];
  insights: string[];
  anomalies: Anomaly[];
}

export interface DifferenceData {
  label: string;
  currentValue: number;
  comparisonValues: { month: string; value: number; diff: number; percentChange: number }[];
}

export interface Anomaly {
  type: 'spike' | 'unexpected_charge' | 'inconsistency';
  severity: 'low' | 'medium' | 'high';
  message: string;
  field: string;
}

export const BILL_TYPES = [
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'internet', label: 'Internet' },
  { value: 'gas', label: 'Gas' },
] as const;

export const COMPARISON_ROWS: ComparisonRow[] = [
  { label: 'Usage Units', key: 'total_units', unit: 'kWh', format: 'number' },
  { label: 'Fixed Charges', key: 'fixed_charges', unit: '₹', format: 'currency' },
  { label: 'Taxes/GST', key: 'taxes_gst', unit: '₹', format: 'currency' },
  { label: 'Extra Charges', key: 'additional_charges', unit: '₹', format: 'currency' },
  { label: 'Total Amount', key: 'total_amount', unit: '₹', format: 'currency' },
];
