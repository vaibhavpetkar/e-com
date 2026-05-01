import React, { useEffect, useState } from 'react';
import { API } from '../../services/api';

export default function WebsiteEngine({ children }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/users/settings');
        const s = res.data;
        setSettings(s);

        // 1. Update Metadata
        if (s.site_name) document.title = s.site_name;
        
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

      } catch (err) {
        console.error('WebsiteEngine: Failed to load settings', err);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className={settings?.enable_dark_mode === 'true' ? 'dark-theme' : ''}>
      {children}
      {/* Footer Injection */}
      {settings?.custom_html_footer && (
        <div 
          id="profitpulse-footer-injection" 
          dangerouslySetInnerHTML={{ __html: settings.custom_html_footer }} 
        />
      )}
    </div>
  );
}
