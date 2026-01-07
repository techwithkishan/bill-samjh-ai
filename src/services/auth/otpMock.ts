/**
 * Mobile OTP Authentication Service (MOCK/SIMULATED)
 * 
 * This module simulates SMS OTP verification for the prototype.
 * No real SMS is sent - OTP is logged to console for testing.
 * 
 * ============================================================
 * PRODUCTION REPLACEMENT GUIDE (SMS Gateway Integration)
 * ============================================================
 * 
 * 1. Choose an SMS Gateway Provider for India:
 *    - Azure Communication Services (recommended for Azure stack)
 *    - Twilio (widely used, good India coverage)
 *    - MSG91 (India-specific, good local rates)
 *    - Kaleyra (formerly Solutions Infini, India-focused)
 * 
 * 2. Set up Azure Communication Services for SMS:
 *    ```typescript
 *    import { SmsClient } from '@azure/communication-sms';
 *    
 *    const connectionString = process.env.AZURE_COMM_CONNECTION_STRING;
 *    const smsClient = new SmsClient(connectionString);
 *    
 *    await smsClient.send({
 *      from: '<your-azure-phone-number>',
 *      to: ['+91' + phoneNumber],
 *      message: `Your BillSamajh verification code is: ${otp}. Valid for 2 minutes.`
 *    });
 *    ```
 *    @see https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/sms/send
 * 
 * 3. Backend OTP Flow (Azure Functions recommended):
 *    - Generate cryptographically secure OTP: crypto.randomInt(100000, 999999)
 *    - Hash OTP with timestamp: SHA256(otp + timestamp + secret)
 *    - Store hash in Azure Redis Cache with TTL
 *    - Send OTP via SMS gateway
 *    - On verification, hash input and compare
 * 
 * 4. Security TODOs:
 *    TODO: Generate OTP server-side only (never on client)
 *    TODO: Use cryptographically secure random number generator
 *    TODO: Store OTP hash (not plaintext) with expiry in Redis/Cosmos
 *    TODO: Implement rate limiting: max 3 OTP requests per phone per hour
 *    TODO: Block phone after 5 failed verification attempts
 *    TODO: Add CAPTCHA before sending OTP to prevent abuse
 *    TODO: Validate Indian phone number format (+91 10 digits)
 *    TODO: Use HTTPS for all API calls
 *    TODO: Log OTP attempts for audit trail (without the OTP value)
 * 
 * 5. Example Azure Function endpoint:
 *    ```typescript
 *    // /api/send-otp
 *    export async function sendOtp(req: HttpRequest): Promise<HttpResponse> {
 *      const { phone } = await req.json();
 *      
 *      // Rate limit check
 *      const attempts = await redis.incr(`otp_requests:${phone}`);
 *      await redis.expire(`otp_requests:${phone}`, 3600);
 *      if (attempts > 3) {
 *        return { status: 429, body: 'Too many requests' };
 *      }
 *      
 *      // Generate and store OTP
 *      const otp = crypto.randomInt(100000, 999999).toString();
 *      const hash = hashOtp(otp, phone, Date.now());
 *      await redis.setex(`otp:${phone}`, 120, hash); // 2 min expiry
 *      
 *      // Send SMS
 *      await smsClient.send({ to: phone, message: `OTP: ${otp}` });
 *      
 *      return { status: 200, body: { success: true } };
 *    }
 *    ```
 * 
 * @see https://learn.microsoft.com/en-us/azure/communication-services/concepts/sms/concepts
 */

import { OTPRequestData, OTPVerifyData, AuthResponse, User, AuthSession, OTPState } from './types';
import { mockStore } from '../storage/mockStore';

// In-memory OTP storage (simulates server-side Redis/cache)
const otpStore = new Map<string, OTPState>();

// Configuration
const OTP_EXPIRY_MS = 2 * 60 * 1000; // 2 minutes
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute between OTP requests

// Rate limiting store
const rateLimitStore = new Map<string, number>();

/**
 * Generate a 6-digit OTP
 * 
 * TODO: In production, use crypto.randomInt(100000, 999999) on server
 * This client-side generation is for demo purposes only
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Format Indian phone number
 */
const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle various formats
  if (digits.startsWith('91') && digits.length === 12) {
    return '+91' + digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return '+91' + digits.slice(1);
  }
  if (digits.length === 10) {
    return '+91' + digits;
  }
  return '+91' + digits;
};

/**
 * Validate Indian mobile number format
 */
const isValidIndianMobile = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  // Indian mobile: 10 digits starting with 6-9
  if (digits.length === 10 && /^[6-9]/.test(digits)) return true;
  // With country code
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) return true;
  return false;
};

