import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { governmentSchemes as fallbackSchemes, GovernmentScheme } from '@/data/governmentSchemes';
import { useToast } from '@/hooks/use-toast';

interface FetchSchemesParams {
  state: string;
  monthlyConsumption?: number;
  category?: string;
}

interface SchemesResponse {
  schemes: GovernmentScheme[];
  eligibilityNotes?: string;
  fetchedAt?: string;
  source?: string;
}

export const useGovernmentSchemes = () => {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<GovernmentScheme[]>(fallbackSchemes);
  const [eligibilityNotes, setEligibilityNotes] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [isLiveData, setIsLiveData] = useState(false);

  const fetchSchemes = useCallback(async ({ state, monthlyConsumption, category }: FetchSchemesParams) => {
    setIsLoading(true);
    
    try {
      console.log('Fetching live government schemes for:', state);
      
      const { data, error } = await supabase.functions.invoke('fetch-government-schemes', {
        body: { state, monthlyConsumption, category }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to fetch schemes');
      }

      if (data?.fallback) {
        // Rate limited or error - use fallback data
        console.log('Using fallback data due to:', data.error);
        setSchemes(fallbackSchemes);
        setIsLiveData(false);
        toast({
          title: 'Using cached data',
          description: 'Live updates temporarily unavailable. Showing saved schemes.',
          variant: 'default',
        });
        return;
      }

      if (data?.schemes && Array.isArray(data.schemes)) {
        // Map the response to ensure consistent structure
        const mappedSchemes: GovernmentScheme[] = data.schemes.map((scheme: any, index: number) => ({
          id: scheme.id || `live-scheme-${index}`,
          name: scheme.name || 'Unknown Scheme',
          description: scheme.description || '',
          eligibility: Array.isArray(scheme.eligibility) ? scheme.eligibility : [],
          benefits: scheme.benefits || '',
          applicableStates: Array.isArray(scheme.applicableStates) ? scheme.applicableStates : ['All India'],
          category: ['subsidy', 'free_electricity', 'solar', 'discount'].includes(scheme.category) 
            ? scheme.category 
            : 'subsidy',
          sourceLink: scheme.sourceLink || undefined,
          lastUpdated: scheme.lastUpdated || new Date().toISOString().split('T')[0],
          isActive: scheme.isActive !== false,
          applicationProcess: scheme.applicationProcess,
          deadline: scheme.deadline,
        }));

        setSchemes(mappedSchemes);
        setEligibilityNotes(data.eligibilityNotes || null);
        setLastFetched(data.fetchedAt || new Date().toISOString());
        setIsLiveData(true);

        console.log(`Loaded ${mappedSchemes.length} live schemes`);
        
        toast({
          title: 'Schemes updated',
          description: `Found ${mappedSchemes.length} schemes for ${state}`,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch live schemes:', error);
      
      // Use fallback data on error
      setSchemes(fallbackSchemes);
      setIsLiveData(false);
      
      toast({
        title: 'Could not fetch live updates',
        description: 'Showing cached scheme data. Try refreshing later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const refreshSchemes = useCallback((state: string, monthlyConsumption?: number) => {
    return fetchSchemes({ state, monthlyConsumption });
  }, [fetchSchemes]);

  return {
    schemes,
    eligibilityNotes,
    isLoading,
    lastFetched,
    isLiveData,
    fetchSchemes,
    refreshSchemes,
  };
};
