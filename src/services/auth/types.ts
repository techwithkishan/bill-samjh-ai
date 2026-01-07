/**
 * Authentication Types
 * 
 * These types define the data structures for the authentication system.
 * 
 * PRODUCTION NOTES:
 * - In production, replace mock types with Azure AD B2C token types
 * - User profile should come from Azure AD B2C claims
 * - Session tokens should be JWT issued by Azure AD B2C
 * 
 * @see https://learn.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
 */

export type AuthMethod = 'email' | 'google' | 'mobile';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  authMethod: AuthMethod;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string; // Mock JWT-like token
  expiresAt: number;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OTPRequestData {
  phone: string;
}

export interface OTPVerifyData {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  session?: AuthSession;
  error?: string;
}

export interface OTPState {
  phone: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

/**
 * Bill data structure for user dashboard
 * This mirrors the data from bill analysis but is associated with a user
 */
export interface UserBillRecord {
  id: string;
  billingMonth: string;
  units: number;
  amount: number;
  previousUnits?: number;
  previousAmount?: number;
  analysisDate: string;
  summary: string;
  aiExplanation: string;
  estimatedNextUnits?: number;
  estimatedNextAmount?: number;
  savingsTips: string[];
  consumerNumber?: string;
  tariffCategory?: string;
}

export interface UserData {
  user: User;
  passwordHash?: string; // Only for email auth - mock hash
  bills: UserBillRecord[];
}
