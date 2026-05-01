import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Stack, TextField,
  Button, Snackbar, Alert, CircularProgress, Fade,
  IconButton, InputAdornment, Divider, Tooltip,
  Switch, FormControlLabel, Chip
} from '@mui/material';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import { API } from '../../services/api';

export default function WebsiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const [settings, setSettings] = useState({
    site_name: 'ProfitPulse E-Com',
    site_description: 'Premium Multi-vendor E-commerce Platform',
    primary_color: '#4f46e5',
    secondary_color: '#1e293b',
    font_family: "'Inter', sans-serif",
    items_per_page: '12',
    homepage_banner_text: 'Discover Premium Quality Products',
    custom_css: '/* Custom CSS here */',
    custom_html_head: '<!-- Head injection -->',
    custom_html_footer: '<!-- Footer injection -->',
    enable_dark_mode: 'false'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/users/settings');
      // Merge fetched settings with defaults
      setSettings(prev => ({ ...prev, ...res.data }));
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(settings);
      await Promise.all(entries.map(([key, value]) => 
        API.put('/users/settings', { key, value: String(value) })
      ));
      setLastSync(new Date().toLocaleTimeString());
      showSnack('Website configuration updated successfully', 'success');
    } catch (err) {
      showSnack('Failed to save website settings', 'error');
    } finally {
      setSaving(false);
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

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      minHeight: '100%',
      position: 'relative',
      background: '#f8fafc',
      overflow: 'hidden'
    }}>
      {/* Dynamic Background */}
      <Box sx={{ 
        position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', 
        background: `radial-gradient(circle, ${settings.primary_color}11 0%, transparent 70%)`,
        filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none'
      }} />

      {/* Header Section */}
      <Fade in={true} timeout={600}>
        <Box sx={{ 
          mb: 4, display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 
        }}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b', letterSpacing: '-0.02em', mb: 0.5 }}>
              Website & UI Management
            </Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Chip 
                label="Frontend Engine" 
                size="small" 
                sx={{ bgcolor: '#1e293b', color: '#fff', fontWeight: 800, fontSize: 10 }} 
              />
              {lastSync && (
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Last sync: {lastSync}
                </Typography>
              )}
            </Stack>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined"
              startIcon={<RestartAltRoundedIcon />}
              onClick={fetchSettings}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
            >
              Reset Changes
            </Button>
            <Button 
              variant="contained" 
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ 
                bgcolor: '#1e293b', 
                borderRadius: 3, 
                px: 3, 
                fontWeight: 800,
                textTransform: 'none',
                '&:hover': { bgcolor: '#334155' }
              }}
            >
              {saving ? 'Publishing...' : 'Publish Changes'}
            </Button>
          </Stack>
        </Box>
      </Fade>

      <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
        
        {/* Section 1: Brand & SEO */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#eff6ff', color: '#3b82f6' }}>
                <SearchRoundedIcon />
              </Box>
              <Typography variant="h6" fontWeight="800">Brand & SEO Identity</Typography>
            </Stack>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="caption" fontWeight="900" color="#64748b" sx={{ ml: 1, mb: 0.5, display: 'block' }}>SITE TITLE</Typography>
                <TextField
                  fullWidth size="small"
                  value={settings.site_name}
                  onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                  InputProps={{ sx: { borderRadius: 3, bgcolor: '#f8fafc' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" fontWeight="900" color="#64748b" sx={{ ml: 1, mb: 0.5, display: 'block' }}>META DESCRIPTION</Typography>
                <TextField
                  fullWidth multiline rows={2}
                  value={settings.site_description}
                  onChange={(e) => setSettings({...settings, site_description: e.target.value})}
                  InputProps={{ sx: { borderRadius: 3, bgcolor: '#f8fafc' } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Section 2: Visual Styling */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', height: '100%' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#fef2f2', color: '#ef4444' }}>
                <BrushRoundedIcon />
              </Box>
              <Typography variant="h6" fontWeight="800">Visual Styling</Typography>
            </Stack>

            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" fontWeight="900" color="#64748b" sx={{ ml: 1, mb: 1, display: 'block' }}>COLOR SYSTEM</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #f1f5f9' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <input 
                          type="color" 
                          value={settings.primary_color}
                          onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                          style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }} 
                        />
                        <Typography variant="caption" fontWeight="800">Primary</Typography>
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #f1f5f9' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <input 
                          type="color" 
                          value={settings.secondary_color}
                          onChange={(e) => setSettings({...settings, secondary_color: e.target.value})}
                          style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }} 
                        />
                        <Typography variant="caption" fontWeight="800">Secondary</Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="caption" fontWeight="900" color="#64748b" sx={{ ml: 1, mb: 1, display: 'block' }}>TYPOGRAPHY</Typography>
                <TextField
                  fullWidth size="small"
                  value={settings.font_family}
                  onChange={(e) => setSettings({...settings, font_family: e.target.value})}
                  InputProps={{ 
                    sx: { borderRadius: 3, bgcolor: '#f8fafc' },
                    startAdornment: <InputAdornment position="start"><TextFieldsRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment>
                  }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.enable_dark_mode === 'true'}
                    onChange={(e) => setSettings({...settings, enable_dark_mode: String(e.target.checked)})}
                  />
                }
                label={<Typography variant="body2" fontWeight="700">Enable Dark Mode Engine</Typography>}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Section 3: Layout & UX */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 4 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#f5f3ff', color: '#7c3aed' }}>
                <LayersRoundedIcon />
              </Box>
              <Typography variant="h6" fontWeight="800">Layout & Content Control</Typography>
            </Stack>

            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Typography variant="caption" fontWeight="900" color="#64748b" sx={{ ml: 1, mb: 1, display: 'block' }}>PRODUCT GRID LOAD</Typography>
                <TextField
                  fullWidth type="number" size="small"
                  value={settings.items_per_page}
                  onChange={(e) => setSettings({...settings, items_per_page: e.target.value})}
                  helperText="Maximum items to show per page scroll"
                  InputProps={{ sx: { borderRadius: 3, bgcolor: '#f8fafc' } }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="caption" fontWeight="900" color="#64748b" sx={{ ml: 1, mb: 1, display: 'block' }}>HERO BANNER HEADLINE</Typography>
                <TextField
                  fullWidth size="small"
                  value={settings.homepage_banner_text}
                  onChange={(e) => setSettings({...settings, homepage_banner_text: e.target.value})}
                  InputProps={{ 
                    sx: { borderRadius: 3, bgcolor: '#f8fafc' },
                    startAdornment: <InputAdornment position="start"><AutoFixHighRoundedIcon sx={{ fontSize: 18 }} /></InputAdornment>
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Section 4: Advanced Code Injection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #1e293b', bgcolor: '#1e293b', color: '#fff' }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 4 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', color: '#10b981' }}>
                <CodeRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="800">Custom Code Injections</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  Inject custom CSS or HTML directly into the frontend runtime
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" fontWeight="900" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1, mb: 1, display: 'block' }}>CUSTOM CSS (Override Styles)</Typography>
                <TextField
                  fullWidth multiline rows={6}
                  value={settings.custom_css}
                  onChange={(e) => setSettings({...settings, custom_css: e.target.value})}
                  sx={{ 
                    '& .MuiInputBase-root': { 
                      color: '#10b981', 
                      fontFamily: 'monospace', 
                      fontSize: 13,
                      bgcolor: 'rgba(0,0,0,0.2)',
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.1)'
                    } 
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" fontWeight="900" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1, mb: 1, display: 'block' }}>HTML HEAD INJECTION</Typography>
                <TextField
                  fullWidth multiline rows={6}
                  value={settings.custom_html_head}
                  onChange={(e) => setSettings({...settings, custom_html_head: e.target.value})}
                  placeholder="<script>...</script>"
                  sx={{ 
                    '& .MuiInputBase-root': { 
                      color: '#3b82f6', 
                      fontFamily: 'monospace', 
                      fontSize: 13,
                      bgcolor: 'rgba(0,0,0,0.2)',
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.1)'
                    } 
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" fontWeight="900" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1, mb: 1, display: 'block' }}>HTML FOOTER INJECTION</Typography>
                <TextField
                  fullWidth multiline rows={4}
                  value={settings.custom_html_footer}
                  onChange={(e) => setSettings({...settings, custom_html_footer: e.target.value})}
                  sx={{ 
                    '& .MuiInputBase-root': { 
                      color: '#f59e0b', 
                      fontFamily: 'monospace', 
                      fontSize: 13,
                      bgcolor: 'rgba(0,0,0,0.2)',
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.1)'
                    } 
                  }}
                />
              </Grid>
            </Grid>
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
