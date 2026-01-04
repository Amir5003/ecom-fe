/**
 * Email Verification Page
 * Handles OTP-based email verification with 6-digit code
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
  TextField,
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
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    // Get email from localStorage (set during registration or login)
    const storedEmail = localStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      // Auto-send OTP when page loads - this ensures user has the latest code
      autoSendOtp(storedEmail);
    } else {
      // Redirect to register if no email found
      router.push('/auth/register');
    }
  }, [router]);

  // Auto-send OTP when page loads
  const autoSendOtp = async (userEmail) => {
    try {
      console.log('Auto-sending OTP to:', userEmail);
      const { data } = await authService.resendVerificationCode(userEmail);
      console.log('OTP auto-sent successfully:', data);
      toast.success('Verification code sent to your email');
      setPageLoading(false);
      setResendTimer(60); // Start cooldown timer
    } catch (err) {
      console.error('Failed to auto-send OTP:', err);
      const errorMessage = err.response?.data?.ackMessage || err.response?.data?.message || 'Failed to send verification code. Please try again.';
      setError(errorMessage);
      setPageLoading(false);
      toast.error(errorMessage);
    }
  };

  // Countdown timer for resend button
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');

    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      verifyOtp(value);
    }
  };

  const verifyOtp = async (code = otp) => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      const { data } = await authService.verifyEmail(email, code);
      setVerified(true);
      toast.success(data.ackMessage || 'Email verified successfully!');
      localStorage.removeItem('verificationEmail');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.ackMessage || err.response?.data?.message || 'Email verification failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      const { data } = await authService.resendVerificationCode(email);
      toast.success(data.ackMessage || 'Verification code resent to your email!');
      setOtp(''); // Clear the input
      setError(''); // Clear any errors
      setResendTimer(60); // Start 60 second cooldown
    } catch (err) {
      const errorMessage = err.response?.data?.ackMessage || err.response?.data?.message || 'Failed to resend code. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
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
            {/* Loading State - Page Load */}
            {pageLoading && (
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
                  Loading...
                </Typography>
              </Box>
            )}

            {/* OTP Input State */}
            {!pageLoading && !verified && (
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
                    mb: 1,
                    color: '#333',
                  }}
                >
                  Verify Your Email
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  We've sent a 6-digit code to <strong>{email}</strong>
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'left' }}>
                    Enter the 6-digit code:
                  </Typography>
                  <TextField
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={loading}
                    fullWidth
                    autoFocus
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '2rem',
                        fontWeight: 600,
                        letterSpacing: '0.5rem',
                        textAlign: 'center',
                        py: 2,
                        fontFamily: 'monospace',
                      },
                      '& input::placeholder': {
                        opacity: 0.5,
                        color: '#999',
                      },
                    }}
                  />
                </Box>

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      backgroundColor: '#ffebee',
                      color: '#c62828',
                      mb: 2,
                      '& .MuiAlert-icon': {
                        color: '#f44336',
                      },
                    }}
                  >
                    {error}
                  </Alert>
                )}

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
                  The code will be auto-verified once you enter all 6 digits.
                </Alert>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => verifyOtp()}
                  disabled={loading || otp.length !== 6}
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
                      color: '#666666',
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} sx={{ color: '#fff' }} />
                      Verifying...
                    </Box>
                  ) : (
                    'Verify Code'
                  )}
                </Button>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mb: 1 }}>
                    Didn&apos;t receive the code?
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleResendOtp}
                    disabled={resendLoading || resendTimer > 0}
                    sx={{
                      borderColor: '#4CAF50',
                      color: '#4CAF50',
                      py: 1,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#f1f8f4',
                      },
                      '&:disabled': {
                        borderColor: '#ccc',
                        color: '#999',
                      },
                    }}
                  >
                    {resendLoading ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Success State */}
            {verified && !pageLoading && (
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
