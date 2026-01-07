import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import FileUpload from '@/components/upload/FileUpload';
import { Upload as UploadIcon } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    
    // Simulate API call with timeout
    // In production, this would call the Azure backend
    setTimeout(() => {
      setIsProcessing(false);
      // Navigate to insights page with mock data
      navigate('/insights');
    }, 2500);
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
              Upload Your Electricity Bill
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Upload a clear photo or PDF of your electricity bill. 
              Our AI will analyze it and explain everything in simple language.
            </p>
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
                    Reading bill details using OCR and processing with AI
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Supported Bills */}
          <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Supported Electricity Boards
            </h3>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              {['MSEDCL', 'TPDDL', 'BSES', 'CESC', 'TANGEDCO', 'BESCOM', 'APSPDCL', 'UPPCL', 'PGVCL', 'WBSEDCL'].map((board) => (
                <span key={board} className="px-4 py-2 rounded-full bg-muted">
                  {board}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              And all other state electricity boards across India
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Upload;
