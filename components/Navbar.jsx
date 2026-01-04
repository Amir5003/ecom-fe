/**
 * Navigation Bar Component
 * Main navigation with light theme
 */

import { AppBar, Toolbar, Box, Button, Badge, Menu, MenuItem, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ShoppingCart, Logout, Dashboard } from '@mui/icons-material';
import { useState } from 'react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  color: '#333',
  borderBottom: '1px solid #e0e0e0',
}));

const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const { totalItems } = useCartStore();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      // Call logout API to blacklist token on backend
      await authService.logout();
      
      // Clear user from local state
      clearUser();
      
      // Close menu
      handleMenuClose();
      
      // Show success message
      toast.success('Logged out successfully!');
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user locally even if API fails
      clearUser();
      handleMenuClose();
      toast.error('Logout failed, but you have been signed out locally');
      router.push('/');
    }
  };

  return (
    <StyledAppBar position="sticky">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/">
          <Box
            sx={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#4CAF50',
              cursor: 'pointer',
            }}
          >
            🥬 VegMarket
          </Box>
        </Link>

        {/* Search & Links */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button sx={{ color: '#333', fontSize: '1rem' }}>Home</Button>
          </Link>
          <Link href="/stores" style={{ textDecoration: 'none' }}>
            <Button sx={{ color: '#333', fontSize: '1rem' }}>Stores</Button>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Cart Icon */}
              <Link href="/cart" style={{ textDecoration: 'none' }}>
                <Badge badgeContent={totalItems} color="error" sx={{ cursor: 'pointer' }}>
                  <ShoppingCart sx={{ color: '#4CAF50', fontSize: '24px' }} />
                </Badge>
              </Link>

              {/* User Menu */}
              <Box onClick={handleMenuOpen} sx={{ cursor: 'pointer' }}>
                <Avatar sx={{ backgroundColor: '#4CAF50', width: 40, height: 40 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => router.push('/profile')}>Profile</MenuItem>
                {user?.role === 'vendor' && (
                  <MenuItem onClick={() => router.push('/vendor/dashboard')}>
                    Dashboard
                  </MenuItem>
                )}
                {user?.role === 'customer' && (
                  <MenuItem onClick={() => router.push('/orders')}>My Orders</MenuItem>
                )}
                <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                  <Logout sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                <Button sx={{ color: '#333' }}>Login</Button>
              </Link>
              <Link href="/auth/register" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#4CAF50', color: '#fff' }}
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;
