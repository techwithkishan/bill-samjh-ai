import { Calendar, Zap, IndianRupee, TrendingUp, TrendingDown, Droplets, Smartphone, Wifi } from 'lucide-react';
import { BillData, BillType, billTypeConfig } from '@/types/bill';
import { getPercentageChange } from '@/data/mockBillData';

interface BillSummaryCardProps {
  data: BillData;
}

const BillTypeIcon = ({ type, className }: { type: BillType; className?: string }) => {
  const icons: Record<BillType, React.ReactNode> = {
    electricity: <Zap className={className} />,
    water: <Droplets className={className} />,
    mobile: <Smartphone className={className} />,
    internet: <Wifi className={className} />,
  };
  return icons[type] || icons.electricity;
};

const BillSummaryCard = ({ data }: BillSummaryCardProps) => {
  const billType = data.billType || 'electricity';
  const config = billTypeConfig[billType];
  const unitsChange = getPercentageChange(data.totalUnits, data.previousUnits);
  const amountChange = getPercentageChange(data.totalAmount, data.previousAmount);
  const isIncrease = amountChange > 0;

  return (
    <div className="insight-card animate-fade-in">
      <div className="insight-card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-primary" />
            Bill Summary
          </h3>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </div>
        </div>
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
            <div className="text-sm text-muted-foreground mb-1">
              {billType === 'mobile' ? 'Mobile Number' : 
               billType === 'internet' ? 'Customer ID' : 
               'Consumer Number'}
            </div>
            <p className="text-xl font-semibold text-foreground">{data.consumerNumber}</p>
          </div>

          {/* Total Units/Usage */}
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BillTypeIcon type={billType} className="h-4 w-4" />
              <span className="text-sm">{config.unitLabel}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="stat-value">{data.totalUnits}</span>
              <span className="text-muted-foreground">{config.unit}</span>
            </div>
            {data.previousUnits > 0 && (
              <div className={isIncrease ? 'badge-increase mt-2' : 'badge-decrease mt-2'}>
                {isIncrease ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(unitsChange)}% vs last month
              </div>
            )}
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
            {data.previousAmount > 0 && (
              <div className={isIncrease ? 'badge-increase mt-2' : 'badge-decrease mt-2'}>
                {isIncrease ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(amountChange)}% vs last month
              </div>
            )}
          </div>
        </div>

        {/* Additional Info - Type Specific */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">
              {billType === 'mobile' || billType === 'internet' ? 'Plan Name' : 'Tariff Category'}
            </span>
            <p className="font-medium text-foreground">{data.planName || data.tariffCategory}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Due Date</span>
            <p className="font-medium text-foreground">{data.dueDate}</p>
          </div>

          {/* Type-specific fields */}
          {billType === 'mobile' && data.talkTime !== undefined && (
            <>
              <div>
                <span className="text-sm text-muted-foreground">Talk Time Used</span>
                <p className="font-medium text-foreground">{data.talkTime} mins</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">SMS Sent</span>
                <p className="font-medium text-foreground">{data.smsCount || 0}</p>
              </div>
            </>
          )}

          {billType === 'internet' && data.connectionSpeed && (
            <div>
              <span className="text-sm text-muted-foreground">Connection Speed</span>
              <p className="font-medium text-foreground">{data.connectionSpeed}</p>
            </div>
          )}

          {billType === 'water' && data.sewerageCharges !== undefined && (
            <div>
              <span className="text-sm text-muted-foreground">Sewerage Charges</span>
              <p className="font-medium text-foreground">₹{data.sewerageCharges}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillSummaryCard;
