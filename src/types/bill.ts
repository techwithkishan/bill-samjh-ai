export interface BillData {
  billingMonth: string;
  totalUnits: number;
  totalAmount: number;
  previousUnits: number;
  previousAmount: number;
  tariffCategory: string;
  consumerNumber: string;
  dueDate: string;
}

export interface AIExplanation {
  summary: string;
  hinglishExplanation: string;
  factors: string[];
}

export interface NextBillEstimate {
  estimatedUnits: number;
  estimatedAmount: number;
  methodology: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface SavingsTip {
  id: string;
  icon: string;
  title: string;
  description: string;
  potentialSavings: string;
}

export interface BillInsights {
  billData: BillData;
  aiExplanation: AIExplanation;
  nextBillEstimate: NextBillEstimate;
  savingsTips: SavingsTip[];
}

export interface UploadState {
  isUploading: boolean;
  isProcessing: boolean;
  error: string | null;
  progress: number;
}
