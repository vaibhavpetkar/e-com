import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, Tab, Button, Chip, IconButton, Tooltip,
  CircularProgress, Snackbar, Alert, Avatar, Fade
} from '@mui/material';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import HistoryIcon from '@mui/icons-material/History';
import { API } from '../../services/api';

export default function RecycleBin() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const tabs = [
    { label: 'Users',      endpoint: '/users/manage/deleted',    restore: '/users/manage/restore' },
    { label: 'Categories', endpoint: '/categories/deleted', restore: '/categories/restore' },
    { label: 'Products',   endpoint: '/products/deleted',   restore: '/products/restore' }
  ];

  useEffect(() => {
    fetchDeletedItems();
  }, [tab]);

  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      const res = await API.get(tabs[tab].endpoint);
      setItems(res.data);
    } catch (err) {
      showSnack('Failed to fetch deleted items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await API.post(`${tabs[tab].restore}/${id}`);
      showSnack('Item restored successfully!', 'success');
      fetchDeletedItems();
      // Trigger update event if needed
      window.dispatchEvent(new Event('userUpdated'));
    } catch (err) {
      showSnack('Failed to restore item', 'error');
    }
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" color="#1e293b">Recycle Bin</Typography>
        <Typography variant="body1" color="text.secondary">Review and restore recently deleted entries</Typography>
      </Box>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)}
          sx={{ 
            px: 2, pt: 1, borderBottom: '1px solid #f1f5f9',
            '& .MuiTab-root': { fontWeight: '700', textTransform: 'none', minWidth: 120 }
          }}
        >
          {tabs.map((t, i) => <Tab key={i} label={t.label} />)}
        </Tabs>

        <TableContainer sx={{ minHeight: 400 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: '700' }}>Item Name / Info</TableCell>
                <TableCell sx={{ fontWeight: '700' }}>Deleted At</TableCell>
                <TableCell sx={{ fontWeight: '700' }}>Deleted By</TableCell>
                <TableCell align="right" sx={{ fontWeight: '700' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                    <CircularProgress size={40} sx={{ color: '#6366f1' }} />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                    <Typography color="text.secondary">No items found in the archive.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {tab === 0 && (
                          <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{item.name?.charAt(0)}</Avatar>
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight="700">{item.name || item.email}</Typography>
                          {tab === 0 && <Typography variant="caption" color="text.secondary">{item.role}</Typography>}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(item.deleted_at).toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.deleted_by_name || 'System'} 
                        size="small" 
                        sx={{ fontWeight: 600, bgcolor: '#f1f5f9' }} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Restore">
                        <IconButton color="primary" onClick={() => handleRestore(item.id)}>
                          <RestoreFromTrashIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View History">
                        <IconButton size="small">
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(p => ({ ...p, open: false }))}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
