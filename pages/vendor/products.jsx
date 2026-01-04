/**
 * Vendor Products Management Page
 */

import { Box, Container, Typography, Grid, Paper, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { productService } from '@/services/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import { compressImage, buildImageUrl } from '@/utils/imageCompression';

const VendorProducts = () => {
  const router = useRouter();
  const { isAuthenticated, isVendor } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
    image: null,
  });

  useEffect(() => {
    if (!isAuthenticated || !isVendor()) {
      router.push('/auth/login');
      return;
    }
    fetchProducts();
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productService.getMyProducts();
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        quantity: product.quantity,
        image: null,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', quantity: '', image: null });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setCompressing(true);
        try {
          const compressedFile = await compressImage(file, 50); // 50KB max size
          setFormData((prev) => ({ ...prev, [name]: compressedFile }));
          toast.success(`Image compressed successfully (${(compressedFile.size / 1024).toFixed(2)}KB)`);
        } catch (error) {
          toast.error(error.message || 'Failed to compress image');
          setFormData((prev) => ({ ...prev, [name]: null }));
        } finally {
          setCompressing(false);
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProduct = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.quantity) {
        toast.error('Please fill in all fields');
        return;
      }

      // For new products, image is required
      if (!editingProduct && !formData.image) {
        toast.error('Product image is required');
        return;
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(formData);
        toast.success('Product created successfully');
      }
      fetchProducts();
      handleCloseDialog();
    } catch (error) {
      toast.error(error.response?.data?.ackMessage || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        fetchProducts();
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            My Products
          </Typography>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#4CAF50' }}
            onClick={() => handleOpenDialog()}
          >
            + Add New Product
          </Button>
        </Box>

        {products.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '12px' }}>
            <Typography color="textSecondary">
              No products yet. Click "Add New Product" to get started.
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'auto' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f0f7f0' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>
                      <Box
                        component="img"
                        src={buildImageUrl(product.image)}
                        alt={product.name}
                        sx={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect width="50" height="50" fill="%23ccc"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="right">₹{product.price}</TableCell>
                    <TableCell align="right">{product.quantity} units</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenDialog(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* Product Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
            <TextField
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              select
              SelectProps={{ native: true }}
              variant="outlined"
            >
              <option value="">Select Category</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="herbs">Herbs</option>
            </TextField>
            <TextField
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
            {!editingProduct && (
              <Box>
                <TextField
                  label="Product Image"
                  name="image"
                  type="file"
                  inputProps={{ accept: 'image/*', disabled: compressing }}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
                {compressing && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <CircularProgress size={20} sx={{ color: '#4CAF50' }} />
                    <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                      Compressing image...
                    </Typography>
                  </Box>
                )}
                {formData.image && (
                  <Typography variant="body2" sx={{ color: '#4CAF50', mt: 1 }}>
                    ✓ Image selected: {(formData.image.size / 1024).toFixed(2)}KB
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#4CAF50' }}
              onClick={handleSaveProduct}
              disabled={compressing}
            >
              {compressing ? 'Compressing...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default VendorProducts;
