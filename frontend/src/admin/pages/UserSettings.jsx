import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, Chip,
  IconButton, Tooltip, Switch, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, CircularProgress, InputAdornment, Alert, Snackbar,
  Avatar, Menu, MenuItem, Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { API } from '../../services/api';

export default function UserSettings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add User Dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'USER' });
  const [addingUser, setAddingUser] = useState(false);
  
  // Notification state
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.role === 'ADMIN') setIsAdmin(true);
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users/manage/all');
      setUsers(res.data);
    } catch (err) {
      showSnack('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    if (!isAdmin) return;
    try {
      await API.put(`/users/manage/status/${userId}`, { is_active: !currentStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
      showSnack(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (err) {
      showSnack(err.response?.data?.details || err.response?.data?.error || 'Failed to update status', 'error');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      showSnack('Email and Password are required', 'error');
      return;
    }
    setAddingUser(true);
    try {
      await API.post('/users/manage/create', newUser);
      showSnack('User added and invitation email sent!', 'success');
      setOpenAddDialog(false);
      setNewUser({ email: '', password: '', name: '', role: 'USER' });
      fetchUsers();
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to add user', 'error');
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to move this user to the recycle bin?')) return;
    try {
      await API.delete(`/users/manage/delete/${id}`);
      showSnack('User moved to archive', 'success');
      fetchUsers();
    } catch (err) {
      showSnack(err.response?.data?.details || err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  // Filtering
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="#1e293b">User Management</Typography>
          <Typography variant="body1" color="text.secondary">View and manage system users and their permissions</Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
            sx={{
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' },
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: '700'
            }}
          >
            Add New User
          </Button>
        )}
      </Box>

      {/* Filters & Table */}
      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by email, name or role..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 300, bgcolor: '#fff' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button startIcon={<FilterListIcon />} sx={{ color: '#64748b', textTransform: 'none' }}>Filters</Button>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>User Info</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Verified</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Status</TableCell>
                {isAdmin && <TableCell align="right" sx={{ fontWeight: '700', color: '#475569' }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <CircularProgress size={40} sx={{ color: '#3b82f6' }} />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <Typography color="text.secondary">No users found matching your search.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((u) => (
                    <TableRow key={u.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={u.avatar_url ? `http://localhost:5000${u.avatar_url}` : ''}
                            sx={{ width: 40, height: 40, bgcolor: '#e2e8f0', color: '#475569', fontWeight: '700' }}
                          >
                            {u.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="700" color="#1e293b">{u.name || 'N/A'}</Typography>
                            <Typography variant="caption" color="text.secondary">Joined {new Date(u.created_at).toLocaleDateString()}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#475569">{u.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={u.role} 
                          size="small" 
                          sx={{ 
                            fontWeight: '700', 
                            bgcolor: u.role === 'ADMIN' ? '#eff6ff' : '#f1f5f9',
                            color: u.role === 'ADMIN' ? '#3b82f6' : '#64748b'
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        {u.is_verified ? (
                          <Tooltip title="Email Verified">
                            <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Pending Verification">
                            <CircularProgress size={16} sx={{ color: '#f59e0b' }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            checked={u.is_active}
                            onChange={() => handleStatusToggle(u.id, u.is_active)}
                            disabled={!isAdmin}
                            size="small"
                            color="success"
                          />
                          <Typography 
                            variant="caption" 
                            fontWeight="700"
                            sx={{ color: u.is_active ? '#22c55e' : '#ef4444' }}
                          >
                            {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </Typography>
                        </Box>
                      </TableCell>
                      {isAdmin && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => navigate(`/admin/profile/${u.id}`)}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteUser(u.id)}><DeleteRoundedIcon sx={{ fontSize: 18 }} /></IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 50, 100, 500, 1000]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid #f1f5f9' }}
        />
      </Paper>

      {/* Add User Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: '800', pt: 3 }}>Add New User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            An invitation email with a temporary password and verification link will be sent automatically.
          </Typography>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
            />
            <TextField
              label="Email Address"
              fullWidth
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
            />
            <TextField
              label="Initial Password"
              type="password"
              fullWidth
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment> }}
            />
            <TextField
              select
              label="Role"
              fullWidth
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Administrator</option>
              <option value="EDITOR">Editor</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenAddDialog(false)} sx={{ color: '#64748b' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddUser}
            disabled={addingUser}
            sx={{ 
              bgcolor: '#3b82f6', 
              borderRadius: 2,
              px: 4,
              fontWeight: '700'
            }}
          >
            {addingUser ? <CircularProgress size={20} color="inherit" /> : 'Create & Invite'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
