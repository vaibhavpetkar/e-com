import React, { useState, useEffect } from 'react';
import { API } from '../../services/api';
import { 
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
  Select, MenuItem, InputLabel, FormControl, IconButton, Tooltip,
  Snackbar, Alert, CircularProgress, Badge
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';

export default function ProductMaster() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        API.get('/products'),
        API.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      showSnack('Failed to fetch product data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async () => {
    if (!name || !price) return showSnack('Name and Price are required', 'warning');
    try {
      await API.post('/products', { 
        name, 
        price: parseFloat(price), 
        description, 
        category_id: categoryId || null,
        images: imageUrl ? [imageUrl] : []
      });
      setOpen(false);
      resetForm();
      showSnack('Product added successfully');
      fetchData();
    } catch (err) {
      showSnack('Failed to add product', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Move this product to archive?')) return;
    try {
      await API.delete(`/products/${id}`);
      showSnack('Product moved to recycle bin');
      fetchData();
    } catch (err) {
      showSnack('Failed to delete product', 'error');
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setCategoryId('');
    setImageUrl('');
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="px-8 py-8 border-b border-gray-100 flex justify-between items-center bg-white">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Products</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
               <FilterListRoundedIcon sx={{ fontSize: 16, color: 'slate.400', mr: 1 }} />
               <select className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer">
                  <option>All Categories</option>
                  {categories.map(c => <option key={c.id}>{c.name}</option>)}
               </select>
            </div>
          </div>
        </div>
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
          sx={{ 
            bgcolor: '#6366f1', 
            borderRadius: '14px', 
            textTransform: 'none', 
            px: 4, py: 1.5,
            fontWeight: 700,
            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
            '&:hover': { bgcolor: '#4f46e5' } 
          }}
        >
          + Add Product
        </Button>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 overflow-auto">
        <div className="grid grid-cols-7 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-6">
          <div className="col-span-1">ID</div>
          <div className="col-span-3">Product Info</div>
          <div className="col-span-1">Category</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-20"><CircularProgress /></div>
          ) : products.map((prod) => (
            <div key={prod.id} className="grid grid-cols-7 items-center px-6 py-5 bg-white hover:bg-slate-50 rounded-2xl transition-all duration-200 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50">
              <div className="col-span-1 text-slate-400 font-mono text-xs">#{prod.id}</div>
              <div className="col-span-3 font-bold text-[#1e293b] flex items-center gap-4">
                {prod.images && prod.images[0] ? (
                  <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-100 font-black text-xl">?</div>
                )}
                <div className="flex flex-col">
                    <span className="text-sm font-black">{prod.name}</span>
                    <span className="text-xs font-medium text-slate-400 line-clamp-1">{prod.description || 'No description'}</span>
                </div>
              </div>
              <div className="col-span-1">
                <Chip 
                    label={categories.find(c => c.id === prod.category_id)?.name || 'Uncategorized'} 
                    size="small"
                    sx={{ fontWeight: 800, fontSize: 10, bgcolor: '#f1f5f9', color: '#64748b' }}
                />
              </div>
              <div className="col-span-1 font-black text-[#1e293b] text-sm">
                ${parseFloat(prod.price).toLocaleString()}
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                <Tooltip title="Edit">
                  <IconButton size="small" sx={{ color: '#64748b' }}>
                    <EditNoteRoundedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDelete(prod.id)} sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}>
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))}
          {!loading && products.length === 0 && (
            <div className="text-center text-slate-400 py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 font-medium">
              Your inventory is empty. Add your first product!
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 6, p: 2, width: '100%', maxWidth: 500 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>Add Product</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField label="Product Name" fullWidth value={name} onChange={e => setName(e.target.value)} sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          <div className="grid grid-cols-2 gap-4">
              <TextField label="Price ($)" type="number" fullWidth value={price} onChange={e => setPrice(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
                <InputLabel>Category</InputLabel>
                <Select value={categoryId} label="Category" onChange={e => setCategoryId(e.target.value)}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
          </div>
          <TextField label="Image URL" fullWidth value={imageUrl} onChange={e => setImageUrl(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          <TextField label="Description" fullWidth multiline rows={3} value={description} onChange={e => setDescription(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProduct} sx={{ bgcolor: '#6366f1', borderRadius: 3, px: 4, fontWeight: 700, textTransform: 'none' }}>Save Product</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(p => ({ ...p, open: false }))}>
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 3 }}>{snack.msg}</Alert>
      </Snackbar>
    </div>
  );
}
