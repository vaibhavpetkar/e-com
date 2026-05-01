import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Fade, Typography } from '@mui/material';
import { API } from '../../services/api';
import SupportWidget from './SupportWidget';

export default function WebsiteEngine({ children }) {
  const [settings, setSettings] = useState(() => {
    const cached = sessionStorage.getItem('app_settings');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!settings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/users/settings');
        const s = res.data;
        setSettings(s);
        sessionStorage.setItem('app_settings', JSON.stringify(s));

        // 1. Update Metadata (Title, Description, Favicon)
        if (s.site_name) document.title = s.site_name;
        
        const updateMeta = (name, content) => {
            let el = document.querySelector(`meta[name="${name}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.name = name;
                document.head.appendChild(el);
            }
            el.content = content;
        };
        if (s.site_description) updateMeta('description', s.site_description);

        // 2. Global Styles (CSS Variables)
        const root = document.documentElement;
        if (s.primary_color) root.style.setProperty('--primary-color', s.primary_color);
        if (s.secondary_color) root.style.setProperty('--secondary-color', s.secondary_color);
        if (s.font_family) root.style.setProperty('--font-family', s.font_family);

        // 3. Custom CSS Injection
        let customStyle = document.getElementById('profitpulse-custom-css');
        if (!customStyle) {
          customStyle = document.createElement('style');
          customStyle.id = 'profitpulse-custom-css';
          document.head.appendChild(customStyle);
        }
        customStyle.innerHTML = s.custom_css || '';

        // 4. Header HTML Injection (Scripts etc.)
        if (s.custom_html_head) {
            const range = document.createRange();
            const documentFragment = range.createContextualFragment(s.custom_html_head);
            document.head.appendChild(documentFragment);
        }

      } catch (err) {
        console.error('WebsiteEngine: Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', bgcolor: '#131921' 
      }}>
        <CircularProgress sx={{ color: '#febd69', mb: 2 }} />
        <Typography variant="h6" fontWeight="900" sx={{ color: '#fff', letterSpacing: 2 }}>
            LOADING MARKETPLACE...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in timeout={800}>
        <Box sx={{ 
            minHeight: '100vh',
            fontFamily: settings?.font_family || 'Inter, sans-serif',
            bgcolor: settings?.enable_dark_mode === 'true' ? '#1a202c' : '#f1f5f9',
            color: settings?.enable_dark_mode === 'true' ? '#f7fafc' : '#1a202c'
        }}>
            {children}
            <SupportWidget />
            
            {/* Footer Injection */}
            {settings?.custom_html_footer && (
                <Box 
                    id="profitpulse-footer-injection" 
                    dangerouslySetInnerHTML={{ __html: settings.custom_html_footer }} 
                    sx={{ mt: 'auto' }}
                />
            )}
        </Box>
    </Fade>
  );
}
