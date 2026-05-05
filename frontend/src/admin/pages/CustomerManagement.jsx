import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Button, Avatar,
  Switch, CircularProgress, Alert, Snackbar, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { API } from '../../services/api';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  
  const [openRemarkDialog, setOpenRemarkDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [remarkText, setRemarkText] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users/manage/all');
      // Filter out admins/editors to only show customers
      setCustomers(res.data.filter(u => u.role === 'USER'));
    } catch (err) {
      showSnack('Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await API.put(`/users/manage/status/${userId}`, { is_active: !currentStatus });
      setCustomers(customers.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
      showSnack(`Customer ${!currentStatus ? 'unblocked' : 'blocked'} successfully`, 'success');
    } catch (err) {
      showSnack('Failed to update status', 'error');
    }
  };

  const openRemark = (user) => {
    setSelectedUser(user);
    setRemarkText('');
    setOpenRemarkDialog(true);
  };

  const saveRemark = async () => {
    // Ideally send remark to backend, for now we just show snack
    showSnack(`Remark saved for ${selectedUser.name}`, 'success');
    setOpenRemarkDialog(false);
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  const filteredCustomers = customers.filter(c => 
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" color="#1e293b">Customer Management</Typography>
        <Typography variant="body1" color="text.secondary">View all customers, manage their access, and add remarks.</Typography>
      </Box>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9' }}>
          <TextField
            placeholder="Search customers..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 300, bgcolor: '#fff' }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: '700' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: '700' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: '700' }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: '700' }}>Status (Block/Unblock)</TableCell>
                <TableCell align="right" sx={{ fontWeight: '700' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    <Typography color="text.secondary">No customers found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#6366f1', width: 36, height: 36 }}>
                            {c.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="700">{c.name || 'Unknown'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Switch
                            checked={c.is_active}
                            onChange={() => handleStatusToggle(c.id, c.is_active)}
                            color="success"
                            size="small"
                          />
                          <Typography variant="caption" fontWeight="700" color={c.is_active ? 'success.main' : 'error.main'}>
                            {c.is_active ? 'ACTIVE' : 'BLOCKED'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" onClick={() => openRemark(c)}>
                          Add Remark
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 50, 100]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Remark Dialog */}
      <Dialog open={openRemarkDialog} onClose={() => setOpenRemarkDialog(false)} PaperProps={{ sx: { width: '100%', maxWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Remark for {selectedUser?.name}</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Type your reason or remark for blocking/unblocking here..."
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenRemarkDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveRemark} sx={{ bgcolor: '#6366f1' }}>Save Remark</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
