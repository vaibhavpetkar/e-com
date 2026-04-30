import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Avatar, Alert, CircularProgress, 
  Chip, Divider, Paper, IconButton, Snackbar, Autocomplete, Grid,
  Card, CardContent, Stack, LinearProgress, Fade, Zoom, InputAdornment
} from '@mui/material';

import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PublicIcon from '@mui/icons-material/Public';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import HomeIcon from '@mui/icons-material/Home';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import { API } from '../../services/api';

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'China', 'Brazil', 'Italy', 'Spain', 
  'Russia', 'South Africa', 'Mexico', 'Singapore', 'UAE', 'Other'
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const fileRef = useRef();

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [country, setCountry]     = useState(null);
  const [city, setCity]           = useState('');
  const [state, setState]         = useState('');
  const [zipCode, setZipCode]     = useState('');
  const [address, setAddress]     = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile]       = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users/profile');
      const u = res.data;
      setUser(u);
      setFirstName(u.first_name || '');
      setLastName(u.last_name  || '');
      setPhone(u.phone         || '');
      setCountry(u.country || null);
      setCity(u.city           || '');
      setState(u.state         || '');
      setZipCode(u.zip_code    || '');
      setAddress(u.address     || '');
      if (u.avatar_url) {
        setAvatarPreview(`http://localhost:5000${u.avatar_url}`);
      }
    } catch (err) {
      showSnack('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      showSnack('Image size should be less than 2MB', 'warning');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!firstName || !lastName) {
      showSnack('First and Last name are required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name',  lastName);
      formData.append('name', `${firstName} ${lastName}`.trim());
      formData.append('phone',    phone);
      formData.append('country',  country || '');
      formData.append('city',     city);
      formData.append('state',    state);
      formData.append('zip_code', zipCode);
      formData.append('address',  address);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvatarFile(null);
      
      showSnack('Profile updated successfully!', 'success');
      window.dispatchEvent(new Event('userUpdated'));
      
    } catch (err) {
      console.error(err);
      showSnack(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  const calculateCompletion = () => {
    const fields = [firstName, lastName, phone, country, city, state, zipCode, address, avatarPreview];
    const filled = fields.filter(f => !!f).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completion = calculateCompletion();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2 }}>
        <CircularProgress thickness={5} size={60} sx={{ color: '#6366f1' }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>LOADING PROFILE...</Typography>
      </Box>
    );
  }

  return (
    <Fade in={!loading} timeout={800}>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'center', md: 'flex-start' }, 
          mb: 4, 
          gap: 3,
          textAlign: { xs: 'center', md: 'left' }
        }}>
          <Box>
            <Typography variant="h4" fontWeight="900" color="#1e293b" sx={{ letterSpacing: '-0.5px' }}>My Account</Typography>
            <Typography variant="body1" color="text.secondary">Configure your profile and manage preferences</Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'center', md: 'flex-end' }
          }}>
             <Button 
              variant="outlined" 
              startIcon={<HistoryIcon />} 
              onClick={() => navigate('/admin/audit-logs')}
              sx={{ 
                borderRadius: '12px', 
                color: '#64748b',
                borderColor: '#e2e8f0',
                textTransform: 'none',
                px: 2,
                '&:hover': { bgcolor: '#fff', borderColor: '#cbd5e1' }
              }}
            >
              Logs
            </Button>
            <Button 
              variant="contained" 
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
              onClick={handleSaveProfile}
              disabled={saving}
              sx={{ 
                borderRadius: '12px', 
                bgcolor: '#6366f1', 
                '&:hover': { bgcolor: '#4f46e5' },
                textTransform: 'none',
                px: 4,
                fontWeight: 700,
                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
              }}
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - User Info Card */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={4}>
              <Card sx={{ 
                borderRadius: 6, 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
                overflow: 'visible',
                position: 'relative',
                pt: 6
              }}>
                <CardContent sx={{ px: 4, pb: 4 }}>
                  <Box sx={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)' }}>
                    <Zoom in={true} timeout={500}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={avatarPreview}
                          sx={{ 
                            width: 120, height: 120, 
                            border: '6px solid #fff',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            bgcolor: '#f1f5f9',
                            fontSize: 40, fontWeight: 900, color: '#6366f1'
                          }}
                        >
                          {!avatarPreview && firstName?.charAt(0)}
                        </Avatar>
                        <IconButton
                          size="small"
                          onClick={() => fileRef.current.click()}
                          sx={{
                            position: 'absolute', bottom: 5, right: 5,
                            bgcolor: '#6366f1', color: '#fff', 
                            '&:hover': { bgcolor: '#4f46e5' },
                            boxShadow: '0 4px 10px rgba(99,102,241,0.5)',
                            p: 1
                          }}
                        >
                          <PhotoCameraIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                      </Box>
                    </Zoom>
                  </Box>

                  <Box sx={{ textAlign: 'center', mt: 2, mb: 4 }}>
                    <Typography variant="h5" fontWeight="800" color="#1e293b">
                      {firstName} {lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{user?.email}</Typography>
                    <Chip
                      label={user?.role}
                      icon={<VerifiedUserIcon style={{ fontSize: 16, color: '#fff' }} />}
                      sx={{
                        mt: 2, bgcolor: user?.role === 'ADMIN' ? '#6366f1' : '#1e293b',
                        color: '#fff', fontWeight: 800, fontSize: 11,
                        px: 1, py: 2, borderRadius: '8px'
                      }}
                    />
                  </Box>

                  <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                  <Typography variant="subtitle2" fontWeight="800" color="#1e293b" mb={2}>Profile Completion</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={completion} 
                      sx={{ 
                        flex: 1, height: 8, borderRadius: 5, bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': { bgcolor: completion > 80 ? '#22c55e' : '#6366f1' }
                      }} 
                    />
                    <Typography variant="body2" fontWeight="800" color={completion > 80 ? '#22c55e' : '#6366f1'}>{completion}%</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {completion < 100 ? 'Fill all fields to reach 100% completion.' : 'Perfect! Your profile is complete.'}
                  </Typography>
                </CardContent>
              </Card>

              {/* Status Alert */}
              {!user?.is_verified && (
                <Alert 
                  severity="warning" 
                  icon={<WarningAmberIcon />}
                  sx={{ borderRadius: 4, fontWeight: 600, border: '1px solid #fed7aa' }}
                >
                  Your email is not verified. Please check your inbox for the verification link.
                </Alert>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Edit Form */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ borderRadius: 6, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="800" color="#1e293b" mb={4}>Account Information</Typography>
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      label="First Name" 
                      fullWidth 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      variant="filled"
                      slotProps={{ 
                        input: { 
                          disableUnderline: true,
                          sx: { borderRadius: '12px', bgcolor: '#f8fafc' },
                          startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>
                        },
                        inputLabel: { shrink: true }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      label="Last Name" 
                      fullWidth 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      variant="filled"
                      slotProps={{ 
                        input: { 
                          disableUnderline: true,
                          sx: { borderRadius: '12px', bgcolor: '#f8fafc' }
                        },
                        inputLabel: { shrink: true }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      label="Phone Number" 
                      fullWidth 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      variant="filled"
                      slotProps={{ 
                        input: { 
                          disableUnderline: true,
                          sx: { borderRadius: '12px', bgcolor: '#f8fafc' },
                          startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>
                        },
                        inputLabel: { shrink: true }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      value={country}
                      onChange={(event, newValue) => setCountry(newValue)}
                      options={COUNTRIES}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Country" 
                          variant="filled"
                          slotProps={{ 
                            input: { 
                              ...params.InputProps,
                              disableUnderline: true,
                              sx: { borderRadius: '12px', bgcolor: '#f8fafc' },
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <PublicIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                                  </InputAdornment>
                                  {params.InputProps?.startAdornment}
                                </>
                              )
                            },
                            inputLabel: { shrink: true }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={12}><Divider sx={{ my: 1, borderStyle: 'dashed' }} /></Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      label="City" 
                      fullWidth 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      variant="filled"
                      slotProps={{ 
                        input: { 
                          disableUnderline: true,
                          sx: { borderRadius: '12px', bgcolor: '#f8fafc' },
                          startAdornment: <InputAdornment position="start"><LocationCityIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>
                        },
                        inputLabel: { shrink: true }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      label="State / Province" 
                      fullWidth 
                      value={state} 
                      onChange={(e) => setState(e.target.value)}
                      variant="filled"
                      slotProps={{ 
                        input: { 
                          disableUnderline: true,
                          sx: { borderRadius: '12px', bgcolor: '#f8fafc' }
                        },
                        inputLabel: { shrink: true }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField 
                      label="Zip Code" 
                      fullWidth 
                      value={zipCode} 
                      onChange={(e) => setZipCode(e.target.value)}
                      variant="filled"
                      slotProps={{ 
                        input: { 
                          disableUnderline: true,
                          sx: { borderRadius: '12px', bgcolor: '#f8fafc' }
                        },
                        inputLabel: { shrink: true }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField 
                      label="Complete Address" 
                      fullWidth 
                      multiline 
                      rows={3} 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      variant="filled"
                      slotProps={{ 
                        input: { 
                          disableUnderline: true,
                          sx: { borderRadius: '12px', bgcolor: '#f8fafc' },
                          startAdornment: <InputAdornment position="start" sx={{ mt: 1, alignSelf: 'flex-start' }}><HomeIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>
                        },
                        inputLabel: { shrink: true }
                      }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Box sx={{ 
                      p: 3, bgcolor: '#fef2f2', borderRadius: 4, 
                      border: '1px solid #fee2e2', mt: 2,
                      display: 'flex', alignItems: 'center', gap: 2
                    }}>
                      <EmailIcon sx={{ color: '#ef4444' }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="800" color="#b91c1c">Security Notice</Typography>
                        <Typography variant="body2" color="#7f1d1d">
                          Your email address <strong>{user?.email}</strong> is used for login and cannot be changed here. Contact support for email changes.
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          open={snack.open}
          autoHideDuration={5000}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnack((p) => ({ ...p, open: false }))} 
            severity={snack.severity} 
            variant="filled"
            sx={{ borderRadius: 3, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%' }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}
