import React, { useState, useEffect } from 'react';
import { API } from '../../services/api';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function CategoryMaster() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!name) return alert('Name is required');
    try {
      await API.post('/categories', { name, description });
      setOpen(false);
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err) {
      console.error('Failed to add category', err);
      alert('Failed to add category');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-[#faf9f6]">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your product categories</p>
        </div>
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
          sx={{ bgcolor: '#1a1d21', borderRadius: '12px', textTransform: 'none', px: 3, '&:hover': { bgcolor: '#2d3136' } }}
        >
          + Add Category
        </Button>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 overflow-auto bg-white">
        <div className="grid grid-cols-5 text-sm font-semibold text-gray-500 mb-4 px-4">
          <div className="col-span-1">ID</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-2">Description</div>
        </div>

        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="grid grid-cols-5 items-center px-4 py-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
              <div className="col-span-1 text-gray-400">#{cat.id}</div>
              <div className="col-span-2 font-medium text-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#fde68a] flex items-center justify-center text-[#92400e] font-bold text-xs">
                  {cat.name.charAt(0).toUpperCase()}
                </div>
                {cat.name}
              </div>
              <div className="col-span-2 text-gray-500 text-sm truncate pr-4">{cat.description || 'No description'}</div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="text-center text-gray-500 py-10">No categories found.</div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ style: { borderRadius: 16, padding: 8 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Category</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDir: 'column', gap: 2, mt: 1, minWidth: 400 }}>
          <TextField 
            label="Category Name" 
            variant="outlined" 
            fullWidth 
            value={name} 
            onChange={e => setName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField 
            label="Description" 
            variant="outlined" 
            fullWidth 
            multiline
            rows={3}
            value={description} 
            onChange={e => setDescription(e.target.value)} 
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'gray' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCategory} sx={{ bgcolor: '#1a1d21', borderRadius: '8px' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
