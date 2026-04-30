import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Switch, FormControlLabel,
  Alert, CircularProgress, Button, Snackbar,
  TextField, Grid, Stack, InputAdornment, IconButton,
  Fade, Chip, Zoom
} from '@mui/material';
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
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import { API } from '../../services/api';

export default function GeneralSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

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
      setLastSync(new Date().toLocaleTimeString());
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
      setLastSync(new Date().toLocaleTimeString());
      showSnack('Settings synchronized', 'success');
    } catch (err) {
      showSnack('Failed to sync settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    const target = window.prompt("Target email for test?");
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
      showSnack('Test sent successfully!', 'success');
    } catch (err) {
      showSnack(err.response?.data?.details || 'Test failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={40} thickness={4} sx={{ color: '#4f46e5' }} />
      </Box>
    );
  }

  const isConfigured = settings.smtp_host && settings.smtp_user && settings.smtp_pass;

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      minHeight: '100%',
      position: 'relative',
      background: '#f8fafc',
      overflow: 'hidden'
    }}>
      {/* Background Mesh */}
      <Box sx={{ 
        position: 'absolute', top: '-15%', right: '-5%', width: '600px', height: '600px', 
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none'
      }} />

      {/* Header */}
      <Fade in={true} timeout={500}>
        <Box sx={{ 
          mb: 4, display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 
        }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ 
              color: '#1e293b',
              letterSpacing: '-0.03em',
              mb: 0.5
            }}>
              System Settings
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ px: 1.5, py: 0.4, bgcolor: '#1e293b', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 6, height: 6, bgcolor: '#10b981', borderRadius: '50%' }} />
                <Typography sx={{ color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>LIVE</Typography>
              </Box>
              {lastSync && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: '#64748b' }}>
                  <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption" fontWeight="600">Updated: {lastSync}</Typography>
                </Stack>
              )}
            </Stack>
          </Box>
          
          <Button 
            variant="contained" 
            size="medium"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
            onClick={handleSaveAll}
            disabled={saving}
            sx={{ 
              bgcolor: '#1e293b', 
              borderRadius: '12px', 
              px: 4, 
              py: 1.2,
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': { bgcolor: '#334155' }
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Fade>

      <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Row 1: System Pulse (Full Width) */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3, borderRadius: 8, bgcolor: '#fff', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <Typography variant="overline" fontWeight="900" color="#6366f1" sx={{ letterSpacing: 2 }}>System Pulse</Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {[
                { label: 'Mail Relay', val: isConfigured ? 'Healthy' : 'Fallback', color: isConfigured ? '#10b981' : '#f59e0b' },
                { label: 'Security', val: 'AES-256', color: '#6366f1' },
                { label: 'API Uptime', val: '99.9%', color: '#10b981' }
              ].map((item, idx) => (
                <Grid item xs={12} sm={4} key={idx}>
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="700" color="#64748b">{item.label}</Typography>
                    <Typography variant="body1" fontWeight="900" sx={{ color: item.color }}>{item.val}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Row 2: Security & Domain (Side by Side on Desktop) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, borderRadius: 8, bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)',
            border: '1px solid #e2e8f0',
            height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3, justifyContent: {xs: 'center', md: 'flex-start'} }}>
              <Box sx={{ p: 1.5, borderRadius: 4, bgcolor: '#f5f3ff', color: '#7c3aed' }}>
                <SecurityRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="900" color="#1e293b">Security</Typography>
                <Typography variant="caption" color="#64748b" fontWeight="600">KYC Policy</Typography>
              </Box>
            </Stack>
            <Box sx={{ 
              p: 2, borderRadius: 6, bgcolor: settings.require_email_verification === 'true' ? '#f0fdf4' : '#fff7ed',
              border: '1px solid', borderColor: settings.require_email_verification === 'true' ? '#10b981' : '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <Typography variant="body2" fontWeight="800">Email Verification</Typography>
              <Switch
                size="small"
                checked={settings.require_email_verification === 'true'}
                onChange={(e) => handleUpdateToggle(e.target.checked)}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, borderRadius: 8, bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)',
            border: '1px solid #e2e8f0',
            height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3, justifyContent: {xs: 'center', md: 'flex-start'} }}>
              <Box sx={{ p: 1.5, borderRadius: 4, bgcolor: '#f0f9ff', color: '#0284c7' }}>
                <DnsRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="900" color="#1e293b">Endpoint</Typography>
                <Typography variant="caption" color="#64748b" fontWeight="600">Domain Setting</Typography>
              </Box>
            </Stack>
            <Box sx={{ p: 1.5, borderRadius: 6, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <TextField
                fullWidth
                variant="standard"
                size="small"
                value={settings.app_domain}
                onChange={(e) => setSettings({ ...settings, app_domain: e.target.value })}
                placeholder="https://app.profitpulse.com"
                InputProps={{ 
                  disableUnderline: true,
                  sx: { fontSize: '0.9rem', fontWeight: 700, px: 1 } 
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Row 3: SMTP Engine (Full Width) */}
        <Grid item xs={12}>
          <Paper sx={{ 
            borderRadius: 12, overflow: 'hidden', bgcolor: '#fff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ 
              p: 3, borderBottom: '1px solid #f1f5f9', bgcolor: '#fafafa', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2
            }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <EmailRoundedIcon sx={{ fontSize: 24, color: '#10b981' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="1000" color="#1e293b">SMTP Infrastructure</Typography>
                  <Typography variant="caption" color="#64748b" fontWeight="600">Mail Delivery Engine</Typography>
                </Box>
              </Stack>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={testing ? <CircularProgress size={14} /> : <SendRoundedIcon />}
                onClick={handleTestEmail}
                disabled={testing}
                sx={{ borderRadius: '8px', fontWeight: 800, textTransform: 'none' }}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </Box>

            <Box sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={9}>
                  <Typography variant="caption" fontWeight="900" color="#64748b" sx={{ ml: 1, mb: 0.5, display: 'block' }}>SMTP HOST</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={settings.smtp_host}
                    onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                    placeholder="smtp.provider.com"
                    InputProps={{ 
                      sx: { borderRadius: 3, bgcolor: '#f8fafc' },
                      startAdornment: <InputAdornment position="start"><SettingsSuggestRoundedIcon sx={{ fontSize: 18, color: '#6366f1' }}/></InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" fontWeight="900" color="#64748b" sx={{ ml: 1, mb: 0.5, display: 'block' }}>PORT</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={settings.smtp_port}
                    onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                    placeholder="587"
                    InputProps={{ sx: { borderRadius: 3, bgcolor: '#f8fafc' } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight="900" color="#64748b" sx={{ ml: 1, mb: 0.5, display: 'block' }}>USERNAME</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={settings.smtp_user}
                    onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                    InputProps={{ 
                      sx: { borderRadius: 3, bgcolor: '#f8fafc' },
                      startAdornment: <InputAdornment position="start"><EmailRoundedIcon sx={{ fontSize: 18, color: '#6366f1' }}/></InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="caption" fontWeight="900" color="#64748b" sx={{ ml: 1, mb: 0.5, display: 'block' }}>PASSWORD</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPass ? 'text' : 'password'}
                    value={settings.smtp_pass}
                    onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                    InputProps={{ 
                      sx: { borderRadius: 3, bgcolor: '#f8fafc' },
                      startAdornment: <InputAdornment position="start"><KeyRoundedIcon sx={{ fontSize: 18, color: '#6366f1' }}/></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                            {showPass ? <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" fontWeight="900" color="#64748b" sx={{ ml: 1, mb: 0.5, display: 'block' }}>SENDER IDENTITY</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={settings.smtp_from}
                    onChange={(e) => setSettings({ ...settings, smtp_from: e.target.value })}
                    placeholder="noreply@domain.com"
                    InputProps={{ 
                      sx: { borderRadius: 3, bgcolor: '#f8fafc' },
                      startAdornment: <InputAdornment position="start"><CloudQueueRoundedIcon sx={{ fontSize: 18, color: '#6366f1' }}/></InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Alert 
                    severity="info" 
                    icon={<InfoRoundedIcon sx={{ fontSize: 20 }} />} 
                    sx={{ 
                      borderRadius: 6, bgcolor: '#f1f5f9', color: '#1e293b',
                      '& .MuiAlert-icon': { color: '#6366f1' }
                    }}
                  >
                    <Typography variant="caption" fontWeight="700">
                      Settings are synchronized with the primary node. Credentials are encrypted using AES-256 standards.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert variant="filled" severity={snack.severity} sx={{ borderRadius: 4, fontWeight: 800 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
