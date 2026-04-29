import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Button, Container, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API } from '../../services/api';

export default function VerifyEmail() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hasCalled = React.useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    hasCalled.current = true;
    
    API.get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        // If we get an error but we already succeeded, don't overwrite
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The link may have expired.');
      });
  }, [searchParams]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1d21 0%, #2d3748 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            borderRadius: 4,
            p: { xs: 4, sm: 6 },
            textAlign: 'center',
            background: '#fff',
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, bgcolor: '#1a1d21',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: 20,
            }}>P</Box>
            <Typography variant="h5" fontWeight="bold" color="#1a1d21">ProfitPulse</Typography>
          </Box>

          {status === 'loading' && (
            <>
              <CircularProgress size={64} sx={{ color: '#1a1d21', mb: 3 }} />
              <Typography variant="h6" color="text.secondary">Verifying your email...</Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircleIcon sx={{ fontSize: 72, color: '#22c55e', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" color="#1a1d21" mb={1}>
                Email Verified!
              </Typography>
              <Typography color="text.secondary" mb={4}>{message}</Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/admin/login')}
                sx={{
                  bgcolor: '#1a1d21', borderRadius: 2, px: 6, py: 1.5,
                  '&:hover': { bgcolor: '#2d3748' },
                }}
              >
                Go to Login
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <CancelIcon sx={{ fontSize: 72, color: '#ef4444', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" color="#1a1d21" mb={1}>
                Verification Failed
              </Typography>
              <Typography color="text.secondary" mb={4}>{message}</Typography>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/admin/login')}
                sx={{ borderRadius: 2, px: 6, py: 1.5, borderColor: '#1a1d21', color: '#1a1d21' }}
              >
                Back to Login
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
