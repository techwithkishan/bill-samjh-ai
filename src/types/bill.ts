export type BillType = 'electricity' | 'water' | 'mobile' | 'internet';

export const billTypeConfig: Record<BillType, {
  label: string;
  icon: string;
  color: string;
  unit: string;
  unitLabel: string;
  providers: string[];
}> = {
  electricity: {
    label: 'Electricity',
    icon: '⚡',
    color: 'text-yellow-500',
    unit: 'kWh',
    unitLabel: 'Units Consumed',
    providers: ['MSEDCL', 'TPDDL', 'BSES', 'CESC', 'TANGEDCO', 'BESCOM', 'APSPDCL', 'UPPCL', 'PGVCL', 'WBSEDCL'],
  },
  water: {
    label: 'Water',
    icon: '💧',
    color: 'text-blue-500',
    unit: 'KL',
    unitLabel: 'Water Usage',
    providers: ['Delhi Jal Board', 'BWSSB', 'MCGM', 'CMWSSB', 'HMWSSB', 'PHED', 'KWA'],
  },
  mobile: {
    label: 'Mobile',
    icon: '📱',
    color: 'text-green-500',
    unit: 'GB',
    unitLabel: 'Data Used',
    providers: ['Jio', 'Airtel', 'Vi (Vodafone Idea)', 'BSNL', 'MTNL'],
  },
  internet: {
    label: 'Internet/Broadband',
    icon: '🌐',
    color: 'text-purple-500',
    unit: 'GB',
    unitLabel: 'Data Usage',
    providers: ['Jio Fiber', 'Airtel Xstream', 'ACT Fibernet', 'BSNL Fiber', 'Tata Play Fiber', 'Hathway', 'Tikona'],
  },
};

export interface BillData {
  billType: BillType;
  billingMonth: string;
  totalUnits: number;
  totalAmount: number;
  previousUnits: number;
  previousAmount: number;
  tariffCategory: string;
  consumerNumber: string;
  dueDate: string;
  // Type-specific fields
  planName?: string; // mobile/internet
  dataLimit?: number; // mobile/internet in GB
  talkTime?: number; // mobile in minutes
  smsCount?: number; // mobile
  connectionSpeed?: string; // internet
  waterTaxes?: number; // water
  sewerageCharges?: number; // water
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

export type SupportedLanguage = 'english' | 'hindi' | 'tamil' | 'telugu' | 'marathi' | 'bengali';

export const languageLabels: Record<SupportedLanguage, string> = {
  english: 'English',
  hindi: 'हिंदी (Hindi)',
  tamil: 'தமிழ் (Tamil)',
  telugu: 'తెలుగు (Telugu)',
  marathi: 'मराठी (Marathi)',
  bengali: 'বাংলা (Bengali)',
};
