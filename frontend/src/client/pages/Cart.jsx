import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Paper, Stack,
  Button, Divider, Fade, Checkbox, FormControlLabel, Link, Select, MenuItem
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import { useCart } from '../context/CartContext';
import CustomerNavbar from '../components/CustomerNavbar';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  const getImageUrl = (url) => {
      if (!url) return 'https://via.placeholder.com/150';
      if (url.startsWith('http')) return url;
      return `http://localhost:5000${url}`;
  };

  const linkStyle = { 
      color: '#4f46e5', 
      fontWeight: 600, 
      cursor: 'pointer', 
      transition: 'all 0.2s',
      '&:hover': { color: '#4338ca', textDecoration: 'underline' } 
  };

  const currencySymbol = cart[0]?.currency_symbol || '$';

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh', pb: 8 }}>
      <CustomerNavbar />

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Fade in timeout={800}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>
            
            {/* LEFT COLUMN: Items */}
            <Box sx={{ flex: '1 1 auto', width: { xs: '100%', md: '70%' }, minWidth: 0 }}>
              <Paper sx={{ p: 4, borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid rgba(255,255,255,0.8)', bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a' }}>
                        Shopping Cart
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Price
                    </Typography>
                </Box>
                
                <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                {cart.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#475569', mb: 2 }}>Your Cart is empty.</Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/')}
                        sx={{ bgcolor: '#4f46e5', borderRadius: '12px', fontWeight: 800, px: 4, py: 1.5, '&:hover': { bgcolor: '#4338ca' } }}
                    >
                      Continue Shopping
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={4}>
                    {cart.map((item, index) => (
                      <Box key={item.id}>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                          
                          {/* Image */}
                          <Box 
                              onClick={() => navigate(`/product/${item.id}`)}
                              sx={{ 
                                  cursor: 'pointer', width: 180, height: 180, flexShrink: 0,
                                  bgcolor: '#fff', borderRadius: '16px', p: 2, border: '1px solid #f1f5f9',
                                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                                  transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.02)' }
                              }}
                          >
                              <img 
                                src={getImageUrl(item.images?.[0])} 
                                alt={item.title} 
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              />
                          </Box>

                          {/* Details */}
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontWeight: 800, color: '#1e293b', mb: 1,
                                        cursor: 'pointer', '&:hover': { color: '#4f46e5' }
                                    }}
                                    onClick={() => navigate(`/product/${item.id}`)}
                                >
                                  {item.title}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap' }}>
                                    {item.currency_symbol || currencySymbol}{item.price}
                                </Typography>
                            </Box>
                            
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)' }} />
                                <Typography sx={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 800 }}>
                                    In Stock
                                </Typography>
                            </Stack>
                            
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 2 }}>
                              <strong style={{ color: '#4f46e5' }}>Eligible for FREE Premium Delivery</strong>
                            </Typography>

                            <Stack direction="row" alignItems="center" spacing={3} sx={{ mt: 2, flexWrap: 'wrap', gap: 2 }}>
                                {/* Quantity Dropdown */}
                                <Select 
                                    value={item.quantity} 
                                    onChange={(e) => updateQuantity(item.id, e.target.value)}
                                    size="small"
                                    sx={{ 
                                        borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, bgcolor: '#f8fafc', height: 36, width: 100,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5', borderWidth: 2 }
                                    }}
                                >
                                    {[1,2,3,4,5,6,7,8,9,10].map(n => <MenuItem key={n} value={n} sx={{ fontWeight: 600 }}>Qty: {n}</MenuItem>)}
                                </Select>

                                <Divider orientation="vertical" flexItem sx={{ borderColor: '#e2e8f0' }} />
                                
                                <Typography 
                                    variant="body2" 
                                    onClick={() => removeFromCart(item.id)}
                                    sx={{ color: '#ef4444', fontWeight: 700, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: '#dc2626', textDecoration: 'underline' } }}
                                >
                                    Remove
                                </Typography>
                                
                                <Divider orientation="vertical" flexItem sx={{ borderColor: '#e2e8f0' }} />
                                
                                <Typography variant="body2" sx={{ ...linkStyle }}>
                                    Save for later
                                </Typography>
                            </Stack>
                          </Box>

                        </Box>
                        
                        {index !== cart.length - 1 && <Divider sx={{ mt: 4, borderStyle: 'dashed', borderColor: '#cbd5e1' }} />}
                      </Box>
                    ))}
                  </Stack>
                )}
                
                {cart.length > 0 && (
                  <Typography variant="h5" sx={{ textAlign: 'right', mt: 4, color: '#334155' }}>
                    Subtotal ({cartCount} items): <span style={{ fontWeight: 900, color: '#0f172a' }}>{currencySymbol}{cartTotal.toFixed(2)}</span>
                  </Typography>
                )}
              </Paper>
            </Box>

            {/* RIGHT COLUMN: Order Summary */}
            <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '30%' } }}>
              {cart.length > 0 && (
                <Box sx={{ 
                    p: 3, 
                    borderRadius: '24px', 
                    position: 'sticky', 
                    top: 32, 
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                }}>
                  <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: '12px', mb: 3, border: '1px dashed #86efac' }}>
                      <Typography variant="body2" sx={{ color: '#166534', fontWeight: 700, mb: 0.5, fontSize: '0.9rem' }}>
                          ✓ Eligible for Free Delivery
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#15803d', fontSize: '0.75rem', lineHeight: 1.2 }}>
                          Select FREE Delivery option at checkout.
                      </Typography>
                  </Box>
                  
                  <Typography sx={{ color: '#475569', fontSize: '1.2rem', mb: 2 }}>
                    Subtotal ({cartCount} items): <br/>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{currencySymbol}{cartTotal.toFixed(2)}</span>
                  </Typography>

                  <FormControlLabel
                    control={<Checkbox size="small" sx={{ color: '#4f46e5', '&.Mui-checked': { color: '#4f46e5' } }} />}
                    label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>This order contains a gift</Typography>}
                    sx={{ mb: 3 }}
                  />

                  <Button
                    fullWidth
                    onClick={handleCheckout}
                    sx={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', 
                        color: '#ffffff', fontWeight: 800, fontSize: '1rem',
                        borderRadius: '12px', py: 1.5, mb: 2,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 20px rgba(79, 70, 229, 0.4)' },
                    }}
                  >
                    Proceed to checkout
                  </Button>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      <SecurityRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Secure Checkout Powered by ProfitPulse</Typography>
                  </Box>
                </Box>
              )}

            </Box>
            
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
