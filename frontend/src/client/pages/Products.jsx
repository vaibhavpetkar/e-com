import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const urlSearchQuery = searchParams.get('search') || "";
    const isSearchMode = !!urlSearchQuery;

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
        const matchesSearch = p.title.toLowerCase().includes(urlSearchQuery.toLowerCase());
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
            <CustomerNavbar />

            {/* Conditionally Show Banner & Category Strip ONLY if not searching */}
            {!isSearchMode && (
                <>
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
                </>
            )}

            {/* Main Content Area */}
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                    
                    {/* Left Sidebar: Filters (ONLY IN SEARCH MODE) */}
                    {isSearchMode && (
                        <Grid item xs={12} md={3} lg={2.5}>
                            <Box sx={{ pr: 2, borderRight: '1px solid #e2e8f0', height: '100%' }}>
                                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Filters</Typography>
                                
                                {/* Delivery */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" fontWeight="800" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', color: '#64748b' }}>
                                        Eligible for Free Delivery
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <input type="checkbox" id="free-delivery" style={{ width: 16, height: 16, cursor: 'pointer' }} />
                                        <label htmlFor="free-delivery" style={{ fontSize: 14, cursor: 'pointer' }}>Free Shipping</label>
                                    </Stack>
                                </Box>

                                {/* Brands */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" fontWeight="800" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', color: '#64748b' }}>
                                        Brands
                                    </Typography>
                                    {['Samsung', 'Apple', 'Sony', 'Premium', 'OnePlus'].map((brand, i) => (
                                        <Stack direction="row" alignItems="center" spacing={1} key={i} sx={{ mb: 0.5 }}>
                                            <input type="checkbox" id={`brand-${i}`} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                                            <label htmlFor={`brand-${i}`} style={{ fontSize: 14, cursor: 'pointer' }}>{brand}</label>
                                        </Stack>
                                    ))}
                                </Box>

                                {/* Price */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" fontWeight="800" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', color: '#64748b' }}>
                                        Price
                                    </Typography>
                                    {['Under $50', '$50 to $100', '$100 to $200', 'Over $200'].map((price, i) => (
                                        <Typography key={i} variant="body2" sx={{ mb: 0.5, cursor: 'pointer', '&:hover': { color: '#4f46e5' } }}>
                                            {price}
                                        </Typography>
                                    ))}
                                </Box>
                                
                                {/* Discounts */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" fontWeight="800" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', color: '#64748b' }}>
                                        Discount
                                    </Typography>
                                    {['10% Off or more', '25% Off or more', '50% Off or more'].map((discount, i) => (
                                        <Typography key={i} variant="body2" sx={{ mb: 0.5, cursor: 'pointer', '&:hover': { color: '#4f46e5' } }}>
                                            {discount}
                                        </Typography>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    )}

                    {/* Right Area: Products */}
                    <Grid item xs={12} md={isSearchMode ? 9 : 12} lg={isSearchMode ? 9.5 : 12}>
                        {isSearchMode && (
                            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                                Results for "{urlSearchQuery}"
                            </Typography>
                        )}
                        
                        {isSearchMode ? (
                            /* --- SEARCH RESULTS LIST VIEW --- */
                            <Stack spacing={3}>
                            {loading ? (
                                [1,2,3,4,5].map(i => (
                                    <Skeleton key={i} variant="rectangular" height={250} sx={{ borderRadius: 4 }} />
                                ))
                            ) : (
                                filteredProducts.map((p) => (
                                    <Card 
                                        key={p.id}
                                        onClick={() => navigate(`/product/${p.id}`)}
                                        sx={{ 
                                            display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                                            borderRadius: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                                            border: '1px solid #e2e8f0', cursor: 'pointer',
                                            transition: 'all 0.2s', '&:hover': { boxShadow: '0 10px 20px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' }
                                        }}
                                    >
                                        {/* Image Section */}
                                        <Box sx={{ width: { xs: '100%', sm: 250 }, minWidth: 250, p: 3, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                            <img 
                                                src={p.images?.[0] || 'https://via.placeholder.com/400x400?text=Product'} 
                                                alt={p.title} 
                                                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', mixBlendMode: 'multiply' }}
                                            />
                                            {p.discount_price && (
                                                <Chip 
                                                    label={`-${Math.round((1 - p.price/p.discount_price) * 100)}%`}
                                                    size="small"
                                                    sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#ef4444', color: '#fff', fontWeight: 900 }}
                                                />
                                            )}
                                        </Box>
                                        
                                        {/* Details Section */}
                                        <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="overline" sx={{ color: '#6366f1', fontWeight: 700, mb: 0.5 }}>
                                                {p.brand || 'Premium Brand'}
                                            </Typography>
                                            
                                            <Typography variant="h5" fontWeight="800" sx={{ mb: 1, color: '#0f172a' }}>
                                                {p.title}
                                            </Typography>
                                            
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                <Rating value={p.rating || 4.5} precision={0.5} size="small" readOnly sx={{ color: '#f59e0b' }} />
                                                <Typography variant="body2" fontWeight="600" sx={{ color: '#3b82f6' }}>{p.review_count || '1,245'}</Typography>
                                            </Stack>

                                            <Typography variant="body2" sx={{ color: '#475569', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {p.description || 'Premium quality product designed for excellence.'}
                                            </Typography>

                                            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                <Box>
                                                    <Stack direction="row" spacing={1.5} alignItems="baseline" sx={{ mb: 0.5 }}>
                                                        <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a' }}>
                                                            {p.currency_symbol || '$'}{p.price}
                                                        </Typography>
                                                        {p.discount_price && (
                                                            <Typography variant="body1" sx={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                                                                {p.currency_symbol || '$'}{p.discount_price}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>
                                                        FREE Premium Delivery
                                                    </Typography>
                                                </Box>

                                                <Button 
                                                    variant="contained"
                                                    onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                                                    sx={{ 
                                                        bgcolor: '#4f46e5', color: '#fff', fontWeight: 800, 
                                                        borderRadius: '12px', px: 4, py: 1.5,
                                                        boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
                                                        '&:hover': { bgcolor: '#4338ca', boxShadow: '0 6px 15px rgba(79, 70, 229, 0.4)' }
                                                    }}
                                                >
                                                    Add to Cart
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </Stack>
                        ) : (
                            /* --- HOME PAGE GRID VIEW --- */
                            <Grid container spacing={3}>
                                {loading ? (
                                    [1,2,3,4,5,6,7,8].map(i => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                                            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 4 }} />
                                        </Grid>
                                    ))
                                ) : (
                                    filteredProducts.map((p) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                                            <Card 
                                                onClick={() => navigate(`/product/${p.id}`)}
                                                sx={{ 
                                                height: '100%', borderRadius: 4, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                                transition: 'transform 0.2s', cursor: 'pointer', '&:hover': { transform: 'scale(1.02)' }
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
                                                            {p.currency_symbol || '$'}{p.price}
                                                        </Typography>
                                                        {p.discount_price && (
                                                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#565959' }}>
                                                                {p.currency_symbol || '$'}{p.discount_price}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                    
                                                    <Typography variant="caption" sx={{ color: '#007600', fontWeight: 700, display: 'block', mb: 2 }}>
                                                        FREE Delivery by Tomorrow
                                                    </Typography>

                                                    <Button 
                                                        fullWidth 
                                                        variant="contained"
                                                        onClick={(e) => { e.stopPropagation(); addToCart(p); }}
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
                        )}
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}