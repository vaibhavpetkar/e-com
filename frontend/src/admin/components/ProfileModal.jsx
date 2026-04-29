import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Avatar, Box } from '@mui/material';
import { API } from '../../services/api';

export default function ProfileModal({ open, onClose, user, onProfileUpdated }) {
  const [name, setName] = useState(user?.name || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar_url ? `http://localhost:5000${user.avatar_url}` : '');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (file) {
        formData.append('avatar', file);
      }

      const res = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update local storage
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      onProfileUpdated(updatedUser);
      onClose();
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { borderRadius: 16, padding: 8, minWidth: 400 } }}>
      <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Edit Profile</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mt: 1 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar src={preview} sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: 32 }}>
            {!preview && name?.charAt(0).toUpperCase()}
          </Avatar>
          <Button
            variant="contained"
            component="label"
            size="small"
            sx={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', borderRadius: 8, textTransform: 'none', whiteSpace: 'nowrap' }}
          >
            Upload
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>
        </Box>
        <TextField 
          label="Full Name" 
          variant="outlined" 
          fullWidth 
          value={name} 
          onChange={e => setName(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField 
          label="Email Address" 
          variant="outlined" 
          fullWidth 
          value={user?.email || ''} 
          disabled
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
        <Button onClick={onClose} sx={{ color: 'gray' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#1a1d21', borderRadius: '8px' }}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
}
