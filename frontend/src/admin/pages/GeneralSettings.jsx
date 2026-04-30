import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Switch, FormControlLabel,
  Alert, CircularProgress, Divider, Button, Snackbar,
  TextField, Grid, Stack, InputAdornment, IconButton, Tooltip,
  Card, CardContent, Fade
} from '@mui/material';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { API } from '../../services/api';

export default function GeneralSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  // Settings state
  const [settings, setSettings] = useState({
    require_email_verification: 'false',
    app_domain: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/users/settings');
      setSettings(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateToggle = async (checked) => {
    const val = String(checked);
    setSaving(true);
    try {
      await API.put('/users/settings', { key: 'require_email_verification', value: val });
      setSettings(prev => ({ ...prev, require_email_verification: val }));
      showSnack('Security policy updated', 'success');
    } catch (err) {
      showSnack('Failed to update security policy', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const keys = ['app_domain', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from'];
      await Promise.all(keys.map(k => 
        API.put('/users/settings', { key: k, value: settings[k] })
      ));
      showSnack('Global settings synchronized successfully', 'success');
    } catch (err) {
      showSnack('Failed to sync settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    const target = window.prompt("Where should we send the test email?");
    if (!target) return;
    setTesting(true);
    try {
      await API.post('/users/settings/test-email', {
        host: settings.smtp_host,
        port: settings.smtp_port,
        user: settings.smtp_user,
        pass: settings.smtp_pass,
        from: settings.smtp_from,
        targetEmail: target
      });
      showSnack('Test transmission successful!', 'success');
    } catch (err) {
      showSnack(err.response?.data?.details || 'Transmission failure', 'error');
    } finally {
      setTesting(false);
    }
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress thickness={5} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
      {/* Page Header */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
        <Box>
          <Typography variant="h3" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: '-0.02em', mb: 1 }}>
            General Settings
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400 }}>
            Configure your application environment and notification systems.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveRoundedIcon />}
          onClick={handleSaveAll}
          disabled={saving}
          sx={{ 
            bgcolor: '#0f172a', 
            borderRadius: 3, 
            px: 5, 
            py: 1.5,
            fontWeight: 800,
            boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)',
            '&:hover': { bgcolor: '#1e293b' },
            textTransform: 'none'
          }}
        >
          {saving ? 'Syncing...' : 'Save Configuration'}
        </Button>
      </Box>

      <Grid container spacing={5}>
        {/* Left Column - Core Config */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={4}>
            {/* Security Card */}
            <Card sx={{ borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f5f3ff', color: '#7c3aed' }}>
                    <SecurityRoundedIcon />
                  </Box>
                  <Typography variant="h6" fontWeight="800" color="#1e293b">Account Security</Typography>
                </Stack>
                
                <Box sx={{ 
                  p: 3, 
                  bgcolor: settings.require_email_verification === 'true' ? '#f0fdf4' : '#fff7ed', 
                  borderRadius: 4, 
                  border: '1px solid',
                  borderColor: settings.require_email_verification === 'true' ? '#bbf7d0' : '#ffedd5',
                  mb: 2
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.require_email_verification === 'true'}
                        onChange={(e) => handleUpdateToggle(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10b981' },
                        }}
                      />
                    }
                    label={<Typography fontWeight="900" color="#1e293b">Enforce Email Verification</Typography>}
                  />
                  <Typography variant="body2" color="#64748b" mt={1}>
                    When active, new accounts are locked until the user verifies their email address.
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Domain Card */}
            <Card sx={{ borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={4}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f0f9ff', color: '#0284c7' }}>
                    <DnsRoundedIcon />
                  </Box>
                  <Typography variant="h6" fontWeight="800" color="#1e293b">Environment Domain</Typography>
                </Stack>

                <Typography variant="body2" color="#64748b" mb={3}>
                  Set the public URL where your application is hosted. This affects all system-generated links.
                </Typography>

                <TextField
                  fullWidth
                  label="Application Public URL"
                  variant="filled"
                  value={settings.app_domain}
                  onChange={(e) => setSettings({ ...settings, app_domain: e.target.value })}
                  placeholder="https://dashboard.profitpulse.com"
                  InputProps={{
                    disableUnderline: true,
                    sx: { borderRadius: 3, bgcolor: '#f1f5f9', p: 1 },
                    startAdornment: <InputAdornment position="start"><DnsRoundedIcon sx={{ color: '#94a3b8' }}/></InputAdornment>
                  }}
                />
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column - SMTP Logic */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'visible' }}>
            <Box sx={{ 
              p: 4, 
              borderBottom: '1px solid #f1f5f9', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              bgcolor: '#fafafa',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24
            }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f0fdf4', color: '#16a34a' }}>
                  <EmailRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="800" color="#1e293b">Email Infrastructure</Typography>
                  <Typography variant="caption" color="#64748b">SMTP Server Configuration</Typography>
                </Box>
              </Stack>
              <Button 
                variant="outlined"
                color="inherit"
                startIcon={testing ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
                onClick={handleTestEmail}
                disabled={testing}
                sx={{ 
                  borderRadius: 3, 
                  fontWeight: 800, 
                  px: 3, 
                  borderColor: '#e2e8f0',
                  color: '#475569',
                  '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                }}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </Box>

            <CardContent sx={{ p: 5 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle2" fontWeight="800" color="#475569" mb={1}>Host Address</Typography>
                  <TextField
                    fullWidth
                    value={settings.smtp_host}
                    onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                    placeholder="smtp.mailtrap.io"
                    InputProps={{ 
                      sx: { borderRadius: 3 },
                      startAdornment: <InputAdornment position="start"><SettingsSuggestRoundedIcon sx={{ color: '#94a3b8' }}/></InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" fontWeight="800" color="#475569" mb={1}>Port</Typography>
                  <TextField
                    fullWidth
                    value={settings.smtp_port}
                    onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                    placeholder="587"
                    InputProps={{ sx: { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="800" color="#475569" mb={1}>SMTP Username</Typography>
                  <TextField
                    fullWidth
                    value={settings.smtp_user}
                    onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                    placeholder="api_key_12345"
                    InputProps={{ 
                      sx: { borderRadius: 3 },
                      startAdornment: <InputAdornment position="start"><EmailRoundedIcon sx={{ color: '#94a3b8' }}/></InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="800" color="#475569" mb={1}>SMTP Password</Typography>
                  <TextField
                    fullWidth
                    type={showPass ? 'text' : 'password'}
                    value={settings.smtp_pass}
                    onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                    InputProps={{ 
                      sx: { borderRadius: 3 },
                      startAdornment: <InputAdornment position="start"><KeyRoundedIcon sx={{ color: '#94a3b8' }}/></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                            {showPass ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="800" color="#475569" mb={1}>"From" Identity</Typography>
                  <TextField
                    fullWidth
                    value={settings.smtp_from}
                    onChange={(e) => setSettings({ ...settings, smtp_from: e.target.value })}
                    placeholder="noreply@profitpulse.com"
                    helperText="This email will appear in the 'From' field of all system messages."
                    InputProps={{ sx: { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" icon={<InfoRoundedIcon />} sx={{ borderRadius: 4, bgcolor: '#eff6ff', color: '#1e40af', '& .MuiAlert-icon': { color: '#3b82f6' } }}>
                    Your SMTP credentials are encrypted at rest and never shared. We recommend using port 587 with TLS for maximum security.
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        TransitionComponent={Fade}
      >
        <Alert severity={snack.severity} sx={{ borderRadius: 3, fontWeight: 700, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
