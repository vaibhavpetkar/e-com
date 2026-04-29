import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';
import { API } from '../../services/api';

export default function Login({ toggleForm }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [emailHelperText, setEmailHelperText] = useState('');

    const validateEmail = (email) => {
        // Basic email regex for demonstration
        return /\S+@\S+\.\S+/.test(email);
    };

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

        // Password validation
        if (password === '') {
            setPasswordError(true);
            hasError = true;
        } else {
            setPasswordError(false);
        }

        if (!hasError) {
            try {
                const res = await API.post("/auth/login", { email, password });
                if (res.data.token) {
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    window.location.href = "/admin/dashboard"; // Redirect after login
                } else {
                    alert(res.data); // e.g. "Wrong password"
                }
            } catch (error) {
                console.error("Login failed", error);
                alert("Login failed due to an error.");
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
                    p: 4, // Increased padding for a better look
                    boxShadow: 6, // Stronger shadow
                    borderRadius: 3, // More rounded corners
                    bgcolor: 'background.paper',
                    transition: 'box-shadow 0.3s ease-in-out', // Subtle transition
                    '&:hover': {
                        boxShadow: 9,
                    },
                }}
            >
                <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                    Welcome Back!
                </Typography>
                <Typography component="h2" variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
                    Sign in to your admin account
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(false); setEmailHelperText(''); }}
                        error={emailError}
                        helperText={emailHelperText}
                        variant="outlined" // Use outlined variant for a modern look
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
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
                        error={passwordError}
                        helperText={passwordError && 'Password is required'}
                        variant="outlined"
                        sx={{ mb: 3 }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large" // Larger button
                        sx={{ mt: 2, mb: 3, py: 1.5, borderRadius: 2, bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' } }}
                    >
                        Sign In
                    </Button>
                    <Link href="#" variant="body2" onClick={(e) => { e.preventDefault(); toggleForm(false); }} sx={{ color: 'secondary.main', '&:hover': { textDecoration: 'underline' } }}>
                        {"Don't have an account? Sign Up"}
                    </Link>
                </Box>
            </Box>
        </Container>
    );
}