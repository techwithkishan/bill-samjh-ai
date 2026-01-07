/**
 * Email & Password Authentication Service (MOCK/SIMULATED)
 * 
 * This module handles email/password authentication for the prototype.
 * All authentication is simulated on the client-side.
 * 
 * ============================================================
 * PRODUCTION REPLACEMENT GUIDE (Azure AD B2C)
 * ============================================================
 * 
 * 1. Set up Azure AD B2C tenant:
 *    - Create user flows for sign-up and sign-in
 *    - Configure password complexity requirements
 *    - Set up email verification
 *    @see https://learn.microsoft.com/en-us/azure/active-directory-b2c/tutorial-create-tenant
 * 
 * 2. Replace signUp() with Azure AD B2C sign-up flow:
 *    - Use MSAL.js library for browser integration
 *    - Call acquireTokenRedirect() or acquireTokenPopup()
 *    - Handle MFA if configured
 * 
 * 3. Replace login() with Azure AD B2C sign-in:
 *    - Use MSAL.js loginRedirect() or loginPopup()
 *    - Handle token response and store securely
 * 
 * 4. Security TODOs for production:
 *    TODO: Implement server-side password hashing (bcrypt/argon2)
 *    TODO: Use HTTPS for all authentication requests
 *    TODO: Implement rate limiting on login attempts
 *    TODO: Add CAPTCHA for sign-up to prevent bots
 *    TODO: Enable Azure AD B2C Identity Protection
 *    TODO: Configure token lifetime policies
 * 
 * Example MSAL.js integration:
 * ```typescript
 * import { PublicClientApplication } from '@azure/msal-browser';
 * 
 * const msalConfig = {
 *   auth: {
 *     clientId: 'YOUR_CLIENT_ID',
 *     authority: 'https://YOUR_TENANT.b2clogin.com/YOUR_TENANT.onmicrosoft.com/B2C_1_signupsignin',
 *     knownAuthorities: ['YOUR_TENANT.b2clogin.com'],
 *     redirectUri: window.location.origin,
 *   }
 * };
 * 
 * const msalInstance = new PublicClientApplication(msalConfig);
 * await msalInstance.loginPopup({ scopes: ['openid', 'profile', 'email'] });
 * ```
 * 
 * @see https://learn.microsoft.com/en-us/azure/active-directory-b2c/enable-authentication-web-application
 */

import { SignUpData, LoginData, AuthResponse, User, AuthSession } from './types';
import { mockStore } from '../storage/mockStore';

/**
 * Generates a mock JWT-like token
 * 
 * TODO: In production, tokens are issued by Azure AD B2C
 * This mock simulates the token format for prototype purposes
 */
const generateMockToken = (user: User): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    name: user.name,
    email: user.email,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }));
  const signature = btoa('mock-signature-' + user.id);
  return `${header}.${payload}.${signature}`;
};

/**
 * Mock password hashing (NOT SECURE - for prototype only)
 * 
 * TODO: In production:
 * - Never hash passwords on the client
 * - Use Azure AD B2C which handles password security
 * - If custom backend needed, use bcrypt/argon2 server-side
 */
const mockHashPassword = (password: string): string => {
  // Simple mock hash - NOT SECURE, just for demonstration
  return btoa(password + '-hashed-mock');
};

/**
 * Mock password verification
 */
const verifyMockPassword = (password: string, hash: string): boolean => {
  return mockHashPassword(password) === hash;
};

/**
 * Sign up a new user with email and password
 * 
 * @param data - Sign up form data
 * @returns AuthResponse with session or error
 */
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { success: false, message: 'Invalid email format', error: 'INVALID_EMAIL' };
  }

  // Validate password length
  if (data.password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters', error: 'WEAK_PASSWORD' };
  }

  // Check if user already exists
  const existingUser = mockStore.getUserByEmail(data.email);
  if (existingUser) {
    return { success: false, message: 'An account with this email already exists', error: 'USER_EXISTS' };
  }

  // Create new user
  const user: User = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    authMethod: 'email',
    createdAt: new Date().toISOString(),
  };

  // Store user with hashed password
  mockStore.createUser({
    user,
    passwordHash: mockHashPassword(data.password),
    bills: [],
  });

  // Generate session
  const session: AuthSession = {
    user,
    token: generateMockToken(user),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  return {
    success: true,
    message: 'Account created successfully',
    session,
  };
};

/**
 * Log in with email and password
 * 
 * @param data - Login credentials
 * @returns AuthResponse with session or error
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Find user by email
  const userData = mockStore.getUserByEmail(data.email.toLowerCase().trim());
  if (!userData) {
    return { success: false, message: 'Invalid email or password', error: 'INVALID_CREDENTIALS' };
  }

  // Verify password
  if (!userData.passwordHash || !verifyMockPassword(data.password, userData.passwordHash)) {
    return { success: false, message: 'Invalid email or password', error: 'INVALID_CREDENTIALS' };
  }

  // Generate session
  const session: AuthSession = {
    user: userData.user,
    token: generateMockToken(userData.user),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  return {
    success: true,
    message: 'Logged in successfully',
    session,
  };
};
