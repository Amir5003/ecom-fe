/**
 * Stores Page
 */

import { Box, Container, Typography, Grid, TextField, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import { productService, vendorService } from '@/services/api';
import { UPLOAD_BASE_URL } from '@/config/endpoints';
import Link from 'next/link';
import toast from 'react-hot-toast';

const Stores = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    const filtered = vendors.filter((vendor) =>
      vendor.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVendors(filtered);
  }, [searchQuery, vendors]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      // This would be fetched from a get all vendors endpoint
      // For now, using a placeholder
      const { data } = await productService.getAllProducts({ limit: 100 });
      const uniqueVendors = {};
      
      if (data.products) {
        data.products.forEach((product) => {
          if (product.vendor && !uniqueVendors[product.vendor._id]) {
            uniqueVendors[product.vendor._id] = product.vendor;
          }
        });
      }
      
      setVendors(Object.values(uniqueVendors));
    } catch (error) {
      toast.error('Failed to load stores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Browse Local Farmers
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Discover fresh vegetables from local farmers near you
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 4 }}>
          <TextField
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f5f5',
                '&:hover fieldset': { borderColor: '#4CAF50' },
                '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
              },
            }}
          />
        </Box>

        {/* Stores Grid */}
        <Grid container spacing={3}>
          {filteredVendors.length > 0 ? (
            filteredVendors.map((vendor) => (
              <Grid item xs={12} sm={6} md={4} key={vendor._id}>
                <Link href={`/store/${vendor.storeSlug}`} style={{ textDecoration: 'none' }}>
                  <Card
                    image={vendor.logo || `${UPLOAD_BASE_URL}/default-store.png`}
                    title={vendor.businessName}
                    description={vendor.businessDescription}
                  >
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        ⭐ {vendor.rating || 4.5} ({vendor.totalReviews || 0} reviews)
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                        {vendor.totalProducts || 0} products
                      </Typography>
                    </Box>
                  </Card>
                </Link>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                No stores found matching your search.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </Layout>
  );
};

export default Stores;
