import { Link } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import BillSummaryCard from '@/components/insights/BillSummaryCard';
import AIExplanationCard from '@/components/insights/AIExplanationCard';
import NextBillEstimateCard from '@/components/insights/NextBillEstimateCard';
import SavingsTipsCard from '@/components/insights/SavingsTipsCard';
import { Button } from '@/components/ui/button';
import { mockBillInsights } from '@/data/mockBillData';

const Insights = () => {
  const insights = mockBillInsights;

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-main">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
            <Button variant="outline" asChild>
              <Link to="/upload">
                <Upload className="h-4 w-4" />
                Analyze Another Bill
              </Link>
            </Button>
          </div>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BillSummaryCard data={insights.billData} />
            <AIExplanationCard data={insights.aiExplanation} />
            <NextBillEstimateCard data={insights.nextBillEstimate} />
            <SavingsTipsCard tips={insights.savingsTips} />
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
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
