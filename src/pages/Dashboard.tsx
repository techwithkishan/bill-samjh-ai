/**
 * User Dashboard Page
 * 
 * Displays user profile and bill analysis history.
 * Protected route - requires authentication.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Zap, TrendingUp, TrendingDown, FileText, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useBillHistory, BillHistoryRecord } from '@/hooks/useBillHistory';

const Dashboard = () => {
  const { user, isAuthenticated, signOut, isLoading: authLoading } = useAuth();
  const { history, isLoading: historyLoading } = useBillHistory();
  const navigate = useNavigate();

  // Redirect if not authenticated or is anonymous user
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.is_anonymous)) {
      navigate('/auth');
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Get display info from user
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email;
  const createdAt = user?.created_at ? new Date(user.created_at) : new Date();

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="container-main py-8 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-main py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {displayName}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" />Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{displayName}</p>
                  <Badge variant="secondary">Email & Password</Badge>
                </div>
              </div>
              {userEmail && <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" />{userEmail}</p>}
              <p className="text-xs text-muted-foreground flex items-center gap-2"><Calendar className="h-3 w-3" />Joined {createdAt.toLocaleDateString()}</p>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Bills Analyzed</CardTitle></CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{history.length}</p>
              <p className="text-sm text-muted-foreground">Total analyses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5" />Latest Bill</CardTitle></CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <>
                  <p className="text-2xl font-bold">₹{history[0].total_amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{history[0].billing_month}</p>
                </>
              ) : (
                <p className="text-muted-foreground">No bills yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bill History */}
        <Card>
          <CardHeader>
            <CardTitle>Bill History</CardTitle>
            <CardDescription>Your analyzed electricity bills</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No bills analyzed yet</h3>
                <p className="text-muted-foreground mb-4">Upload your first electricity bill to get AI-powered insights</p>
                <Button asChild><Link to="/upload">Upload Bill</Link></Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Billing Month</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Analyzed</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((bill) => {
                    const change = bill.previous_amount ? ((bill.total_amount - bill.previous_amount) / bill.previous_amount * 100) : null;
                    return (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.billing_month}</TableCell>
                        <TableCell><Badge variant="outline">{bill.bill_type || 'electricity'}</Badge></TableCell>
                        <TableCell>{bill.total_units} kWh</TableCell>
                        <TableCell>₹{bill.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {change !== null && (
                            <span className={`flex items-center gap-1 ${change > 0 ? 'text-destructive' : 'text-green-600'}`}>
                              {change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {Math.abs(change).toFixed(1)}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{new Date(bill.created_at).toLocaleDateString()}</TableCell>
                        <TableCell><ChevronRight className="h-4 w-4" /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
