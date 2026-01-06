/**
 * Vendor Setup Page
 * Vendors complete their business profile information here before they can access the dashboard
 */

import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { authService, storeService } from '@/services/api';
import toast from 'react-hot-toast';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InfoIcon from '@mui/icons-material/Info';

const VendorSetup = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameCheck, setNameCheck] = useState({ status: 'idle', message: '', slug: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const logoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    businessLicense: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
  });

  const steps = ['Business Information', 'Address Details', 'Review & Submit'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
    setError('');
  };

  const validateStep = (step) => {
    if (step === 0) {
      if (!formData.businessName.trim()) {
        setError('Business name is required');
        return false;
      }
      if (!formData.businessLicense.trim()) {
        setError('Business license is required');
        return false;
      }
      if (!formData.phoneNumber.trim()) {
        setError('Phone number is required');
        return false;
      }
    } else if (step === 1) {
      if (!formData.address.street.trim()) {
        setError('Street address is required');
        return false;
      }
      if (!formData.address.city.trim()) {
        setError('City is required');
        return false;
      }
      if (!formData.address.state.trim()) {
        setError('State is required');
        return false;
      }
      if (!formData.address.country.trim()) {
        setError('Country is required');
        return false;
      }
      if (!formData.address.postalCode.trim()) {
        setError('Postal code is required');
        return false;
      }
    }
    return true;
  };

  const handleLogoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be smaller than 2MB');
      return;
    }

    setError('');
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // Debounced store name availability check
  useEffect(() => {
    const trimmedName = formData.businessName.trim();
    if (!trimmedName) {
      setNameCheck({ status: 'idle', message: '', slug: '' });
      return undefined;
    }

    const timer = setTimeout(async () => {
      setNameCheck({ status: 'checking', message: '', slug: '' });
      try {
        const { data } = await storeService.validateName(trimmedName);
        if (data.available) {
          setNameCheck({ status: 'available', message: data.message || 'Store name is available', slug: data.storeSlug });
        } else {
          setNameCheck({ status: 'taken', message: data.message || 'Store name is already taken', slug: data.storeSlug });
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Could not validate store name';
        setNameCheck({ status: 'error', message: msg, slug: '' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.businessName]);

  // Cleanup object URL when logo changes
  useEffect(() => () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
  }, [logoPreview]);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    if (nameCheck.status === 'taken') {
      setError('Store name is already taken. Please choose another name.');
      return;
    }

    if (nameCheck.status === 'checking') {
      setError('Please wait while we check store name availability.');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('businessName', formData.businessName.trim());
      payload.append('businessDescription', formData.businessDescription);
      payload.append('businessLicense', formData.businessLicense.trim());
      payload.append('phoneNumber', formData.phoneNumber.trim());
      payload.append('address', JSON.stringify(formData.address));
      if (logoFile) {
        payload.append('logo', logoFile);
      }

      const { data } = await authService.vendorSetup(payload);
      toast.success(data.ackMessage || 'Vendor setup completed! Waiting for admin approval...');
      
      // Redirect to pending approval page
      router.push('/vendor/pending-approval');
    } catch (err) {
      const errorMessage = err.response?.data?.ackMessage || err.response?.data?.message || 'Failed to setup vendor profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ py: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <StorefrontIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Complete Your Vendor Profile
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Set up your business information to get started selling
              </Typography>
            </Box>

            {/* Alert */}
            <Alert
              severity="info"
              sx={{
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                mb: 3,
                '& .MuiAlert-icon': {
                  color: '#2196f3',
                },
              }}
              icon={<InfoIcon />}
            >
              After you submit your information, our admin team will review and approve your vendor account within 24-48 hours.
            </Alert>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 0: Business Information */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Business Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Store Logo
                    </Typography>
                    <Box
                      onClick={() => logoInputRef.current?.click()}
                      sx={{
                        border: '1px dashed #bdbdbd',
                        borderRadius: '10px',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#fff',
                          border: '1px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {logoPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Typography variant="caption" color="textSecondary" align="center">
                            Click to upload
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Upload store logo
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Recommended: square image, under 2MB. PNG/JPG.
                        </Typography>
                        {logoFile && (
                          <Typography variant="caption" color="textSecondary">
                            Selected: {logoFile.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <input
                      type="file"
                      accept="image/*"
                      ref={logoInputRef}
                      style={{ display: 'none' }}
                      onChange={handleLogoSelect}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Business Name"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="Enter your business name"
                      variant="outlined"
                      required
                      error={nameCheck.status === 'taken' || nameCheck.status === 'error'}
                      helperText={
                        nameCheck.status === 'checking'
                          ? 'Checking availability...'
                          : nameCheck.message
                      }
                    />
                    {nameCheck.status === 'available' && nameCheck.slug && (
                      <Typography variant="caption" color="success.main">
                        Your store URL will be /store/{nameCheck.slug}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Business Description"
                      name="businessDescription"
                      value={formData.businessDescription}
                      onChange={handleInputChange}
                      placeholder="Describe your business (optional)"
                      variant="outlined"
                      multiline
                      rows={4}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Business License Number"
                      name="businessLicense"
                      value={formData.businessLicense}
                      onChange={handleInputChange}
                      placeholder="Enter your business license number"
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your business phone number"
                      variant="outlined"
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 1: Address Details */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Business Address
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      name="street"
                      value={formData.address.street}
                      onChange={handleAddressChange}
                      placeholder="Enter street address"
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.address.city}
                      onChange={handleAddressChange}
                      placeholder="Enter city"
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={formData.address.state}
                      onChange={handleAddressChange}
                      placeholder="Enter state"
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={formData.address.country}
                      onChange={handleAddressChange}
                      placeholder="Enter country"
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      name="postalCode"
                      value={formData.address.postalCode}
                      onChange={handleAddressChange}
                      placeholder="Enter postal code"
                      variant="outlined"
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Step 2: Review & Submit */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Review Your Information
                </Typography>
                <Box sx={{ backgroundColor: '#f5f5f5', p: 3, borderRadius: '8px', mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Business Name
                      </Typography>
                      <Typography variant="body1">{formData.businessName}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Business Description
                      </Typography>
                      <Typography variant="body1">
                        {formData.businessDescription || '(Not provided)'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Business License
                      </Typography>
                      <Typography variant="body1">{formData.businessLicense}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Phone Number
                      </Typography>
                      <Typography variant="body1">{formData.phoneNumber}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {formData.address.street}, {formData.address.city}, {formData.address.state}{' '}
                        {formData.address.postalCode}, {formData.address.country}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Alert severity="warning" sx={{ mb: 3 }}>
                  Please review your information carefully. Our admin team will verify these details before approving your vendor account.
                </Alert>
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    flex: 1,
                    '&:hover': {
                      backgroundColor: '#45a049',
                    },
                    '&:disabled': {
                      backgroundColor: '#cccccc',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Submit & Complete Setup'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    flex: 1,
                    '&:hover': {
                      backgroundColor: '#45a049',
                    },
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};

export default VendorSetup;
