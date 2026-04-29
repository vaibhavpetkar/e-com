import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { name: 'Categories', path: '/admin/categories', icon: <CategoryIcon fontSize="small" /> },
    { name: 'Products', path: '/admin/products', icon: <ShoppingCartIcon fontSize="small" /> },
  ];

  return (
    <div className="w-64 bg-[#1a1d21] text-[#9ca3af] flex flex-col justify-between py-6 rounded-r-3xl my-2">
      <div>
        <div className="px-8 mb-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold text-xl">P</div>
          <span className="text-white text-xl font-semibold tracking-wide">ProfitPulse</span>
        </div>

        <nav className="flex flex-col gap-2 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'hover:text-white hover:bg-[#2d3136]'
                }`
              }
            >
              {item.icon}
              <span className="text-[15px]">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full text-left rounded-2xl transition-all duration-200 hover:text-white hover:bg-[#2d3136]"
        >
          <ExitToAppIcon fontSize="small" />
          <span className="text-[15px]">Log out</span>
        </button>
      </div>
    </div>
  );
}
