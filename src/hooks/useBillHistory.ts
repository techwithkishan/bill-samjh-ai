import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseWithSession } from '@/lib/supabaseWithSession';
import { useSessionId } from './useSessionId';
import { BillInsights } from '@/types/bill';

export interface BillHistoryRecord {
  id: string;
  billing_month: string;
  total_units: number;
  total_amount: number;
  previous_units: number | null;
  previous_amount: number | null;
  estimated_units: number | null;
  estimated_amount: number | null;
  tariff_category: string | null;
  consumer_number: string | null;
  bill_type: string | null;
  language: string | null;
  fixed_charges: number | null;
  taxes_gst: number | null;
  additional_charges: number | null;
  due_amount: number | null;
  due_date: string | null;
  ai_summary: string | null;
  ai_hinglish_explanation: string | null;
  ai_factors: string[] | null;
  estimation_methodology: string | null;
  estimation_confidence: string | null;
  savings_tips: unknown;
  created_at: string;
}

export const useBillHistory = () => {
  const sessionId = useSessionId();
  const [history, setHistory] = useState<BillHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create supabase client with session headers
  const supabase = useMemo(() => getSupabaseWithSession(), []);

  const fetchHistory = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bill_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bill history:', error);
      } else if (data) {
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
    setIsLoading(false);
  }, [sessionId, supabase]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveBillAnalysis = useCallback(async (insights: BillInsights): Promise<boolean> => {
    if (!sessionId) {
      console.error('No session ID available');
      return false;
    }

    const billType = insights.billData.billType || 'electricity';

    const insertData = {
      session_id: sessionId,
      billing_month: insights.billData.billingMonth,
      total_units: insights.billData.totalUnits,
      total_amount: insights.billData.totalAmount,
      previous_units: insights.billData.previousUnits,
      previous_amount: insights.billData.previousAmount,
      tariff_category: insights.billData.tariffCategory || insights.billData.planName,
      consumer_number: insights.billData.consumerNumber,
      due_date: insights.billData.dueDate,
      bill_type: billType,
      ai_summary: insights.aiExplanation.summary,
      ai_hinglish_explanation: insights.aiExplanation.hinglishExplanation,
      ai_factors: insights.aiExplanation.factors,
      estimated_units: insights.nextBillEstimate.estimatedUnits,
      estimated_amount: insights.nextBillEstimate.estimatedAmount,
      estimation_methodology: insights.nextBillEstimate.methodology,
      estimation_confidence: insights.nextBillEstimate.confidence,
      savings_tips: insights.savingsTips as unknown as Record<string, unknown>[],
    };

    console.log('Inserting bill with session_id:', sessionId);
    
    const { error } = await supabase
      .from('bill_analyses')
      .insert(insertData as any);

    if (error) {
      console.error('Error saving bill analysis:', error);
      return false;
    }
    
    console.log('Bill saved successfully, refreshing history...');
    // Refresh history
    await fetchHistory();
    return true;
  }, [sessionId, supabase, fetchHistory]);

  const deleteBill = useCallback(async (billId: string): Promise<boolean> => {
    if (!sessionId) return false;

    const { error } = await supabase
      .from('bill_analyses')
      .delete()
      .eq('id', billId);

    if (error) {
      console.error('Error deleting bill:', error);
      return false;
    }

    await fetchHistory();
    return true;
  }, [sessionId, supabase, fetchHistory]);

  return { history, isLoading, saveBillAnalysis, deleteBill, sessionId, refreshHistory: fetchHistory };
};
