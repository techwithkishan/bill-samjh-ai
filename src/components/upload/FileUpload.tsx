import { useState, useCallback } from 'react';
import { Upload, FileImage, FileText, X, AlertCircle, Zap, Droplets, Smartphone, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BillType, billTypeConfig } from '@/types/bill';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File, billType: BillType) => void;
  isProcessing: boolean;
}

const billTypeIcons: Record<BillType, React.ReactNode> = {
  electricity: <Zap className="h-5 w-5" />,
  water: <Droplets className="h-5 w-5" />,
  mobile: <Smartphone className="h-5 w-5" />,
  internet: <Wifi className="h-5 w-5" />,
};

const FileUpload = ({ onFileSelect, isProcessing }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBillType, setSelectedBillType] = useState<BillType>('electricity');
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or PDF file.');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileSelect(selectedFile, selectedBillType);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-destructive" />;
    }
    return <FileImage className="h-8 w-8 text-primary" />;
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Bill Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3 text-center">
          What type of bill are you uploading?
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(billTypeConfig) as BillType[]).map((type) => {
            const config = billTypeConfig[type];
            const isSelected = selectedBillType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedBillType(type)}
                disabled={isProcessing}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-secondary'
                )}
              >
                <span className="text-2xl">{config.icon}</span>
                <span className="text-xs font-medium">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Zone */}
      {!selectedFile && (
        <div
          className={`upload-zone ${dragActive ? 'upload-zone-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleChange}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                {billTypeIcons[selectedBillType]}
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Drag and drop your {billTypeConfig[selectedBillType].label.toLowerCase()} bill here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse files
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileImage className="h-4 w-4" />
                  JPG, PNG
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  PDF
                </span>
                <span>Max 10MB</span>
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !error && (
        <div className="mt-4 p-4 rounded-lg bg-secondary border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile.type)}
              <div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Selected Bill Type Badge */}
          <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10 mb-4">
            <span className="text-lg">{billTypeConfig[selectedBillType].icon}</span>
            <span className="text-sm font-medium text-primary">
              {billTypeConfig[selectedBillType].label} Bill
            </span>
          </div>

          <Button
            onClick={handleAnalyze}
            className="w-full"
            size="lg"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Analyzing {billTypeConfig[selectedBillType].label} Bill...
              </>
            ) : (
              <>Analyze This {billTypeConfig[selectedBillType].label} Bill</>
            )}
          </Button>
        </div>
      )}

      {/* Privacy Note */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground text-center">
          🔒 <strong>Your privacy matters.</strong> Your bill data is used only for analysis 
          and is not stored permanently on our servers.
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
