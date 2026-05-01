import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import {
    Box, Button, TextField, Container, Typography, Card, Alert,
    CircularProgress, InputAdornment, IconButton, Checkbox, FormControlLabel
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { API } from '../../services/api';

/**
 * CustomerLogin Component
 * Login page for customers
 */
const CustomerLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [formData, setFormData] = useState({
        email: localStorage.getItem('remembered_email') || '',
        password: '',
    });

    // Check if email was verified and show success message
    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setSuccess('Email verified! You can now log in.');
            if (location.state?.email) {
                setFormData((prev) => ({ ...prev, email: location.state.email }));
            }
        }
    }, [searchParams, location.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return;
        }

        setLoading(true);
        try {
            const response = await API.post('/auth/login', {
                email: formData.email,
                password: formData.password,
            });

            const { token, user } = response.data;

            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Remember email if checkbox is checked
            if (rememberMe) {
                localStorage.setItem('remembered_email', formData.email);
            } else {
                localStorage.removeItem('remembered_email');
            }

            setSuccess('Login successful! Redirecting...');

            // Redirect based on cart state or to checkout
            setTimeout(() => {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                if (cart.length > 0) {
                    navigate('/checkout');
                } else {
                    navigate('/');
                }
            }, 1000);
        } catch (err) {
            if (err.response?.data?.pendingVerification) {
                setError('Email not verified. Please check your email for a verification link.');
            } else {
                setError(err.response?.data?.error || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 4,
        }}>
            <Container maxWidth="sm">
                <Card sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}>
                    {/* Header */}
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: '900', mb: 1, color: '#1a1d21' }}>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Log in to your account to continue shopping
                        </Typography>
                    </Box>

                    {/* Messages */}
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {success && (
                        <Alert severity="success" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ fontSize: 20 }} />
                            {success}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <Box component="form" onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="you@example.com"
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="Enter your password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />

                        {/* Remember Me & Forgot Password */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        disabled={loading}
                                    />
                                }
                                label="Remember me"
                                sx={{ '& .MuiTypography-root': { fontSize: '14px' } }}
                            />
                            <Link
                                to="/forgot-password"
                                style={{
                                    textDecoration: 'none',
                                    color: '#6366f1',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                }}
                            >
                                Forgot Password?
                            </Link>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            disabled={loading}
                            sx={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                py: 1.5,
                                fontWeight: '600',
                                textTransform: 'none',
                                fontSize: '16px',
                                mb: 3,
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Don't have an account?{' '}
                                <Link
                                    to="/signup"
                                    style={{
                                        color: '#6366f1',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                    }}
                                >
                                    Sign Up
                                </Link>
                            </Typography>
                        </Box>
                    </Box>

                    {/* Continue Shopping Button */}
                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e2e8f0' }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate('/')}
                            sx={{
                                borderColor: '#cbd5e1',
                                color: '#64748b',
                                textTransform: 'none',
                                fontWeight: '600',
                                '&:hover': {
                                    borderColor: '#6366f1',
                                    color: '#6366f1',
                                    backgroundColor: 'transparent',
                                },
                            }}
                        >
                            Continue Shopping
                        </Button>
                    </Box>
                </Card>
            </Container>
        </Box>
    );
};

export default CustomerLogin;
