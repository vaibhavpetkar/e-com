import React, { useState } from 'react';
import {
  Container, Box, Typography, TextField, Button,
  Link, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton
} from '@mui/material';
import { Close as CloseIcon, Email as EmailIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API } from '../../services/api';

export default function Login({ toggleForm }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (v) => /\S+@\S+\.\S+/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setPendingVerification(false);
    let hasError = false;

    if (!email) {
      setEmailError(true); setEmailHelperText('Email is required'); hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError(true); setEmailHelperText('Invalid email format'); hasError = true;
    } else {
      setEmailError(false); setEmailHelperText('');
    }

    if (!password) {
      setPasswordError(true); hasError = true;
    } else {
      setPasswordError(false);
    }

    if (hasError) return;

    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.href = '/admin/dashboard';
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.pendingVerification) {
        setPendingVerification(true);
        setPendingEmail(data.email || email);
      } else {
        setServerError(data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMsg('');
    setResendLoading(true);
    try {
      const res = await API.post('/auth/resend-verification', { email: pendingEmail });
      setResendMsg(res.data.message);
    } catch (err) {
      setResendMsg(err.response?.data?.error || 'Failed to resend. Try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{
        marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center',
        p: 4, boxShadow: 6, borderRadius: 3, bgcolor: 'background.paper',
        transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 9 },
      }}>
        <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
          Welcome Back!
        </Typography>
        <Typography component="h2" variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
          Sign in to your admin account
        </Typography>

        {/* Server Error */}
        {serverError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal" required fullWidth id="email" label="Email Address"
            name="email" autoComplete="email" autoFocus
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(false); setEmailHelperText(''); }}
            error={emailError} helperText={emailHelperText}
            variant="outlined" sx={{ mb: 2 }}
          />
          <TextField
            margin="normal" required fullWidth name="password" label="Password"
            type="password" id="password" autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
            error={passwordError} helperText={passwordError && 'Password is required'}
            variant="outlined" sx={{ mb: 1 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Link
              href="#"
              variant="body2"
              onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
              sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
            >
              Forgot Password?
            </Link>
          </Box>

          <Button
            type="submit" fullWidth variant="contained" size="large" disabled={loading}
            sx={{ mt: 1, mb: 3, py: 1.5, borderRadius: 2, bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>

          <Link
            href="#" variant="body2"
            onClick={(e) => { e.preventDefault(); toggleForm(false); }}
            sx={{ color: 'secondary.main', '&:hover': { textDecoration: 'underline' } }}
          >
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Box>

      {/* Verification Required Popup */}
      <Dialog
        open={pendingVerification}
        onClose={() => setPendingVerification(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 400 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
          <EmailIcon color="warning" />
          Verify Your Email
          <IconButton
            onClick={() => setPendingVerification(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your account is registered but <strong>not yet verified</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            We sent a verification link to <strong>{pendingEmail}</strong>. Please check your inbox (and spam folder) to activate your account.
          </Typography>

          {resendMsg && (
            <Alert severity={resendMsg.includes('resent') ? "success" : "info"} sx={{ mb: 2, borderRadius: 2 }}>
              {resendMsg}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleResend}
            disabled={resendLoading}
            sx={{ bgcolor: '#1a1d21', borderRadius: 2, py: 1, '&:hover': { bgcolor: '#2d3748' } }}
          >
            {resendLoading ? <CircularProgress size={20} color="inherit" /> : 'Resend Verification Email'}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setPendingVerification(false)}
            sx={{ color: 'text.secondary' }}
          >
            Maybe Later
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}