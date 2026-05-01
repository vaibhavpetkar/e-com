import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, 
  Stack, Divider, Switch, FormControlLabel, Alert,
  CircularProgress, Fade
} from '@mui/material';
import { API } from '../../services/api';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';

export default function IntegrationSettings() {
  const [settings, setSettings] = useState({
    razorpay_key_id: '',
    razorpay_key_secret: '',
    razorpay_enabled: 'false'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/users/settings');
      setSettings(prev => ({
        ...prev,
        ...res.data
      }));
    } catch (err) {
      console.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key, value) => {
    setSaving(true);
    try {
      await API.put('/users/settings', { key, value });
      setSettings(prev => ({ ...prev, [key]: value }));
      setMessage({ type: 'success', text: `Saved ${key.replace('_', ' ')}` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
      <Typography variant="h4" fontWeight="900" sx={{ mb: 4, letterSpacing: -1 }}>Integrations</Typography>
      
      <Fade in>
        <Grid container spacing={4}>
          {/* Razorpay Integration */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: 6 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <PaymentRoundedIcon sx={{ fontSize: 40, color: '#6366f1' }} />
                <Box>
                  <Typography variant="h5" fontWeight="900">Razorpay Payment Gateway</Typography>
                  <Typography variant="body2" color="text.secondary">Connect your store to Razorpay to accept online payments.</Typography>
                </Box>
              </Stack>
              
              <Divider sx={{ mb: 4 }} />

              {message && <Alert severity={message.type} sx={{ mb: 3, borderRadius: 3 }}>{message.text}</Alert>}

              <Stack spacing={4}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.razorpay_enabled === 'true'} 
                      onChange={(e) => handleSave('razorpay_enabled', e.target.checked ? 'true' : 'false')} 
                    />
                  }
                  label={<Typography fontWeight="800">Enable Razorpay Payments</Typography>}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField 
                      label="Razorpay Key ID" 
                      fullWidth 
                      value={settings.razorpay_key_id} 
                      onChange={(e) => setSettings({...settings, razorpay_key_id: e.target.value})}
                      onBlur={() => handleSave('razorpay_key_id', settings.razorpay_key_id)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      label="Razorpay Key Secret" 
                      type="password"
                      fullWidth 
                      value={settings.razorpay_key_secret} 
                      onChange={(e) => setSettings({...settings, razorpay_key_secret: e.target.value})}
                      onBlur={() => handleSave('razorpay_key_secret', settings.razorpay_key_secret)}
                      disabled={saving}
                    />
                  </Grid>
                </Grid>

                <Alert severity="info" icon={<SecurityRoundedIcon />} sx={{ borderRadius: 3 }}>
                  Your keys are encrypted and stored securely. Never share your Key Secret with anyone.
                </Alert>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: 6, bgcolor: '#1e293b', color: '#fff' }}>
              <Typography variant="h6" fontWeight="900" sx={{ mb: 2 }}>Integration Help</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                To get your API keys:
                <br /><br />
                1. Log in to your Razorpay Dashboard.
                <br />
                2. Go to Settings {'>'} API Keys.
                <br />
                3. Click "Generate Key" and copy the details here.
              </Typography>
              <Button variant="contained" fullWidth sx={{ bgcolor: '#fff', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#f1f5f9' } }}>
                Read Documentation
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Fade>
    </Box>
  );
}
