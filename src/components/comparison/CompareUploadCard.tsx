/**
 * Compare Upload Card
 * Individual bill upload component for the comparison feature
 */

import { useState, useCallback } from 'react';
import { Upload, FileImage, FileText, X, Zap, Droplets, Smartphone, Wifi, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BillType, billTypeConfig, BillInsights } from '@/types/bill';
import { cn } from '@/lib/utils';

interface CompareUploadCardProps {
  title: string;
  billNumber: 1 | 2;
  onBillAnalyzed: (insights: BillInsights, month: string, year: string) => void;
  isProcessing: boolean;
  onAnalyze: (file: File, billType: BillType) => Promise<BillInsights | null>;
  analyzedBill: BillInsights | null;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

const billTypeIcons: Record<BillType, React.ReactNode> = {
  electricity: <Zap className="h-5 w-5" />,
  water: <Droplets className="h-5 w-5" />,
  mobile: <Smartphone className="h-5 w-5" />,
  internet: <Wifi className="h-5 w-5" />,
};

const CompareUploadCard = ({ 
  title, 
  billNumber, 
  onBillAnalyzed, 
  isProcessing, 
  onAnalyze,
  analyzedBill 
}: CompareUploadCardProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBillType, setSelectedBillType] = useState<BillType>('electricity');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

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
    const maxSize = 10 * 1024 * 1024;

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
        setIsAnalyzed(false);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setIsAnalyzed(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setIsAnalyzed(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    if (!selectedMonth) {
      setError('Please select a billing month.');
      return;
    }

    const result = await onAnalyze(selectedFile, selectedBillType);
    if (result) {
      setIsAnalyzed(true);
      onBillAnalyzed(result, selectedMonth, selectedYear);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') {
      return <FileText className="h-6 w-6 text-destructive" />;
    }
    return <FileImage className="h-6 w-6 text-primary" />;
  };

  return (
    <Card className={cn(
      'transition-all',
      isAnalyzed && 'ring-2 ring-success/50 bg-success/5',
      billNumber === 1 ? 'border-primary/30' : 'border-secondary'
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{title}</span>
          {isAnalyzed && (
            <span className="flex items-center gap-1 text-success text-sm font-normal">
              <Check className="h-4 w-4" />
              Analyzed
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month & Year Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Billing Month
            </label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={isProcessing}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Year
            </label>
            <Select value={selectedYear} onValueChange={setSelectedYear} disabled={isProcessing}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bill Type Selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Bill Type
          </label>
          <div className="grid grid-cols-4 gap-1.5">
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
                    'flex flex-col items-center gap-1 p-2 rounded-md border transition-all text-xs',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:border-primary/50'
                  )}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span className="font-medium truncate w-full text-center">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Zone */}
        {!selectedFile && !isAnalyzed && (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
              dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id={`file-upload-${billNumber}`}
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleChange}
            />
            <label htmlFor={`file-upload-${billNumber}`} className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  {billTypeIcons[selectedBillType]}
                </div>
                <p className="text-sm font-medium text-foreground">
                  Drop bill here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, PDF (Max 10MB)
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Selected File Preview */}
        {selectedFile && !isAnalyzed && (
          <div className="p-3 rounded-lg bg-secondary border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile.type)}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-1.5 hover:bg-muted rounded transition-colors"
                disabled={isProcessing}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <Button
              onClick={handleAnalyze}
              className="w-full"
              size="sm"
              disabled={isProcessing || !selectedMonth}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Analyze Bill
                </>
              )}
            </Button>
          </div>
        )}

        {/* Analyzed Bill Summary */}
        {isAnalyzed && analyzedBill && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {selectedMonth} {selectedYear}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="h-7 text-xs"
              >
                Change
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Units:</span>
                <span className="ml-1 font-medium">{analyzedBill.billData.totalUnits}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <span className="ml-1 font-medium">₹{analyzedBill.billData.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompareUploadCard;
