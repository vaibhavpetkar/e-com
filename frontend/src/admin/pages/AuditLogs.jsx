import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button,
  MenuItem, Chip, CircularProgress, IconButton, Tooltip
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import { API } from '../../services/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.role === 'ADMIN') {
        setIsAdmin(true);
        fetchUsers();
      }
    }
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users/all');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedUser) params.append('userId', selectedUser);

      const res = await API.get(`/users/audit-logs?${params.toString()}`);
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedUser('');
    // We need to wait for state updates or just call with empty values
    setLoading(true);
    API.get('/users/audit-logs').then(res => {
      setLogs(res.data);
      setLoading(false);
    });
  };

  const formatAction = (action) => {
    if (action.startsWith('SETTING_UPDATE')) return 'Setting Update';
    if (action === 'PROFILE_UPDATE') return 'Profile Update';
    return action;
  };

  const getActionColor = (action) => {
    if (action.includes('UPDATE')) return 'primary';
    if (action.includes('DELETE')) return 'error';
    if (action.includes('CREATE')) return 'success';
    return 'default';
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f4f2ec', minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1d21">Audit Log History</Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={fetchLogs}
          sx={{ borderRadius: 2, borderColor: '#1a1d21', color: '#1a1d21' }}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 1px 8px 0 rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 150 }}
          />
          {isAdmin && (
            <TextField
              select
              label="User"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Users</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </MenuItem>
              ))}
            </TextField>
          )}
          <Button 
            variant="contained" 
            onClick={fetchLogs}
            sx={{ bgcolor: '#1a1d21', color: '#fff', borderRadius: 2, px: 3, height: 40, '&:hover': { bgcolor: '#2d3748' } }}
          >
            Filter
          </Button>
          <Button 
            variant="text" 
            onClick={handleReset}
            sx={{ color: 'text.secondary', height: 40 }}
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 1px 8px 0 rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={30} sx={{ color: '#1a1d21' }} />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">No logs found matching your criteria.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{log.user_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{log.user_email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={formatAction(log.action)} 
                      size="small" 
                      color={getActionColor(log.action)}
                      sx={{ fontWeight: 'bold', fontSize: 11 }}
                    />
                    {log.action.includes(':') && (
                      <Typography variant="caption" display="block" mt={0.5} color="text.secondary">
                        {log.action.split(': ')[1]}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {log.ip_address}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
