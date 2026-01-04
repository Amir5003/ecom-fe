/**
 * Email Verification Page
 * Handles token-based email verification from the verification link
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
  Link as MUILink,
} from '@mui/material';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const VerifyEmail = () => {
  const router = useRouter();
  const { token } = router.query;
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    }
  }, [token]);

  const verifyEmailToken = async (verificationToken) => {
    try {
      setLoading(true);
      await authService.verifyEmail(verificationToken);
      setVerified(true);
      toast.success('Email verified successfully!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Email verification failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            {/* Loading State */}
            {loading && (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress
                  size={80}
                  sx={{
                    color: '#4CAF50',
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#333',
                    mb: 1,
                  }}
                >
                  Verifying Your Email...
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Please wait while we verify your email address.
                </Typography>
              </Box>
            )}

            {/* Success State */}
            {verified && !loading && (
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircleIcon
                  sx={{
                    fontSize: 100,
                    color: '#4CAF50',
                    mb: 2,
                    animation: 'pulse 0.6s ease-out',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(0.8)',
                        opacity: 0.5,
                      },
                      '100%': {
                        transform: 'scale(1)',
                        opacity: 1,
                      },
                    },
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: '#4CAF50',
                  }}
                >
                  Email Verified! ✅
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  Your email has been successfully verified.
                  <br />
                  You can now log in to your account.
                </Typography>

                <Alert
                  severity="success"
                  sx={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    mb: 3,
                    '& .MuiAlert-icon': {
                      color: '#4CAF50',
                    },
                  }}
                >
                  Redirecting to login page in a moment...
                </Alert>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => router.push('/auth/login')}
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#45a049',
                    },
                  }}
                >
                  Go to Login
                </Button>
              </Box>
            )}

            {/* Error State */}
            {error && !loading && (
              <Box sx={{ textAlign: 'center' }}>
                <ErrorOutlineIcon
                  sx={{
                    fontSize: 100,
                    color: '#f44336',
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: '#d32f2f',
                  }}
                >
                  Verification Failed
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  We couldn't verify your email address.
                </Typography>

                <Alert
                  severity="error"
                  sx={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    mb: 3,
                    textAlign: 'left',
                    '& .MuiAlert-icon': {
                      color: '#f44336',
                    },
                  }}
                >
                  <strong>Error:</strong> {error}
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => router.push('/auth/register')}
                    sx={{
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#45a049',
                      },
                    }}
                  >
                    Try Registering Again
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => router.push('/auth/login')}
                    sx={{
                      borderColor: '#4CAF50',
                      color: '#4CAF50',
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#f1f8f4',
                      },
                    }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </Box>
            )}

            {/* Pending State (No token provided) */}
            {!token && !loading && !verified && !error && (
              <Box sx={{ textAlign: 'center' }}>
                <MailOutlineIcon
                  sx={{
                    fontSize: 100,
                    color: '#4CAF50',
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: '#333',
                  }}
                >
                  Check Your Email
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                  We've sent a verification link to your email address.
                  <br />
                  <br />
                  <strong>Please click the verification link</strong> in the email to complete your registration.
                </Typography>

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
                  <strong>Tip:</strong> The link will expire in 24 hours. If you don't see the email, check your spam folder.
                </Alert>

                <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px', mb: 3 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                    The verification email contains a secure link that will look like:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      wordBreak: 'break-all',
                      color: '#666',
                    }}
                  >
                    http://localhost:3000/auth/verify-email?token=xxxxx
                  </Typography>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Already verified?
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => router.push('/auth/login')}
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#45a049',
                    },
                  }}
                >
                  Go to Login
                </Button>
              </Box>
            )}

            {/* Footer Links */}
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Need help?{' '}
                <MUILink
                  href="/"
                  underline="hover"
                  sx={{
                    color: '#4CAF50',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Go back home
                </MUILink>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};

export default VerifyEmail;
