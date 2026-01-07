import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionId } from './useSessionId';
import { BillInsights, SavingsTip } from '@/types/bill';

interface BillHistoryRecord {
  id: string;
  billing_month: string;
  total_units: number;
  total_amount: number;
  previous_units: number | null;
  previous_amount: number | null;
  tariff_category: string | null;
  consumer_number: string | null;
  created_at: string;
}

export const useBillHistory = () => {
  const sessionId = useSessionId();
  const [history, setHistory] = useState<BillHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bill_analyses')
        .select('id, billing_month, total_units, total_amount, previous_units, previous_amount, tariff_category, consumer_number, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .setHeader('x-session-id', sessionId);

      if (!error && data) {
        setHistory(data);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [sessionId]);

  const saveBillAnalysis = async (insights: BillInsights) => {
    if (!sessionId) return;

    const insertData = {
      session_id: sessionId,
      billing_month: insights.billData.billingMonth,
      total_units: insights.billData.totalUnits,
      total_amount: insights.billData.totalAmount,
      previous_units: insights.billData.previousUnits,
      previous_amount: insights.billData.previousAmount,
      tariff_category: insights.billData.tariffCategory,
      consumer_number: insights.billData.consumerNumber,
      due_date: insights.billData.dueDate,
      ai_summary: insights.aiExplanation.summary,
      ai_hinglish_explanation: insights.aiExplanation.hinglishExplanation,
      ai_factors: insights.aiExplanation.factors,
      estimated_units: insights.nextBillEstimate.estimatedUnits,
      estimated_amount: insights.nextBillEstimate.estimatedAmount,
      estimation_methodology: insights.nextBillEstimate.methodology,
      estimation_confidence: insights.nextBillEstimate.confidence,
      savings_tips: insights.savingsTips as unknown as Record<string, unknown>[],
    };

    const { error } = await supabase.from('bill_analyses').insert(insertData as any).setHeader('x-session-id', sessionId);

    if (!error) {
      // Refresh history
      const { data } = await supabase
        .from('bill_analyses')
        .select('id, billing_month, total_units, total_amount, previous_units, previous_amount, tariff_category, consumer_number, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .setHeader('x-session-id', sessionId);

      if (data) setHistory(data);
    }
  };

  return { history, isLoading, saveBillAnalysis, sessionId };
};
