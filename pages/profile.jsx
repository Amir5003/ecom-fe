/**
 * User Profile Page
 */

import { Box, Container, Typography, Grid, Paper, TextField, Button, Avatar } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const Profile = () => {
  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, this would call an API endpoint
      updateUser(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          My Profile
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Picture */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f0f7f0', borderRadius: '12px', textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  backgroundColor: '#4CAF50',
                  fontSize: '48px',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {user.email}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                {user.role?.toUpperCase()}
              </Typography>
            </Paper>
          </Grid>

          {/* Profile Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#fff', borderRadius: '12px' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Edit Profile
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
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
                  disabled
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                      '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                    },
                  }}
                />
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                      '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#4CAF50',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    mt: 2,
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Profile;
