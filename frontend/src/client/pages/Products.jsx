import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../services/api";
import { 
  Box, Typography, Grid, Card, CardMedia, CardContent, 
  Container, Button, Chip, Fade, Skeleton, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Badge, Drawer, Divider, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, InputAdornment,
  Rating, Tooltip, Paper
} from "@mui/material";
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { useCart } from "../context/CartContext";
import CustomerNavbar from "../components/CustomerNavbar";

export default function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({});
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [cartOpen, setCartOpen] = useState(false);

    const { cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [prodRes, settRes, catRes] = await Promise.all([
                    API.get("/products"),
                    API.get("/users/settings"),
                    API.get("/categories")
                ]);
                setProducts(prodRes.data);
                setSettings(settRes.data);
                setCategories(catRes.data);
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All" || p.category_name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const primaryColor = settings.primary_color || '#4f46e5';

    const handleCheckout = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Not logged in, redirect to login
            navigate('/login');
        } else {
            // Logged in, go to checkout
            navigate('/checkout');
        }
    };

    return (
        <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh' }}>
            {/* Customer Navbar with Login/Signup and Cart */}
            <CustomerNavbar onCartClick={() => setCartOpen(true)} />

            {/* Category Strip */}
            <Box sx={{ bgcolor: '#232f3e', color: '#fff', py: 1 }}>
                <Container maxWidth="xl">
                    <Stack direction="row" spacing={3} sx={{ overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
                        <Typography 
                            onClick={() => setSelectedCategory("All")}
                            sx={{ 
                                cursor: 'pointer', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
                                color: selectedCategory === "All" ? '#febd69' : '#fff'
                            }}
                        >
                            All
                        </Typography>
                        {categories.map(cat => (
                            <Typography 
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.name)}
                                sx={{ 
                                    cursor: 'pointer', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
                                    color: selectedCategory === cat.name ? '#febd69' : '#fff'
                                }}
                            >
                                {cat.name}
                            </Typography>
                        ))}
                    </Stack>
                </Container>
            </Box>

            {/* Hero Section / Banner */}
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Paper sx={{ 
                    height: 300, borderRadius: 4, 
                    background: `linear-gradient(90deg, ${primaryColor} 0%, #1e293b 100%)`,
                    display: 'flex', alignItems: 'center', px: 8, color: '#fff',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <Box sx={{ maxWidth: 500, position: 'relative', zIndex: 1 }}>
                        <Chip label="LIMITED TIME OFFER" size="small" sx={{ bgcolor: '#febd69', color: '#000', fontWeight: 900, mb: 2 }} />
                        <Typography variant="h2" fontWeight="900" sx={{ lineHeight: 1, mb: 2 }}>
                            {settings.homepage_banner_text || 'Premium Deals Just For You'}
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.8, mb: 4 }}>
                            Up to 50% off on latest collections. Shop now and save big!
                        </Typography>
                        <Button variant="contained" sx={{ bgcolor: '#febd69', color: '#000', fontWeight: 900, borderRadius: 2, px: 4 }}>
                            View All Offers
                        </Button>
                    </Box>
                    <Box sx={{ position: 'absolute', right: -50, top: -50, opacity: 0.1 }}>
                        <ShoppingBagRoundedIcon sx={{ fontSize: 400 }} />
                    </Box>
                </Paper>
            </Container>

            {/* Product Grid */}
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Grid container spacing={2}>
                    {loading ? (
                        [1,2,3,4,5,6,7,8].map(i => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                                <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4 }} />
                            </Grid>
                        ))
                    ) : (
                        filteredProducts.map((p) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                                <Card sx={{ 
                                    height: '100%', borderRadius: 4, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' }
                                }}>
                                    <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
                                        <CardMedia
                                            component="img"
                                            image={p.images?.[0] || 'https://via.placeholder.com/400x400?text=Product'}
                                            alt={p.title}
                                            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', p: 2 }}
                                        />
                                        {p.discount_price && (
                                            <Chip 
                                                label={`SAVE ${Math.round((1 - p.price/p.discount_price) * 100)}%`}
                                                size="small"
                                                sx={{ position: 'absolute', top: 12, left: 12, bgcolor: '#cc0c39', color: '#fff', fontWeight: 900 }}
                                            />
                                        )}
                                    </Box>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Typography variant="caption" sx={{ color: '#565959', fontWeight: 700 }}>{p.brand || 'Premium Brand'}</Typography>
                                        <Typography variant="body1" fontWeight="700" sx={{ 
                                            height: 48, overflow: 'hidden', display: '-webkit-box', 
                                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', mb: 1
                                        }}>
                                            {p.title}
                                        </Typography>
                                        
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            <Rating value={p.rating || 4.5} precision={0.5} size="small" readOnly />
                                            <Typography variant="caption" color="primary" fontWeight="700">({p.review_count || '1.2k'})</Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={1} alignItems="baseline">
                                            <Typography variant="h5" fontWeight="900" sx={{ color: '#0f1111' }}>
                                                ${p.price}
                                            </Typography>
                                            {p.discount_price && (
                                                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#565959' }}>
                                                    ${p.discount_price}
                                                </Typography>
                                            )}
                                        </Stack>
                                        
                                        <Typography variant="caption" sx={{ color: '#007600', fontWeight: 700, display: 'block', mb: 2 }}>
                                            FREE Delivery by Tomorrow
                                        </Typography>

                                        <Button 
                                            fullWidth 
                                            variant="contained"
                                            onClick={() => addToCart(p)}
                                            sx={{ 
                                                bgcolor: '#ffd814', color: '#0f1111', fontWeight: 800, 
                                                borderRadius: 10, '&:hover': { bgcolor: '#f7ca00' },
                                                boxShadow: '0 2px 5px rgba(213,217,217,.5)'
                                            }}
                                        >
                                            Add to Cart
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>

            {/* Cart Drawer */}
            <Drawer 
                anchor="right" 
                open={cartOpen} 
                onClose={() => setCartOpen(false)}
                PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 3 } }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="900">Your Cart ({cartCount})</Typography>
                    <IconButton onClick={() => setCartOpen(false)}><CloseRoundedIcon /></IconButton>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                {cart.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <ShoppingCartRoundedIcon sx={{ fontSize: 80, color: '#e2e8f0', mb: 2 }} />
                        <Typography variant="h6" fontWeight="700">Your cart is empty</Typography>
                        <Button onClick={() => setCartOpen(false)} sx={{ mt: 2 }}>Start Shopping</Button>
                    </Box>
                ) : (
                    <>
                        <List sx={{ flex: 1, overflowY: 'auto' }}>
                            {cart.map(item => (
                                <ListItem key={item.id} sx={{ px: 0, mb: 2 }}>
                                    <ListItemAvatar sx={{ mr: 2 }}>
                                        <Avatar variant="rounded" src={item.images?.[0]} sx={{ width: 80, height: 80, bgcolor: '#f8fafc' }} />
                                    </ListItemAvatar>
                                    <Stack sx={{ width: '100%' }}>
                                        <Typography variant="body2" fontWeight="800" noWrap>{item.title}</Typography>
                                        <Typography variant="body2" color="primary" fontWeight="900">${item.price}</Typography>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                                            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)} sx={{ border: '1px solid #e2e8f0' }}>
                                                <RemoveRoundedIcon fontSize="small" />
                                            </IconButton>
                                            <Typography fontWeight="800">{item.quantity}</Typography>
                                            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)} sx={{ border: '1px solid #e2e8f0' }}>
                                                <AddRoundedIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>

                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 4, mt: 'auto' }}>
                            <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2">Subtotal</Typography>
                                    <Typography variant="body2" fontWeight="800">${cartTotal.toFixed(2)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2">Shipping</Typography>
                                    <Typography variant="body2" fontWeight="800" sx={{ color: '#007600' }}>FREE</Typography>
                                </Stack>
                                <Divider sx={{ my: 1 }} />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="h6" fontWeight="900">Total</Typography>
                                    <Typography variant="h6" fontWeight="900">${cartTotal.toFixed(2)}</Typography>
                                </Stack>
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    onClick={handleCheckout}
                                    sx={{ mt: 2, py: 1.5, borderRadius: 3, bgcolor: '#ffd814', color: '#0f1111', fontWeight: 900, '&:hover': { bgcolor: '#f7ca00' } }}
                                >
                                    Proceed to Buy
                                </Button>
                            </Stack>
                        </Paper>
                    </>
                )}
            </Drawer>
        </Box>
    );
}