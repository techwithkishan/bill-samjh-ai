/**
 * Bill Selector Component
 * Dropdown selectors for choosing bills to compare with bill type filtering
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BillRecord } from '@/types/comparison';
import { BillType, billTypeConfig } from '@/types/bill';
import { format } from 'date-fns';

interface BillSelectorProps {
  bills: BillRecord[];
  selectedId: string;
  onChange: (id: string) => void;
  excludeIds?: string[];
  label: string;
  placeholder?: string;
  billTypeFilter?: string;
}

const getBillTypeEmoji = (billType: string): string => {
  const type = billType as BillType;
  return billTypeConfig[type]?.icon || '📄';
};

const getBillTypeUnit = (billType: string): string => {
  const type = billType as BillType;
  return billTypeConfig[type]?.unit || 'units';
};

export const BillSelector = ({
  bills,
  selectedId,
  onChange,
  excludeIds = [],
  label,
  placeholder = 'Select a bill',
  billTypeFilter,
}: BillSelectorProps) => {
  let availableBills = bills.filter(b => !excludeIds.includes(b.id));
  
  // Filter by bill type if specified
  if (billTypeFilter && billTypeFilter !== 'all') {
    availableBills = availableBills.filter(b => b.bill_type === billTypeFilter);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Select value={selectedId} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {availableBills.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No bills available
            </div>
          ) : (
            availableBills.map((bill) => (
              <SelectItem key={bill.id} value={bill.id}>
                <div className="flex items-center gap-2">
                  <span>{getBillTypeEmoji(bill.bill_type)}</span>
                  <span className="font-medium">{bill.billing_month}</span>
                  <Badge variant="outline" className="text-xs">
                    ₹{bill.total_amount.toLocaleString()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(bill.created_at), 'dd MMM yy')}
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

interface MultiBillSelectorProps {
  bills: BillRecord[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  excludeIds?: string[];
  label: string;
  maxSelections?: number;
  billTypeFilter?: string;
}

export const MultiBillSelector = ({
  bills,
  selectedIds,
  onChange,
  excludeIds = [],
  label,
  maxSelections = 3,
  billTypeFilter,
}: MultiBillSelectorProps) => {
  let availableBills = bills.filter(b => !excludeIds.includes(b.id));
  
  // Filter by bill type if specified
  if (billTypeFilter && billTypeFilter !== 'all') {
    availableBills = availableBills.filter(b => b.bill_type === billTypeFilter);
  }

  const handleToggle = (billId: string) => {
    if (selectedIds.includes(billId)) {
      onChange(selectedIds.filter(id => id !== billId));
    } else if (selectedIds.length < maxSelections) {
      onChange([...selectedIds, billId]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label} <span className="text-muted-foreground">(max {maxSelections})</span>
      </label>
      <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto bg-background">
        {availableBills.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            No other bills available for comparison
          </p>
        ) : (
          availableBills.map((bill) => {
            const isSelected = selectedIds.includes(bill.id);
            const isDisabled = !isSelected && selectedIds.length >= maxSelections;
            
            return (
              <button
                key={bill.id}
                type="button"
                onClick={() => handleToggle(bill.id)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                  isSelected 
                    ? 'bg-primary/10 border border-primary/30' 
                    : isDisabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span>{getBillTypeEmoji(bill.bill_type)}</span>
                  <span className="font-medium text-sm">{bill.billing_month}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    ₹{bill.total_amount.toLocaleString()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {bill.total_units} {getBillTypeUnit(bill.bill_type)}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
      {selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} of {maxSelections} selected
        </p>
      )}
    </div>
  );
};

interface BillTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
  bills: BillRecord[];
}

export const BillTypeFilter = ({ value, onChange, bills }: BillTypeFilterProps) => {
  // Get unique bill types from the bills
  const billTypes = [...new Set(bills.map(b => b.bill_type))];
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Filter by Bill Type</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All bill types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <span className="flex items-center gap-2">
              📊 All Bill Types
            </span>
          </SelectItem>
          {billTypes.map((type) => {
            const config = billTypeConfig[type as BillType];
            const count = bills.filter(b => b.bill_type === type).length;
            return (
              <SelectItem key={type} value={type}>
                <span className="flex items-center gap-2">
                  {config?.icon || '📄'} {config?.label || type}
                  <Badge variant="secondary" className="text-xs ml-1">
                    {count}
                  </Badge>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
