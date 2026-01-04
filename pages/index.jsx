/**
 * Home Page
 */

import { Box, Container, Typography, Grid, Button, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import { productService } from '@/services/api';
import { buildImageUrl } from '@/utils/imageCompression';
import Link from 'next/link';
import toast from 'react-hot-toast';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productService.getAllProducts({ limit: 8 });
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
            borderRadius: { xs: '8px', sm: '12px' },
            p: { xs: 3, sm: 4, md: 6 },
            color: '#fff',
            textAlign: 'center',
            mb: 6,
            mx: { xs: 0, sm: 0 },
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '28px', sm: '32px', md: '38px' } }}>
            🥬 Fresh Vegetables, Local Farmers
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 400, fontSize: { xs: '14px', sm: '16px' } }}>
            Buy fresh, seasonal vegetables directly from local farmers
          </Typography>
          <Link href="/stores" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#fff', color: '#4CAF50', fontWeight: 600 }}
            >
              Browse Stores
            </Button>
          </Link>
        </Box>

        {/* Features */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, textAlign: 'center', fontSize: { xs: '22px', sm: '28px' } }}>
            Why Choose VegMarket?
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {[
              { title: '🌱 Fresh Daily', desc: 'Farm fresh vegetables delivered to your door' },
              { title: '👥 Local Farmers', desc: 'Support local agriculture and farmers' },
              { title: '💰 Best Prices', desc: 'Direct from farm prices without middlemen' },
              { title: '🚚 Fast Delivery', desc: 'Quick delivery with quality guarantee' },
            ].map((feature, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f0f7f0', borderRadius: '12px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: '16px', sm: '18px' } }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '13px', sm: '14px' } }}>
                    {feature.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Featured Products */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '22px', sm: '28px' } }}>
              Featured Products
            </Typography>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <Button sx={{ color: '#4CAF50', fontSize: { xs: '13px', sm: '14px' } }}>View All →</Button>
            </Link>
          </Box>

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                <Link href={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                  <Card
                    image={buildImageUrl(product.image)}
                    title={product.name}
                    description={product.description}
                    price={product.price}
                  />
                </Link>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default Home;
