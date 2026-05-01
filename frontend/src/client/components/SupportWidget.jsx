import React, { useState } from 'react';
import { 
  Box, Fab, Zoom, Paper, Typography, TextField, 
  Button, Stack, IconButton, Badge, Fade
} from '@mui/material';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { API } from '../../services/api';

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setSending(true);
    try {
        await API.post('/messages', { 
            message,
            customer_name: 'Guest User', // Or fetch from profile
            customer_email: 'guest@example.com'
        });
        setSent(true);
        setMessage('');
        setTimeout(() => {
            setSent(false);
            setOpen(false);
        }, 3000);
    } catch (err) {
        console.error('Failed to send message');
    } finally {
        setSending(false);
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 2000 }}>
      <Zoom in style={{ transitionDelay: '1000ms' }}>
        <Fab 
          color="primary" 
          onClick={() => setOpen(!open)}
          sx={{ bgcolor: '#131921', color: '#febd69', '&:hover': { bgcolor: '#232f3e' } }}
        >
          {open ? <CloseRoundedIcon /> : <ChatRoundedIcon />}
        </Fab>
      </Zoom>

      <Fade in={open}>
        <Paper sx={{ 
            position: 'absolute', bottom: 80, right: 0, 
            width: 320, borderRadius: 6, overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: open ? 'block' : 'none'
        }}>
          <Box sx={{ bgcolor: '#131921', color: '#fff', p: 3 }}>
            <Typography variant="h6" fontWeight="900">Support Chat</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>We're online. How can we help?</Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {sent ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography fontWeight="800" color="primary">Message Sent!</Typography>
                    <Typography variant="body2">We'll get back to you soon.</Typography>
                </Box>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField 
                            placeholder="Type your message..." 
                            multiline 
                            rows={4} 
                            fullWidth
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <Button 
                            type="submit"
                            variant="contained" 
                            disabled={sending}
                            fullWidth
                            endIcon={<SendRoundedIcon />}
                            sx={{ borderRadius: 3, bgcolor: '#febd69', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#f3a847' } }}
                        >
                            {sending ? 'Sending...' : 'Send Message'}
                        </Button>
                    </Stack>
                </form>
            )}
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
}
