/**
 * User Dashboard Page
 * 
 * Displays user profile and bill analysis history.
 * Protected route - requires authentication.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Zap, TrendingUp, TrendingDown, FileText, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { mockStore } from '@/services/storage/mockStore';
import { UserBillRecord } from '@/services/auth/types';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState<UserBillRecord | null>(null);

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/auth');
    return null;
  }

  const bills = mockStore.getUserBills(user.id);
  const authMethodLabels = { email: 'Email & Password', google: 'Google', mobile: 'Mobile OTP' };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Layout>
      <div className="container-main py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
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
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{user.name}</p>
                  <Badge variant="secondary">{authMethodLabels[user.authMethod]}</Badge>
                </div>
              </div>
              {user.email && <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" />{user.email}</p>}
              {user.phone && <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" />{user.phone}</p>}
              <p className="text-xs text-muted-foreground flex items-center gap-2"><Calendar className="h-3 w-3" />Joined {new Date(user.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Bills Analyzed</CardTitle></CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{bills.length}</p>
              <p className="text-sm text-muted-foreground">Total analyses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5" />Latest Bill</CardTitle></CardHeader>
            <CardContent>
              {bills.length > 0 ? (
                <>
                  <p className="text-2xl font-bold">₹{bills[0].amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{bills[0].billingMonth}</p>
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
            {bills.length === 0 ? (
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
                    <TableHead>Units</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Analyzed</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => {
                    const change = bill.previousAmount ? ((bill.amount - bill.previousAmount) / bill.previousAmount * 100) : null;
                    return (
                      <TableRow key={bill.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedBill(bill)}>
                        <TableCell className="font-medium">{bill.billingMonth}</TableCell>
                        <TableCell>{bill.units} kWh</TableCell>
                        <TableCell>₹{bill.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {change !== null && (
                            <span className={`flex items-center gap-1 ${change > 0 ? 'text-destructive' : 'text-green-600'}`}>
                              {change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {Math.abs(change).toFixed(1)}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{new Date(bill.analysisDate).toLocaleDateString()}</TableCell>
                        <TableCell><ChevronRight className="h-4 w-4" /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Bill Detail Modal */}
        <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedBill?.billingMonth} Bill Analysis</DialogTitle>
            </DialogHeader>
            {selectedBill && (
              <div className="space-y-4">
                <Card><CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader><CardContent><p>{selectedBill.summary}</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">AI Explanation (Hinglish)</CardTitle></CardHeader><CardContent><p>{selectedBill.aiExplanation}</p></CardContent></Card>
                {selectedBill.estimatedNextAmount && (
                  <Card><CardHeader><CardTitle className="text-base">Next Bill Estimate</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">₹{selectedBill.estimatedNextAmount.toLocaleString()}</p><p className="text-sm text-muted-foreground">~{selectedBill.estimatedNextUnits} kWh</p></CardContent></Card>
                )}
                <Card><CardHeader><CardTitle className="text-base">Savings Tips</CardTitle></CardHeader><CardContent><ul className="space-y-2">{selectedBill.savingsTips.map((tip, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{tip}</li>)}</ul></CardContent></Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Dashboard;
