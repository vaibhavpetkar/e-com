import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Avatar, Switch,
  FormControlLabel, Alert, CircularProgress, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tooltip, IconButton, Snackbar,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import { API } from '../../services/api';

// ─── Country list (abbreviated) ───────────────
const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'China', 'Brazil', 'Other',
];

// ─── Section card wrapper ───────────────────────
function SectionCard({ title, children }) {
  return (
    <Box sx={{
      bgcolor: '#fff', borderRadius: 3, p: 4, mb: 3,
      boxShadow: '0 1px 8px 0 rgba(0,0,0,0.07)',
    }}>
      <Typography variant="h6" fontWeight="bold" color="#1a1d21" mb={3}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

// ─── Profile form row ───────────────────────────
function FormRow({ children }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
      {children}
    </Box>
  );
}

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
  const [country, setCountry]     = useState('');
  const [city, setCity]           = useState('');
  const [state, setState]         = useState('');
  const [zipCode, setZipCode]     = useState('');
  const [address, setAddress]     = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile]       = useState(null);

  // Admin settings
  const [isAdmin, setIsAdmin]                 = useState(false);
  const [requireVerification, setRequireVerification] = useState(false);
  const [settingLoading, setSettingLoading]   = useState(false);
  const [users, setUsers]         = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState({});

  // ── Load profile ─────────────────────────────
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let localUser = null;
    try { localUser = JSON.parse(userStr); } catch {}

    if (localUser?.role === 'ADMIN') setIsAdmin(true);

    API.get('/users/profile')
      .then((res) => {
        const u = res.data;
        setUser(u);
        setFirstName(u.first_name || '');
        setLastName(u.last_name  || '');
        setPhone(u.phone         || '');
        setCountry(u.country     || '');
        setCity(u.city           || '');
        setState(u.state         || '');
        setZipCode(u.zip_code    || '');
        setAddress(u.address     || '');
        if (u.avatar_url) setAvatarPreview(`http://localhost:5000${u.avatar_url}`);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Load admin settings + users ───────────────
  useEffect(() => {
    if (!isAdmin) return;

    // Settings
    API.get('/users/settings')
      .then((res) => {
        setRequireVerification(res.data.require_email_verification === 'true');
      })
      .catch(console.error);

    // User list
    setUsersLoading(true);
    API.get('/users/all')
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setUsersLoading(false));
  }, [isAdmin]);

  // ── Handle avatar pick ────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Save profile ──────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name',  lastName);
      formData.append('name', `${firstName} ${lastName}`.trim());
      formData.append('phone',    phone);
      formData.append('country',  country);
      formData.append('city',     city);
      formData.append('state',    state);
      formData.append('zip_code', zipCode);
      formData.append('address',  address);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setAvatarFile(null);
      showSnack('Profile updated successfully!', 'success');
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle verify-users setting ───────────────
  const handleVerificationToggle = async (checked) => {
    setSettingLoading(true);
    try {
      await API.put('/users/settings', {
        key: 'require_email_verification',
        value: String(checked),
      });
      setRequireVerification(checked);
      showSnack(
        checked
          ? 'Email verification is now REQUIRED for new users.'
          : 'Email verification is now OPTIONAL.',
        'success'
      );
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to update setting', 'error');
    } finally {
      setSettingLoading(false);
    }
  };

  // ── Resend verification for a user ────────────
  const handleResend = async (email) => {
    setResendLoading((p) => ({ ...p, [email]: true }));
    try {
      const res = await API.post('/auth/resend-verification', { email });
      showSnack(res.data.message, 'success');
    } catch (err) {
      showSnack(err.response?.data?.error || 'Failed to resend', 'error');
    } finally {
      setResendLoading((p) => ({ ...p, [email]: false }));
    }
  };

  const showSnack = (msg, severity = 'success') =>
    setSnack({ open: true, msg, severity });

  const getInitials = () => {
    const n = user?.name || `${firstName} ${lastName}`;
    return n?.trim().charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress sx={{ color: '#1a1d21' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f4f2ec', minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1d21">My Profile</Typography>
        <Button 
          variant="outlined" 
          startIcon={<HistoryIcon />} 
          onClick={() => navigate('/admin/audit-logs')}
          sx={{ borderRadius: 2, borderColor: '#1a1d21', color: '#1a1d21' }}
        >
          View Log History
        </Button>
      </Box>

      {/* ── Profile Card ── */}
      <SectionCard title="My Profile Details">
        {/* Avatar row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={avatarPreview}
              sx={{ width: 90, height: 90, bgcolor: '#1a1d21', fontSize: 32, fontWeight: 'bold' }}
            >
              {!avatarPreview && getInitials()}
            </Avatar>
            <IconButton
              size="small"
              onClick={() => fileRef.current.click()}
              sx={{
                position: 'absolute', bottom: -4, right: -4,
                bgcolor: '#22c55e', color: '#fff', width: 28, height: 28,
                '&:hover': { bgcolor: '#16a34a' },
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleAvatarChange} />
          </Box>
          <Box>
            <Typography fontWeight="bold" fontSize={18} color="#1a1d21">
              {user?.name || `${firstName} ${lastName}`.trim() || 'Your Name'}
            </Typography>
            <Chip
              label={user?.role || 'USER'}
              size="small"
              sx={{
                mt: 0.5, bgcolor: '#1a1d21', color: '#fff',
                fontSize: 11, fontWeight: 'bold', height: 22,
              }}
            />
            <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {/* Form fields */}
        <FormRow>
          <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth variant="outlined" />
          <TextField label="Country" value={country} onChange={(e) => setCountry(e.target.value)} fullWidth variant="outlined"
            select SelectProps={{ native: true }}
          >
            <option value=""></option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </TextField>
        </FormRow>

        <FormRow>
          <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth variant="outlined" />
          <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth variant="outlined" />
        </FormRow>

        <FormRow>
          <TextField label="Email" value={user?.email || ''} fullWidth variant="outlined" disabled />
          <TextField label="State" value={state} onChange={(e) => setState(e.target.value)} fullWidth variant="outlined" />
        </FormRow>

        <FormRow>
          <TextField label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth variant="outlined" />
          <TextField label="Zip Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} fullWidth variant="outlined" />
        </FormRow>

        <FormRow>
          <Box /> {/* spacer */}
          <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth variant="outlined" multiline rows={2} />
        </FormRow>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained" size="large" startIcon={<SaveIcon />}
            onClick={handleSaveProfile} disabled={saving}
            sx={{
              bgcolor: '#22c55e', color: '#fff', borderRadius: 3,
              px: 4, py: 1.5, fontWeight: 'bold',
              '&:hover': { bgcolor: '#16a34a' },
            }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : 'Update Information'}
          </Button>
        </Box>
      </SectionCard>

      {/* ── Admin Panel Tools (ADMIN ONLY) ── */}
      {isAdmin && (
        <SectionCard title="Admin Panel Tools">
          <Divider sx={{ mb: 3 }} />

          {/* Verify Users Toggle */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            p: 3, bgcolor: '#f8fafc', borderRadius: 2, mb: 3, border: '1px solid #e2e8f0',
          }}>
            <Box>
              <Typography fontWeight="bold" color="#1a1d21">Require Email Verification</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                When enabled, new users must verify their email before they can log in.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {settingLoading && <CircularProgress size={20} />}
              <Switch
                checked={requireVerification}
                onChange={(e) => handleVerificationToggle(e.target.checked)}
                disabled={settingLoading}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#22c55e' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#22c55e' },
                }}
              />
              <Chip
                label={requireVerification ? 'ON' : 'OFF'}
                size="small"
                sx={{
                  bgcolor: requireVerification ? '#dcfce7' : '#fee2e2',
                  color: requireVerification ? '#16a34a' : '#dc2626',
                  fontWeight: 'bold', minWidth: 44,
                }}
              />
            </Box>
          </Box>

          {/* Users Table */}
          <Typography fontWeight="bold" color="#1a1d21" mb={2}>
            All Users — Verification Status
          </Typography>
          {usersLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#1a1d21' }} />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={u.avatar_url ? `http://localhost:5000${u.avatar_url}` : ''}
                            sx={{ width: 32, height: 32, bgcolor: '#1a1d21', fontSize: 13 }}
                          >
                            {u.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">{u.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          size="small"
                          sx={{
                            bgcolor: u.role === 'ADMIN' ? '#ede9fe' : '#f1f5f9',
                            color: u.role === 'ADMIN' ? '#7c3aed' : '#475569',
                            fontWeight: 'bold', fontSize: 11,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {u.is_verified ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckCircleIcon sx={{ fontSize: 18, color: '#22c55e' }} />
                            <Typography variant="body2" color="#22c55e" fontWeight="bold">Verified</Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                            <Typography variant="body2" color="#f59e0b" fontWeight="bold">Pending</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {!u.is_verified && (
                          <Tooltip title="Resend verification email">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={resendLoading[u.email] ? <CircularProgress size={14} /> : <SendIcon />}
                              onClick={() => handleResend(u.email)}
                              disabled={resendLoading[u.email]}
                              sx={{
                                borderRadius: 2, fontSize: 12, borderColor: '#f59e0b',
                                color: '#f59e0b', '&:hover': { bgcolor: '#fffbeb' },
                              }}
                            >
                              Resend
                            </Button>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </SectionCard>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          severity={snack.severity}
          sx={{ borderRadius: 2, width: '100%' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
