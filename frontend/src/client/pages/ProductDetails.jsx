import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../services/api";
import { 
  Box, Typography, Grid, Container, Button, Stack, Skeleton,
  Divider, Paper, Rating, Link, Select, MenuItem, Chip
} from "@mui/material";
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import AssignmentReturnRoundedIcon from '@mui/icons-material/AssignmentReturnRounded';
import CustomerNavbar from "../components/CustomerNavbar";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");
    const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
    const [qty, setQty] = useState(1);

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/600x600?text=Product';
        if (url.startsWith('http')) return url;
        return `http://localhost:5000${url}`;
    };

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.target.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomStyle({
            display: 'block',
            backgroundImage: `url(${getImageUrl(selectedImage)})`,
            backgroundPosition: `${x}% ${y}%`,
            backgroundSize: '200%',
            position: 'absolute',
            top: 0,
            left: '105%',
            width: '120%',
            height: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            zIndex: 1000,
            pointerEvents: 'none'
        });
    };

    const handleMouseLeave = () => {
        setZoomStyle({ display: 'none' });
    };

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await API.get(`/products/${id}`);
                setProduct(res.data);
                if (res.data.images && res.data.images.length > 0) {
                    setSelectedImage(res.data.images[0]);
                }
            } catch (err) {
                console.error("Failed to fetch product:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const handleBuyNow = () => {
        addToCart(product);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            navigate('/checkout');
        }
    };

    const linkStyle = { 
        color: '#4f46e5', 
        fontWeight: 600, 
        cursor: 'pointer', 
        transition: 'all 0.2s',
        '&:hover': { color: '#4338ca', textDecoration: 'underline' } 
    };

    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
            minHeight: '100vh', 
            pb: 10 
        }}>
            <CustomerNavbar />

            {/* Breadcrumb Strip */}
            <Box sx={{ py: 1.5, px: 2, fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="xl" sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Link sx={{...linkStyle, color: '#64748b', '&:hover': { color: '#4f46e5' }}} underline="none">Home</Link>
                    <KeyboardArrowRightRoundedIcon sx={{ fontSize: 16 }} />
                    <Link sx={{...linkStyle, color: '#64748b', '&:hover': { color: '#4f46e5' }}} underline="none">Premium Catalog</Link>
                    <KeyboardArrowRightRoundedIcon sx={{ fontSize: 16 }} />
                    <span style={{ fontWeight: 700, color: '#334155' }}>{product?.title || 'Product Details'}</span>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 3 }}>
                {loading ? (
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={5}><Skeleton variant="rectangular" height={500} sx={{ borderRadius: 6 }} /></Grid>
                        <Grid item xs={12} md={4}><Skeleton variant="text" height={60} /><Skeleton variant="text" height={30} width="60%" /><Skeleton variant="text" height={100} sx={{ mt: 2 }} /></Grid>
                        <Grid item xs={12} md={3}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 6 }} /></Grid>
                    </Grid>
                ) : !product ? (
                    <Typography variant="h4" align="center" sx={{ mt: 10, fontWeight: 800, color: '#475569' }}>
                        Product Not Found
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>
                        
                        {/* LEFT: Images (Amazon Structure) */}
                        <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '33%', lg: '30%' } }}>
                            <Box sx={{ position: 'sticky', top: 32 }}>
                                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                                    {/* Vertical Thumbnails */}
                                    <Stack direction="column" spacing={1.5} sx={{ width: 60, flexShrink: 0 }}>
                                        {product.images?.map((img, idx) => (
                                            <Paper 
                                                key={idx} 
                                                elevation={0}
                                                onMouseEnter={() => setSelectedImage(img)}
                                                onClick={() => setSelectedImage(img)}
                                                sx={{ 
                                                    width: 60, height: 60, p: 1, cursor: 'pointer',
                                                    border: selectedImage === img ? '2px solid #4f46e5' : '1px solid transparent',
                                                    bgcolor: '#fff',
                                                    boxShadow: selectedImage === img ? '0 8px 16px rgba(79, 70, 229, 0.2)' : '0 4px 6px rgba(0,0,0,0.05)',
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                    borderRadius: '16px',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }
                                                }}
                                            >
                                                <img src={getImageUrl(img)} alt={`thumb-${idx}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            </Paper>
                                        ))}
                                    </Stack>

                                    {/* Main Image */}
                                    <Box sx={{ position: 'relative', flexGrow: 1 }}>
                                        <Paper 
                                            elevation={0} 
                                            sx={{ 
                                                p: 3, 
                                                borderRadius: '32px', 
                                                bgcolor: '#fff', 
                                                border: '1px solid #ffffff',
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                                display: 'flex', 
                                                justifyContent: 'center', 
                                                height: 500, 
                                                cursor: 'crosshair',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            onMouseMove={handleMouseMove}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <img 
                                                src={getImageUrl(selectedImage)} 
                                                alt={product.title} 
                                                style={{ 
                                                    maxWidth: '100%', 
                                                    maxHeight: '100%', 
                                                    objectFit: 'contain', 
                                                    pointerEvents: 'none',
                                                    filter: 'drop-shadow(0px 20px 30px rgba(0,0,0,0.1))'
                                                }}
                                            />
                                        </Paper>
                                        
                                        {/* Zoom Window */}
                                        <Box sx={zoomStyle} />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* CENTER: Details (Amazon Structure) */}
                        <Box sx={{ flex: '1 1 auto', width: { xs: '100%', md: '40%', lg: '45%' }, minWidth: 0 }}>
                            {/* Title & Brand */}
                            <Typography variant="overline" sx={{ color: '#6366f1', fontWeight: 800, letterSpacing: 1.5, mb: 1, display: 'block' }}>
                                {product.brand || 'PREMIUM COLLECTION'}
                            </Typography>
                            <Typography variant="h2" sx={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, mb: 2 }}>
                                {product.title}
                            </Typography>

                            {/* Ratings */}
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff', px: 1.5, py: 0.5, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <Rating value={product.rating || 4.5} precision={0.5} readOnly size="small" sx={{ color: '#f59e0b' }} />
                                    <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 800, color: '#334155' }}>
                                        {product.rating || 4.5}
                                    </Typography>
                                </Box>
                                <Link sx={linkStyle} underline="none">
                                    {product.review_count || '1,245'} Verified Reviews
                                </Link>
                            </Stack>

                            <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                            {/* Price Block */}
                            <Box sx={{ mb: 3 }}>
                                {product.discount_price ? (
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                                        <Typography sx={{ color: '#0f172a', fontSize: '2.5rem', fontWeight: 900, display: 'flex', alignItems: 'flex-start', background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                            <span style={{ fontSize: '1.2rem', marginTop: 10, marginRight: 4, color: '#0f172a', WebkitTextFillColor: 'initial' }}>{product.currency_symbol || '$'}</span>
                                            {product.price}
                                        </Typography>
                                        <Chip 
                                            label={`Save ${Math.round((1 - product.price/product.discount_price) * 100)}%`}
                                            sx={{ bgcolor: '#fee2e2', color: '#ef4444', fontWeight: 900, borderRadius: '12px', fontSize: '1rem' }}
                                        />
                                    </Stack>
                                ) : (
                                    <Typography sx={{ color: '#0f172a', fontSize: '2.5rem', fontWeight: 900, display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                        <span style={{ fontSize: '1.2rem', marginTop: 10, marginRight: 4 }}>{product.currency_symbol || '$'}</span>
                                        {product.price}
                                    </Typography>
                                )}

                                {product.discount_price && (
                                    <Typography sx={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 600 }}>
                                        Original Price: <span style={{ textDecoration: 'line-through' }}>{product.currency_symbol || '$'}{product.discount_price}</span>
                                    </Typography>
                                )}
                            </Box>

                            {/* Offers Box */}
                            <Box sx={{ bgcolor: '#fff', p: 2.5, borderRadius: '20px', mb: 4, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                                <Typography sx={{ fontSize: '1rem', fontWeight: 800, mb: 1.5, color: '#334155' }}>
                                    ⚡ Available Offers
                                </Typography>
                                <Typography sx={{ fontSize: '0.9rem', color: '#475569', mb: 1 }}>
                                    <strong style={{ color: '#4f46e5' }}>Bank Offer:</strong> Extra 10% off on Credit Cards. <Link sx={linkStyle}>T&C</Link>
                                </Typography>
                                <Typography sx={{ fontSize: '0.9rem', color: '#475569' }}>
                                    <strong style={{ color: '#4f46e5' }}>No Cost EMI:</strong> Starts at {product.currency_symbol || '$'}99/month. <Link sx={linkStyle}>Options</Link>
                                </Typography>
                            </Box>

                            {/* Features Row */}
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                {[
                                    { icon: <AssignmentReturnRoundedIcon sx={{ fontSize: 28, color: '#4f46e5' }} />, title: '10 Days Return' },
                                    { icon: <LocalShippingRoundedIcon sx={{ fontSize: 28, color: '#10b981' }} />, title: 'Free Delivery' },
                                    { icon: <SecurityRoundedIcon sx={{ fontSize: 28, color: '#f59e0b' }} />, title: 'Secure Pay' }
                                ].map((feature, i) => (
                                    <Grid item xs={4} key={i}>
                                        <Box sx={{ 
                                            textAlign: 'center', p: 2, bgcolor: '#ffffff', borderRadius: '20px', 
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.03)', transition: 'all 0.3s',
                                            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.06)' }
                                        }}>
                                            <Box sx={{ mb: 1 }}>{feature.icon}</Box>
                                            <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700, display: 'block' }}>
                                                {feature.title}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Description / Bullet Points */}
                            <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, mb: 2, color: '#1e293b' }}>
                                About this item
                            </Typography>
                            <Typography component="div" sx={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                                <ul>
                                    {product.description?.split('\n').filter(l=>l.trim()).map((line, i) => (
                                        <li key={i} style={{ marginBottom: '12px' }}>{line.replace(/^-/, '').trim()}</li>
                                    )) || <li>Premium build quality engineered for perfection.</li>}
                                </ul>
                            </Typography>

                        </Box>

                        {/* RIGHT: Buy Box (Premium Styling, Compact) */}
                        <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '25%', lg: '25%' } }}>
                            <Box sx={{ 
                                p: 2.5, 
                                borderRadius: '24px', 
                                position: 'sticky', 
                                top: 32, 
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.8)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                            }}>
                                {/* Price */}
                                <Typography sx={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                                    <span style={{ fontSize: '0.9rem', marginTop: 6, marginRight: 4 }}>{product.currency_symbol || '$'}</span>
                                    {product.price}
                                </Typography>

                                {/* Delivery Info */}
                                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', mb: 2, border: '1px dashed #cbd5e1' }}>
                                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, mb: 0.5, fontSize: '0.85rem' }}>
                                        <strong style={{ color: '#10b981' }}>Free Premium Delivery</strong>
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', lineHeight: 1.2 }}>
                                        Order within 5 hrs for delivery tomorrow.
                                    </Typography>
                                </Box>

                                {/* Location */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: '#4f46e5', cursor: 'pointer', '&:hover': { color: '#4338ca' } }}>
                                    <LocationOnOutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Deliver to user - New York</Typography>
                                </Box>

                                {/* Stock Status */}
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)' }} />
                                    <Typography sx={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 800 }}>
                                        In Stock & Ready
                                    </Typography>
                                </Stack>

                                {/* Quantity */}
                                <Box sx={{ mb: 2 }}>
                                    <Select 
                                        value={qty} 
                                        onChange={(e) => setQty(e.target.value)}
                                        size="small"
                                        fullWidth
                                        sx={{ 
                                            borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, bgcolor: '#fff', height: 36,
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4f46e5', borderWidth: 2 }
                                        }}
                                    >
                                        {[1,2,3,4,5].map(n => <MenuItem key={n} value={n} sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Quantity: {n}</MenuItem>)}
                                    </Select>
                                </Box>

                                {/* Buttons */}
                                <Button 
                                    fullWidth
                                    onClick={() => {
                                        for(let i=0; i<qty; i++) addToCart(product);
                                    }}
                                    sx={{ 
                                        bgcolor: '#ffffff', color: '#4f46e5', fontWeight: 800, fontSize: '0.9rem',
                                        borderRadius: '12px', py: 1.2, mb: 1.5, border: '2px solid #4f46e5',
                                        transition: 'all 0.3s ease',
                                        '&:hover': { bgcolor: '#eff6ff', transform: 'translateY(-2px)', boxShadow: '0 6px 12px rgba(79, 70, 229, 0.15)' },
                                    }}
                                >
                                    Add to Cart
                                </Button>
                                
                                <Button 
                                    fullWidth
                                    onClick={() => {
                                        for(let i=0; i<qty; i++) addToCart(product);
                                        handleBuyNow();
                                    }}
                                    sx={{ 
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', 
                                        color: '#ffffff', fontWeight: 800, fontSize: '0.9rem',
                                        borderRadius: '12px', py: 1.2, mb: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)' },
                                    }}
                                >
                                    Buy Now
                                </Button>

                                {/* Secure Transaction */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: '#64748b' }}>
                                    <LockOutlinedIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>256-bit Secure Checkout</Typography>
                                </Box>

                                {/* Seller Info */}
                                <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 1.5, border: '1px solid #f1f5f9' }}>
                                    <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', color: '#334155' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ color: '#64748b', paddingBottom: 6, fontWeight: 600 }}>Ships from</td>
                                                <td style={{ paddingBottom: 6, textAlign: 'right', fontWeight: 700 }}>ProfitPulse</td>
                                            </tr>
                                            <tr>
                                                <td style={{ color: '#64748b', paddingBottom: 6, fontWeight: 600 }}>Sold by</td>
                                                <td style={{ paddingBottom: 6, textAlign: 'right', fontWeight: 700 }}><Link sx={linkStyle} underline="none">Direct</Link></td>
                                            </tr>
                                            <tr>
                                                <td style={{ color: '#64748b', fontWeight: 600 }}>Returns</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700 }}><Link sx={linkStyle} underline="none">15-day refund</Link></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Box>

                            </Box>
                        </Box>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
