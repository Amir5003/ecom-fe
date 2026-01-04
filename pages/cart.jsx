/**
 * Cart Page
 */

import { Box, Container, Typography, Grid, Paper, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { cartService } from '@/services/api';
import { UPLOAD_BASE_URL } from '@/config/endpoints';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import Link from 'next/link';
import toast from 'react-hot-toast';

const Cart = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setCart, groupedByVendor, totalPrice } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await cartService.getCart();
      setCart(data);
    } catch (error) {
      toast.error('Failed to load cart');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await cartService.removeFromCart({ productId });
      fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      await cartService.updateCartQuantity({ productId, quantity });
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      setCart({ items: [], cartSummary: [], totalPrice: 0, totalItems: 0 });
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) return <Layout><Loading /></Layout>;

  if (groupedByVendor.length === 0) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Your cart is empty
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 4 }}>
              Start shopping to add items to your cart
            </Typography>
            <Link href="/stores" style={{ textDecoration: 'none' }}>
              <Button variant="contained" sx={{ backgroundColor: '#4CAF50' }}>
                Browse Stores
              </Button>
            </Link>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          Shopping Cart
        </Typography>

        <Grid container spacing={3}>
          {/* Cart Items by Vendor */}
          <Grid item xs={12} md={8}>
            {groupedByVendor.map((vendorCart, idx) => (
              <Paper key={idx} elevation={0} sx={{ p: 3, mb: 3, backgroundColor: '#fafafa', borderRadius: '12px' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#4CAF50' }}>
                  🏪 {vendorCart.vendor.businessName}
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendorCart.items.map((item) => (
                      <TableRow key={item.product._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={`${UPLOAD_BASE_URL}/${item.product.image}`}
                              sx={{ width: 50, height: 50, borderRadius: '8px' }}
                            />
                            {item.product.name}
                          </Box>
                        </TableCell>
                        <TableCell align="right">₹{item.product.price}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              size="small"
                              onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                            >
                              −
                            </Button>
                            <Typography sx={{ px: 1 }}>{item.quantity}</Typography>
                            <Button
                              size="small"
                              onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </Box>
                        </TableCell>
                        <TableCell align="right">₹{(item.product.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(item.product._id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            ))}
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f0f7f0', borderRadius: '12px', position: 'sticky', top: 100 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Order Summary
              </Typography>

              {groupedByVendor.map((vendorCart, idx) => (
                <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{vendorCart.vendor.businessName}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ₹{vendorCart.subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ))}

              <Box sx={{ py: 2, borderTop: '2px solid #4CAF50', borderBottom: '2px solid #4CAF50', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    ₹{totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Link href="/checkout" style={{ textDecoration: 'none' }}>
                <Button fullWidth variant="contained" sx={{ backgroundColor: '#4CAF50', mb: 1 }}>
                  Proceed to Checkout
                </Button>
              </Link>
              <Link href="/stores" style={{ textDecoration: 'none' }}>
                <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
                  Continue Shopping
                </Button>
              </Link>
              <Button fullWidth variant="text" color="error" onClick={handleClearCart}>
                Clear Cart
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Cart;
