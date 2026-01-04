/**
 * Vendor Earnings & Payouts Page
 */

import { Box, Container, Typography, Grid, Paper, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { vendorService } from '@/services/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const VendorEarnings = () => {
  const router = useRouter();
  const { isAuthenticated, isVendor } = useAuthStore();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openPayoutDialog, setOpenPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isVendor()) {
      router.push('/auth/login');
      return;
    }
    fetchEarnings();
  }, [isAuthenticated]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const { data } = await vendorService.getEarnings();
      setEarnings(data.earnings);
    } catch (error) {
      toast.error('Failed to load earnings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await vendorService.requestPayout({
        amount: parseFloat(payoutAmount),
        accountNumber: 'ACCOUNT_NUMBER', // Get from backend
      });
      toast.success('Payout request submitted');
      setOpenPayoutDialog(false);
      setPayoutAmount('');
      fetchEarnings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request payout');
    }
  };

  if (loading) return <Layout><Loading /></Layout>;

  const stats = [
    {
      label: 'Total Earnings',
      value: `₹${(earnings?.totalEarnings || 0).toFixed(2)}`,
      color: '#4CAF50',
    },
    {
      label: 'Current Balance',
      value: `₹${(earnings?.currentBalance || 0).toFixed(2)}`,
      color: '#2196F3',
    },
    {
      label: 'Total Paid Out',
      value: `₹${(earnings?.totalPaidOut || 0).toFixed(2)}`,
      color: '#FF9800',
    },
    {
      label: 'Pending Requests',
      value: earnings?.pendingPayouts || 0,
      color: '#F44336',
    },
  ];

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Earnings & Payouts
          </Typography>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#4CAF50' }}
            onClick={() => setOpenPayoutDialog(true)}
          >
            Request Payout
          </Button>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card elevation={0} sx={{ backgroundColor: '#fafafa', borderRadius: '12px' }}>
                <CardContent>
                  <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Transactions */}
        <Paper elevation={0} sx={{ p: 3, backgroundColor: '#fff', borderRadius: '12px', mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Recent Transactions
          </Typography>

          {earnings?.transactions && earnings.transactions.length > 0 ? (
            <Table>
              <TableHead sx={{ backgroundColor: '#f0f7f0' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {earnings.transactions.map((transaction, idx) => (
                  <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {transaction.type?.toUpperCase()}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: transaction.type === 'credit' ? '#4CAF50' : '#F44336',
                        }}
                      >
                        {transaction.type === 'credit' ? '+' : '−'}₹
                        {transaction.amount?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status || 'Completed'}
                        size="small"
                        color={transaction.status === 'pending' ? 'warning' : 'success'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No transactions yet
            </Typography>
          )}
        </Paper>

        {/* Payout Requests */}
        <Paper elevation={0} sx={{ p: 3, backgroundColor: '#fff', borderRadius: '12px' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Payout Requests
          </Typography>

          {earnings?.payoutRequests && earnings.payoutRequests.length > 0 ? (
            <Table>
              <TableHead sx={{ backgroundColor: '#f0f7f0' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Bank Account</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {earnings.payoutRequests.map((payout, idx) => (
                  <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ₹{payout.amount?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payout.status}
                        size="small"
                        color={
                          payout.status === 'pending'
                            ? 'warning'
                            : payout.status === 'approved'
                              ? 'info'
                              : payout.status === 'completed'
                                ? 'success'
                                : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {payout.bankAccount?.accountNumber?.slice(-4) || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No payout requests yet
            </Typography>
          )}
        </Paper>

        {/* Payout Request Dialog */}
        <Dialog open={openPayoutDialog} onClose={() => setOpenPayoutDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Request Payout
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Available Balance: ₹{(earnings?.currentBalance || 0).toFixed(2)}
            </Typography>
            <TextField
              label="Payout Amount"
              type="number"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              fullWidth
              placeholder="0.00"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                },
              }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
              Minimum payout: ₹100
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenPayoutDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#4CAF50' }}
              onClick={handleRequestPayout}
            >
              Request Payout
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default VendorEarnings;
