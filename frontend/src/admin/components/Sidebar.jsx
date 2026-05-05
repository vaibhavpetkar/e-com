import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, IconButton, Collapse, Avatar, Typography, Tooltip, Divider, 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  useTheme, useMediaQuery, Fade
} from '@mui/material';

// Icons
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import InventoryRoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, isMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    window.addEventListener('userUpdated', loadUser);
    return () => window.removeEventListener('userUpdated', loadUser);
  }, []);

  const loadUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
    } catch (e) {
      console.error("Sidebar user load error", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const [productsExpanded, setProductsExpanded] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <DashboardRoundedIcon /> },
    { name: 'Website',   path: '/admin/settings/website', icon: <LanguageRoundedIcon /> },
    { name: 'Orders',    path: '/admin/orders', icon: <ShoppingBagRoundedIcon /> },
    { name: 'Customers', path: '/admin/customers', icon: <GroupRoundedIcon /> },
    { name: 'Messages',  path: '/admin/messages', icon: <ChatRoundedIcon /> },
  ];

  const productSubItems = [
    { name: 'All Products', path: '/admin/products', icon: <ShoppingCartRoundedIcon sx={{ fontSize: 18 }} /> },
    { name: 'Categories',   path: '/admin/categories', icon: <CategoryRoundedIcon sx={{ fontSize: 18 }} /> },
    { name: 'Stocks',       path: '/admin/products/stocks', icon: <InventoryRoundedIcon sx={{ fontSize: 18 }} /> },
  ];

  const settingItems = [
    { name: 'General', path: '/admin/settings/general', icon: <TuneRoundedIcon sx={{ fontSize: 18 }} /> },
    { name: 'Users',   path: '/admin/settings/users',   icon: <GroupRoundedIcon sx={{ fontSize: 18 }} /> },
    { name: 'Archive', path: '/admin/recycle-bin',      icon: <DeleteSweepRoundedIcon sx={{ fontSize: 18 }} /> },
    { name: 'Plugins', path: '/admin/settings/integration', icon: <ExtensionRoundedIcon sx={{ fontSize: 18 }} /> },
  ];

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#0f172a', // Deep slate blue-black
      color: '#94a3b8',
      p: 2,
      position: 'relative',
      boxShadow: '10px 0 30px rgba(0,0,0,0.1)'
    }}>
      {/* Brand Logo */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        px: 2, 
        py: 3, 
        mb: 4,
        justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start'
      }}>
        <Box sx={{ 
          minWidth: 40, height: 40, 
          bgcolor: '#6366f1', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#fff', 
          fontWeight: '900', 
          fontSize: '22px',
          boxShadow: '0 8px 16px -4px rgba(99,102,241,0.5)',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
        }}>P</Box>
        {(!collapsed || isMobile) && (
          <Typography variant="h6" fontWeight="900" sx={{ color: '#fff', letterSpacing: '-0.5px' }}>
            ProfitPulse
          </Typography>
        )}
      </Box>

      {/* Navigation List */}
      <List sx={{ flex: 1, px: 0 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip key={item.name} title={(collapsed && !isMobile) ? item.name : ""} placement="right">
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) onMobileClose();
                  }}
                  sx={{
                    borderRadius: '16px',
                    py: 1.5,
                    px: (collapsed && !isMobile) ? 0 : 2,
                    justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
                    bgcolor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    color: isActive ? '#fff' : 'inherit',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      '& .MuiListItemIcon-root': { color: '#6366f1' }
                    },
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0, top: '20%', bottom: '20%',
                      width: 4, borderRadius: '0 4px 4px 0',
                      bgcolor: '#6366f1',
                      boxShadow: '0 0 10px #6366f1'
                    } : {}
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: (collapsed && !isMobile) ? 0 : 40, 
                    color: isActive ? '#6366f1' : 'inherit',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText 
                      primary={item.name} 
                      slotProps={{ 
                        primary: { 
                          sx: { fontSize: '15px', fontWeight: isActive ? 700 : 500 } 
                        } 
                      }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}

        {/* Expandable Products */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => {
              if (collapsed && !isMobile) onToggle();
              setProductsExpanded(!productsExpanded);
            }}
            sx={{
              borderRadius: '16px',
              py: 1.5,
              px: (collapsed && !isMobile) ? 0 : 2,
              justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
              color: productsExpanded ? '#fff' : 'inherit',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#fff' }
            }}
          >
            <ListItemIcon sx={{ minWidth: (collapsed && !isMobile) ? 0 : 40, color: 'inherit', justifyContent: 'center' }}>
              <ShoppingCartRoundedIcon />
            </ListItemIcon>
            {(!collapsed || isMobile) && (
              <>
                <ListItemText 
                  primary="Products" 
                  slotProps={{ 
                    primary: { sx: { fontSize: '15px', fontWeight: 500 } } 
                  }} 
                />
                {productsExpanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </>
            )}
          </ListItemButton>
        </ListItem>

        <Collapse in={productsExpanded && (!collapsed || isMobile)} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: (collapsed && !isMobile) ? 0 : 4, mb: 1 }}>
            {productSubItems.map((sub) => {
              const subActive = location.pathname === sub.path;
              return (
                <ListItemButton
                  key={sub.name}
                  onClick={() => {
                    navigate(sub.path);
                    if (isMobile) onMobileClose();
                  }}
                  sx={{
                    borderRadius: '12px',
                    py: 1,
                    mb: 0.5,
                    color: subActive ? '#6366f1' : 'inherit',
                    '&:hover': { color: '#fff' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>{sub.icon}</ListItemIcon>
                  <ListItemText 
                    primary={sub.name} 
                    slotProps={{ 
                      primary: { sx: { fontSize: '13px', fontWeight: subActive ? 700 : 400 } } 
                    }} 
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>

        {/* Expandable Settings */}
        <ListItem disablePadding sx={{ mt: 2 }}>
          <ListItemButton
            onClick={() => {
              if (collapsed && !isMobile) onToggle();
              setSettingsExpanded(!settingsExpanded);
            }}
            sx={{
              borderRadius: '16px',
              py: 1.5,
              px: (collapsed && !isMobile) ? 0 : 2,
              justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
              color: settingsExpanded ? '#fff' : 'inherit',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#fff' }
            }}
          >
            <ListItemIcon sx={{ minWidth: (collapsed && !isMobile) ? 0 : 40, color: 'inherit', justifyContent: 'center' }}>
              <SettingsRoundedIcon />
            </ListItemIcon>
            {(!collapsed || isMobile) && (
              <>
                <ListItemText 
                  primary="Settings" 
                  slotProps={{ 
                    primary: { sx: { fontSize: '15px', fontWeight: 500 } } 
                  }} 
                />
                {settingsExpanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
              </>
            )}
          </ListItemButton>
        </ListItem>

        <Collapse in={settingsExpanded && (!collapsed || isMobile)} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: (collapsed && !isMobile) ? 0 : 4, mt: 1 }}>
            {settingItems.map((sub) => {
              const subActive = location.pathname === sub.path;
              return (
                <ListItemButton
                  key={sub.name}
                  onClick={() => {
                    navigate(sub.path);
                    if (isMobile) onMobileClose();
                  }}
                  sx={{
                    borderRadius: '12px',
                    py: 1,
                    mb: 0.5,
                    color: subActive ? '#6366f1' : 'inherit',
                    '&:hover': { color: '#fff' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>{sub.icon}</ListItemIcon>
                  <ListItemText 
                    primary={sub.name} 
                    slotProps={{ 
                      primary: { sx: { fontSize: '13px', fontWeight: subActive ? 700 : 400 } } 
                    }} 
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      </List>

      {/* Footer Profile Section */}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 3, borderStyle: 'dashed' }} />
        

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '16px',
            py: 1.5,
            color: '#ef4444',
            justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: (collapsed && !isMobile) ? 0 : 40, color: 'inherit', justifyContent: 'center' }}>
            <ExitToAppRoundedIcon />
          </ListItemIcon>
          {(!collapsed || isMobile) && (
            <ListItemText 
              primary="Sign Out" 
              slotProps={{ 
                primary: { sx: { fontSize: '15px', fontWeight: 700 } } 
              }} 
            />
          )}
        </ListItemButton>
      </Box>
      
      {/* Desktop Collapse Toggle (Bottom) */}
      {!isMobile && (
        <IconButton 
          onClick={onToggle}
          sx={{ 
            position: 'absolute', 
            right: -15, 
            top: 32, 
            zIndex: 100,
            bgcolor: '#6366f1', 
            color: '#fff', 
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            width: 32, height: 32,
            '&:hover': { bgcolor: '#4f46e5' }
          }}
        >
          {collapsed ? <MenuRoundedIcon sx={{ fontSize: 18 }} /> : <MenuOpenRoundedIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, border: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Persistent Sidebar */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: collapsed ? 88 : 280,
          flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          h: '100vh',
          zIndex: 1100,
        }}
      >
        <Box sx={{ 
          height: '100%', 
          position: 'fixed', 
          width: 'inherit',
          transition: 'inherit'
        }}>
          {drawerContent}
        </Box>
      </Box>
    </>
  );
}
