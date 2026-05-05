import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar, Toolbar, Box, Button, IconButton, Badge, Menu, MenuItem,
    Avatar, Typography, Divider, Container, Select as MuiSelect
} from '@mui/material';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useCart } from '../context/CartContext';

/**
 * CustomerNavbar Component
 * Top navigation bar for shopping page with:
 * - Logo
 * - Search bar (optional)
 * - Shopping cart icon with badge
 * - Login/Signup buttons OR user menu
 */
const CustomerNavbar = ({ onCartClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartCount } = useCart();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('All');
    const [settings, setSettings] = useState({});
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Fetch Settings & Categories
        const fetchData = async () => {
            try {
                const res = await API.get('/settings/public');
                if (res.data) setSettings(res.data);
            } catch (err) {}
            try {
                const catRes = await API.get('/categories');
                if (catRes.data) setCategories(catRes.data);
            } catch (err) {}
        };
        fetchData();
        // Check login status
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                setUser(JSON.parse(userStr));
                setIsLoggedIn(true);
            } catch (err) {
                console.error('Failed to parse user', err);
            }
        }

        // Listen for user updates (in case user logs in/out in another tab/component)
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleStorageChange = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
                setIsLoggedIn(true);
            } catch {
                setIsLoggedIn(false);
                setUser(null);
            }
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        setAnchorEl(null);
        navigate('/');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate(`/`);
        }
    };

    return (
        <AppBar position="sticky" sx={{
            background: 'linear-gradient(135deg, #1a1d21 0%, #2d3142 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
            <Container maxWidth="lg">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 0, sm: 2 } }}>
                    {/* Logo */}
                    <Box
                        onClick={() => navigate('/')}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            '&:hover': { opacity: 0.8 }
                        }}
                    >
                        <Box sx={{
                            width: 36,
                            height: 36,
                            bgcolor: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: '900',
                            fontSize: '20px',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                        }}>
                            {settings.website_name ? settings.website_name.charAt(0).toUpperCase() : 'P'}
                        </Box>
                        <Typography variant="h6" sx={{
                            fontWeight: '900',
                            color: '#fff',
                            display: { xs: 'none', sm: 'block' },
                            letterSpacing: '-0.5px',
                        }}>
                            {settings.website_name || 'ProfitPulse'}
                        </Typography>
                    </Box>

                    {/* Middle Section: Search Bar */}
                    <Box 
                        component="form" 
                        onSubmit={handleSearchSubmit}
                        sx={{ 
                            display: { xs: 'none', md: 'flex' }, 
                            flexGrow: 1, 
                            mx: { md: 4, lg: 8 },
                            maxWidth: 800,
                            position: 'relative'
                        }}
                    >
                        <Box sx={{ 
                            display: 'flex', 
                            width: '100%', 
                            bgcolor: 'rgba(255, 255, 255, 0.95)', 
                            borderRadius: '50px', 
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            border: '2px solid transparent',
                            transition: 'all 0.3s ease',
                            '&:focus-within': { borderColor: '#4f46e5', boxShadow: '0 8px 30px rgba(79, 70, 229, 0.3)', bgcolor: '#fff' }
                        }}>
                            {/* Category Dropdown (Functional) */}
                            <select 
                                value={searchCategory}
                                onChange={(e) => setSearchCategory(e.target.value)}
                                style={{
                                    backgroundColor: 'transparent', 
                                    padding: '0 16px 0 24px',
                                    border: 'none',
                                    borderRight: '1px solid rgba(0,0,0,0.1)',
                                    color: '#475569',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    fontWeight: 700,
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right .7em top 50%',
                                    backgroundSize: '.65em auto'
                                }}
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            
                            {/* Input Field */}
                            <input 
                                type="text"
                                placeholder={`Search ${settings.website_name || 'ProfitPulse'} for premium products...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flexGrow: 1,
                                    border: 'none',
                                    outline: 'none',
                                    padding: '0 24px',
                                    fontSize: '15px',
                                    color: '#0f172a',
                                    fontWeight: 500,
                                    backgroundColor: 'transparent'
                                }}
                            />
                            
                            {/* Submit Button */}
                            <Button 
                                type="submit"
                                sx={{ 
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                                    minWidth: '50px', 
                                    borderRadius: '50px',
                                    margin: '4px',
                                    color: '#fff',
                                    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { 
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                        boxShadow: '0 6px 15px rgba(79, 70, 229, 0.4)',
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            >
                                <SearchRoundedIcon fontSize="small" />
                            </Button>
                        </Box>
                    </Box>

                    {/* Right Section: Cart + Auth */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Shopping Cart Icon */}
                        <IconButton
                            onClick={() => {
                                if (onCartClick) {
                                    onCartClick();
                                } else {
                                    navigate('/cart');
                                }
                            }}
                            sx={{
                                color: '#fff',
                                position: 'relative',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                },
                                transition: 'all 0.2s',
                            }}
                        >
                            <Badge
                                badgeContent={cartCount}
                                color="error"
                                sx={{
                                    '& .MuiBadge-badge': {
                                        backgroundColor: '#ef4444',
                                        color: '#fff',
                                        fontWeight: '700',
                                    },
                                }}
                            >
                                <ShoppingCartRoundedIcon sx={{ fontSize: 24 }} />
                            </Badge>
                        </IconButton>

                        {/* Authentication UI */}
                        {isLoggedIn && user ? (
                            // User Dropdown Menu
                            <>
                                <IconButton
                                    onClick={handleMenuOpen}
                                    sx={{
                                        p: 0.5,
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '50%',
                                        },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            bgcolor: '#6366f1',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </Avatar>
                                </IconButton>

                                {/* Dropdown Menu */}
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    PaperProps={{
                                        sx: {
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                            minWidth: '200px',
                                        },
                                    }}
                                >
                                    <MenuItem disabled sx={{ flexDirection: 'column', alignItems: 'flex-start', pb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: '600' }}>
                                            {user.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                            {user.email}
                                        </Typography>
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                                        <AccountCircleRoundedIcon sx={{ mr: 1.5, fontSize: 20 }} />
                                        <Typography variant="body2">My Profile</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                                        <ShoppingCartRoundedIcon sx={{ mr: 1.5, fontSize: 20 }} />
                                        <Typography variant="body2">My Orders</Typography>
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout}>
                                        <LogoutRoundedIcon sx={{ mr: 1.5, fontSize: 20, color: '#ef4444' }} />
                                        <Typography variant="body2" sx={{ color: '#ef4444' }}>
                                            Logout
                                        </Typography>
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            // Login/Signup Buttons
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="text"
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        color: '#fff',
                                        textTransform: 'none',
                                        fontWeight: '600',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                    }}
                                >
                                    Log In
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/signup')}
                                    sx={{
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        textTransform: 'none',
                                        fontWeight: '600',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #4f46e5 100%)',
                                            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)',
                                        },
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>

                {/* Mobile Search Bar (Only visible on xs/sm) */}
                <Box 
                    component="form" 
                    onSubmit={handleSearchSubmit}
                    sx={{ 
                        display: { xs: 'flex', md: 'none' }, 
                        px: 2, pb: 2, width: '100%' 
                    }}
                >
                    <Box sx={{ 
                        display: 'flex', 
                        width: '100%', 
                        bgcolor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '50px', 
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '2px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:focus-within': { borderColor: '#4f46e5', boxShadow: '0 6px 20px rgba(79, 70, 229, 0.3)', bgcolor: '#fff' }
                    }}>
                        <select 
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            style={{
                                backgroundColor: 'transparent', 
                                padding: '0 8px 0 16px',
                                border: 'none',
                                borderRight: '1px solid rgba(0,0,0,0.1)',
                                color: '#475569',
                                fontSize: '12px',
                                cursor: 'pointer',
                                outline: 'none',
                                fontWeight: 700,
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right .5em top 50%',
                                backgroundSize: '.65em auto'
                            }}
                        >
                            <option value="All">All</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        
                        <input 
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flexGrow: 1,
                                border: 'none',
                                outline: 'none',
                                padding: '0 16px',
                                fontSize: '14px',
                                color: '#0f172a',
                                fontWeight: 500,
                                backgroundColor: 'transparent',
                                minWidth: 0
                            }}
                        />
                        
                        <Button 
                            type="submit"
                            sx={{ 
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                                minWidth: '40px', 
                                borderRadius: '50px',
                                margin: '3px',
                                color: '#fff',
                                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' }
                            }}
                        >
                            <SearchRoundedIcon fontSize="small" />
                        </Button>
                    </Box>
                </Box>
            </Container>
        </AppBar>
    );
};

export default CustomerNavbar;
