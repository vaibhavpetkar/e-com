import React, { useState, useEffect } from 'react';
import { API } from '../../services/api';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

export default function ProductMaster() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        API.get('/products'),
        API.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async () => {
    if (!name || !price) return alert('Name and Price are required');
    try {
      await API.post('/products', { 
        name, 
        price: parseFloat(price), 
        description, 
        category_id: categoryId || null,
        images: imageUrl ? [imageUrl] : []
      });
      setOpen(false);
      // Reset
      setName('');
      setPrice('');
      setDescription('');
      setCategoryId('');
      setImageUrl('');
      fetchData();
    } catch (err) {
      console.error('Failed to add product', err);
      alert('Failed to add product');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-[#faf9f6]">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <div className="flex items-center gap-4 mt-2">
            <select className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none">
              <option>Any Category</option>
              {categories.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
            <select className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none">
              <option>Sort by Date</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
          sx={{ bgcolor: '#1a1d21', borderRadius: '12px', textTransform: 'none', px: 3, '&:hover': { bgcolor: '#2d3136' } }}
        >
          + Add Product
        </Button>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 overflow-auto bg-white">
        <div className="grid grid-cols-6 text-sm font-semibold text-gray-500 mb-4 px-4">
          <div className="col-span-1">Product ID</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-1">Category</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="flex flex-col gap-2">
          {products.map((prod) => (
            <div key={prod.id} className="grid grid-cols-6 items-center px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
              <div className="col-span-1 text-gray-400">#{prod.id}</div>
              <div className="col-span-2 font-medium text-gray-800 flex items-center gap-4">
                {prod.images && prod.images[0] ? (
                  <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">?</div>
                )}
                {prod.name}
              </div>
              <div className="col-span-1 text-gray-500">
                {categories.find(c => c.id === prod.category_id)?.name || '--'}
              </div>
              <div className="col-span-1 font-semibold text-gray-800">
                ${parseFloat(prod.price).toFixed(2)}
              </div>
              <div className="col-span-1 text-right text-gray-400 hover:text-black">
                ...
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center text-gray-500 py-10">No products found.</div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ style: { borderRadius: 16, padding: 8 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Product</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 400 }}>
          <TextField label="Product Name" variant="outlined" fullWidth value={name} onChange={e => setName(e.target.value)} sx={{ mt: 1 }} />
          <TextField label="Price ($)" variant="outlined" type="number" fullWidth value={price} onChange={e => setPrice(e.target.value)} />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={categoryId} label="Category" onChange={e => setCategoryId(e.target.value)}>
              <MenuItem value=""><em>None</em></MenuItem>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Image URL" variant="outlined" fullWidth value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          <TextField label="Description" variant="outlined" fullWidth multiline rows={3} value={description} onChange={e => setDescription(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'gray' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProduct} sx={{ bgcolor: '#1a1d21', borderRadius: '8px' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
