/**
 * Register Page
 */

import { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Link as MUILink, Alert, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const router = useRouter();
  const [userType, setUserType] = useState('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessLicense: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType,
      };

      if (userType === 'vendor') {
        payload.businessName = formData.businessName;
        payload.businessLicense = formData.businessLicense;
      }

      const { data } = await authService.register(payload);
      toast.success('Registration successful! Please check your email to verify.');
      router.push('/auth/verify-email');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ py: 6 }}>
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
              Create Account
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mb: 3 }}>
              Join our vegetable marketplace
            </Typography>

            {/* User Type Toggle */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <ToggleButtonGroup
                value={userType}
                exclusive
                onChange={(e, newType) => newType && setUserType(newType)}
                sx={{
                  '& .MuiToggleButton-root': {
                    color: '#666',
                    '&.Mui-selected': {
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#45a049' },
                    },
                  },
                }}
              >
                <ToggleButton value="customer">Customer</ToggleButton>
                <ToggleButton value="vendor">Vendor</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
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

              {userType === 'vendor' && (
                <>
                  <TextField
                    label="Business Name"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    fullWidth
                    required={userType === 'vendor'}
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
                    label="Business License"
                    name="businessLicense"
                    value={formData.businessLicense}
                    onChange={handleChange}
                    fullWidth
                    required={userType === 'vendor'}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f5f5f5',
                        '&:hover fieldset': { borderColor: '#4CAF50' },
                        '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                      },
                    }}
                  />
                </>
              )}

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
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>

            <Typography sx={{ textAlign: 'center', mt: 3 }}>
              Already have an account?{' '}
              <MUILink href="/auth/login" underline="hover" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                Sign in here
              </MUILink>
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};

export default Register;
