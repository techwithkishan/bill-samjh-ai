/**
 * Google Sign-In Service (MOCK/SIMULATED)
 * 
 * This module simulates Google OAuth for the prototype.
 * It displays a mock consent modal and returns simulated user data.
 * 
 * ============================================================
 * PRODUCTION REPLACEMENT GUIDE (Azure AD B2C + Google)
 * ============================================================
 * 
 * 1. Configure Google as an Identity Provider in Azure AD B2C:
 *    - Go to Azure Portal > Azure AD B2C > Identity providers
 *    - Add Google and configure with Google Cloud Console credentials
 *    @see https://learn.microsoft.com/en-us/azure/active-directory-b2c/identity-provider-google
 * 
 * 2. Create a Google Cloud OAuth 2.0 Client:
 *    - Go to Google Cloud Console > APIs & Services > Credentials
 *    - Create OAuth 2.0 Client ID (Web application)
 *    - Add Azure AD B2C redirect URI
 *    @see https://console.cloud.google.com/apis/credentials
 * 
 * 3. Update Azure AD B2C User Flows:
 *    - Add Google to your sign-up/sign-in user flow
 *    - Configure claim mappings for email, name, picture
 * 
 * 4. Replace this mock with MSAL.js:
 *    ```typescript
 *    import { PublicClientApplication } from '@azure/msal-browser';
 *    
 *    // The same MSAL instance handles all identity providers
 *    // Azure AD B2C routes to Google based on user flow configuration
 *    const msalInstance = new PublicClientApplication(msalConfig);
 *    
 *    // Trigger sign-in with Google hint
 *    await msalInstance.loginPopup({
 *      scopes: ['openid', 'profile', 'email'],
 *      extraQueryParameters: {
 *        domain_hint: 'google.com'
 *      }
 *    });
 *    ```
 * 
 * 5. Security TODOs:
 *    TODO: Validate OAuth state parameter to prevent CSRF
 *    TODO: Verify token signatures server-side
 *    TODO: Implement proper token refresh flow
 *    TODO: Configure proper CORS and redirect URIs
 *    TODO: Enable MFA for high-security scenarios
 * 
 * @see https://learn.microsoft.com/en-us/azure/active-directory-b2c/add-identity-provider
 */

import { AuthResponse, User, AuthSession } from './types';
import { mockStore } from '../storage/mockStore';

/**
 * Simulated Google user profiles for the demo
 * These represent what Google would return after OAuth consent
 */
const MOCK_GOOGLE_PROFILES = [
  {
    googleId: 'google_' + Math.random().toString(36).substr(2, 9),
    name: 'Demo User',
    email: 'demo.user@gmail.com',
    picture: 'https://ui-avatars.com/api/?name=Demo+User&background=4285f4&color=fff',
  },
];

/**
 * Generate a mock token for Google auth
 */
const generateGoogleMockToken = (user: User): string => {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    name: user.name,
    email: user.email,
    picture: user.avatarUrl,
    iss: 'https://mock-azure-b2c.com',
    aud: 'billsamajh-client-id',
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  }));
  const signature = btoa('mock-google-signature');
  return `${header}.${payload}.${signature}`;
};

/**
 * Simulates the Google OAuth consent flow
 * 
 * In the real implementation, this would:
 * 1. Redirect to Azure AD B2C sign-in endpoint
 * 2. User sees Google consent screen (via AD B2C)
 * 3. User grants permission
 * 4. Redirect back with authorization code
 * 5. Exchange code for tokens server-side
 * 
 * @returns Promise that resolves after "consent" with mock user data
 */
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  // Simulate OAuth redirect and user interaction time
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Use the first mock profile (in real app, this comes from Google)
  const googleProfile = MOCK_GOOGLE_PROFILES[0];

  // Check if user already exists with this email
  let userData = mockStore.getUserByEmail(googleProfile.email);
  
  if (userData) {
    // User exists, return existing session
    const session: AuthSession = {
      user: userData.user,
      token: generateGoogleMockToken(userData.user),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    return {
      success: true,
      message: 'Signed in with Google successfully',
      session,
    };
  }

  // Create new user from Google profile
  const user: User = {
    id: 'google_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name: googleProfile.name,
    email: googleProfile.email,
    authMethod: 'google',
    avatarUrl: googleProfile.picture,
    createdAt: new Date().toISOString(),
  };

  // Store user (no password for OAuth users)
  mockStore.createUser({
    user,
    bills: [],
  });

  // Generate session
  const session: AuthSession = {
    user,
    token: generateGoogleMockToken(user),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  return {
    success: true,
    message: 'Account created with Google successfully',
    session,
  };
};

/**
 * Check if user has Google-linked account
 */
export const hasGoogleAccount = (email: string): boolean => {
  const userData = mockStore.getUserByEmail(email);
  return userData?.user.authMethod === 'google';
};
