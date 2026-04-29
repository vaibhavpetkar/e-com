import React, { useState, useRef } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { API } from '../../services/api';

// Step indicator
const steps = ['Enter Email', 'Verify OTP', 'New Password'];

function StepIndicator({ current }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
      {steps.map((label, idx) => (
        <React.Fragment key={label}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '50%',
              bgcolor: idx <= current ? '#1a1d21' : '#e5e7eb',
              color: idx <= current ? '#fff' : '#9ca3af',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: 14,
              transition: 'all 0.3s',
            }}>
              {idx + 1}
            </Box>
            <Typography variant="caption" sx={{ color: idx <= current ? '#1a1d21' : '#9ca3af', fontWeight: idx === current ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
              {label}
            </Typography>
          </Box>
          {idx < steps.length - 1 && (
            <Box sx={{ flex: 1, height: 2, bgcolor: idx < current ? '#1a1d21' : '#e5e7eb', mx: 1, mb: 2.5, transition: 'all 0.3s' }} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=email, 1=otp, 2=newpassword
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const otpRefs = useRef([]);

  // ── STEP 1: Send OTP ────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.'); return;
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setSuccess(res.data.message);
      setTimeout(() => { setSuccess(''); setStep(1); }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input handling ───────────────────────────
  const handleOtpChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[idx] = value;
    setOtp(updated);
    if (value && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // ── STEP 2: Verify OTP ──────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    const otpValue = otp.join('');
    if (otpValue.length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    try {
      const res = await API.post('/auth/verify-otp', { email, otp: otpValue });
      setResetToken(res.data.resetToken);
      setSuccess('OTP verified!');
      setTimeout(() => { setSuccess(''); setStep(2); }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 3: Reset Password ──────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', { resetToken, newPassword });
      setSuccess(res.data.message);
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1d21 0%, #2d3748 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Container maxWidth="sm">
        <Paper elevation={12} sx={{ borderRadius: 4, p: { xs: 4, sm: 6 }, background: '#fff' }}>
          {/* Logo */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, bgcolor: '#1a1d21',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: 20,
            }}>P</Box>
            <Typography variant="h5" fontWeight="bold" color="#1a1d21">ProfitPulse</Typography>
          </Box>

          <Typography variant="h5" fontWeight="bold" textAlign="center" mb={0.5} color="#1a1d21">
            {step === 0 && 'Forgot Password'}
            {step === 1 && 'Verify OTP'}
            {step === 2 && 'Set New Password'}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            {step === 0 && 'Enter your registered email to receive an OTP'}
            {step === 1 && `Enter the 6-digit code sent to ${email}`}
            {step === 2 && 'Choose a strong new password'}
          </Typography>

          <StepIndicator current={step} />

          {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

          {/* ── STEP 0: Email ── */}
          {step === 0 && (
            <Box component="form" onSubmit={handleSendOtp}>
              <TextField
                fullWidth required label="Email Address" type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#9ca3af' }} /></InputAdornment>,
                }}
                sx={{ mb: 3 }} variant="outlined"
              />
              <Button
                type="submit" fullWidth variant="contained" size="large" disabled={loading}
                sx={{ bgcolor: '#1a1d21', borderRadius: 2, py: 1.5, '&:hover': { bgcolor: '#2d3748' } }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
              </Button>
            </Box>
          )}

          {/* ── STEP 1: OTP ── */}
          {step === 1 && (
            <Box component="form" onSubmit={handleVerifyOtp}>
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mb: 4 }}>
                {otp.map((digit, idx) => (
                  <TextField
                    key={idx}
                    inputRef={(el) => (otpRefs.current[idx] = el)}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    inputProps={{
                      maxLength: 1, style: {
                        textAlign: 'center', fontSize: 28, fontWeight: 'bold',
                        padding: '12px 0', width: 48,
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: digit ? '#f0fdf4' : '#f9fafb',
                      },
                    }}
                  />
                ))}
              </Box>
              <Button
                type="submit" fullWidth variant="contained" size="large" disabled={loading}
                sx={{ bgcolor: '#1a1d21', borderRadius: 2, py: 1.5, mb: 2, '&:hover': { bgcolor: '#2d3748' } }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
              </Button>
              <Button
                fullWidth variant="text" size="small"
                onClick={() => { setStep(0); setOtp(['','','','','','']); setError(''); }}
                sx={{ color: '#6b7280' }}
              >
                Resend OTP
              </Button>
            </Box>
          )}

          {/* ── STEP 2: New Password ── */}
          {step === 2 && (
            <Box component="form" onSubmit={handleResetPassword}>
              <TextField
                fullWidth required label="New Password"
                type={showPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOpenIcon sx={{ color: '#9ca3af' }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw(!showPw)} edge="end">
                        {showPw ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }} variant="outlined"
              />
              <TextField
                fullWidth required label="Confirm Password"
                type={showPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 3 }} variant="outlined"
              />
              <Button
                type="submit" fullWidth variant="contained" size="large" disabled={loading}
                sx={{ bgcolor: '#1a1d21', borderRadius: 2, py: 1.5, '&:hover': { bgcolor: '#2d3748' } }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
              </Button>
            </Box>
          )}

          {/* Back to login */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="text" size="small" onClick={() => navigate('/admin/login')} sx={{ color: '#6b7280' }}>
              ← Back to Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
