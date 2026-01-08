import { BillInsights } from "@/types/bill";

export const mockBillInsights: BillInsights = {
  billData: {
    billType: "electricity",
    billingMonth: "December 2024",
    totalUnits: 485,
    totalAmount: 3842,
    previousUnits: 312,
    previousAmount: 2456,
    tariffCategory: "Domestic LT-1",
    consumerNumber: "MH-2024-XXXXXX",
    dueDate: "15 January 2025",
  },
  aiExplanation: {
    summary:
      "Your electricity consumption increased by 55% this month compared to last month. This is primarily due to increased heating appliance usage during winter and extended evening hours.",
    hinglishExplanation:
      "Is mahine aapka bijli ka bill zyada aaya hai kyunki December mein heater aur geyser ka use badh gaya. Raat ko lights bhi zyada der tak chali. Peak hours (6-10 PM) mein usage 40% zyada tha pichle mahine se.",
    factors: [
      "Winter season - Increased heater and geyser usage",
      "Longer evening hours - More lighting consumption",
      "Peak hour usage increased by 40%",
      "Refrigerator working harder due to temperature fluctuations",
    ],
  },
  nextBillEstimate: {
    estimatedUnits: 420,
    estimatedAmount: 3320,
    methodology:
      "Based on your 6-month consumption pattern, seasonal trends, and current usage trajectory. January typically shows 10-15% reduction from December peak.",
    confidence: "medium",
  },
  savingsTips: [
    {
      id: "1",
      icon: "❄️",
      title: "Optimize AC/Heater Temperature",
      description: "Set your heater to 22°C instead of 25°C. Each degree lower can save 3-5% on heating costs.",
      potentialSavings: "₹200-400/month",
    },
    {
      id: "2",
      icon: "🔌",
      title: "Reduce Standby Power",
      description:
        "Unplug chargers, TV, and appliances when not in use. Standby mode can consume up to 10% of your bill.",
      potentialSavings: "₹150-300/month",
    },
    {
      id: "3",
      icon: "⏰",
      title: "Shift Usage to Off-Peak Hours",
      description: "Run washing machine and heavy appliances before 6 PM or after 10 PM to avoid peak tariff rates.",
      potentialSavings: "₹100-250/month",
    },
    {
      id: "4",
      icon: "💡",
      title: "Switch to LED Lighting",
      description: "Replace CFL or incandescent bulbs with LED. LEDs use 75% less energy and last 25 times longer.",
      potentialSavings: "₹80-150/month",
    },
  ],
};

export const getPercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};
