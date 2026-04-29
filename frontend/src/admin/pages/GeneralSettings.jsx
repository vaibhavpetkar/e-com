import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Switch, FormControlLabel,
  Alert, CircularProgress, Divider, Button, Snackbar
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import SecurityIcon from '@mui/icons-material/Security';
import { API } from '../../services/api';

export default function GeneralSettings() {
  const [requireVerification, setRequireVerification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/users/settings');
      setRequireVerification(res.data.require_email_verification === 'true');
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked) => {
    setSaving(true);
    try {
      await API.put('/users/settings', {
        key: 'require_email_verification',
        value: String(checked)
      });
      setRequireVerification(checked);
      setSnack({
        open: true,
        msg: checked ? 'Email verification enabled for new users.' : 'Email verification disabled. New users will be auto-verified.',
        severity: 'success'
      });
    } catch (err) {
      setSnack({
        open: true,
        msg: 'Failed to update setting.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress sx={{ color: '#1a1d21' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f4f2ec', minHeight: '100%' }}>
      <Typography variant="h5" fontWeight="bold" color="#1a1d21" mb={3}>General Settings</Typography>

      <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', color: '#16a34a', borderRadius: 2 }}>
            <MarkEmailReadIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">Email Verification</Typography>
            <Typography variant="body2" color="text.secondary">Manage how new users register on your platform.</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 3,
          bgcolor: '#f8fafc',
          borderRadius: 3,
          border: '1px solid #e2e8f0'
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight="bold" color="#1a1d21">Enable Email Verification</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 500 }}>
              If enabled, newly registered users must click a link in their email to activate their account. 
              If disabled, users are automatically verified and granted access immediately.
            </Typography>
            
            {requireVerification ? (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#16a34a' }}>
                <SecurityIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" fontWeight="bold">Security: High (Verification Required)</Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#f59e0b' }}>
                <SecurityIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" fontWeight="bold">Security: Standard (Auto-Verify)</Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {saving && <CircularProgress size={20} />}
            <Switch
              checked={requireVerification}
              onChange={(e) => handleToggle(e.target.checked)}
              disabled={saving}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#1a1d21' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#1a1d21' },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Alert severity={requireVerification ? "info" : "warning"} sx={{ borderRadius: 2 }}>
            {requireVerification 
              ? "New users will see a 'Pending Verification' message until they verify their email."
              : "New users will be automatically marked as verified (blue checkmark) upon registration."}
          </Alert>
        </Box>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
