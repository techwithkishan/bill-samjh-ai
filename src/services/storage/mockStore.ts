/**
 * Mock Data Store (SIMULATED BACKEND)
 * 
 * This module provides a localStorage-based data store for the prototype.
 * It simulates what would be a proper backend database in production.
 * 
 * ============================================================
 * PRODUCTION REPLACEMENT GUIDE (Azure Services)
 * ============================================================
 * 
 * 1. User Authentication & Profile:
 *    - Azure AD B2C for identity management
 *    - User profiles stored in Azure Cosmos DB or Azure SQL
 *    @see https://learn.microsoft.com/en-us/azure/cosmos-db/
 * 
 * 2. Bill Analysis History:
 *    - Azure Cosmos DB for JSON document storage (recommended)
 *    - Or Azure SQL Database for relational data
 *    - Partition by userId for efficient queries
 *    
 *    Example Cosmos DB schema:
 *    ```json
 *    {
 *      "id": "bill_123",
 *      "userId": "user_456",
 *      "partitionKey": "user_456",
 *      "billingMonth": "January 2025",
 *      "units": 450,
 *      "amount": 2150,
 *      "analysisDate": "2025-01-07",
 *      "aiExplanation": "...",
 *      "savingsTips": ["...", "..."]
 *    }
 *    ```
 * 
 * 3. Bill Image Storage:
 *    - Azure Blob Storage for uploaded bill images
 *    - Generate SAS tokens for secure access
 *    @see https://learn.microsoft.com/en-us/azure/storage/blobs/
 * 
 * 4. API Layer:
 *    - Azure Functions for serverless API endpoints
 *    - Azure API Management for rate limiting & security
 *    
 *    Example endpoints:
 *    - GET /api/users/{userId}/bills
 *    - POST /api/bills/analyze
 *    - GET /api/bills/{billId}
 * 
 * 5. Security Considerations:
 *    TODO: Implement proper data isolation per user
 *    TODO: Use Azure Key Vault for connection strings
 *    TODO: Enable Azure Defender for SQL/Cosmos
 *    TODO: Implement audit logging for data access
 *    TODO: Configure backup and disaster recovery
 * 
 * @see https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/data-store-overview
 */

import { UserData, User, UserBillRecord } from '../auth/types';

const STORAGE_KEY = 'billsamajh_mock_db';

interface MockDatabase {
  users: UserData[];
}

/**
 * Initialize mock database with sample data
 */
