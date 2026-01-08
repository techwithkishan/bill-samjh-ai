import { useMemo } from 'react';
import { useBillHistory } from './useBillHistory';

export interface BillDataPoint {
  month: string;
  units: number;
  amount: number;
  perUnitRate: number;
  fixedCharges: number;
  date: string;
  rawDate: Date;
}

export interface RateAnalysis {
  month: string;
  rate: number;
  changePercent: number | null;
  isSpike: boolean;
}

export interface BillPrediction {
  predictedUnits: number;
  predictedAmount: number;
  confidenceRange: { min: number; max: number };
  confidenceLevel: 'low' | 'medium' | 'high';
  methodology: string;
  factors: string[];
}

export const useAnalytics = () => {
  const { history, isLoading } = useBillHistory();

  const chartData = useMemo((): BillDataPoint[] => {
    return [...history]
      .reverse()
      .map((record) => {
        const perUnitRate = record.total_units > 0 
          ? Number((record.total_amount / record.total_units).toFixed(2))
          : 0;
        
        return {
          month: record.billing_month,
          units: record.total_units,
          amount: record.total_amount,
          perUnitRate,
          fixedCharges: 0, // Will be enhanced when we have this data
          date: new Date(record.created_at).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short' 
          }),
          rawDate: new Date(record.created_at),
        };
      });
  }, [history]);

  const rateAnalysis = useMemo((): RateAnalysis[] => {
    return chartData.map((point, index) => {
      const prevPoint = chartData[index - 1];
      let changePercent: number | null = null;
      
      if (prevPoint && prevPoint.perUnitRate > 0) {
        changePercent = Number(
          (((point.perUnitRate - prevPoint.perUnitRate) / prevPoint.perUnitRate) * 100).toFixed(1)
        );
      }

      // Flag as spike if rate increased by more than 15%
      const isSpike = changePercent !== null && changePercent > 15;

      return {
        month: point.month,
        rate: point.perUnitRate,
        changePercent,
        isSpike,
      };
    });
  }, [chartData]);

  const prediction = useMemo((): BillPrediction | null => {
    if (chartData.length < 3) return null;

    const recentMonths = chartData.slice(-6);
    const avgUnits = recentMonths.reduce((sum, p) => sum + p.units, 0) / recentMonths.length;
    const avgAmount = recentMonths.reduce((sum, p) => sum + p.amount, 0) / recentMonths.length;
    const avgRate = recentMonths.reduce((sum, p) => sum + p.perUnitRate, 0) / recentMonths.length;

    // Calculate trend (simple linear regression approximation)
    let unitsTrend = 0;
    if (recentMonths.length >= 3) {
      const firstHalf = recentMonths.slice(0, Math.floor(recentMonths.length / 2));
      const secondHalf = recentMonths.slice(Math.floor(recentMonths.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, p) => sum + p.units, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, p) => sum + p.units, 0) / secondHalf.length;
      
      unitsTrend = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
    }

    // Seasonal adjustment (simplified - winter months typically have higher usage)
    const currentMonth = new Date().getMonth();
    const isWinterMonth = currentMonth >= 10 || currentMonth <= 1;
    const isSummerMonth = currentMonth >= 3 && currentMonth <= 6;
    
    let seasonalFactor = 1;
    if (isWinterMonth) seasonalFactor = 1.1;
    else if (isSummerMonth) seasonalFactor = 1.15;

    // Calculate prediction
    const predictedUnits = Math.round(avgUnits * (1 + unitsTrend * 0.5) * seasonalFactor);
    const predictedAmount = Math.round(predictedUnits * avgRate);

    // Calculate confidence range (±5-15% based on data variance)
    const variance = recentMonths.reduce((sum, p) => sum + Math.pow(p.units - avgUnits, 2), 0) / recentMonths.length;
    const stdDev = Math.sqrt(variance);
    const variationCoefficient = stdDev / avgUnits;

    let confidenceLevel: 'low' | 'medium' | 'high' = 'medium';
    let rangePercent = 0.1;

    if (recentMonths.length >= 6 && variationCoefficient < 0.15) {
      confidenceLevel = 'high';
      rangePercent = 0.05;
    } else if (recentMonths.length < 4 || variationCoefficient > 0.3) {
      confidenceLevel = 'low';
      rangePercent = 0.15;
    }

    const factors: string[] = [];
    if (unitsTrend > 0.05) factors.push('Rising consumption trend detected');
    if (unitsTrend < -0.05) factors.push('Declining consumption trend detected');
    if (isWinterMonth) factors.push('Winter season adjustment (+10%)');
    if (isSummerMonth) factors.push('Summer season adjustment (+15% for cooling)');
    if (recentMonths.length >= 6) factors.push('Based on 6 months of data');
    else factors.push(`Based on ${recentMonths.length} months of data`);

    return {
      predictedUnits,
      predictedAmount,
      confidenceRange: {
        min: Math.round(predictedAmount * (1 - rangePercent)),
        max: Math.round(predictedAmount * (1 + rangePercent)),
      },
      confidenceLevel,
      methodology: `Prediction uses weighted moving average of last ${recentMonths.length} months, adjusted for seasonal patterns and consumption trends.`,
      factors,
    };
  }, [chartData]);

  // Summary statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { avgUnits: 0, avgAmount: 0, avgRate: 0, totalBills: 0, maxUnits: 0, minUnits: 0 };
    }

    const avgUnits = Math.round(chartData.reduce((sum, p) => sum + p.units, 0) / chartData.length);
    const avgAmount = Math.round(chartData.reduce((sum, p) => sum + p.amount, 0) / chartData.length);
    const avgRate = Number((chartData.reduce((sum, p) => sum + p.perUnitRate, 0) / chartData.length).toFixed(2));
    const maxUnits = Math.max(...chartData.map(p => p.units));
    const minUnits = Math.min(...chartData.map(p => p.units));

    return {
      avgUnits,
      avgAmount,
      avgRate,
      totalBills: chartData.length,
      maxUnits,
      minUnits,
    };
  }, [chartData]);

  // Latest trends
  const trends = useMemo(() => {
    if (chartData.length < 2) {
      return { unitsChange: null, amountChange: null, rateChange: null };
    }

    const latest = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];

    return {
      unitsChange: Number((((latest.units - previous.units) / previous.units) * 100).toFixed(1)),
      amountChange: Number((((latest.amount - previous.amount) / previous.amount) * 100).toFixed(1)),
      rateChange: previous.perUnitRate > 0 
        ? Number((((latest.perUnitRate - previous.perUnitRate) / previous.perUnitRate) * 100).toFixed(1))
        : null,
    };
  }, [chartData]);

  return {
    chartData,
    rateAnalysis,
    prediction,
    stats,
    trends,
    isLoading,
    hasEnoughData: chartData.length >= 3,
  };
};
