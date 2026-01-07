/**
 * Authentication Page
 * 
 * Provides Email/Password, Google (simulated), and Mobile OTP (simulated) auth flows.
 * 
 * DEMO NOTICE: All auth flows are simulated for the Imagine Cup prototype.
 * See src/services/auth/*.ts for production replacement guides.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, User, Lock, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { signUp, login } from '@/services/auth/emailAuth';
import { signInWithGoogle } from '@/services/auth/googleMock';
import { requestOTP, verifyOTP, getOTPTimeRemaining } from '@/services/auth/otpMock';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Email form state
  const [emailForm, setEmailForm] = useState({ name: '', email: '', password: '' });
  
  // OTP form state
  const [otpForm, setOtpForm] = useState({ phone: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  // Start OTP countdown timer
  const startOtpTimer = (phone: string) => {
    const checkTimer = () => {
      const remaining = getOTPTimeRemaining(phone);
      if (remaining && remaining > 0) {
        setOtpTimer(Math.ceil(remaining / 1000));
        setTimeout(checkTimer, 1000);
      } else {
        setOtpTimer(0);
        setOtpSent(false);
      }
    };
    checkTimer();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = authMode === 'signup' 
        ? await signUp(emailForm)
        : await login({ email: emailForm.email, password: emailForm.password });

      if (result.success && result.session) {
        authLogin(result.session);
        toast({ title: 'Success!', description: result.message });
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success && result.session) {
        authLogin(result.session);
        toast({ title: 'Welcome!', description: result.message });
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Google sign-in failed');
    }
    setIsLoading(false);
  };

  const handleSendOTP = async () => {
    setError('');
    setIsLoading(true);
    const result = await requestOTP({ phone: otpForm.phone });
    if (result.success) {
      setOtpSent(true);
      startOtpTimer(otpForm.phone);
      toast({ title: 'OTP Sent', description: 'Check console for demo OTP' });
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    setError('');
    setIsLoading(true);
    const result = await verifyOTP(otpForm);
    if (result.success && result.session) {
      authLogin(result.session);
      toast({ title: 'Verified!', description: result.message });
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="container-main py-12">
        <div className="max-w-md mx-auto">
          {/* Demo Notice */}
          <Alert className="mb-6 border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Demo authentication</strong> — simulated for prototype. Architected for Azure AD B2C / production OTP.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
              <CardDescription>
                {authMode === 'login' ? 'Sign in to access your dashboard' : 'Get started with BillSamajh AI'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="email"><Mail className="h-4 w-4 mr-2" />Email</TabsTrigger>
                  <TabsTrigger value="mobile"><Phone className="h-4 w-4 mr-2" />Mobile</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email Tab */}
                <TabsContent value="email">
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    {authMode === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input id="name" placeholder="Enter your name" className="pl-10" required
                            value={emailForm.name} onChange={e => setEmailForm({...emailForm, name: e.target.value})} />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="you@example.com" className="pl-10" required
                          value={emailForm.email} onChange={e => setEmailForm({...emailForm, email: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type="password" placeholder="••••••••" className="pl-10" required minLength={6}
                          value={emailForm.password} onChange={e => setEmailForm({...emailForm, password: e.target.value})} />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Continue with Google (Simulated)
                  </Button>
                </TabsContent>

                {/* Mobile OTP Tab */}
                <TabsContent value="mobile">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" type="tel" placeholder="9876543210" className="pl-10"
                          value={otpForm.phone} onChange={e => setOtpForm({...otpForm, phone: e.target.value})} disabled={otpSent} />
                      </div>
                    </div>
                    {!otpSent ? (
                      <Button className="w-full" onClick={handleSendOTP} disabled={isLoading || !otpForm.phone}>
                        {isLoading ? 'Sending...' : 'Send OTP'}
                      </Button>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="otp">Enter OTP</Label>
                          <Input id="otp" type="text" placeholder="6-digit code" maxLength={6}
                            value={otpForm.otp} onChange={e => setOtpForm({...otpForm, otp: e.target.value})} />
                          {otpTimer > 0 && <p className="text-sm text-muted-foreground">Expires in {otpTimer}s</p>}
                        </div>
                        <Button className="w-full" onClick={handleVerifyOTP} disabled={isLoading || otpForm.otp.length !== 6}>
                          {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm">
                {authMode === 'login' ? (
                  <p>Don't have an account? <button className="text-primary hover:underline" onClick={() => setAuthMode('signup')}>Sign up</button></p>
                ) : (
                  <p>Already have an account? <button className="text-primary hover:underline" onClick={() => setAuthMode('login')}>Sign in</button></p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
