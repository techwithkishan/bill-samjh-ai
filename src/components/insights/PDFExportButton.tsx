import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BillInsights } from '@/types/bill';
import jsPDF from 'jspdf';

interface PDFExportButtonProps {
  insights: BillInsights;
}

const PDFExportButton = ({ insights }: PDFExportButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;
      const lineHeight = 7;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Helper function to add wrapped text
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * lineHeight);
      };

      // Title
      pdf.setFontSize(22);
      pdf.setTextColor(0, 119, 181);
      pdf.text('BillSamajh AI', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Electricity Bill Analysis Report', margin, yPosition);
      yPosition += 15;

      // Divider
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Bill Summary Section
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Bill Summary', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      
      const summaryData = [
        ['Billing Month:', insights.billData.billingMonth],
        ['Total Units:', `${insights.billData.totalUnits} kWh`],
        ['Total Amount:', `Rs. ${insights.billData.totalAmount.toLocaleString()}`],
        ['Previous Units:', `${insights.billData.previousUnits} kWh`],
        ['Previous Amount:', `Rs. ${insights.billData.previousAmount.toLocaleString()}`],
        ['Tariff Category:', insights.billData.tariffCategory],
        ['Due Date:', insights.billData.dueDate],
      ];

      summaryData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 45, yPosition);
        yPosition += lineHeight;
      });

      yPosition += 5;

      // AI Explanation Section
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('AI Analysis', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      yPosition = addWrappedText(insights.aiExplanation.summary, margin, yPosition, contentWidth);
      yPosition += 5;

      // Key Factors
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Factors:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      yPosition += lineHeight;

      insights.aiExplanation.factors.forEach((factor, index) => {
        yPosition = addWrappedText(`${index + 1}. ${factor}`, margin + 5, yPosition, contentWidth - 5);
      });

      yPosition += 5;

      // Next Bill Estimate
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Next Bill Estimate', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Estimated Units: ${insights.nextBillEstimate.estimatedUnits} kWh`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Estimated Amount: Rs. ${insights.nextBillEstimate.estimatedAmount.toLocaleString()}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Confidence: ${insights.nextBillEstimate.confidence.toUpperCase()}`, margin, yPosition);
      yPosition += lineHeight + 5;

      // Check if we need a new page for savings tips
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
      }

      // Savings Tips
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Savings Tips', margin, yPosition);
      yPosition += 10;

      insights.savingsTips.forEach((tip) => {
        if (yPosition > 260) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 119, 181);
        pdf.text(`${tip.icon} ${tip.title}`, margin, yPosition);
        yPosition += lineHeight;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        yPosition = addWrappedText(tip.description, margin, yPosition, contentWidth);
        
        pdf.setTextColor(0, 150, 0);
        pdf.text(`Potential Savings: ${tip.potentialSavings}`, margin, yPosition);
        yPosition += lineHeight + 5;
      });

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          'Generated by BillSamajh AI - This is an AI-generated estimate for educational purposes only.',
          margin,
          pdf.internal.pageSize.getHeight() - 10
        );
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin - 20,
          pdf.internal.pageSize.getHeight() - 10
        );
      }

      // Save the PDF
      pdf.save(`BillSamajh_Report_${insights.billData.billingMonth.replace(/\s/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline" disabled={isGenerating}>
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Report
        </>
      )}
    </Button>
  );
};

export default PDFExportButton;
