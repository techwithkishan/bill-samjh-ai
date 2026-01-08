import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import BillSummaryCard from '@/components/insights/BillSummaryCard';
import AIExplanationCard from '@/components/insights/AIExplanationCard';
import NextBillEstimateCard from '@/components/insights/NextBillEstimateCard';
import SavingsTipsCard from '@/components/insights/SavingsTipsCard';
import LanguageSelector from '@/components/insights/LanguageSelector';
import PDFExportButton from '@/components/insights/PDFExportButton';
import { Button } from '@/components/ui/button';
import { BillInsights, SupportedLanguage } from '@/types/bill';
import { mockBillInsights } from '@/data/mockBillData';
import { useBillAnalysis } from '@/hooks/useBillAnalysis';
import { useBillHistory } from '@/hooks/useBillHistory';
import { useToast } from '@/hooks/use-toast';

const Insights = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isProcessing, analyzeBill } = useBillAnalysis();
  const { saveBillAnalysis } = useBillHistory();
  const [insights, setInsights] = useState<BillInsights | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('english');
  const [hasStoredFile, setHasStoredFile] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    // Try to load insights from sessionStorage
    const storedInsights = sessionStorage.getItem('billInsights');
    const storedLanguage = sessionStorage.getItem('selectedLanguage') as SupportedLanguage;
    const storedFile = sessionStorage.getItem('uploadedBillBase64');
    const alreadySaved = sessionStorage.getItem('billSaved');

    if (storedInsights) {
      const parsedInsights = JSON.parse(storedInsights);
      setInsights(parsedInsights);
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage);
      }
      // Auto-save to history if not already saved
      if (!alreadySaved) {
        saveBillAnalysis(parsedInsights).then(() => {
          sessionStorage.setItem('billSaved', 'true');
          setHasSaved(true);
        });
      }
    } else {
      // Use mock data if no real data
      setInsights(mockBillInsights);
    }

    setHasStoredFile(!!storedFile);
  }, [saveBillAnalysis]);

  const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
    const storedBase64 = sessionStorage.getItem('uploadedBillBase64');
    const storedName = sessionStorage.getItem('uploadedBillName');
    const storedType = sessionStorage.getItem('uploadedBillType');

    if (!storedBase64 || !storedName || !storedType) {
      toast({
        title: 'Cannot change language',
        description: 'Original bill data not available. Please upload again.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedLanguage(newLanguage);

    // Convert base64 back to File
    const response = await fetch(storedBase64);
    const blob = await response.blob();
    const file = new File([blob], storedName, { type: storedType });

    const result = await analyzeBill(file, newLanguage);
    if (result) {
      setInsights(result);
      sessionStorage.setItem('billInsights', JSON.stringify(result));
      sessionStorage.setItem('selectedLanguage', newLanguage);
      toast({
        title: 'Language updated',
        description: `Analysis now displayed in ${newLanguage}`,
      });
    }
  };

  if (!insights) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="container-main text-center">
            <p>Loading insights...</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-main">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Link 
                  to="/upload" 
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Upload
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Bill Analysis Results</h1>
                <p className="text-muted-foreground mt-1">
                  Here's what we found in your {insights.billData.billingMonth} electricity bill.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <PDFExportButton insights={insights} />
                <Button variant="outline" asChild>
                  <Link to="/upload">
                    <Upload className="h-4 w-4" />
                    Analyze Another Bill
                  </Link>
                </Button>
              </div>
            </div>

            {/* Language Selector */}
            {hasStoredFile && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Change explanation language:</span>
                <LanguageSelector 
                  value={selectedLanguage} 
                  onChange={handleLanguageChange}
                  disabled={isProcessing}
                />
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Re-analyzing...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BillSummaryCard data={insights.billData} />
            <AIExplanationCard data={insights.aiExplanation} />
            <NextBillEstimateCard data={insights.nextBillEstimate} />
            <SavingsTipsCard tips={insights.savingsTips} />
          </div>

          {/* Learn More CTA */}
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary border border-primary/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  🎓 Want to understand your bill better?
                </h3>
                <p className="text-muted-foreground">
                  Learn how electricity units convert to money with our simple visual guides.
                </p>
              </div>
              <Button asChild>
                <Link to="/learn">Learn Unit ↔ Money Conversion</Link>
              </Button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground text-center">
              <strong className="text-foreground">Note:</strong> These insights are AI-generated estimates based on your bill data. 
              For official billing information, please refer to your electricity provider's official communication.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Insights;
