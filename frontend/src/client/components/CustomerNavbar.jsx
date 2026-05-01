import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar, Toolbar, Box, Button, IconButton, Badge, Menu, MenuItem,
    Avatar, Typography, Divider, Container
} from '@mui/material';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
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

    useEffect(() => {
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
                            P
                        </Box>
                        <Typography variant="h6" sx={{
                            fontWeight: '900',
                            color: '#fff',
                            display: { xs: 'none', sm: 'block' },
                            letterSpacing: '-0.5px',
                        }}>
                            ProfitPulse
                        </Typography>
                    </Box>

                    {/* Right Section: Cart + Auth */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Shopping Cart Icon */}
                        <IconButton
                            onClick={onCartClick}
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
                                    <MenuItem onClick={() => { navigate('/checkout'); handleMenuClose(); }}>
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
            </Container>
        </AppBar>
    );
};

export default CustomerNavbar;
