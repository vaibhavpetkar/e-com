import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, ListItemIcon } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal';
import LogHistoryModal from '../components/LogHistoryModal';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const getAvatarUrl = () => {
    if (user?.avatar_url) {
      return `http://localhost:5000${user.avatar_url}`;
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f2ec]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        
        {/* User Profile Area */}
        <div 
          className="flex items-center gap-4 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors"
          onClick={handleMenuClick}
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-500">
            {getAvatarUrl() ? (
              <img src={getAvatarUrl()} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">{user?.name || 'Admin User'}</div>
            <div className="text-xs text-gray-500">{user?.email || 'admin@profitpulse.com'}</div>
          </div>
        </div>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { mt: 1.5, borderRadius: 3, minWidth: 200 }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { handleMenuClose(); setProfileOpen(true); }}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); setLogOpen(true); }}>
            <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
            Log History
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><ExitToAppIcon fontSize="small" color="error" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 overflow-auto bg-white rounded-b-3xl flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to ProfitPulse</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Your modern admin dashboard is ready. Navigate using the sidebar to manage your Products and Categories.
        </p>
      </div>

      {/* Modals */}
      <ProfileModal 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)} 
        user={user} 
        onProfileUpdated={(updatedUser) => setUser(updatedUser)} 
      />
      <LogHistoryModal 
        open={logOpen} 
        onClose={() => setLogOpen(false)} 
      />
    </div>
  );
}