const getInitialDatabase = (): MockDatabase => {
  return {
    users: [
      // Sample user 1: Email auth
      {
        user: {
          id: 'demo_user_email_001',
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          authMethod: 'email',
          createdAt: '2024-12-01T10:00:00Z',
        },
        passwordHash: btoa('demo123-hashed-mock'), // Password: demo123
        bills: [
          {
            id: 'bill_001',
            billingMonth: 'December 2024',
            units: 485,
            amount: 2340,
            previousUnits: 420,
            previousAmount: 1980,
            analysisDate: '2024-12-15',
            summary: 'Your bill increased by ₹360 (18%) compared to last month due to higher AC usage during the winter cold snap.',
            aiExplanation: 'Aapka bill is baar ₹2340 aaya hai, jo pichle mahine se ₹360 zyada hai. Yeh isliye hua kyunki December mein thandi badh gayi aur AC heater mode pe zyada chala. Peak hours mein bhi consumption badha hai.',
            estimatedNextUnits: 510,
            estimatedNextAmount: 2480,
            savingsTips: [
              'Use a geyser timer to heat water only during specific hours',
              'Switch to LED bulbs throughout the house to save up to 20% on lighting',
              'Unplug devices on standby - they consume 10% of your electricity bill'
            ],
            consumerNumber: 'MH12345678',
            tariffCategory: 'Domestic LT-I',
          },
          {
            id: 'bill_002',
            billingMonth: 'November 2024',
            units: 420,
            amount: 1980,
            previousUnits: 380,
            previousAmount: 1750,
            analysisDate: '2024-11-18',
            summary: 'Your bill increased moderately by ₹230 as the festive season brought more appliance usage.',
            aiExplanation: 'November mein Diwali ki wajah se ghar mein zyada appliances chale. Decorative lights aur guests ke liye extra AC/fan usage se bill badha.',
            estimatedNextUnits: 450,
            estimatedNextAmount: 2100,
            savingsTips: [
              'Use solar-powered decorative lights for festivals',
              'Run washing machine with full loads only',
              'Set AC temperature to 24°C instead of lower settings'
            ],
            consumerNumber: 'MH12345678',
            tariffCategory: 'Domestic LT-I',
          },
          {
            id: 'bill_003',
            billingMonth: 'October 2024',
            units: 380,
            amount: 1750,
            previousUnits: 350,
            previousAmount: 1580,
            analysisDate: '2024-10-12',
            summary: 'Slight increase of ₹170 due to post-monsoon humidity requiring more fan/cooler usage.',
            aiExplanation: 'October mein monsoon ke baad humidity thi, isliye cooler aur fans zyada chale. Refrigerator bhi zyada kaam kiya humidity mein.',
            estimatedNextUnits: 400,
            estimatedNextAmount: 1850,
            savingsTips: [
              'Clean refrigerator coils every 3 months for better efficiency',
              'Use ceiling fans on lower speed with windows open',
              'Consider a 5-star rated air cooler for better efficiency'
            ],
            consumerNumber: 'MH12345678',
            tariffCategory: 'Domestic LT-I',
          },
        ],
      },
      // Sample user 2: Google auth
      {
        user: {
          id: 'demo_user_google_001',
          name: 'Priya Patel',
          email: 'priya.patel@gmail.com',
          authMethod: 'google',
          avatarUrl: 'https://ui-avatars.com/api/?name=Priya+Patel&background=34a853&color=fff',
          createdAt: '2024-11-15T08:30:00Z',
        },
        bills: [
          {
            id: 'bill_004',
            billingMonth: 'December 2024',
            units: 320,
            amount: 1480,
            previousUnits: 290,
            previousAmount: 1320,
            analysisDate: '2024-12-20',
            summary: 'Your electricity usage is efficient! Only ₹160 increase despite winter season.',
            aiExplanation: 'Aapka bijli ka bill kaafi efficient hai! Winter season mein bhi sirf ₹160 ka increase aaya. Aapki energy-saving habits kaam kar rahi hain.',
            estimatedNextUnits: 340,
            estimatedNextAmount: 1580,
            savingsTips: [
              'Great job! Continue using natural light during daytime',
              'Consider installing solar panels for even more savings',
              'Smart power strips can help reduce standby consumption further'
            ],
            consumerNumber: 'GJ98765432',
            tariffCategory: 'Domestic',
          },
          {
            id: 'bill_005',
            billingMonth: 'November 2024',
            units: 290,
            amount: 1320,
            previousUnits: 280,
            previousAmount: 1260,
            analysisDate: '2024-11-22',
            summary: 'Stable consumption with minimal increase of ₹60. Well managed!',
            aiExplanation: 'November mein aapka bill stable raha. Sirf ₹60 ka increase aaya jo normal range mein hai. Aap energy ko acche se manage kar rahe ho.',
            estimatedNextUnits: 310,
            estimatedNextAmount: 1400,
            savingsTips: [
              'Your usage pattern is excellent - maintain it!',
              'Track your daily consumption to identify any spikes',
              'Consider time-of-use tariff if available in your area'
            ],
            consumerNumber: 'GJ98765432',
            tariffCategory: 'Domestic',
          },
        ],
      },
      // Sample user 3: Mobile OTP auth
      {
        user: {
          id: 'demo_user_mobile_001',
          name: 'User 7890',
          phone: '+919876547890',
          authMethod: 'mobile',
          createdAt: '2024-12-10T14:00:00Z',
        },
        bills: [
          {
            id: 'bill_006',
            billingMonth: 'December 2024',
            units: 550,
            amount: 2780,
            previousUnits: 480,
            previousAmount: 2350,
            analysisDate: '2024-12-22',
            summary: 'Significant increase of ₹430 (18.3%). Review your heavy appliance usage patterns.',
            aiExplanation: 'Is mahine aapka bill kaafi badha hai - ₹430 zyada. Lagta hai koi naya appliance add hua hai ya phir geyser/heater zyada chal raha hai. Peak hours (6-10 PM) mein consumption check karein.',
            estimatedNextUnits: 520,
            estimatedNextAmount: 2600,
            savingsTips: [
              'Identify the new high-consumption appliance and optimize its usage',
              'Shift heavy appliance usage to off-peak hours (10 PM - 6 AM)',
              'Get an energy audit to find hidden power drains in your home'
            ],
            consumerNumber: 'DL55667788',
            tariffCategory: 'Domestic',
          },
        ],
      },
    ],
  };
};

