/**
 * Footer Component
 * Main footer with light theme
 */

import { Box, Container, Grid, Typography, Link as MUILink, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  borderTop: '1px solid #e0e0e0',
  marginTop: '60px',
  paddingTop: '40px',
  paddingBottom: '20px',
}));

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterWrapper>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* About */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#4CAF50' }}>
              🥬 VegMarket
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Your local vegetable marketplace connecting farmers and customers.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MUILink href="/" underline="hover">
                Home
              </MUILink>
              <MUILink href="/stores" underline="hover">
                Browse Stores
              </MUILink>
              <MUILink href="/about" underline="hover">
                About Us
              </MUILink>
              <MUILink href="/contact" underline="hover">
                Contact
              </MUILink>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MUILink href="/faq" underline="hover">
                FAQ
              </MUILink>
              <MUILink href="/shipping" underline="hover">
                Shipping
              </MUILink>
              <MUILink href="/returns" underline="hover">
                Returns
              </MUILink>
              <MUILink href="/privacy" underline="hover">
                Privacy Policy
              </MUILink>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Contact Us
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Email: support@vegmarket.com
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Phone: +91 98765 43210
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            &copy; {currentYear} VegMarket. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;
