export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string[];
  benefits: string;
  applicableStates: string[];
  category: 'subsidy' | 'free_electricity' | 'solar' | 'discount';
  sourceLink?: string;
  lastUpdated: string;
  isActive: boolean;
}

export const indianStates = [
  'All India',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export type IndianState = typeof indianStates[number];

export const governmentSchemes: GovernmentScheme[] = [
  {
    id: 'pm-surya-ghar',
    name: 'PM Surya Ghar Muft Bijli Yojana',
    description: 'Free electricity scheme providing up to 300 units of free electricity per month through rooftop solar installation with central government subsidy.',
    eligibility: [
      'Indian citizen with valid documents',
      'Residential electricity consumer',
      'Should have suitable rooftop for solar installation',
      'Connected to DISCOM grid',
    ],
    benefits: 'Subsidy of ₹30,000-₹78,000 for rooftop solar installation + 300 units free electricity monthly',
    applicableStates: ['All India'],
    category: 'solar',
    sourceLink: 'https://pmsuryaghar.gov.in',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
  {
    id: 'delhi-free-200',
    name: 'Delhi Free Electricity Scheme',
    description: 'Consumers using up to 200 units per month get 100% subsidy on their electricity bill. 50% subsidy for 201-400 units consumption.',
    eligibility: [
      'Delhi resident with domestic electricity connection',
      'Consumption up to 400 units monthly',
      'Valid Aadhaar-linked electricity account',
    ],
    benefits: 'Free electricity for 0-200 units, 50% discount for 201-400 units',
    applicableStates: ['Delhi'],
    category: 'free_electricity',
    sourceLink: 'https://delhigovt.nic.in',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
  {
    id: 'punjab-300-free',
    name: 'Punjab 300 Unit Free Electricity',
    description: 'Domestic consumers in Punjab get 300 units of free electricity per month under the state government scheme.',
    eligibility: [
      'Punjab resident with domestic connection',
      'Monthly consumption up to 300 units',
      'Valid electricity bill account',
    ],
    benefits: '300 units of free electricity per month for domestic consumers',
    applicableStates: ['Punjab'],
    category: 'free_electricity',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
  {
    id: 'rajasthan-100-free',
    name: 'Rajasthan Gruha Jyoti Yojana',
    description: 'Domestic consumers in Rajasthan receive 100 units of free electricity per month under this state scheme.',
    eligibility: [
      'Rajasthan resident with domestic connection',
      'BPL or low-income category (priority)',
      'Valid Bhamashah/Jan Aadhaar linked',
    ],
    benefits: '100 units free electricity per month + subsidized rates thereafter',
    applicableStates: ['Rajasthan'],
    category: 'free_electricity',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
  {
    id: 'karnataka-gruha-jyoti',
    name: 'Karnataka Gruha Jyoti Scheme',
    description: 'Karnataka state scheme providing 200 units of free electricity to all domestic consumers per month.',
    eligibility: [
      'Karnataka resident with domestic LT connection',
      'Valid government-issued ID',
      'Only one free connection per household',
    ],
    benefits: '200 units free electricity per month for all domestic consumers',
    applicableStates: ['Karnataka'],
    category: 'free_electricity',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
  {
    id: 'telangana-gruha-jyoti',
    name: 'Telangana Gruha Jyoti Scheme',
    description: 'Free electricity of 200 units per month for domestic consumers in Telangana under state welfare scheme.',
    eligibility: [
      'Telangana resident',
      'Domestic electricity consumer',
      'Monthly consumption within 200 units',
    ],
    benefits: '200 units free electricity monthly for households',
    applicableStates: ['Telangana'],
    category: 'free_electricity',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
  {
    id: 'mp-bijli-bill-mafi',
    name: 'MP Bijli Bill Mafi Yojana',
    description: 'Madhya Pradesh waiver scheme for pending electricity bills for eligible domestic consumers.',
    eligibility: [
      'Madhya Pradesh resident',
      'Domestic connection with pending bills',
      'Low-income or BPL category consumers',
    ],
    benefits: 'Waiver of outstanding electricity bills up to specified limits',
    applicableStates: ['Madhya Pradesh'],
    category: 'subsidy',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
  {
    id: 'up-free-electricity',
    name: 'UP Free Electricity for Agriculture',
    description: 'Uttar Pradesh provides free electricity to farmers for agricultural pump sets up to 5 HP.',
    eligibility: [
      'UP farmer with agricultural land',
      'Pump set up to 5 HP capacity',
      'Valid land ownership documents',
    ],
    benefits: 'Free electricity for agricultural pump sets up to 5 HP',
    applicableStates: ['Uttar Pradesh'],
    category: 'free_electricity',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
  {
    id: 'solar-rooftop-subsidy',
    name: 'MNRE Solar Rooftop Subsidy',
    description: 'Central government subsidy for residential rooftop solar installation under Ministry of New and Renewable Energy.',
    eligibility: [
      'Indian resident with owned property',
      'Suitable rooftop area for solar panels',
      'Grid-connected electricity consumer',
    ],
    benefits: '40% subsidy for 1-3 kW systems, 20% for 3-10 kW additional capacity',
    applicableStates: ['All India'],
    category: 'solar',
    sourceLink: 'https://solarrooftop.gov.in',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
  {
    id: 'kusum-scheme',
    name: 'PM-KUSUM Scheme',
    description: 'Kisan Urja Suraksha evam Utthaan Mahabhiyan for solar pump installation with central and state subsidies.',
    eligibility: [
      'Indian farmer with agricultural land',
      'Existing grid-connected pump or new installation',
      'Valid farmer ID and land documents',
    ],
    benefits: '60% subsidy (30% Central + 30% State) for solar pump installation',
    applicableStates: ['All India'],
    category: 'solar',
    sourceLink: 'https://mnre.gov.in/kusum',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
  {
    id: 'maharashtra-subsidy',
    name: 'Maharashtra Solar Agriculture Feeder',
    description: 'Solar feeders for agricultural electricity supply with state subsidy support.',
    eligibility: [
      'Maharashtra farmer',
      'Agricultural electricity connection',
      'Part of designated solar feeder area',
    ],
    benefits: 'Daytime solar-powered electricity for agriculture at subsidized rates',
    applicableStates: ['Maharashtra'],
    category: 'solar',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
  {
    id: 'tamil-nadu-subsidy',
    name: 'Tamil Nadu Electricity Subsidy',
    description: 'Subsidized electricity rates for domestic consumers with consumption below 100 units.',
    eligibility: [
      'Tamil Nadu resident',
      'Domestic electricity consumer',
      'Monthly consumption under 100 units',
    ],
    benefits: 'Free electricity for consumption up to 100 units per month',
    applicableStates: ['Tamil Nadu'],
    category: 'subsidy',
    lastUpdated: '2025-01-01',
    isActive: true,
  },
];

export const getCategoryLabel = (category: GovernmentScheme['category']): string => {
  const labels: Record<GovernmentScheme['category'], string> = {
    subsidy: 'Subsidy',
    free_electricity: 'Free Electricity',
    solar: 'Solar Scheme',
    discount: 'Discount',
  };
  return labels[category];
};

export const getCategoryColor = (category: GovernmentScheme['category']): string => {
  const colors: Record<GovernmentScheme['category'], string> = {
    subsidy: 'bg-blue-100 text-blue-800',
    free_electricity: 'bg-green-100 text-green-800',
    solar: 'bg-yellow-100 text-yellow-800',
    discount: 'bg-purple-100 text-purple-800',
  };
  return colors[category];
};
