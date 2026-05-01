import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, MenuItem, Select, FormControl,
  InputLabel, Alert, CircularProgress, Fade, Grid, Divider
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import { API } from '../../services/api';

export default function OrderMaster() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(true);
    try {
      await API.put(`/orders/${id}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'processing': return 'info';
      case 'shipped': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b', letterSpacing: '-0.02em' }}>
          Order Management
        </Typography>
        <Chip 
          label={`${orders.length} Total Orders`} 
          sx={{ bgcolor: '#1e293b', color: '#fff', fontWeight: 800 }} 
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell fontWeight="bold">#{order.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="700">{order.customer_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{order.customer_email}</Typography>
                </TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>${order.total_amount}</TableCell>
                <TableCell>
                  <Chip 
                    label={order.status.toUpperCase()} 
                    size="small" 
                    color={getStatusColor(order.status)}
                    sx={{ fontWeight: 900, fontSize: 10 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    onClick={() => { setSelectedOrder(order); setOpenDetail(true); }}
                    sx={{ color: '#6366f1' }}
                  >
                    <VisibilityRoundedIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Detail Dialog */}
      <Dialog 
        open={openDetail} 
        onClose={() => setOpenDetail(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 6, p: 2 } }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight="900">Order Details #{selectedOrder.id}</Typography>
              <Chip label={selectedOrder.status.toUpperCase()} color={getStatusColor(selectedOrder.status)} sx={{ fontWeight: 900 }} />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={4} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="overline" fontWeight="900" color="text.secondary">Customer Info</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 4, mt: 1 }}>
                    <Typography variant="body1" fontWeight="800">{selectedOrder.customer_name}</Typography>
                    <Typography variant="body2">{selectedOrder.customer_email}</Typography>
                    <Typography variant="body2">{selectedOrder.customer_phone}</Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="caption" fontWeight="900" color="text.secondary">SHIPPING ADDRESS</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedOrder.shipping_address}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="overline" fontWeight="900" color="text.secondary">Order Status</Typography>
                  <FormControl fullWidth sx={{ mt: 1 }}>
                    <InputLabel>Update Status</InputLabel>
                    <Select
                      value={selectedOrder.status}
                      label="Update Status"
                      onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                      disabled={updating}
                      sx={{ borderRadius: 3 }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="overline" fontWeight="900" color="text.secondary">Items Ordered</Typography>
                  <TableContainer sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Product</TableCell>
                          <TableCell sx={{ fontWeight: 800 }} align="center">Qty</TableCell>
                          <TableCell sx={{ fontWeight: 800 }} align="right">Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell fontWeight="700">{item.title || `Product #${item.product_id}`}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">${item.price}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2} align="right"><Typography fontWeight="900">Total</Typography></TableCell>
                          <TableCell align="right"><Typography fontWeight="900" color="primary.main">${selectedOrder.total_amount}</Typography></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setOpenDetail(false)} variant="contained" sx={{ borderRadius: 3, px: 4, bgcolor: '#1e293b' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
