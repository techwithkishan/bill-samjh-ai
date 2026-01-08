import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BillTrackingChart from '@/components/analytics/BillTrackingChart';
import RateAnalysisChart from '@/components/analytics/RateAnalysisChart';
import BillForecastCard from '@/components/analytics/BillForecastCard';
import GovernmentSchemesSection from '@/components/analytics/GovernmentSchemesSection';
import AnalyticsSummaryCards from '@/components/analytics/AnalyticsSummaryCards';
import { 
  Upload, 
  BarChart3, 
  TrendingUp, 
  Landmark,
  AlertCircle,
  LineChart,
} from 'lucide-react';

const Analytics = () => {
  const { 
    chartData, 
    rateAnalysis, 
    prediction, 
    stats, 
    trends, 
    isLoading,
    hasEnoughData,
  } = useAnalytics();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Electricity Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Track usage patterns, predict future bills, and discover government schemes
              </p>
            </div>
            <Button asChild>
              <Link to="/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Bill
              </Link>
            </Button>
          </div>

          {chartData.length === 0 ? (
            /* No Data State */
            <Card className="text-center py-16">
              <CardContent>
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Start Your Analytics Journey</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Upload your electricity bills to unlock powerful analytics, predictions, and personalized insights.
                </p>
                <Button asChild size="lg">
                  <Link to="/upload">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Your First Bill
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Main Analytics Content */
            <Tabs defaultValue="usage" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
                <TabsTrigger value="usage" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  <span className="hidden sm:inline">Usage & Billing</span>
                  <span className="sm:hidden">Usage</span>
                </TabsTrigger>
                <TabsTrigger value="forecast" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Forecast</span>
                  <span className="sm:hidden">Forecast</span>
                </TabsTrigger>
                <TabsTrigger value="schemes" className="flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  <span className="hidden sm:inline">Govt. Schemes</span>
                  <span className="sm:hidden">Schemes</span>
                </TabsTrigger>
              </TabsList>

              {/* Usage & Billing Tab */}
              <TabsContent value="usage" className="space-y-6">
                {/* Summary Cards */}
                <AnalyticsSummaryCards stats={stats} trends={trends} />

                {/* Bill Tracking Chart */}
                <BillTrackingChart data={chartData} prediction={prediction} />

                {/* Rate Analysis */}
                <RateAnalysisChart data={rateAnalysis} avgRate={stats.avgRate} />
              </TabsContent>

              {/* AI Forecast Tab */}
              <TabsContent value="forecast" className="space-y-6">
                {!hasEnoughData ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">More Data Needed</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-4">
                        We need at least 3 months of bill data to generate accurate predictions. 
                        You currently have {chartData.length} bill(s) analyzed.
                      </p>
                      <Button asChild variant="outline">
                        <Link to="/upload">Upload More Bills</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Forecast Card */}
                    {prediction && (
                      <BillForecastCard prediction={prediction} />
                    )}

                    {/* Forecast Chart Preview */}
                    <div className="lg:row-span-1">
                      <BillTrackingChart data={chartData} prediction={prediction} />
                    </div>
                  </div>
                )}

                {/* Tips for Better Predictions */}
                {hasEnoughData && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        💡 Tips for Better Predictions
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-foreground font-medium">Upload Regularly</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Monthly uploads improve prediction accuracy
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-foreground font-medium">6+ Months Data</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            More history = better seasonal adjustments
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-foreground font-medium">Consistent Usage</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Regular patterns lead to higher confidence
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Government Schemes Tab */}
              <TabsContent value="schemes">
                <GovernmentSchemesSection />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
