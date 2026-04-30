import React, { useState, useEffect } from 'react';
import { API } from '../../services/api';
import { 
  Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Tooltip, Snackbar, Alert,
  CircularProgress
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';

export default function CategoryMaster() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get('/categories');
      setCategories(res.data);
    } catch (err) {
      showSnack('Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!name) return showSnack('Name is required', 'warning');
    try {
      await API.post('/categories', { name, description });
      setOpen(false);
      setName('');
      setDescription('');
      showSnack('Category created successfully');
      fetchCategories();
    } catch (err) {
      showSnack('Failed to add category', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Move this category to archive?')) return;
    try {
      await API.delete(`/categories/${id}`);
      showSnack('Category moved to recycle bin');
      fetchCategories();
    } catch (err) {
      showSnack('Failed to delete category', 'error');
    }
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="px-8 py-8 border-b border-gray-100 flex justify-between items-center bg-white">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Categories</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Organize and manage your product catalog</p>
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
          + Create New
        </Button>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 overflow-auto">
        <div className="grid grid-cols-6 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-6">
          <div className="col-span-1">ID</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-2">Description</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-20"><CircularProgress /></div>
          ) : categories.map((cat) => (
            <div key={cat.id} className="grid grid-cols-6 items-center px-6 py-5 bg-white hover:bg-slate-50 rounded-2xl transition-all duration-200 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50">
              <div className="col-span-1 text-slate-400 font-mono text-xs">#{cat.id}</div>
              <div className="col-span-2 font-bold text-[#1e293b] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eef2ff] flex items-center justify-center text-[#6366f1] font-black text-sm border border-[#e0e7ff]">
                  {cat.name.charAt(0).toUpperCase()}
                </div>
                {cat.name}
              </div>
              <div className="col-span-2 text-slate-500 text-sm font-medium truncate pr-4">
                {cat.description || <span className="italic text-slate-300">No description provided</span>}
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                <Tooltip title="Edit">
                  <IconButton size="small" sx={{ color: '#64748b' }}>
                    <EditNoteRoundedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDelete(cat.id)} sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}>
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))}
          {!loading && categories.length === 0 && (
            <div className="text-center text-slate-400 py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 font-medium">
              No categories found. Start by creating one!
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 6, p: 2, width: '100%', maxWidth: 450 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>Add Category</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <TextField 
            label="Category Name" 
            fullWidth 
            value={name} 
            onChange={e => setName(e.target.value)}
            sx={{ mb: 3, mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <TextField 
            label="Description" 
            fullWidth 
            multiline
            rows={4}
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddCategory} 
            sx={{ bgcolor: '#6366f1', borderRadius: 3, px: 4, fontWeight: 700, textTransform: 'none' }}
          >
            Create Category
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(p => ({ ...p, open: false }))}>
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 3 }}>{snack.msg}</Alert>
      </Snackbar>
    </div>
  );
}