/**
 * Load database from localStorage or initialize with sample data
 */
const loadDatabase = (): MockDatabase => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load mock database:', error);
  }
  
  // Initialize with sample data
  const initialDb = getInitialDatabase();
  saveDatabase(initialDb);
  return initialDb;
};

/**
 * Save database to localStorage
 */
const saveDatabase = (db: MockDatabase): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    console.error('Failed to save mock database:', error);
  }
};

/**
 * Mock Store API
 * 
 * These functions mirror what a real backend API would provide.
 * Replace with fetch/axios calls to Azure Functions in production.
 */
export const mockStore = {
  /**
   * Get user by email
   * 
   * Production: GET /api/users?email={email}
   */
  getUserByEmail: (email: string): UserData | undefined => {
    const db = loadDatabase();
    return db.users.find(u => u.user.email?.toLowerCase() === email.toLowerCase());
  },

  /**
   * Get user by phone
   * 
   * Production: GET /api/users?phone={phone}
   */
  getUserByPhone: (phone: string): UserData | undefined => {
    const db = loadDatabase();
    return db.users.find(u => u.user.phone === phone);
  },

  /**
   * Get user by ID
   * 
   * Production: GET /api/users/{userId}
   */
  getUserById: (userId: string): UserData | undefined => {
    const db = loadDatabase();
    return db.users.find(u => u.user.id === userId);
  },

  /**
   * Create new user
   * 
   * Production: POST /api/users
   */
  createUser: (userData: UserData): void => {
    const db = loadDatabase();
    db.users.push(userData);
    saveDatabase(db);
  },

  /**
   * Update user profile
   * 
   * Production: PATCH /api/users/{userId}
   */
  updateUser: (userId: string, updates: Partial<User>): void => {
    const db = loadDatabase();
    const userIndex = db.users.findIndex(u => u.user.id === userId);
    if (userIndex !== -1) {
      db.users[userIndex].user = { ...db.users[userIndex].user, ...updates };
      saveDatabase(db);
    }
  },

  /**
   * Get user's bill history
   * 
   * Production: GET /api/users/{userId}/bills
   */
  getUserBills: (userId: string): UserBillRecord[] => {
    const db = loadDatabase();
    const userData = db.users.find(u => u.user.id === userId);
    return userData?.bills || [];
  },

  /**
   * Get specific bill
   * 
   * Production: GET /api/bills/{billId}
   */
  getBillById: (userId: string, billId: string): UserBillRecord | undefined => {
    const bills = mockStore.getUserBills(userId);
    return bills.find(b => b.id === billId);
  },

  /**
   * Add bill to user's history
   * 
   * Production: POST /api/users/{userId}/bills
   */
  addBill: (userId: string, bill: UserBillRecord): void => {
    const db = loadDatabase();
    const userIndex = db.users.findIndex(u => u.user.id === userId);
    if (userIndex !== -1) {
      db.users[userIndex].bills.unshift(bill); // Add to beginning
      saveDatabase(db);
    }
  },

  /**
   * Delete bill from user's history
   * 
   * Production: DELETE /api/bills/{billId}
   */
  deleteBill: (userId: string, billId: string): void => {
    const db = loadDatabase();
    const userIndex = db.users.findIndex(u => u.user.id === userId);
    if (userIndex !== -1) {
      db.users[userIndex].bills = db.users[userIndex].bills.filter(b => b.id !== billId);
      saveDatabase(db);
    }
  },

  /**
   * Reset database to initial state (for testing)
   */
  resetDatabase: (): void => {
    const initialDb = getInitialDatabase();
    saveDatabase(initialDb);
  },

  /**
   * Clear all data (for logout cleanup if needed)
   */
  clearDatabase: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};

/**
 * Initialize database on module load
 */
loadDatabase();
