import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Button, TextField, Container, Typography, Card, Alert,
    CircularProgress, Stepper, Step, StepLabel, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, ArrowBack } from '@mui/icons-material';
import { API } from '../../services/api';
import OTPInput from '../components/OTPInput';

/**
 * CustomerSignup Component
 * Multi-step signup process: Email/Password → OTP Verification
 */
const CustomerSignup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // Step 1: Email/Password, Step 2: OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Step 1: Registration
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Step 2: OTP Verification
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Validation
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    // Step 1: Submit signup form
    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email');
            return;
        }

        if (!validatePassword(formData.password)) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await API.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            setSuccess(response.data.message);
            setStep(2);
            // Start resend timer
            setResendTimer(60);
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setOtpError('');

        if (otp.length !== 6) {
            setOtpError('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            await API.post('/auth/verify-email-otp', {
                email: formData.email,
                otp: otp,
            });

            setSuccess('Email verified successfully!');
            setTimeout(() => {
                // Auto-login or redirect to login
                navigate('/login?verified=true', { state: { email: formData.email } });
            }, 1500);
        } catch (err) {
            setOtpError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendTimer > 0) return;

        setResendLoading(true);
        try {
            await API.post('/auth/resend-otp', {
                email: formData.email,
            });
            setSuccess('OTP resent! Check your email.');
            setResendTimer(60);
            setOtp('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    // Timer for resend button
    React.useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

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
                    position: 'relative',
                }}>
                    {/* Back Button */}
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/')}
                        sx={{ mb: 2, textTransform: 'none' }}
                    >
                        Back to Shopping
                    </Button>

                    {/* Header */}
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: '900', mb: 1, color: '#1a1d21' }}>
                            Create Account
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Join us to start shopping and place your first order
                        </Typography>
                    </Box>

                    {/* Stepper */}
                    <Stepper activeStep={step - 1} sx={{ mb: 4 }}>
                        <Step>
                            <StepLabel>Details</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Verify Email</StepLabel>
                        </Step>
                    </Stepper>

                    {/* Messages */}
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {otpError && <Alert severity="error" sx={{ mb: 3 }}>{otpError}</Alert>}
                    {success && (
                        <Alert severity="success" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ fontSize: 20 }} />
                            {success}
                        </Alert>
                    )}

                    {/* Step 1: Signup Form */}
                    {step === 1 && (
                        <Box component="form" onSubmit={handleSignup}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={loading}
                                sx={{ mb: 3 }}
                            />

                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={loading}
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
                                sx={{ mb: 3 }}
                            />

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                disabled={loading}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                edge="end"
                                                tabIndex={-1}
                                            >
                                                {showConfirm ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 4 }}
                            />

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
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                            </Button>

                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    Already have an account?{' '}
                                    <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}>
                                        Log In
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <Box component="form" onSubmit={handleVerifyOtp}>
                            <Box sx={{ mb: 4, textAlign: 'center' }}>
                                <Typography variant="body1" sx={{ mb: 2, color: '#1a1d21' }}>
                                    We've sent a verification code to
                                </Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: '600', color: '#6366f1', mb: 3 }}>
                                    {formData.email}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: '#64748b' }}>
                                    Enter the 6-digit code below
                                </Typography>
                                <OTPInput
                                    otp={otp}
                                    onChange={setOtp}
                                    disabled={loading}
                                    error={!!otpError}
                                />
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                sx={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    py: 1.5,
                                    fontWeight: '600',
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    mb: 2,
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Email'}
                            </Button>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                                    Didn't receive the code?
                                </Typography>
                                <Button
                                    disabled={resendTimer > 0 || resendLoading}
                                    onClick={handleResendOtp}
                                    sx={{ textTransform: 'none', fontWeight: '600', color: '#6366f1' }}
                                >
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Card>
            </Container>
        </Box>
    );
};

export default CustomerSignup;
