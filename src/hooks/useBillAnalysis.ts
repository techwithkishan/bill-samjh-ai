import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BillInsights, SupportedLanguage, BillType } from '@/types/bill';
import { useToast } from '@/hooks/use-toast';

export const useBillAnalysis = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<BillInsights | null>(null);
  const { toast } = useToast();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const analyzeBill = async (
    file: File, 
    language: SupportedLanguage = 'english',
    billType: BillType = 'electricity'
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      
      const { data, error: functionError } = await supabase.functions.invoke('analyze-bill', {
        body: { imageBase64: base64, language, billType }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Ensure billType is set in the response
      if (data.billData) {
        data.billData.billType = billType;
      }

      setInsights(data as BillInsights);
      return data as BillInsights;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze bill';
      setError(message);
      toast({
        title: 'Analysis Failed',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const reanalyzeWithLanguage = async (
    file: File, 
    language: SupportedLanguage,
    billType: BillType = 'electricity'
  ) => {
    return analyzeBill(file, language, billType);
  };

  return {
    isProcessing,
    error,
    insights,
    analyzeBill,
    reanalyzeWithLanguage,
    setInsights,
  };
};
