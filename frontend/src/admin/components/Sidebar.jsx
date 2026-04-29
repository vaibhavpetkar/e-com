import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton } from '@mui/material';

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard',   path: '/admin/dashboard',  icon: <DashboardIcon fontSize="small" /> },
    { name: 'Categories',  path: '/admin/categories', icon: <CategoryIcon fontSize="small" /> },
    { name: 'Products',    path: '/admin/products',   icon: <ShoppingCartIcon fontSize="small" /> },
  ];

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-[#1a1d21] text-[#9ca3af] flex flex-col justify-between py-6 rounded-r-3xl my-2 transition-all duration-300 relative shadow-2xl`}>
      {/* Toggle Button */}
      <Box sx={{ position: 'absolute', right: -15, top: 25, zIndex: 10 }}>
        <IconButton 
          onClick={onToggle}
          sx={{ 
            bgcolor: '#fff', 
            color: '#1a1d21', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: '#f1f5f9' },
            width: 32, height: 32
          }}
        >
          {collapsed ? <MenuIcon sx={{ fontSize: 18 }} /> : <MenuOpenIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>

      <div>
        <div className={`px-6 mb-10 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 min-w-[32px] rounded bg-white text-black flex items-center justify-center font-bold text-xl shadow-inner">P</div>
          {!collapsed && <span className="text-white text-xl font-semibold tracking-wide truncate">ProfitPulse</span>}
        </div>

        <nav className="flex flex-col gap-2 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? 'justify-center' : 'gap-4 px-4'} py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-md'
                    : 'hover:text-white hover:bg-[#2d3136]'
                }`
              }
              title={collapsed ? item.name : ''}
            >
              {item.icon}
              {!collapsed && <span className="text-[15px]">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-4">
        <button
          onClick={handleLogout}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4 px-4'} py-3 w-full text-left rounded-2xl transition-all duration-200 hover:text-white hover:bg-[#2d3136]`}
          title={collapsed ? 'Log out' : ''}
        >
          <ExitToAppIcon fontSize="small" />
          {!collapsed && <span className="text-[15px]">Log out</span>}
        </button>
      </div>
    </div>
  );
}
