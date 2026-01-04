/**
 * Layout Component
 * Main layout wrapper with Navbar and Footer
 */

import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';

const Layout = ({ children }) => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from cookies on mount
    initialize();
  }, [initialize]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
      }}
    >
      <Navbar />
      <Box component="main" sx={{ flex: 1, py: 4 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
