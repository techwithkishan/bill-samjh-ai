import { Calendar, Zap, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { BillData } from '@/types/bill';
import { getPercentageChange } from '@/data/mockBillData';

interface BillSummaryCardProps {
  data: BillData;
}

const BillSummaryCard = ({ data }: BillSummaryCardProps) => {
  const unitsChange = getPercentageChange(data.totalUnits, data.previousUnits);
  const amountChange = getPercentageChange(data.totalAmount, data.previousAmount);
  const isIncrease = amountChange > 0;

  return (
    <div className="insight-card animate-fade-in">
      <div className="insight-card-header">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" />
          Bill Summary
        </h3>
      </div>
      <div className="insight-card-body">
        <div className="grid grid-cols-2 gap-6">
          {/* Billing Month */}
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Billing Month</span>
            </div>
            <p className="text-xl font-semibold text-foreground">{data.billingMonth}</p>
          </div>

          {/* Consumer Number */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">Consumer Number</div>
            <p className="text-xl font-semibold text-foreground">{data.consumerNumber}</p>
          </div>

          {/* Total Units */}
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Units Consumed</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="stat-value">{data.totalUnits}</span>
              <span className="text-muted-foreground">kWh</span>
            </div>
            <div className={isIncrease ? 'badge-increase mt-2' : 'badge-decrease mt-2'}>
              {isIncrease ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(unitsChange)}% vs last month
            </div>
          </div>

          {/* Total Amount */}
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm">Total Amount</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="stat-value">₹{data.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className={isIncrease ? 'badge-increase mt-2' : 'badge-decrease mt-2'}>
              {isIncrease ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(amountChange)}% vs last month
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Tariff Category</span>
            <p className="font-medium text-foreground">{data.tariffCategory}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Due Date</span>
            <p className="font-medium text-foreground">{data.dueDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillSummaryCard;
