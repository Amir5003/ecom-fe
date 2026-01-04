/**
 * Vendor Dashboard
 */

import { Box, Container, Typography, Grid, Paper, Button, Card, CardContent, LinearProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { vendorService } from '@/services/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

const VendorDashboard = () => {
  const router = useRouter();
  const { isAuthenticated, isVendor } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isVendor()) {
      router.push('/auth/login');
      return;
    }
    fetchDashboard();
  }, [isAuthenticated]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await vendorService.getDashboard();
      setDashboard(data.dashboard);
    } catch (error) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loading /></Layout>;

  const stats = [
    { label: 'Total Products', value: dashboard?.totalProducts || 0, color: '#4CAF50' },
    { label: 'Total Orders', value: dashboard?.totalOrders || 0, color: '#2196F3' },
    { label: 'Total Earnings', value: `₹${(dashboard?.totalEarnings || 0).toFixed(2)}`, color: '#FF9800' },
    { label: 'Pending Orders', value: dashboard?.pendingOrders || 0, color: '#F44336' },
  ];

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Vendor Dashboard
          </Typography>
          <Link href="/vendor/products" style={{ textDecoration: 'none' }}>
            <Button variant="contained" sx={{ backgroundColor: '#4CAF50' }}>
              + Add Product
            </Button>
          </Link>
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

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#fff', borderRadius: '12px', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Link href="/vendor/products" style={{ textDecoration: 'none' }}>
                    <Button fullWidth variant="outlined" sx={{ py: 1.5 }}>
                      Manage Products
                    </Button>
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Link href="/vendor/orders" style={{ textDecoration: 'none' }}>
                    <Button fullWidth variant="outlined" sx={{ py: 1.5 }}>
                      View Orders
                    </Button>
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Link href="/vendor/earnings" style={{ textDecoration: 'none' }}>
                    <Button fullWidth variant="outlined" sx={{ py: 1.5 }}>
                      View Earnings
                    </Button>
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Link href="/vendor/profile" style={{ textDecoration: 'none' }}>
                    <Button fullWidth variant="outlined" sx={{ py: 1.5 }}>
                      Edit Profile
                    </Button>
                  </Link>
                </Grid>
              </Grid>
            </Paper>

            {/* Store Info */}
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f0f7f0', borderRadius: '12px' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Your Store
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Store URL
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#4CAF50', wordBreak: 'break-all' }}>
                    /store/{dashboard?.storeSlug}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Commission Rate
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {dashboard?.commissionPercentage || 10}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#fff', borderRadius: '12px' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Recent Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Profile Completion</Typography>
                    <Typography variant="body2">75%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={75} sx={{ backgroundColor: '#e0e0e0', '& .MuiLinearProgress-bar': { backgroundColor: '#4CAF50' } }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    ⭐ Store Rating: {dashboard?.rating || 4.5}/5
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Based on {dashboard?.totalReviews || 0} reviews
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default VendorDashboard;
