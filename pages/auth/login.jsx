/**
 * Login Page
 */

import { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Link as MUILink, Alert } from '@mui/material';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authService.login(formData);
      
      // Backend returns user data in data.data with new response format
      const userData = data.data || data; // Handle both old and new format
      const user = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        vendorSlug: userData.vendorSlug,
      };
      
      setUser(user, userData.token);
      toast.success(data.ackMessage || 'Login successful!');

      // Redirect based on role
      if (userData.role === 'vendor') {
        router.push('/vendor/dashboard');
      } else if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.ackMessage || err.response?.data?.message || 'Login failed';
      
      // Check if error is due to unverified email
      if (err.response?.status === 401 && errorMessage && errorMessage.toLowerCase().includes('verify')) {
        // Save email to localStorage and redirect to verify page
        localStorage.setItem('verificationEmail', formData.email);
        toast.error('Please verify your email first');
        // Use replace to prevent going back to login
        router.replace('/auth/verify-email');
        return;
      }
      
      // For other errors
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ py: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
              Welcome Back
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ textAlign: 'center', mb: 3 }}
            >
              Sign in to your account
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '&:hover fieldset': { borderColor: '#4CAF50' },
                    '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  },
                }}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f5f5',
                    '&:hover fieldset': { borderColor: '#4CAF50' },
                    '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#45a049' },
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>

            <Typography sx={{ textAlign: 'center', mt: 3 }}>
              Don&apos;t have an account?{' '}
              <MUILink href="/auth/register" underline="hover" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                Sign up here
              </MUILink>
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};

export default Login;
