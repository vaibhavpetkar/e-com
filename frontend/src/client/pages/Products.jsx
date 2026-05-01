import { useEffect, useState } from "react";
import { API } from "../../services/api";
import { 
  Box, Typography, Grid, Card, CardMedia, CardContent, 
  Container, Button, Chip, Fade, Skeleton, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({});

    const [openBuy, setOpenBuy] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [orderForm, setOrderForm] = useState({ name: '', email: '', phone: '', address: '' });
    const [ordering, setOrdering] = useState(false);
 
    useEffect(() => {
        const loadData = async () => {
            try {
                const [prodRes, settRes] = await Promise.all([
                    API.get("/products"),
                    API.get("/users/settings")
                ]);
                setProducts(prodRes.data);
                setSettings(settRes.data);
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const primaryColor = settings.primary_color || '#4f46e5';
    const bannerText = settings.homepage_banner_text || 'Premium Quality for You';

    const handleBuyNow = (product) => {
        setSelectedProduct(product);
        setOpenBuy(true);
    };

    const placeOrder = async () => {
        setOrdering(true);
        try {
            await API.post('/orders', {
                customerName: orderForm.name,
                customerEmail: orderForm.email,
                customerPhone: orderForm.phone,
                shippingAddress: orderForm.address,
                totalAmount: selectedProduct.price,
                items: [{
                    productId: selectedProduct.id,
                    quantity: 1,
                    price: selectedProduct.price
                }]
            });
            alert('Order placed successfully!');
            setOpenBuy(false);
        } catch (err) {
            console.error(err);
            alert('Failed to place order');
        } finally {
            setOrdering(false);
        }
    };

    return (
        <Box sx={{ bgcolor: '#fdfdfd', minHeight: '100vh', pb: 10 }}>
            {/* Navigation Header Placeholder */}
            <Box sx={{ py: 3, borderBottom: '1px solid #f1f5f9', bgcolor: '#fff', textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: -1 }}>
                    {settings.site_name || 'PROFITPULSE'}
                </Typography>
            </Box>

            {/* Hero Section */}
            <Box sx={{ 
                bgcolor: '#1e293b', 
                color: '#fff', 
                py: { xs: 8, md: 12 }, 
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                mb: 6
            }}>
                <Box sx={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: `linear-gradient(45deg, ${primaryColor}44 0%, transparent 100%)`,
                    zIndex: 0
                }} />
                
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Fade in timeout={800}>
                        <Box>
                            <Typography variant="h2" fontWeight="900" sx={{ 
                                mb: 2, fontSize: { xs: '2.5rem', md: '4rem' },
                                letterSpacing: '-0.04em', lineHeight: 1.1
                            }}>
                                {bannerText}
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                                {settings.site_description || 'Exclusive collections delivered to your doorstep.'}
                            </Typography>
                            <Button 
                                variant="contained" 
                                size="large"
                                sx={{ 
                                    bgcolor: primaryColor, 
                                    px: 6, py: 2, 
                                    borderRadius: 10, 
                                    fontWeight: 800,
                                    boxShadow: `0 8px 24px ${primaryColor}44`,
                                    '&:hover': { bgcolor: primaryColor, opacity: 0.9 }
                                }}
                            >
                                Shop Collection
                            </Button>
                        </Box>
                    </Fade>
                </Container>
            </Box>

            {/* Product Grid */}
            <Container maxWidth="lg">
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Typography variant="h5" fontWeight="900">Featured Products</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="700">
                        {products.length} Items Found
                    </Typography>
                </Stack>

                <Grid container spacing={4}>
                    {loading ? (
                        [1,2,3,4,5,6].map(i => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 6, mb: 1 }} />
                                <Skeleton width="60%" />
                                <Skeleton width="40%" />
                            </Grid>
                        ))
                    ) : (
                        products.map((p, idx) => (
                            <Grid item xs={12} sm={6} md={4} key={p.id}>
                                <Fade in timeout={400 + (idx * 100)}>
                                    <Card sx={{ 
                                        borderRadius: 6, 
                                        boxShadow: 'none', 
                                        border: '1px solid #f1f5f9',
                                        transition: 'all 0.3s ease',
                                        '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }
                                    }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                height="320"
                                                image={p.images?.[0] || 'https://via.placeholder.com/400x500?text=Product'}
                                                alt={p.title}
                                                sx={{ objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={() => handleBuyNow(p)}
                                            />
                                            {p.discount_price && (
                                                <Chip 
                                                    label="SALE" 
                                                    size="small"
                                                    sx={{ 
                                                        position: 'absolute', top: 16, right: 16, 
                                                        bgcolor: '#ef4444', color: '#fff', fontWeight: 900 
                                                    }} 
                                                />
                                            )}
                                        </Box>
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                                {p.brand || 'Original'}
                                            </Typography>
                                            <Typography variant="h6" fontWeight="800" sx={{ mb: 1, height: 60, overflow: 'hidden' }}>
                                                {p.title}
                                            </Typography>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="h6" fontWeight="900" sx={{ color: primaryColor }}>
                                                        {p.currency_symbol || '$'}{p.price}
                                                    </Typography>
                                                    {p.discount_price && (
                                                        <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                                                            {p.currency_symbol || '$'}{p.discount_price}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Button 
                                                    variant="contained" 
                                                    onClick={() => handleBuyNow(p)}
                                                    sx={{ 
                                                        borderRadius: 4, 
                                                        bgcolor: primaryColor,
                                                        fontWeight: 800,
                                                        textTransform: 'none',
                                                        '&:hover': { bgcolor: primaryColor, opacity: 0.9 }
                                                    }}
                                                >
                                                    Buy Now
                                                </Button>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Fade>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>

            {/* Quick Buy Dialog */}
            <Dialog open={openBuy} onClose={() => setOpenBuy(false)} PaperProps={{ sx: { borderRadius: 6, p: 2 } }}>
                <DialogTitle><Typography variant="h5" fontWeight="900">Complete Your Order</Typography></DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">You are buying: <b>{selectedProduct?.title}</b> for <b>${selectedProduct?.price}</b></Typography>
                        <TextField label="Full Name" fullWidth value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} />
                        <TextField label="Email Address" fullWidth value={orderForm.email} onChange={e => setOrderForm({...orderForm, email: e.target.value})} />
                        <TextField label="Phone Number" fullWidth value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} />
                        <TextField label="Shipping Address" fullWidth multiline rows={3} value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenBuy(false)} sx={{ color: '#64748b', fontWeight: 700 }}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={placeOrder} 
                        disabled={ordering}
                        sx={{ bgcolor: primaryColor, borderRadius: 3, px: 4, fontWeight: 800 }}
                    >
                        {ordering ? 'Placing Order...' : 'Confirm Order'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}