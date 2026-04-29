import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1d21 0%, #2d3748 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.05)',
            width: `${(i + 1) * 180}px`,
            height: `${(i + 1) * 180}px`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `pulse${i} ${3 + i}s ease-in-out infinite alternate`,
          }}
        />
      ))}

      <Container maxWidth="sm" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 6 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2, bgcolor: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#1a1d21', fontWeight: 'bold', fontSize: 22,
          }}>P</Box>
          <Typography variant="h5" fontWeight="bold" color="#fff">ProfitPulse</Typography>
        </Box>

        {/* 404 number */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '8rem', sm: '11rem' },
            fontWeight: 900,
            color: 'transparent',
            WebkitTextStroke: '2px rgba(255,255,255,0.15)',
            lineHeight: 1,
            mb: 0,
            userSelect: 'none',
            letterSpacing: '-4px',
          }}
        >
          404
        </Typography>

        {/* Ghost icon */}
        <Box sx={{ fontSize: '4rem', mb: 2, lineHeight: 1 }}>👻</Box>

        <Typography variant="h4" fontWeight="bold" color="#fff" mb={1.5}>
          Page Not Found
        </Typography>

        <Typography
          color="rgba(255,255,255,0.55)"
          mb={1}
          sx={{ fontSize: '1rem', lineHeight: 1.7 }}
        >
          The page{' '}
          <Box
            component="code"
            sx={{
              bgcolor: 'rgba(255,255,255,0.08)', px: 1, py: 0.3,
              borderRadius: 1, fontSize: '0.9rem', color: '#94a3b8',
            }}
          >
            {location.pathname}
          </Box>
          {' '}doesn&apos;t exist.
        </Typography>

        <Typography color="rgba(255,255,255,0.4)" mb={5} sx={{ fontSize: '0.9rem' }}>
          It might have been moved, deleted, or you may have typed the URL incorrectly.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/admin/dashboard')}
            sx={{
              bgcolor: '#fff', color: '#1a1d21', borderRadius: 3,
              px: 4, py: 1.4, fontWeight: 'bold', fontSize: '0.95rem',
              '&:hover': { bgcolor: '#f1f5f9' },
            }}
          >
            🏠 Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate(-1)}
            sx={{
              borderColor: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 3,
              px: 4, py: 1.4, fontWeight: 'bold', fontSize: '0.95rem',
              '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            ← Go Back
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
