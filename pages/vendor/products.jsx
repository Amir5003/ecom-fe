/**
 * Vendor Products Management Page
 */

import { Box, Container, Typography, Grid, Paper, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { productService } from '@/services/api';
import { UPLOAD_BASE_URL } from '@/config/endpoints';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

const VendorProducts = () => {
  const router = useRouter();
  const { isAuthenticated, isVendor } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
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
        stock: product.stock,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', stock: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = async () => {
    try {
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
      toast.error(error.response?.data?.message || 'Failed to save product');
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
                        src={`${UPLOAD_BASE_URL}/${product.image}`}
                        sx={{ width: 50, height: 50, borderRadius: '8px' }}
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="right">₹{product.price}</TableCell>
                    <TableCell align="right">{product.stock} units</TableCell>
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
              label="Stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#4CAF50' }}
              onClick={handleSaveProduct}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default VendorProducts;
