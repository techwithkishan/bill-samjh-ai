/**
 * Authentication Page
 * 
 * Provides Email/Password authentication using Supabase Auth.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Input validation schema
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const AuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });

  // Redirect if already authenticated with a real account (not anonymous)
  useEffect(() => {
    if (isAuthenticated && user && !user.is_anonymous) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const validateInputs = (): boolean => {
    try {
      emailSchema.parse(emailForm.email);
      passwordSchema.parse(emailForm.password);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;

      if (authMode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: emailForm.email,
          password: emailForm.password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else {
            setError(signUpError.message);
          }
        } else if (data.user) {
          toast({ title: 'Account created!', description: 'You are now signed in.' });
          navigate('/dashboard');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: emailForm.email,
          password: emailForm.password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(signInError.message);
          }
        } else if (data.user) {
          toast({ title: 'Welcome back!', description: 'You are now signed in.' });
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="container-main py-12">
        <div className="max-w-md mx-auto">
          <Alert className="mb-6 border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              Create an account to save your bill analyses and access them from any device.
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
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      className="pl-10" 
                      required
                      value={emailForm.email} 
                      onChange={e => setEmailForm({...emailForm, email: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10" 
                      required 
                      minLength={6}
                      value={emailForm.password} 
                      onChange={e => setEmailForm({...emailForm, password: e.target.value})} 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

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
