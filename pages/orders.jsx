/**
 * Customer Orders Page
 */

import { Box, Container, Typography, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { orderService } from '@/services/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

const Orders = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const deriveStatus = (order) => {
    const vendorStatuses = (order.vendors || []).map((v) => (v.vendorStatus || '').toLowerCase());
    if (vendorStatuses.includes('delivered')) return 'delivered';
    if (vendorStatuses.includes('in_transit') || vendorStatuses.includes('shipped')) return 'shipped';
    if (vendorStatuses.includes('processing') || vendorStatuses.includes('accepted')) return 'processing';
    return (order.orderStatus || 'pending').toLowerCase();
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await orderService.getAllOrders({ page: 1, limit: 50 });
      const normalized = (data.orders || []).map((o) => ({
        ...o,
        derivedStatus: deriveStatus(o),
      }));
      setOrders(normalized);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      accepted: 'info',
      shipped: 'primary',
      in_transit: 'primary',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status?.toLowerCase()] || 'default';
  };

  if (loading) return <Layout><Loading /></Layout>;

  if (orders.length === 0) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              No Orders Yet
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 4 }}>
              Start shopping to place your first order
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
          My Orders
        </Typography>

        <Paper elevation={0} sx={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'auto' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f0f7f0' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Vendors</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {order._id.substring(0, 8)}...
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ₹{order.totalPrice?.toFixed(2) || 0}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.derivedStatus || order.orderStatus}
                      color={getStatusColor(order.derivedStatus || order.orderStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.vendors?.length || 0} vendors
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link href={`/orders/${order._id}`} style={{ textDecoration: 'none' }}>
                      <Button size="small" variant="outlined">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </Layout>
  );
};

export default Orders;
