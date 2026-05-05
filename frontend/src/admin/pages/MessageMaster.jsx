import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, CircularProgress, Chip,
  Snackbar, Alert, IconButton
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { API } from '../../services/api';

export default function MessageMaster() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await API.get('/messages');
      setMessages(res.data);
    } catch (err) {
      showSnack('Failed to fetch messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" color="#1e293b">Customer Support Messages</Typography>
        <Typography variant="body1" color="text.secondary">View and manage messages sent from the support widget</Typography>
      </Box>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 10 }}>
                    <CircularProgress size={40} sx={{ color: '#3b82f6' }} />
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 10 }}>
                    <Typography color="text.secondary">No messages found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                messages
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((m) => (
                    <TableRow key={m.id} hover>
                      <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="700">{m.customer_name || 'Anonymous'}</Typography>
                        <Typography variant="caption" color="text.secondary">{m.customer_email || 'No email provided'}</Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 400 }}>
                        <Typography variant="body2">{m.message}</Typography>
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
          count={messages.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ borderTop: '1px solid #f1f5f9' }}
        />
      </Paper>

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
