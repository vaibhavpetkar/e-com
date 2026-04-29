import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import { API } from '../../services/api';

export default function Signup({ toggleForm }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState(''); // Changed from mobile to name to match backend
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ADMIN'); // Ensure it matches role constants in backend (e.g. ADMIN)

  const [emailError, setEmailError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [roleError, setRoleError] = useState(false);

  const [emailHelperText, setEmailHelperText] = useState('');
  const [passwordHelperText, setPasswordHelperText] = useState('');
  const [confirmPasswordHelperText, setConfirmPasswordHelperText] = useState('');

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1; // Minimum length
    if (/[A-Z]/.test(password)) strength += 1; // Uppercase
    if (/[a-z]/.test(password)) strength += 1; // Lowercase
    if (/[0-9]/.test(password)) strength += 1; // Number
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Special character

    switch (strength) {
      case 0:
      case 1:
        return { text: 'Weak', color: 'error', value: 25 };
      case 2:
      case 3:
        return { text: 'Moderate', color: 'warning', value: 50 };
      case 4:
        return { text: 'Good', color: 'info', value: 75 };
      case 5:
        return { text: 'Strong', color: 'success', value: 100 };
      default:
        return { text: '', color: 'grey', value: 0 };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let hasError = false;

    // Email validation
    if (email === '') {
      setEmailError(true);
      setEmailHelperText('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError(true);
      setEmailHelperText('Invalid email format');
      hasError = true;
    } else {
      setEmailError(false);
      setEmailHelperText('');
    }

    // Name validation
    if (name === '') {
      setNameError(true);
      hasError = true;
    } else {
      setNameError(false);
    }

    // Password validation
    const currentPasswordStrength = getPasswordStrength(password);
    if (password === '') {
      setPasswordError(true);
      setPasswordHelperText('Password is required');
      hasError = true;
    } else if (currentPasswordStrength.value < 75) { // Require at least 'Good' strength
      setPasswordError(true);
      setPasswordHelperText('Password is too weak. Please include uppercase, lowercase, numbers, and special characters.');
      hasError = true;
    } else {
      setPasswordError(false);
      setPasswordHelperText('');
    }

    // Confirm Password validation
    if (confirmPassword === '') {
      setConfirmPasswordError(true);
      setConfirmPasswordHelperText('Confirm Password is required');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      setConfirmPasswordHelperText('Passwords do not match');
      hasError = true;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordHelperText('');
    }

    // Role validation
    if (role === '') {
      setRoleError(true);
      hasError = true;
    } else {
      setRoleError(false);
    }

    if (!hasError) {
      try {
        const res = await API.post("/auth/register", { name, email, password, role });
        alert(res.data); // e.g. "User created"
        if (res.data === "User created") {
          toggleForm(true); // Go back to login after signup
        }
      } catch (error) {
        console.error("Signup failed", error);
        alert("Signup failed due to an error.");
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          boxShadow: 6,
          borderRadius: 3,
          bgcolor: 'background.paper',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: 9,
          },
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'secondary.main' }}>
          Create Account
        </Typography>
        <Typography component="h2" variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
          Sign up for your admin panel
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(false); }}
            error={nameError}
            helperText={nameError && 'Name is required'}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(false); setEmailHelperText(''); }}
            error={emailError}
            helperText={emailHelperText}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(false); setPasswordHelperText(''); }}
            error={passwordError}
            helperText={passwordHelperText}
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Box sx={{ width: '100%', mb: 2, display: 'flex', alignItems: 'center' }}>
            <LinearProgress
              variant="determinate"
              value={passwordStrength.value}
              color={passwordStrength.color}
              sx={{ width: '80%', height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color={passwordStrength.color} sx={{ ml: 1, minWidth: 60, textAlign: 'right' }}>
              {passwordStrength.text}
            </Typography>
          </Box>
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(false); setConfirmPasswordHelperText(''); }}
            error={confirmPasswordError}
            helperText={confirmPasswordHelperText}
            variant="outlined"
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth margin="normal" error={roleError} variant="outlined" sx={{ mb: 3 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={role}
              label="Role"
              onChange={(e) => { setRole(e.target.value); setRoleError(false); }}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="EDITOR">Editor</MenuItem>
              <MenuItem value="VIEWER">Viewer</MenuItem>
            </Select>
            {roleError && <Typography variant="caption" color="error">Role is required</Typography>}
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 2, mb: 3, py: 1.5, borderRadius: 2, bgcolor: 'secondary.dark', '&:hover': { bgcolor: 'secondary.main' } }}
          >
            Sign Up
          </Button>
          <Link href="#" variant="body2" onClick={(e) => { e.preventDefault(); toggleForm(true); }} sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
            {'Already have an account? Sign In'}
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
