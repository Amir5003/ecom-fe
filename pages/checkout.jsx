/**
 * Checkout Page
 */

import { Box, Container, Typography, Grid, Paper, Button, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { orderService, cartService } from '@/services/api';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const Checkout = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { groupedByVendor, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phoneNumber: '',
    paymentMethod: 'card',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        phoneNumber: formData.phoneNumber,
        taxPrice: 0,
        shippingPrice: 0,
      };

      const { data } = await orderService.createOrder(orderData);
      clearCart();
      toast.success('Order created successfully!');
      router.push(`/orders/${data.order._id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create order';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          Checkout
        </Typography>

        <Grid container spacing={3}>
          {/* Shipping Address Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 4, backgroundColor: '#fff', borderRadius: '12px' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Shipping Address
              </Typography>

              <Box component="form" onSubmit={handleSubmitOrder} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Full Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  required
                  multiline
                  rows={2}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                      '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                    },
                  }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      fullWidth
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                          '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Postal Code"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      fullWidth
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                          '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      fullWidth
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                          '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      fullWidth
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f5f5f5',
                          '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
                  Payment Method
                </Typography>
                <TextField
                  select
                  label="Select Payment Method"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  fullWidth
                  SelectProps={{ native: true }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                      '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                    },
                  }}
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="wallet">Digital Wallet</option>
                </TextField>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    backgroundColor: '#4CAF50',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    mt: 3,
                  }}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f0f7f0', borderRadius: '12px', position: 'sticky', top: 100 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Order Summary
              </Typography>

              {groupedByVendor.map((vendorCart, idx) => (
                <Box key={idx} sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {vendorCart.vendor.businessName}
                  </Typography>
                  {vendorCart.items.map((item) => (
                    <Box key={item.product._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">
                        {item.product.name} × {item.quantity}
                      </Typography>
                      <Typography variant="body2">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px dashed #ccc' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Subtotal
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ₹{vendorCart.subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ))}

              <Box sx={{ py: 2, borderTop: '2px solid #4CAF50', borderBottom: '2px solid #4CAF50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal</Typography>
                  <Typography>₹{totalPrice.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Delivery</Typography>
                  <Typography>Free</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    ₹{totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Checkout;
