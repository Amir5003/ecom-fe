/**
 * Product Detail Page
 */

import { Box, Container, Typography, Grid, Paper, Button, Rating } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { productService } from '@/services/api';
import { UPLOAD_BASE_URL } from '@/config/endpoints';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await productService.getProductById(id);
      setProduct(data.product);
    } catch (error) {
      toast.error('Failed to load product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) return <Layout><Loading /></Layout>;
  if (!product) return <Layout><Typography>Product not found</Typography></Layout>;

  return (
    <Layout>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Box
                component="img"
                src={`${UPLOAD_BASE_URL}/${product.image}`}
                sx={{ width: '100%', height: 'auto' }}
              />
            </Paper>
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              {product.name}
            </Typography>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Rating value={product.rating || 4} readOnly size="small" />
              <Typography variant="body2" color="textSecondary">
                {product.reviews || 0} reviews
              </Typography>
            </Box>

            {/* Price */}
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#4CAF50', mb: 3 }}>
              ₹{product.price}
            </Typography>

            {/* Description */}
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: '12px', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Description
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {product.description}
              </Typography>
            </Paper>

            {/* Category & Stock */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {product.category}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Stock
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: product.stock > 0 ? '#4CAF50' : '#f44336',
                    }}
                  >
                    {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Vendor Info */}
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f0f7f0', borderRadius: '12px', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Sold by
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                {product.vendor?.businessName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {product.vendor?.businessDescription}
              </Typography>
            </Paper>

            {/* Quantity & Add to Cart */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #e0e0e0', borderRadius: '8px', p: 0.5 }}>
                <Button
                  size="small"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  sx={{ minWidth: '36px' }}
                >
                  −
                </Button>
                <Typography sx={{ px: 1, minWidth: '40px', textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <Button
                  size="small"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  sx={{ minWidth: '36px' }}
                >
                  +
                </Button>
              </Box>

              <Button
                variant="contained"
                fullWidth
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                sx={{
                  backgroundColor: '#4CAF50',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Add to Cart
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default ProductDetail;
