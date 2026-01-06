/**
 * Store Detail Page
 */

import { Box, Container, Typography, Grid, Button, Paper, Rating } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import { storeService } from '@/services/api';
import { buildImageUrl } from '@/utils/imageCompression';
import Link from 'next/link';
import toast from 'react-hot-toast';
import useCartStore from '@/store/cartStore';

const StoreDetail = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (slug) {
      fetchStoreData();
    }
  }, [slug]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const storeRes = await storeService.getStoreBySlug(slug);
      const productsRes = await storeService.getStoreProducts(slug, { limit: 100 });

      setStore(storeRes.data?.data || storeRes.data?.store || storeRes.data);
      setProducts(productsRes.data?.products || productsRes.data?.data?.products || []);
    } catch (error) {
      toast.error('Failed to load store');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) return <Layout><Loading /></Layout>;
  if (!store) return <Layout><Typography>Store not found</Typography></Layout>;

  return (
    <Layout>
      <Container maxWidth="lg">
        {/* Store Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            backgroundColor: '#f0f7f0',
            borderRadius: '12px',
            mb: 6,
            display: 'flex',
            gap: 3,
            alignItems: 'center',
          }}
        >
          {store.logo && (
            <Box
              component="img"
              src={buildImageUrl(store.logo)}
              sx={{ width: 120, height: 120, borderRadius: '12px', objectFit: 'cover' }}
            />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {store.businessName}
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              {store.businessDescription}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box>
                <Rating value={store.rating || 4} readOnly size="small" />
                <Typography variant="body2" color="textSecondary">
                  {store.totalReviews || 0} reviews
                </Typography>
              </Box>
              <Typography variant="body2">
                📍 {store.address?.city}, {store.address?.state}
              </Typography>
              <Typography variant="body2">
                📞 {store.phoneNumber}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Products */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>
            Available Products ({products.length})
          </Typography>
          <Grid container spacing={3}>
            {products.length > 0 ? (
              products.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <Card
                    image={buildImageUrl(product.image)}
                    title={product.name}
                    description={product.description}
                    price={product.price}
                  >
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => handleAddToCart(product)}
                        sx={{ backgroundColor: '#4CAF50' }}
                      >
                        Add to Cart
                      </Button>
                      <Link href={`/products/${product._id}`} style={{ textDecoration: 'none', flex: 1 }}>
                        <Button variant="outlined" size="small" fullWidth>
                          View
                        </Button>
                      </Link>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  No products available
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default StoreDetail;
