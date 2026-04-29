import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function UserSettings() {
  return (
    <Box sx={{ p: 4, bgcolor: '#f4f2ec', minHeight: '100%' }}>
      <Typography variant="h5" fontWeight="bold" color="#1a1d21" mb={3}>User Settings</Typography>
      <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">User management settings and permissions will appear here.</Typography>
      </Paper>
    </Box>
  );
}
