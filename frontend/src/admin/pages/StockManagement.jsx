import React, { useState, useEffect } from 'react';
import { API } from '../../services/api';
import { 
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
  Select, MenuItem, InputLabel, FormControl, IconButton, Tooltip,
  Snackbar, Alert, CircularProgress, Chip, Box, Typography,
  Stack, Paper, Avatar, Grid
} from '@mui/material';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';

export default function StockManagement() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  // Form State
  const [productId, setProductId] = useState('');
  const [type, setType] = useState('addition');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, prodRes] = await Promise.all([
        API.get('/stock'),
        API.get('/products')
      ]);
      setTransactions(transRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      showSnack('Failed to fetch inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async () => {
    if (!productId || !quantity || !type) return showSnack('Missing required fields', 'warning');
    setSaving(true);
    try {
      await API.post('/stock', {
        productId,
        type,
        quantity: parseInt(quantity),
        reason
      });
      setOpen(false);
      resetForm();
      showSnack('Stock updated successfully');
      fetchData();
    } catch (err) {
      showSnack('Transaction failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setProductId('');
    setType('addition');
    setQuantity('');
    setReason('');
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  const getTypeColor = (type) => {
    switch(type) {
      case 'opening': return { bg: '#f0f9ff', text: '#0369a1', icon: <TrendingUpRoundedIcon sx={{ fontSize: 16 }} /> };
      case 'addition': return { bg: '#f0fdf4', text: '#15803d', icon: <TrendingUpRoundedIcon sx={{ fontSize: 16 }} /> };
      case 'sellout': return { bg: '#fff7ed', text: '#c2410c', icon: <TrendingDownRoundedIcon sx={{ fontSize: 16 }} /> };
      case 'scrap': return { bg: '#fef2f2', text: '#b91c1c', icon: <RemoveCircleOutlineRoundedIcon sx={{ fontSize: 16 }} /> };
      case 'wastage': return { bg: '#fef2f2', text: '#b91c1c', icon: <RemoveCircleOutlineRoundedIcon sx={{ fontSize: 16 }} /> };
      default: return { bg: '#f1f5f9', text: '#475569', icon: null };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b', letterSpacing: '-0.02em' }}>Inventory Console</Typography>
          <Typography variant="body2" color="slate.400" fontWeight="600">Track and manage stock movements</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddRoundedIcon />}
          onClick={() => { resetForm(); setOpen(true); }}
          sx={{ 
            bgcolor: '#1e293b', borderRadius: '12px', px: 3, py: 1.2, fontWeight: 800, textTransform: 'none',
            '&:hover': { bgcolor: '#334155' }
          }}
        >
          Post Transaction
        </Button>
      </Box>

      {/* Stats Quick View */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
         <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
               <Box sx={{ p: 2, borderRadius: 4, bgcolor: '#f0fdf4', color: '#16a34a' }}><TrendingUpRoundedIcon /></Box>
               <Box>
                  <Typography variant="caption" fontWeight="800" color="slate.400">TOTAL STOCK VALUE</Typography>
                  <Typography variant="h6" fontWeight="900">
                    {products[0]?.currency_symbol || '$'}
                    {products.reduce((acc, p) => acc + (parseFloat(p.price) * p.stock), 0).toLocaleString()}
                  </Typography>
               </Box>
            </Paper>
         </Grid>
         {/* Add more stats if needed */}
      </Grid>

      {/* Transaction List */}
      <Paper sx={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
           <Typography variant="subtitle1" fontWeight="1000">Recent Transactions</Typography>
        </Box>
        <Box sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f8fafc] border-b border-[#f1f5f9]">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((tr) => {
                    const style = getTypeColor(tr.type);
                    return (
                      <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <Typography variant="caption" fontWeight="700" color="slate.500">
                            {new Date(tr.created_at).toLocaleDateString()}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="body2" fontWeight="800" color="#1e293b">{tr.product_title}</Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Box sx={{ 
                            display: 'inline-flex', alignItems: 'center', gap: 1, 
                            px: 1.5, py: 0.5, borderRadius: '20px',
                            bgcolor: style.bg, color: style.text
                          }}>
                            {style.icon}
                            <Typography sx={{ fontSize: 10, fontWeight: 1000, textTransform: 'uppercase' }}>{tr.type}</Typography>
                          </Box>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="body2" fontWeight="900" color={tr.quantity < 0 ? '#ef4444' : '#10b981'}>
                            {tr.type === 'addition' || tr.type === 'opening' ? '+' : '-'}{Math.abs(tr.quantity)}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Typography variant="caption" fontWeight="600" color="slate.400">{tr.reason || '-'}</Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Chip label={tr.user_name} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: 10 }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <Box sx={{ py: 10, textAlign: 'center', color: 'slate.400', fontWeight: 600 }}>No transactions recorded yet.</Box>
              )}
            </div>
          )}
        </Box>
      </Paper>

      {/* Post Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 6, p: 2, width: '100%', maxWidth: 450 } }}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem' }}>Post Transaction</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <FormControl fullWidth sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
            <InputLabel>Target Product</InputLabel>
            <Select value={productId} label="Target Product" onChange={e => setProductId(e.target.value)}>
              {products.map(p => <MenuItem key={p.id} value={p.id}>{p.title} (Stock: {p.stock})</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
            <InputLabel>Transaction Type</InputLabel>
            <Select value={type} label="Transaction Type" onChange={e => setType(e.target.value)}>
              <MenuItem value="addition">Stock Addition (Purchase)</MenuItem>
              <MenuItem value="scrap">Scrap (Damaged)</MenuItem>
              <MenuItem value="wastage">Wastage (Expired/Lost)</MenuItem>
              <MenuItem value="sellout">Sellout (Manual Correction)</MenuItem>
            </Select>
          </FormControl>

          <TextField 
            label="Quantity" 
            type="number" 
            fullWidth 
            value={quantity} 
            onChange={e => setQuantity(e.target.value)} 
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} 
          />

          <TextField 
            label="Transaction Note" 
            fullWidth 
            multiline 
            rows={2} 
            value={reason} 
            onChange={e => setReason(e.target.value)} 
            placeholder="e.g. Batch #402 received"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} 
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'slate.400', fontWeight: 700, textTransform: 'none' }}>Discard</Button>
          <Button 
            variant="contained" 
            onClick={handleAddTransaction}
            disabled={saving}
            sx={{ bgcolor: '#1e293b', borderRadius: 3, px: 4, py: 1, fontWeight: 800, textTransform: 'none' }}
          >
            {saving ? 'Posting...' : 'Commit Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(p => ({ ...p, open: false }))}>
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 3 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
