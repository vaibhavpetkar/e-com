import React, { useState, useEffect } from 'react';
import { API } from '../../services/api';
import { 
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
  Select, MenuItem, InputLabel, FormControl, IconButton, Tooltip,
  Snackbar, Alert, CircularProgress, Badge, Chip, Box, Typography,
  Stack
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function ProductMaster() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  
  // Form State
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [openingStock, setOpeningStock] = useState('');
  const [imageUrls, setImageUrls] = useState([]);

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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const res = await API.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrls(prev => [...prev, ...res.data.urls]);
      showSnack(`${files.length} images uploaded`);
    } catch (err) {
      showSnack('Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => {
    setImageUrls(prev => prev.filter(u => u !== url));
  };

  const handleAddProduct = async () => {
    if (!title || !price) return showSnack('Title and Price are required', 'warning');
    try {
      await API.post('/products', { 
        title, 
        brand,
        price: parseFloat(price), 
        description, 
        categoryId: categoryId || null,
        openingStock: parseInt(openingStock) || 0,
        images: imageUrls
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
    setTitle('');
    setBrand('');
    setPrice('');
    setDescription('');
    setCategoryId('');
    setOpeningStock('');
    setImageUrls([]);
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
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
          </div>
        </div>
        <Button 
          variant="contained" 
          onClick={() => { resetForm(); setOpen(true); }}
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
                <Box sx={{ position: 'relative' }}>
                  {prod.images && prod.images[0] ? (
                    <img src={prod.images[0]} alt={prod.title} className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-100 font-black text-xl">?</div>
                  )}
                  {prod.images?.length > 1 && (
                    <Badge badgeContent={`+${prod.images.length - 1}`} color="primary" sx={{ position: 'absolute', bottom: 8, right: 8, '& .MuiBadge-badge': { fontSize: 8, height: 16, minWidth: 16 } }} />
                  )}
                </Box>
                <div className="flex flex-col">
                    <span className="text-sm font-black">{prod.title}</span>
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
                {prod.currency_symbol || '$'}{parseFloat(prod.price).toLocaleString()}
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
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 6, p: 2, width: '100%', maxWidth: 550 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#1e293b' }}>New Product</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <div className="grid grid-cols-2 gap-4">
            <TextField 
                label="Product Title" 
                fullWidth 
                placeholder="e.g. iPhone 15 Pro Max"
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }} 
            />
            <TextField 
                label="Brand" 
                fullWidth 
                placeholder="e.g. Apple"
                value={brand} 
                onChange={e => setBrand(e.target.value)} 
                sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <TextField 
                label={`Price (${products[0]?.currency_symbol || '$'})`} 
                type="number" 
                fullWidth 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} 
              />
              <TextField 
                label="Opening Stock" 
                type="number" 
                fullWidth 
                value={openingStock} 
                onChange={e => setOpeningStock(e.target.value)} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} 
              />
          </div>

          <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryId} label="Category" onChange={e => setCategoryId(e.target.value)}>
              <MenuItem value=""><em>None</em></MenuItem>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="caption" fontWeight="800" color="slate.400" sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>PRODUCT IMAGES</Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
               {imageUrls.map((url, idx) => (
                 <Box key={idx} sx={{ position: 'relative', width: 80, height: 80 }}>
                    <img src={url} alt="product" className="w-full h-full rounded-xl object-cover border border-slate-200" />
                    <IconButton 
                      size="small" 
                      onClick={() => removeImage(url)}
                      sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#ef4444', color: '#fff', '&:hover': { bgcolor: '#dc2626' }, width: 20, height: 20 }}
                    >
                      <CloseRoundedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                 </Box>
               ))}
               <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                  <input type="file" multiple hidden onChange={handleImageUpload} accept="image/*" />
                  {uploading ? <CircularProgress size={20} /> : <AddPhotoAlternateRoundedIcon sx={{ color: 'slate.300' }} />}
                  <span className="text-[8px] font-black mt-1 text-slate-400">ADD MORE</span>
               </label>
            </Stack>
          </Box>

          <TextField label="About this item / Description" fullWidth multiline rows={4} value={description} onChange={e => setDescription(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>Discard</Button>
          <Button 
            variant="contained" 
            onClick={handleAddProduct} 
            disabled={uploading}
            sx={{ bgcolor: '#6366f1', borderRadius: 3, px: 5, py: 1.2, fontWeight: 700, textTransform: 'none', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}
          >
            Deploy Product
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(p => ({ ...p, open: false }))}>
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 3 }}>{snack.msg}</Alert>
      </Snackbar>
    </div>
  );
}
