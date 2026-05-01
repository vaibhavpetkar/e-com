import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Typography, Paper, TextField, 
  Button, Stack, Divider, Radio, RadioGroup, FormControlLabel,
  FormControl, FormLabel, Stepper, Step, StepLabel, CircularProgress,
  IconButton, Chip, Alert, Fade, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API } from '../../services/api';
import AddHomeRoundedIcon from '@mui/icons-material/AddHomeRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // T4-1: Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // T4-2: Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showUnverifiedDialog, setShowUnverifiedDialog] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    label: 'Home', full_name: '', phone: '', secondary_phone: '',
    email: '', address_line1: '', address_line2: '',
    city: '', state: '', pincode: ''
  });

  const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

  useEffect(() => {
    if (cart.length === 0) navigate('/');
    
    // T4-1: Check authentication
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      // Not logged in - redirect to login
      navigate('/login');
      return;
    }
    
    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setIsAuthenticated(true);
      
      // T4-2: Check email verification
      if (userData.is_verified === false) {
        setShowUnverifiedDialog(true);
        setIsEmailVerified(false);
      } else {
        setIsEmailVerified(true);
        fetchAddresses();
      }
    } catch (err) {
      console.error('Failed to parse user', err);
      navigate('/login');
    }
  }, [cart, navigate]);

  const fetchAddresses = async () => {
    try {
      const res = await API.get('/users/addresses');
      setAddresses(res.data);
      if (res.data.length > 0) setSelectedAddress(res.data[0]);
    } catch (err) {
      console.error('Failed to fetch addresses');
    }
  };
  
  // T4-3: Resend OTP handler
  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await API.post('/auth/resend-otp', {
        email: user.email
      });
      alert('OTP sent to your email! Please verify and refresh the page.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        customerName: selectedAddress.full_name,
        customerEmail: selectedAddress.email,
        customerPhone: selectedAddress.phone,
        shippingAddress: `${selectedAddress.address_line1}, ${selectedAddress.address_line2}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`,
        totalAmount: cartTotal,
        items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
        }))
      };

      const res = await API.post('/orders', orderData);
      alert('Order placed successfully! Order ID: #' + res.data.id);
      clearCart();
      navigate('/');
    } catch (err) {
      // Handle checkout errors
      if (err.response?.data?.requiresLogin) {
        alert('Please log in to place an order');
        navigate('/login');
      } else if (err.response?.data?.requiresEmailVerification) {
        setShowUnverifiedDialog(true);
      } else {
        alert(err.response?.data?.error || 'Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveNewAddress = async () => {
    try {
        const res = await API.post('/users/addresses', newAddress);
        setAddresses([...addresses, res.data]);
        setSelectedAddress(res.data);
        setActiveStep(1);
    } catch (err) {
        alert('Failed to save address. Make sure you are logged in.');
    }
  };

  // T4-3: Show loading or unverified state
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* T4-3: Unverified Email Dialog */}
        <Dialog
          open={showUnverifiedDialog}
          onClose={() => setShowUnverifiedDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: '700' }}>
            <WarningRoundedIcon sx={{ color: '#f59e0b' }} />
            Email Verification Required
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Your email address needs to be verified before you can place an order. We've sent a verification code to <strong>{user?.email}</strong>.
              </Typography>
            </Alert>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Please check your email for the 6-digit verification code and enter it to continue.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setShowUnverifiedDialog(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={handleResendOtp}
              disabled={resendLoading}
              sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
            >
              {resendLoading ? <CircularProgress size={20} color="inherit" /> : 'Resend Code'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Show checkout only if verified */}
        {!isEmailVerified && (
          <Alert severity="error" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoRoundedIcon />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: '600' }}>Email Verification Required</Typography>
              <Typography variant="caption">Please verify your email address to place your order.</Typography>
            </Box>
          </Alert>
        )}
        <Typography variant="h4" fontWeight="900" sx={{ mb: 4, letterSpacing: -1 }}>Checkout</Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {activeStep === 0 && (
              <Fade in>
                <Box>
                  <Typography variant="h6" fontWeight="800" sx={{ mb: 2 }}>Select Shipping Address</Typography>
                  <Grid container spacing={2}>
                    {addresses.map(addr => (
                      <Grid item xs={12} sm={6} key={addr.id}>
                        <Paper 
                          onClick={() => setSelectedAddress(addr)}
                          sx={{ 
                            p: 3, borderRadius: 4, cursor: 'pointer',
                            border: selectedAddress?.id === addr.id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                            bgcolor: selectedAddress?.id === addr.id ? '#f5f7ff' : '#fff'
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={addr.label} 
                              size="small" 
                              icon={addr.label === 'Home' ? <AddHomeRoundedIcon /> : <BusinessCenterRoundedIcon />}
                              sx={{ fontWeight: 800 }}
                            />
                            {selectedAddress?.id === addr.id && <CheckCircleRoundedIcon color="primary" />}
                          </Stack>
                          <Typography variant="body1" fontWeight="800" sx={{ mt: 2 }}>{addr.full_name}</Typography>
                          <Typography variant="body2" color="text.secondary">{addr.phone}</Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>{addr.address_line1}, {addr.city}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  {selectedAddress && (
                    <Button 
                        variant="contained" 
                        fullWidth 
                        sx={{ mt: 3, py: 1.5, borderRadius: 3, fontWeight: 900, bgcolor: '#febd69', color: '#000', '&:hover': { bgcolor: '#f3a847' } }}
                        onClick={() => setActiveStep(1)}
                    >
                        Deliver to {selectedAddress.full_name}
                    </Button>
                  )}

                  {!localStorage.getItem('token') && (
                    <Alert severity="warning" sx={{ mt: 3, borderRadius: 3 }}>
                        Please <Typography component="span" fontWeight="900" sx={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/admin/login')}>Login</Typography> to save addresses and track your order.
                    </Alert>
                  )}

                  <Typography variant="h6" fontWeight="800" sx={{ mt: 6, mb: 2 }}>Add New Address</Typography>
                  <Paper sx={{ p: 4, borderRadius: 6 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField label="Full Name" fullWidth value={newAddress.full_name} onChange={e => setNewAddress({...newAddress, full_name: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Email" fullWidth value={newAddress.email} onChange={e => setNewAddress({...newAddress, email: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Primary Phone" fullWidth value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Secondary Phone" fullWidth value={newAddress.secondary_phone} onChange={e => setNewAddress({...newAddress, secondary_phone: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField label="Address Line 1" fullWidth value={newAddress.address_line1} onChange={e => setNewAddress({...newAddress, address_line1: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={4}><TextField label="City" fullWidth value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={4}><TextField label="State" fullWidth value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Pincode" fullWidth value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} /></Grid>
                        <Grid item xs={12}>
                            <FormLabel sx={{ fontWeight: 800, mb: 1, display: 'block' }}>Address Type</FormLabel>
                            <RadioGroup row value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})}>
                                <FormControlLabel value="Home" control={<Radio />} label="Home" />
                                <FormControlLabel value="Office" control={<Radio />} label="Office" />
                            </RadioGroup>
                        </Grid>
                    </Grid>
                    <Button 
                        variant="contained" 
                        fullWidth 
                        sx={{ mt: 4, py: 1.5, borderRadius: 3, fontWeight: 900, bgcolor: '#1e293b' }}
                        onClick={saveNewAddress}
                    >
                        Use this address
                    </Button>
                  </Paper>
                </Box>
              </Fade>
            )}

            {activeStep === 1 && (
              <Fade in>
                <Box>
                    <Typography variant="h6" fontWeight="800" sx={{ mb: 2 }}>Payment Method</Typography>
                    <Paper sx={{ p: 4, borderRadius: 6 }}>
                        <RadioGroup defaultValue="razorpay">
                            <Paper sx={{ p: 3, mb: 2, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                                <FormControlLabel value="razorpay" control={<Radio />} label={
                                    <Box>
                                        <Typography fontWeight="800">Razorpay Secure</Typography>
                                        <Typography variant="caption" color="text.secondary">Pay with UPI, Cards, Netbanking</Typography>
                                    </Box>
                                } />
                            </Paper>
                            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                                <FormControlLabel value="cod" control={<Radio />} label={
                                    <Box>
                                        <Typography fontWeight="800">Cash on Delivery</Typography>
                                        <Typography variant="caption" color="text.secondary">Pay when you receive the items</Typography>
                                    </Box>
                                } />
                            </Paper>
                        </RadioGroup>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            sx={{ mt: 4, py: 1.5, borderRadius: 3, fontWeight: 900, bgcolor: '#1e293b' }}
                            onClick={() => setActiveStep(2)}
                        >
                            Review Order
                        </Button>
                    </Paper>
                </Box>
              </Fade>
            )}

            {activeStep === 2 && (
              <Fade in>
                <Box>
                    <Typography variant="h6" fontWeight="800" sx={{ mb: 2 }}>Review Order</Typography>
                    <Paper sx={{ p: 4, borderRadius: 6 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="caption" fontWeight="900" color="text.secondary">DELIVERING TO</Typography>
                                <Typography fontWeight="800">{selectedAddress?.full_name}</Typography>
                                <Typography variant="body2">{selectedAddress?.address_line1}, {selectedAddress?.city}</Typography>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography variant="caption" fontWeight="900" color="text.secondary">ITEMS</Typography>
                                {cart.map(item => (
                                    <Stack key={item.id} direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                        <Typography variant="body2">{item.title} x {item.quantity}</Typography>
                                        <Typography variant="body2" fontWeight="800">${(item.price * item.quantity).toFixed(2)}</Typography>
                                    </Stack>
                                ))}
                            </Box>
                        </Stack>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            disabled={loading}
                            sx={{ mt: 4, py: 2, borderRadius: 4, fontWeight: 900, bgcolor: '#febd69', color: '#000', '&:hover': { bgcolor: '#f3a847' } }}
                            onClick={handlePlaceOrder}
                        >
                            {loading ? <CircularProgress size={24} /> : `Confirm & Pay $${cartTotal.toFixed(2)}`}
                        </Button>
                    </Paper>
                </Box>
            </Fade>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: 6, position: 'sticky', top: 100 }}>
              <Typography variant="h6" fontWeight="900" sx={{ mb: 3 }}>Order Summary</Typography>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Items Subtotal</Typography>
                  <Typography fontWeight="800">${cartTotal.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Shipping Fee</Typography>
                  <Typography fontWeight="800" sx={{ color: '#007600' }}>FREE</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" fontWeight="900">Total</Typography>
                  <Typography variant="h6" fontWeight="900" sx={{ color: '#cc0c39' }}>${cartTotal.toFixed(2)}</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