/**
 * Request OTP for a mobile number
 * 
 * @param data - Phone number to send OTP to
 * @returns AuthResponse indicating success/failure
 */
export const requestOTP = async (data: OTPRequestData): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const formattedPhone = formatPhoneNumber(data.phone);

  // Validate phone number format
  if (!isValidIndianMobile(data.phone)) {
    return { 
      success: false, 
      message: 'Please enter a valid 10-digit Indian mobile number', 
      error: 'INVALID_PHONE' 
    };
  }

  // Check rate limiting
  const lastRequest = rateLimitStore.get(formattedPhone);
  if (lastRequest && Date.now() - lastRequest < RATE_LIMIT_WINDOW_MS) {
    const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (Date.now() - lastRequest)) / 1000);
    return { 
      success: false, 
      message: `Please wait ${waitSeconds} seconds before requesting another OTP`, 
      error: 'RATE_LIMITED' 
    };
  }

  // Generate OTP
  const otp = generateOTP();
  
  // Store OTP state
  const otpState: OTPState = {
    phone: formattedPhone,
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
  };
  otpStore.set(formattedPhone, otpState);
  rateLimitStore.set(formattedPhone, Date.now());

  // Log OTP to console for testing (REMOVE IN PRODUCTION)
  console.log('═══════════════════════════════════════════════════');
  console.log('📱 SIMULATED SMS OTP (Demo Only)');
  console.log(`   Phone: ${formattedPhone}`);
  console.log(`   OTP: ${otp}`);
  console.log(`   Valid for: 2 minutes`);
  console.log('═══════════════════════════════════════════════════');

  return {
    success: true,
    message: `OTP sent to ${formattedPhone}. Check console for demo OTP.`,
  };
};

/**
 * Verify OTP and create/login user
 * 
 * @param data - Phone and OTP to verify
 * @returns AuthResponse with session or error
 */
export const verifyOTP = async (data: OTPVerifyData): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const formattedPhone = formatPhoneNumber(data.phone);
  const otpState = otpStore.get(formattedPhone);

  // Check if OTP was requested
  if (!otpState) {
    return { 
      success: false, 
      message: 'Please request an OTP first', 
      error: 'NO_OTP_REQUESTED' 
    };
  }

  // Check if OTP expired
  if (Date.now() > otpState.expiresAt) {
    otpStore.delete(formattedPhone);
    return { 
      success: false, 
      message: 'OTP has expired. Please request a new one.', 
      error: 'OTP_EXPIRED' 
    };
  }

  // Check attempts
  if (otpState.attempts >= otpState.maxAttempts) {
    otpStore.delete(formattedPhone);
    return { 
      success: false, 
      message: 'Too many incorrect attempts. Please request a new OTP.', 
      error: 'MAX_ATTEMPTS_EXCEEDED' 
    };
  }

  // Verify OTP
  if (data.otp !== otpState.otp) {
    otpState.attempts++;
    const remaining = otpState.maxAttempts - otpState.attempts;
    return { 
      success: false, 
      message: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, 
      error: 'INVALID_OTP' 
    };
  }

  // OTP verified - clean up
  otpStore.delete(formattedPhone);

  // Check if user exists with this phone
  let userData = mockStore.getUserByPhone(formattedPhone);
  let user: User;

  if (userData) {
    user = userData.user;
  } else {
    // Create new user
    user = {
      id: 'mobile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: 'User ' + formattedPhone.slice(-4),
      phone: formattedPhone,
      authMethod: 'mobile',
      createdAt: new Date().toISOString(),
    };

    mockStore.createUser({
      user,
      bills: [],
    });
  }

  // Generate session
  const token = generateMobileToken(user);
  const session: AuthSession = {
    user,
    token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  return {
    success: true,
    message: 'Phone verified successfully',
    session,
  };
};

/**
 * Generate a mock token for mobile auth
 */
const generateMobileToken = (user: User): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    name: user.name,
    phone: user.phone,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  }));
  const signature = btoa('mock-mobile-signature-' + user.id);
  return `${header}.${payload}.${signature}`;
};

/**
 * Get remaining time for OTP verification
 */
export const getOTPTimeRemaining = (phone: string): number | null => {
  const formattedPhone = formatPhoneNumber(phone);
  const otpState = otpStore.get(formattedPhone);
  if (!otpState) return null;
  
  const remaining = otpState.expiresAt - Date.now();
  return remaining > 0 ? remaining : null;
};

/**
 * Get remaining OTP attempts
 */
export const getOTPAttemptsRemaining = (phone: string): number | null => {
  const formattedPhone = formatPhoneNumber(phone);
  const otpState = otpStore.get(formattedPhone);
  if (!otpState) return null;
  
  return otpState.maxAttempts - otpState.attempts;
};
