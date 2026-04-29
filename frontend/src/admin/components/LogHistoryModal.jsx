import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';
import { API } from '../../services/api';

export default function LogHistoryModal({ open, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      API.get('/users/audit')
        .then(res => {
          setLogs(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch logs", err);
          setLoading(false);
        });
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { borderRadius: 16, padding: 8, minWidth: 500 } }}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Log History (Audit)</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 300 }}>
        {loading ? (
          <div className="flex justify-center items-center h-full flex-1">
            <CircularProgress />
          </div>
        ) : logs.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ mt: 4 }}>No audit logs found.</Typography>
        ) : (
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b pb-2 text-sm text-gray-500 font-semibold">Time</th>
                  <th className="border-b pb-2 text-sm text-gray-500 font-semibold">Action</th>
                  <th className="border-b pb-2 text-sm text-gray-500 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-3 border-b text-sm text-gray-700">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 border-b text-sm font-medium text-gray-900">{log.action}</td>
                    <td className="py-3 border-b text-sm text-gray-500">{log.ip_address || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={onClose} sx={{ bgcolor: '#1a1d21', borderRadius: '8px' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
