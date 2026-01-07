/**
 * Vendor Orders Page
 */

import { Box, Container, Typography, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { orderService } from '@/services/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const VendorOrders = () => {
  const router = useRouter();
  const { isAuthenticated, isVendor, user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isVendor()) {
      router.push('/auth/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await orderService.getVendorOrders({ page: 1, limit: 50 });
      const vendorId = user?.vendorProfile || user?.vendor?._id || user?.vendorId;

      const flattened = (data.orders || []).map((order) => {
        const vendorOrder = order.vendors?.find((v) => {
          const vId = v.vendor?._id || v.vendor;
          return vId && vendorId && vId.toString() === vendorId.toString();
        }) || order.vendors?.[0];

        if (!vendorOrder) return null;

        return {
          orderId: order._id,
          customerName: order.customer?.name,
          vendorStatus: vendorOrder.vendorStatus || 'pending',
          vendorSubtotal: vendorOrder.vendorSubtotal || 0,
          itemsCount: vendorOrder.items?.length || 0,
          createdAt: order.createdAt,
        };
      }).filter(Boolean);

      setOrders(flattened);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus((order.vendorStatus || 'pending').toLowerCase());
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async () => {
    try {
      await orderService.updateVendorOrderStatus(selectedOrder.orderId, { vendorStatus: newStatus });
      toast.success('Order status updated');
      fetchOrders();
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to update status');
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

  return (
    <Layout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          My Orders
        </Typography>

        {orders.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '12px' }}>
            <Typography color="textSecondary">
              No orders yet.
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'auto' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f0f7f0' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {order.orderId.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{order.customerName || '—'}</TableCell>
                    <TableCell align="right">
                      ₹{order.vendorSubtotal?.toFixed(2) || 0}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.vendorStatus}
                        color={getStatusColor(order.vendorStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {order.itemsCount || 0} items
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenDialog(order)}
                      >
                        Update Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* Status Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Update Order Status
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              select
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              fullWidth
              variant="outlined"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="in_transit">In Transit</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </DialogContent>
          <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#4CAF50' }}
              onClick={handleUpdateStatus}
            >
              Update
            </Button>
          </Box>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default VendorOrders;
