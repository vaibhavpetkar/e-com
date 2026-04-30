import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  Box, useMediaQuery, useTheme, IconButton, AppBar, Toolbar, 
  Typography, Avatar, Menu, MenuItem, ListItemIcon, Divider, 
  Tooltip, Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';

export default function AdminLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    window.addEventListener('userUpdated', loadUser);
    return () => window.removeEventListener('userUpdated', loadUser);
  }, []);

  const loadUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  // Get Page Title from path
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (!path || path === 'dashboard') return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', bgcolor: '#f8fafc', overflow: 'hidden' }}>
      
      {/* Sidebar handles both Mobile (Drawer) and Desktop (Persistent) */}
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Global Header */}
        <AppBar 
          position="static" 
          sx={{ 
            bgcolor: '#fff', 
            color: '#1e293b', 
            boxShadow: 'none', 
            borderBottom: '1px solid #e2e8f0',
            zIndex: 10
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#6366f1' }}>
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" fontWeight="800" sx={{ color: '#1e293b', display: { xs: 'none', sm: 'block' } }}>
                {getPageTitle()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 3 } }}>
              <Tooltip title="Notifications">
                <IconButton size="small" sx={{ color: '#64748b' }}>
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ my: 2, display: { xs: 'none', sm: 'block' } }} />

              {/* User Menu Trigger */}
              <Box 
                onClick={handleProfileMenuOpen}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  cursor: 'pointer',
                  p: 0.5,
                  pr: { xs: 0.5, sm: 2 },
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#f1f5f9' }
                }}
              >
                <Avatar 
                  src={user?.avatar_url ? `http://localhost:5000${user.avatar_url}` : ''}
                  sx={{ 
                    width: 36, height: 36, 
                    bgcolor: '#6366f1',
                    border: '2px solid #eef2ff'
                  }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" fontWeight="700" color="#1e293b" noWrap>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: 10 }}>{user?.role}</Typography>
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* User Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.1))',
              mt: 1.5,
              borderRadius: '16px',
              minWidth: 200,
              border: '1px solid #e2e8f0',
              '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight="800">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => navigate('/admin/profile')}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={() => navigate('/admin/settings/general')}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            Account Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {/* Content Container */}
        <Box sx={{ 
          flex: 1, 
          p: { xs: 2, md: 3 }, 
          overflowY: 'auto',
          bgcolor: '#f8fafc'
        }}>
          <Box sx={{ 
            bgcolor: '#fff', 
            borderRadius: '24px', 
            minHeight: '100%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
