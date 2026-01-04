/**
 * Vendor Pending Approval Page
 * Shows vendors that their profile is awaiting admin approval
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { authService } from '@/services/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

const VendorPendingApproval = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // Check vendor status on page load
    checkVendorStatus();
  }, []);

  const checkVendorStatus = async () => {
    setCheckingStatus(true);
    try {
      const { data } = await authService.getVendorStatus();
      const vendorStatus = data.data;
      setStatus(vendorStatus);

      // If approved, redirect to dashboard
      if (vendorStatus.vendorStatus === 'APPROVED') {
        toast.success('Your vendor account has been approved!');
        router.push('/vendor/dashboard');
        return;
      }

      // If setup required, redirect to setup
      if (vendorStatus.vendorStatus === 'SETUP_REQUIRED') {
        router.push('/vendor/setup');
        return;
      }

      // If suspended, show error
      if (vendorStatus.vendorStatus === 'SUSPENDED') {
        // Keep showing this page
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.ackMessage || err.response?.data?.message || 'Failed to check status';
      toast.error(errorMessage);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      router.push('/auth/login');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Error logging out');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    checkVendorStatus();
  };

  if (checkingStatus) {
    return (
      <Layout>
        <Container maxWidth="sm">
          <Box
            sx={{
              py: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
            }}
          >
            <CircularProgress size={80} sx={{ color: '#4CAF50', mb: 3 }} />
            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              Checking your vendor status...
            </Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  // Suspended Status
  if (status?.vendorStatus === 'SUSPENDED') {
    return (
      <Layout>
        <Container maxWidth="sm">
          <Box sx={{ py: 6, display: 'flex', alignItems: 'center', minHeight: '60vh' }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                textAlign: 'center',
              }}
            >
              <ErrorIcon sx={{ fontSize: 100, color: '#f44336', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#f44336' }}>
                Account Suspended
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Your vendor account has been suspended.
              </Typography>

              {status.suspensionReason && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Suspension Reason:
                  </Typography>
                  {status.suspensionReason}
                </Alert>
              )}

              <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                Please contact our support team for more information.
              </Typography>

              <Button
                variant="contained"
                fullWidth
                onClick={handleLogout}
                disabled={loading}
                sx={{
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  },
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Logout'}
              </Button>
            </Paper>
          </Box>
        </Container>
      </Layout>
    );
  }

  // Pending Approval Status (default)
  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ py: 6, display: 'flex', alignItems: 'center', minHeight: '70vh' }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <HourglassEmptyIcon sx={{ fontSize: 100, color: '#FF9800', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
                Pending Admin Approval
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Your vendor profile is awaiting admin review
              </Typography>
            </Box>

            {/* Status Card */}
            <Card
              sx={{
                backgroundColor: '#fff8f0',
                border: '2px solid #FF9800',
                mb: 3,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HourglassEmptyIcon sx={{ color: '#FF9800', mr: 2, fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    What's Next?
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Our admin team is reviewing your business information and verification documents.
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  ⏱️ <strong>Estimated time:</strong> 24-48 hours
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  You'll receive an email notification once your account has been approved or if we need
                  additional information.
                </Typography>
              </CardContent>
            </Card>

            {/* Info Alerts */}
            <Alert
              severity="info"
              sx={{
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                mb: 3,
                '& .MuiAlert-icon': {
                  color: '#2196f3',
                },
              }}
            >
              During this time, you can edit your profile information but cannot access the vendor dashboard or create
              products.
            </Alert>

            <Divider sx={{ my: 3 }} />

            {/* Your Information Summary */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Your Account Information
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: '8px' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{user?.email}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: '8px' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Account Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <HourglassEmptyIcon sx={{ color: '#FF9800', fontSize: 20 }} />
                    <Typography variant="body1" sx={{ color: '#FF9800', fontWeight: 600 }}>
                      {status?.message || 'Pending Approval'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleRefresh}
                disabled={checkingStatus}
                startIcon={<RefreshIcon />}
                sx={{
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#45a049',
                  },
                  '&:disabled': {
                    backgroundColor: '#cccccc',
                  },
                }}
              >
                {checkingStatus ? 'Checking Status...' : 'Check Status Now'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleLogout}
                disabled={loading}
                sx={{
                  borderColor: '#ccc',
                  color: '#666',
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#999',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                {loading ? <CircularProgress size={20} /> : 'Logout'}
              </Button>
            </Box>

            {/* Help Section */}
            <Box sx={{ backgroundColor: '#f9f9f9', p: 3, borderRadius: '8px', mt: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Need Help?
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                If you don't receive approval within 48 hours, please contact our support team at{' '}
                <strong>support@vegmarket.com</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Make sure all the information you provided is accurate and matches your business documents.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};

export default VendorPendingApproval;
