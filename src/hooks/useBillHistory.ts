import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  user_id: string | null;
}

export const useBillHistory = () => {
  const { user, isAuthenticated, signInAnonymously, isLoading: authLoading } = useAuth();
  const [history, setHistory] = useState<BillHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-authenticate anonymously if not already authenticated
  useEffect(() => {
    const ensureAuthenticated = async () => {
      if (!authLoading && !isAuthenticated) {
        console.log('Not authenticated, signing in anonymously...');
        await signInAnonymously();
      }
    };
    ensureAuthenticated();
  }, [authLoading, isAuthenticated, signInAnonymously]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bill_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bill history:', error);
      } else if (data) {
        setHistory(data as BillHistoryRecord[]);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  const saveBillAnalysis = useCallback(async (insights: BillInsights): Promise<boolean> => {
    if (!user) {
      console.error('No authenticated user');
      return false;
    }

    const billType = insights.billData.billType || 'electricity';

    const insertData = {
      user_id: user.id,
      session_id: user.id, // Keep session_id for backwards compatibility
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

    console.log('Inserting bill with user_id:', user.id);
    
    const { error } = await supabase
      .from('bill_analyses')
      .insert(insertData as any);

    if (error) {
      console.error('Error saving bill analysis:', error);
      return false;
    }
    
    console.log('Bill saved successfully, refreshing history...');
    await fetchHistory();
    return true;
  }, [user, fetchHistory]);

  const deleteBill = useCallback(async (billId: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('bill_analyses')
      .delete()
      .eq('id', billId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting bill:', error);
      return false;
    }

    await fetchHistory();
    return true;
  }, [user, fetchHistory]);

  return { 
    history, 
    isLoading: isLoading || authLoading, 
    saveBillAnalysis, 
    deleteBill, 
    userId: user?.id, 
    refreshHistory: fetchHistory,
    isAuthenticated 
  };
};
