import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Typography, Paper, Avatar, 
  Stack, Divider, Chip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, IconButton,
  CircularProgress, Fade, Tabs, Tab
} from '@mui/material';
import { API } from '../../services/api';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [uRes, oRes, aRes] = await Promise.all([
        API.get('/users/profile'),
        API.get('/orders/myorders'), 
        API.get('/users/addresses')
      ]);
      setUser(uRes.data);
      // Filter orders for current user if not already filtered by backend
      setOrders(oRes.data);
      setAddresses(aRes.data);
    } catch (err) {
      console.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Sidebar Info */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: 6, textAlign: 'center' }}>
              <Avatar 
                src={user?.avatar_url ? `http://localhost:5000${user.avatar_url}` : ''}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: '#6366f1', fontSize: 40 }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="h5" fontWeight="900">{user?.name}</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>{user?.email}</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2} textAlign="left">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ShoppingBagRoundedIcon color="disabled" />
                    <Typography variant="body2" fontWeight="700">{orders.length} Orders Placed</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOnRoundedIcon color="disabled" />
                    <Typography variant="body2" fontWeight="700">{addresses.length} Saved Addresses</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: 6, overflow: 'hidden' }}>
              <Tabs 
                value={tab} 
                onChange={(e, v) => setTab(v)}
                sx={{ px: 3, pt: 2, borderBottom: '1px solid #e2e8f0' }}
              >
                <Tab label="My Orders" sx={{ fontWeight: 800 }} />
                <Tab label="Saved Addresses" sx={{ fontWeight: 800 }} />
                <Tab label="Account Info" sx={{ fontWeight: 800 }} />
              </Tabs>

              <Box sx={{ p: 4 }}>
                {tab === 0 && (
                  <Fade in>
                    <Box>
                        {orders.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <ShoppingBagRoundedIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                                <Typography fontWeight="700">No orders yet</Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 800 }}>Order ID</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Total</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }} align="right">Track</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {orders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell fontWeight="bold">#{order.id}</TableCell>
                                                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell fontWeight="900">${order.total_amount}</TableCell>
                                                <TableCell>
                                                    <Chip label={order.status.toUpperCase()} size="small" color={getStatusColor(order.status)} sx={{ fontWeight: 900, fontSize: 10 }} />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title={order.tracking_number ? `Tracking: ${order.tracking_number}` : "Not yet shipped"}>
                                                        <IconButton color="primary"><LocalShippingRoundedIcon /></IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                  </Fade>
                )}

                {tab === 1 && (
                  <Fade in>
                    <Grid container spacing={2}>
                        {addresses.map(addr => (
                            <Grid item xs={12} sm={6} key={addr.id}>
                                <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                                        <Chip label={addr.label} size="small" sx={{ fontWeight: 800 }} />
                                        {addr.is_default && <Typography variant="caption" color="primary" fontWeight="800">DEFAULT</Typography>}
                                    </Stack>
                                    <Typography fontWeight="800">{addr.full_name}</Typography>
                                    <Typography variant="body2">{addr.address_line1}</Typography>
                                    <Typography variant="body2">{addr.city}, {addr.pincode}</Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>Phone: {addr.phone}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                  </Fade>
                )}

                {tab === 2 && (
                  <Fade in>
                    <Box>
                        <Typography variant="h6" fontWeight="800" sx={{ mb: 3 }}>Personal Details</Typography>
                        <Stack spacing={3}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" fontWeight="900" color="text.secondary">NAME</Typography>
                                    <Typography fontWeight="800">{user?.name}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" fontWeight="900" color="text.secondary">EMAIL</Typography>
                                    <Typography fontWeight="800">{user?.email}</Typography>
                                </Grid>
                            </Grid>
                            <Button variant="outlined" sx={{ borderRadius: 3, fontWeight: 800, alignSelf: 'flex-start' }}>
                                Edit Profile
                            </Button>
                        </Stack>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
