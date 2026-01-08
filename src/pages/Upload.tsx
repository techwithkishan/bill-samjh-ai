import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import FileUpload from '@/components/upload/FileUpload';
import LanguageSelector from '@/components/insights/LanguageSelector';
import { Upload as UploadIcon, Zap, Droplets, Smartphone, Wifi } from 'lucide-react';
import { useBillAnalysis } from '@/hooks/useBillAnalysis';
import { useBillHistory } from '@/hooks/useBillHistory';
import { SupportedLanguage, BillType, billTypeConfig } from '@/types/bill';
import { useToast } from '@/hooks/use-toast';

const Upload = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('english');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const { isProcessing, analyzeBill } = useBillAnalysis();
  const { saveBillAnalysis } = useBillHistory();
  const { toast } = useToast();

  const handleFileSelect = async (file: File, billType: BillType) => {
    setCurrentFile(file);
    const result = await analyzeBill(file, selectedLanguage, billType);
    
    if (result) {
      // Auto-save to history
      const saved = await saveBillAnalysis(result);
      if (saved) {
        toast({
          title: 'Bill Saved',
          description: 'Your bill has been saved to history.',
        });
      }

      // Store insights and file in sessionStorage for the insights page
      sessionStorage.setItem('billInsights', JSON.stringify(result));
      sessionStorage.setItem('selectedLanguage', selectedLanguage);
      sessionStorage.setItem('selectedBillType', billType);
      
      // Store the file as base64 for re-analysis with different language
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        sessionStorage.setItem('uploadedBillBase64', reader.result as string);
        sessionStorage.setItem('uploadedBillName', file.name);
        sessionStorage.setItem('uploadedBillType', file.type);
        navigate('/insights');
      };
    }
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-main">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
              <UploadIcon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Upload Your Utility Bill
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
              Upload a clear photo or PDF of your utility bill. 
              Our AI will analyze it and explain everything in simple language.
            </p>

            {/* Bill Types Preview */}
            <div className="flex justify-center gap-4 mb-6">
              {(Object.keys(billTypeConfig) as BillType[]).map((type) => (
                <div key={type} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span>{billTypeConfig[type].icon}</span>
                  <span>{billTypeConfig[type].label}</span>
                </div>
              ))}
            </div>

            {/* Language Selector */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary">
                <span className="text-sm text-muted-foreground">Explanation Language:</span>
                <LanguageSelector 
                  value={selectedLanguage} 
                  onChange={setSelectedLanguage}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />

          {/* Processing State */}
          {isProcessing && (
            <div className="mt-8 text-center">
              <div className="inline-flex flex-col items-center gap-4 p-6 rounded-xl bg-secondary">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Analyzing your bill...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reading bill details with AI vision and generating insights
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Supported Providers */}
          <div className="mt-16 space-y-8">
            {(Object.keys(billTypeConfig) as BillType[]).map((type) => (
              <div key={type} className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
                  <span className="text-xl">{billTypeConfig[type].icon}</span>
                  Supported {billTypeConfig[type].label} Providers
                </h3>
                <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
                  {billTypeConfig[type].providers.map((provider) => (
                    <span key={provider} className="px-4 py-2 rounded-full bg-muted">
                      {provider}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-sm text-muted-foreground text-center">
              And many more service providers across India
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Upload;
