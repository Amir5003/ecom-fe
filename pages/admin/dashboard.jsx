/**
 * Admin Dashboard
 * Main admin control panel for managing vendors, payouts, and platform stats
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import useAuthStore from '@/store/authStore';
import { adminService } from '@/services/api';
import toast from 'react-hot-toast';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';

const AdminDashboard = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorStatus, setVendorStatus] = useState('all');
  const [payoutStatus, setPayoutStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedVendorDetails, setSelectedVendorDetails] = useState(null);
  const [detailsRejectionReason, setDetailsRejectionReason] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, vendorsRes, payoutsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAllVendors({ status: 'all' }),
        adminService.getAllPayouts({ status: 'all' }),
      ]);

      setDashboardData(dashboardRes.data?.data);
      setVendors(vendorsRes.data?.vendors || vendorsRes.data?.data?.vendors || []);
      setPayouts(payoutsRes.data?.payouts || payoutsRes.data?.data?.payouts || []);
    } catch (err) {
      const errorMessage = err.response?.data?.ackMessage || 'Failed to fetch dashboard data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId) => {
    setActionLoading(true);
    try {
      await adminService.approveVendor(vendorId);
      toast.success('Vendor approved successfully');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.ackMessage || 'Failed to approve vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVendor = async (vendorId) => {
    setActionLoading(true);
    try {
      await adminService.rejectVendor(vendorId, { reason: rejectionReason });
      toast.success('Vendor rejected successfully');
      setRejectDialogOpen(false);
      setRejectionReason('');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.ackMessage || 'Failed to reject vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenVendorDetails = (vendor) => {
    setSelectedVendorDetails(vendor);
    setDetailsDialogOpen(true);
    setDetailsRejectionReason('');
  };

  const handleApprovePayout = async (payoutId) => {
    setActionLoading(true);
    try {
      await adminService.approvePayout(payoutId);
      toast.success('Payout approved successfully');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.ackMessage || 'Failed to approve payout');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveVendorFromModal = async () => {
    setActionLoading(true);
    try {
      await adminService.approveVendor(selectedVendorDetails._id);
      toast.success('Vendor approved successfully');
      setDetailsDialogOpen(false);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.ackMessage || 'Failed to approve vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVendorFromModal = async () => {
    setActionLoading(true);
    try {
      await adminService.rejectVendor(selectedVendorDetails._id, { reason: detailsRejectionReason });
      toast.success('Vendor rejected successfully');
      setDetailsDialogOpen(false);
      setDetailsRejectionReason('');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.ackMessage || 'Failed to reject vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendVendorFromModal = async () => {
    setActionLoading(true);
    try {
      await adminService.suspendVendor(selectedVendorDetails._id, { reason: 'Suspended by admin' });
      toast.success('Vendor suspended successfully');
      setDetailsDialogOpen(false);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.ackMessage || 'Failed to suspend vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateVendorFromModal = async () => {
    setActionLoading(true);
    try {
      await adminService.activateVendor(selectedVendorDetails._id);
      toast.success('Vendor activated successfully');
      setDetailsDialogOpen(false);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.ackMessage || 'Failed to activate vendor');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <CircularProgress size={80} sx={{ color: '#4CAF50' }} />
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <DashboardIcon sx={{ fontSize: 40, color: '#4CAF50' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Admin Dashboard
            </Typography>
          </Box>

          {/* Stats Cards */}
          {dashboardData && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {/* Total Vendors */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Total Vendors
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                          {dashboardData.vendors?.total || 0}
                        </Typography>
                      </Box>
                      <StoreIcon sx={{ fontSize: 40, color: '#4CAF50', opacity: 0.5 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Approved Vendors */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Approved Vendors
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                          {dashboardData.vendors?.approved || 0}
                        </Typography>
                      </Box>
                      <CheckCircleIcon sx={{ fontSize: 40, color: '#4CAF50', opacity: 0.5 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Pending Vendors */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Pending Approval
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9800' }}>
                          {dashboardData.vendors?.pending || 0}
                        </Typography>
                      </Box>
                      <PendingIcon sx={{ fontSize: 40, color: '#FF9800', opacity: 0.5 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Suspended Vendors */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Suspended
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#f44336' }}>
                          {dashboardData.vendors?.suspended || 0}
                        </Typography>
                      </Box>
                      <BlockIcon sx={{ fontSize: 40, color: '#f44336', opacity: 0.5 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Total Orders */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Total Orders
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196f3' }}>
                          {dashboardData.orders?.total || 0}
                        </Typography>
                      </Box>
                      <ShoppingCartIcon sx={{ fontSize: 40, color: '#2196f3', opacity: 0.5 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Total Products */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Total Products
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                          {dashboardData.products?.total || 0}
                        </Typography>
                      </Box>
                      <ShoppingCartIcon sx={{ fontSize: 40, color: '#9c27b0', opacity: 0.5 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Pending Payouts */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Pending Payouts
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF5722' }}>
                          {dashboardData.payouts?.pending || 0}
                        </Typography>
                      </Box>
                      <MonetizationOnIcon sx={{ fontSize: 40, color: '#FF5722', opacity: 0.5 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Platform Revenue */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          Platform Revenue
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                          ₹{dashboardData.revenue?.platformRevenue || 0}
                        </Typography>
                      </Box>
                      <MonetizationOnIcon sx={{ fontSize: 40, color: '#4CAF50', opacity: 0.5 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tabs for Vendors and Payouts */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, value) => setTabValue(value)}
              sx={{ borderBottom: '1px solid #e0e0e0' }}
            >
              <Tab label={`Vendors (${vendors.length})`} />
              <Tab label={`Payouts (${payouts.length})`} />
            </Tabs>

            {/* Vendors Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 2 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Business Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Products</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vendors.map((vendor) => (
                        <TableRow key={vendor._id} hover>
                          <TableCell>{vendor.businessName}</TableCell>
                          <TableCell>{vendor.user?.email}</TableCell>
                          <TableCell>
                            {vendor.isApproved ? (
                              <Chip label="Approved" color="success" size="small" />
                            ) : vendor.isActive === false ? (
                              <Chip label="Suspended" color="error" size="small" />
                            ) : (
                              <Chip label="Pending" color="warning" size="small" />
                            )}
                          </TableCell>
                          <TableCell>{vendor.totalProducts || 0}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleOpenVendorDetails(vendor)}
                              disabled={actionLoading}
                              sx={{ backgroundColor: '#2196f3' }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {vendors.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No vendors found
                  </Alert>
                )}
              </Box>
            )}

            {/* Payouts Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 2 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payouts.map((payout) => (
                        <TableRow key={payout._id} hover>
                          <TableCell>{payout.vendor?.businessName}</TableCell>
                          <TableCell>₹{payout.amount}</TableCell>
                          <TableCell>
                            <Chip
                              label={payout.status?.charAt(0).toUpperCase() + payout.status?.slice(1)}
                              color={payout.status === 'pending' ? 'warning' : 'success'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {payout.status === 'pending' && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleApprovePayout(payout._id)}
                                disabled={actionLoading}
                                sx={{ backgroundColor: '#4CAF50' }}
                              >
                                Approve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {payouts.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No payouts found
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      </Container>

      {/* Vendor Details Modal */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>Vendor Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedVendorDetails && (
            <Box>
              {/* Vendor Basic Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Basic Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Business Name
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.businessName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Owner Name
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.user?.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.user?.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Phone Number
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.phoneNumber}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Business Description
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.businessDescription}</Typography>
                </Box>
              </Box>

              {/* Store Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Store Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Store Slug
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.storeSlug}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Commission Percentage
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.commissionPercentage}%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total Products
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.totalProducts}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total Orders
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.totalOrders}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total Sales
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹{selectedVendorDetails.totalSales}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Rating
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedVendorDetails.rating} ({selectedVendorDetails.totalReviews} reviews)
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Address Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Address Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Street
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.address?.street}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      City
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.address?.city}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      State
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.address?.state}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Country
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.address?.country}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Postal Code
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.address?.postalCode}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Compliance Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Compliance Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Business License
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>{selectedVendorDetails.businessLicense}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                    {selectedVendorDetails.isApproved ? (
                      <Chip label="Approved" color="success" size="small" />
                    ) : selectedVendorDetails.isActive === false ? (
                      <Chip label="Suspended" color="error" size="small" />
                    ) : (
                      <Chip label="Pending" color="warning" size="small" />
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Approval History */}
              {selectedVendorDetails.isApproved && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Approval History
                  </Typography>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Approved On
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {new Date(selectedVendorDetails.approvedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Rejection History */}
              {selectedVendorDetails.rejectionReason && (
                <Box sx={{ mb: 3, p: 2, backgroundColor: '#fff3cd', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#856404' }}>
                    Rejection Reason
                  </Typography>
                  <Typography sx={{ color: '#856404' }}>{selectedVendorDetails.rejectionReason}</Typography>
                </Box>
              )}

              {/* Suspension History */}
              {selectedVendorDetails.isSuspended && (
                <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8d7da', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#721c24' }}>
                    Suspension Reason
                  </Typography>
                  <Typography sx={{ color: '#721c24' }}>{selectedVendorDetails.suspensionReason}</Typography>
                </Box>
              )}

              {/* Rejection Form for Pending Vendors */}
              {!selectedVendorDetails.isApproved && selectedVendorDetails.isActive !== false && !selectedVendorDetails.rejectionReason && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Rejection Reason (if rejecting)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter rejection reason"
                    value={detailsRejectionReason}
                    onChange={(e) => setDetailsRejectionReason(e.target.value)}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>

          {selectedVendorDetails && !selectedVendorDetails.isApproved && selectedVendorDetails.isActive !== false && (
            <>
              <Button
                onClick={handleApproveVendorFromModal}
                disabled={actionLoading}
                variant="contained"
                sx={{ backgroundColor: '#4CAF50' }}
              >
                Approve
              </Button>
              <Button
                onClick={handleRejectVendorFromModal}
                disabled={actionLoading || !detailsRejectionReason}
                variant="contained"
                color="error"
              >
                Reject
              </Button>
            </>
          )}

          {selectedVendorDetails && selectedVendorDetails.isApproved && selectedVendorDetails.isActive !== false && (
            <Button
              onClick={handleSuspendVendorFromModal}
              disabled={actionLoading}
              variant="outlined"
              color="error"
            >
              Suspend
            </Button>
          )}

          {selectedVendorDetails && selectedVendorDetails.isActive === false && (
            <Button
              onClick={handleActivateVendorFromModal}
              disabled={actionLoading}
              variant="outlined"
              sx={{ color: '#4CAF50', borderColor: '#4CAF50' }}
            >
              Activate
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;
