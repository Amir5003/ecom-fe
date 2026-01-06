/**
 * Navigation Bar Component
 * Main navigation with light theme and mobile responsiveness
 */

import { AppBar, Toolbar, Box, Button, Badge, Menu, MenuItem, Avatar, IconButton, Drawer, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ShoppingCart, Logout, Dashboard, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const handleLogout = async () => {
    try {
      // Call logout API to blacklist token on backend
      await authService.logout();
      
      // Clear user from local state
      clearUser();
      
      // Close menu
      handleMenuClose();
      handleDrawerClose();
      
      // Show success message
      toast.success('Logged out successfully!');
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user locally even if API fails
      clearUser();
      handleMenuClose();
      handleDrawerClose();
      toast.error('Logout failed, but you have been signed out locally');
      router.push('/');
    }
  };

  // Navigation items for mobile drawer
  const navItems = (
    <Box sx={{ width: 280, pt: 2 }}>
      {/* Logo in drawer */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Link href="/">
          <Box
            onClick={handleDrawerClose}
            sx={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#4CAF50',
              cursor: 'pointer',
            }}
          >
            🥬 VegMarket
          </Box>
        </Link>
      </Box>

      <Divider />

      {/* Navigation Links */}
      <Box sx={{ py: 2 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <MenuItem onClick={handleDrawerClose} sx={{ color: '#333' }}>
            Home
          </MenuItem>
        </Link>
        {isAuthenticated && (
          <Link href="/stores" style={{ textDecoration: 'none' }}>
            <MenuItem onClick={handleDrawerClose} sx={{ color: '#333' }}>
              Stores
            </MenuItem>
          </Link>
        )}
      </Box>

      <Divider />

      {/* Auth section */}
      <Box sx={{ py: 2 }}>
        {isAuthenticated ? (
          <>
            <MenuItem onClick={() => {
              router.push('/profile');
              handleDrawerClose();
            }} sx={{ color: '#333' }}>
              Profile
            </MenuItem>
            {user?.role === 'vendor' && (
              <MenuItem onClick={() => {
                router.push('/vendor/dashboard');
                handleDrawerClose();
              }} sx={{ color: '#333' }}>
                Dashboard
              </MenuItem>
            )}
            {user?.role === 'customer' && (
              <MenuItem onClick={() => {
                router.push('/orders');
                handleDrawerClose();
              }} sx={{ color: '#333' }}>
                My Orders
              </MenuItem>
            )}
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
              <Logout sx={{ mr: 1, fontSize: 18 }} /> Logout
            </MenuItem>
          </>
        ) : (
          <>
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <MenuItem onClick={handleDrawerClose} sx={{ color: '#333' }}>
                Login
              </MenuItem>
            </Link>
            <Link href="/auth/register" style={{ textDecoration: 'none' }}>
              <MenuItem onClick={handleDrawerClose} sx={{ backgroundColor: '#4CAF50', color: '#fff', my: 1 }}>
                Sign Up
              </MenuItem>
            </Link>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <StyledAppBar position="sticky">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
        {/* Logo */}
        <Link href="/">
          <Box
            sx={{
              fontSize: { xs: '18px', sm: '24px' },
              fontWeight: 700,
              color: '#4CAF50',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🥬 VegMarket
          </Box>
        </Link>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button sx={{ color: '#333', fontSize: '1rem' }}>Home</Button>
          </Link>
          {isAuthenticated && (
            <Link href="/stores" style={{ textDecoration: 'none' }}>
              <Button sx={{ color: '#333', fontSize: '1rem' }}>Stores</Button>
            </Link>
          )}

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
                <MenuItem onClick={() => {
                  router.push('/profile');
                  handleMenuClose();
                }}>Profile</MenuItem>
                {user?.role === 'vendor' && (
                  <MenuItem onClick={() => {
                    router.push('/vendor/dashboard');
                    handleMenuClose();
                  }}>
                    Dashboard
                  </MenuItem>
                )}
                {user?.role === 'customer' && (
                  <MenuItem onClick={() => {
                    router.push('/orders');
                    handleMenuClose();
                  }}>My Orders</MenuItem>
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

        {/* Mobile Navigation - Cart + Menu Icon */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, alignItems: 'center' }}>
          {isAuthenticated && (
            <Link href="/cart" style={{ textDecoration: 'none' }}>
              <Badge badgeContent={totalItems} color="error">
                <ShoppingCart sx={{ color: '#4CAF50', fontSize: '22px', cursor: 'pointer' }} />
              </Badge>
            </Link>
          )}
          <IconButton
            onClick={handleDrawerOpen}
            sx={{ color: '#333' }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          sx={{
            '& .MuiDrawer-paper': {
              backgroundColor: '#fff',
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Box sx={{ fontSize: '16px', fontWeight: 700, color: '#333' }}>Menu</Box>
            <IconButton onClick={handleDrawerClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          {navItems}
        </Drawer>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;
