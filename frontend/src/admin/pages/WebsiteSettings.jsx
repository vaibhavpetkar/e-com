import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function WebsiteSettings() {
  return (
    <Box sx={{ p: 4, bgcolor: '#f4f2ec', minHeight: '100%' }}>
      <Typography variant="h5" fontWeight="bold" color="#1a1d21" mb={3}>Website Settings</Typography>
      <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Global website configuration (SEO, Logo, Meta) will appear here.</Typography>
      </Paper>
    </Box>
  );
}
