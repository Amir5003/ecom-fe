/**
 * Order Details Page
 */

import { Box, Container, Typography, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Stepper, Step, StepLabel, Divider, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { orderService } from '@/services/api';
import { UPLOAD_BASE_URL } from '@/config/endpoints';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (id) {
      fetchOrder();
    }
  }, [id, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await orderService.getOrderById(id);
      const orderData = data.order || data;

      const vendorStatuses = (orderData.vendors || []).map((v) => (v.vendorStatus || '').toLowerCase());
      let derivedStatus = (orderData.orderStatus || 'pending').toLowerCase();
      if (vendorStatuses.includes('delivered')) derivedStatus = 'delivered';
      else if (vendorStatuses.includes('in_transit') || vendorStatuses.includes('shipped')) derivedStatus = 'shipped';
      else if (vendorStatuses.includes('processing') || vendorStatuses.includes('accepted')) derivedStatus = 'processing';

      setOrder({ ...orderData, derivedStatus });
    } catch (error) {
      toast.error('Failed to load order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = {
      pending: 0,
      processing: 1,
      confirmed: 1,
      shipped: 2,
      in_transit: 2,
      delivered: 3,
    };
    if (!status) return 0;
    return steps[status.toLowerCase()] ?? 0;
  };

  if (loading) return <Layout><Loading /></Layout>;
  if (!order) return <Layout><Typography>Order not found</Typography></Layout>;

  return (
    <Layout>
      <Container maxWidth="lg">
        {/* Order Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: '#f0f7f0',
            borderRadius: '12px',
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Order #{order._id.substring(0, 8).toUpperCase()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip label={order.derivedStatus || order.orderStatus} color="success" />
            <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, color: '#4CAF50' }}>
              ₹{order.totalPrice?.toFixed(2)}
            </Typography>
          </Box>
        </Paper>

        {/* Order Status Timeline */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#fff', borderRadius: '12px' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Order Status
          </Typography>
          <Stepper activeStep={getStatusStep(order.derivedStatus || order.orderStatus)} sx={{ mb: 3 }}>
            {['Pending', 'Processing', 'Shipped / In Transit', 'Delivered'].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Grid container spacing={3}>
          {/* Vendors and Items */}
          <Grid item xs={12} md={8}>
            {order.vendors?.map((vendorOrder, idx) => (
              <Paper key={idx} elevation={0} sx={{ p: 3, mb: 3, backgroundColor: '#fafafa', borderRadius: '12px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    🏪 {vendorOrder.vendor?.businessName}
                  </Typography>
                  <Chip label={vendorOrder.vendorStatus} size="small" />
                </Box>

                <Table size="small" sx={{ mb: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendorOrder.items?.map((item) => (
                      <TableRow key={item.product?._id || item._id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">₹{item.price?.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      ₹{vendorOrder.vendorSubtotal?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Commission ({vendorOrder.commissionPercentage}%)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#f44336' }}>
                      −₹{vendorOrder.commissionAmount?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Vendor Earns
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                      ₹{vendorOrder.vendorEarnings?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {vendorOrder.tracking && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        📦 Tracking
                      </Typography>
                      <Typography variant="body2">
                        Carrier: {vendorOrder.tracking.carrier}
                      </Typography>
                      <Typography variant="body2">
                        Number: {vendorOrder.tracking.number}
                      </Typography>
                    </Box>
                  </>
                )}
              </Paper>
            ))}
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f0f7f0', borderRadius: '12px' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Order Summary
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Shipping Address
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {order.shippingAddress?.address}
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress?.country}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Payment Method
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                  {order.paymentMethod || 'Card'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ backgroundColor: '#fff', p: 2, borderRadius: '8px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">₹{order.totalPrice?.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    ₹{order.totalPrice?.toFixed(2)}
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

export default OrderDetail;
