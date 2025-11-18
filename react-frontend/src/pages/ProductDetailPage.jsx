import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Container, Button, Chip, TextField,
    IconButton, Snackbar, Alert, Breadcrumbs, Link, Modal,
    CircularProgress
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import StoreNavBar from '../components/StoreNavBar';
import LoadingScreen from '../components/LoadingScreen';
import { useCart } from '../context/CartContext';
import { API_URL, API_STORAGE_URL } from '../services/api';
import { updatePageForStore } from '../utils/pageUtils';

function ProductDetailPage() {
    const { slug, productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [store, setStore] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [imageModalOpen, setImageModalOpen] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/stores/${slug}/products/${productId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || 'Product not found');
                    setLoading(false);
                    return;
                }

                setProduct(data.product);
                setStore(data.store);
                setRelatedProducts(data.relatedProducts || []);

                // Update page title and favicon for this store
                updatePageForStore(data.store);
            } catch (err) {
                setError('Failed to load product. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug, productId]);

    const handleAddToCart = () => {
        if (product.stock_quantity === 0) {
            setSnackbar({ open: true, message: 'Product out of stock', severity: 'error' });
            return;
        }

        for (let i = 0; i < quantity; i++) {
            addToCart(product, slug);
        }
        setSnackbar({ open: true, message: `${quantity} x ${product.name} added to cart!`, severity: 'success' });
    };

    const handleBuyNow = () => {
        if (product.stock_quantity === 0) {
            setSnackbar({ open: true, message: 'Product out of stock', severity: 'error' });
            return;
        }

        for (let i = 0; i < quantity; i++) {
            addToCart(product, slug);
        }
        navigate(`/store/${slug}/checkout`);
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value) || 1;
        if (value >= 1 && value <= product.stock_quantity) {
            setQuantity(value);
        }
    };


    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (error || !product) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5" sx={{ color: '#666' }}>{error || 'Product not found'}</Typography>
                <Button variant="contained" onClick={() => navigate(`/store/${slug}`)}>
                    Back to Store
                </Button>
            </Box>
        );
    }

    return (
        <>
            {/* Store Navbar */}
            <StoreNavBar store={store} isPublic={true} />

            {/* Breadcrumbs */}
            <Box sx={{ backgroundColor: '#f5f5f5', padding: '16px 0' }}>
                <Container maxWidth="lg">
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => navigate(`/store/${slug}`)}
                            sx={{ cursor: 'pointer', textDecoration: 'none', color: '#666', '&:hover': { color: '#000' } }}
                        >
                            {store.store_name}
                        </Link>
                        <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>
                            {product.name}
                        </Typography>
                    </Breadcrumbs>
                </Container>
            </Box>

            {/* Product Detail Section */}
            <Box sx={{ backgroundColor: '#fff', padding: '60px 0' }}>
                <Container maxWidth="lg">
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 6
                    }}>
                        {/* Left Column: Image */}
                        <Box>
                            <Box
                                onClick={() => setImageModalOpen(true)}
                                sx={{
                                    width: '100%',
                                    height: '500px',
                                    backgroundColor: product.image ? 'transparent' : '#c0c0c0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    cursor: product.image ? 'zoom-in' : 'default',
                                    border: '1px solid #e0e0e0',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: product.image ? 'scale(1.02)' : 'none'
                                    }
                                }}
                            >
                                {product.image ? (
                                    <img
                                        src={`${API_STORAGE_URL}/${product.image}`}
                                        alt={product.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <Typography sx={{ color: '#999' }}>No Image Available</Typography>
                                )}
                            </Box>
                            {product.image && (
                                <Typography variant="caption" sx={{ display: 'block', marginTop: 1, color: '#666', textAlign: 'center' }}>
                                    Click image to view larger
                                </Typography>
                            )}
                        </Box>

                        {/* Right Column: Product Info */}
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                                {product.name}
                            </Typography>

                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00bcd4', marginBottom: 2 }}>
                                RM {parseFloat(product.price).toFixed(2)}
                            </Typography>

                            {/* Stock Count */}
                            <Typography variant="body1" sx={{ marginBottom: 3, color: '#666' }}>
                                Stock: <strong>{product.stock_quantity}</strong>
                            </Typography>

                            {/* Category */}
                            {product.category && (
                                <Box sx={{ marginBottom: 3 }}>
                                    <Typography variant="body2" sx={{ color: '#666', marginBottom: 1 }}>
                                        Category:
                                    </Typography>
                                    <Chip label={product.category} variant="outlined" />
                                </Box>
                            )}

                            {/* Description */}
                            <Box sx={{ marginBottom: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                                    Description
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                                    {product.description || 'No description available.'}
                                </Typography>
                            </Box>

                            {/* Quantity Selector */}
                            {product.stock_quantity > 0 && (
                                <Box sx={{ marginBottom: 3 }}>
                                    <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 500 }}>
                                        Quantity:
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        inputProps={{ min: 1, max: product.stock_quantity }}
                                        size="small"
                                        sx={{ width: '100px' }}
                                    />
                                </Box>
                            )}

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleBuyNow}
                                    disabled={product.stock_quantity === 0}
                                    sx={{
                                        backgroundColor: '#000',
                                        color: 'white',
                                        textTransform: 'none',
                                        fontSize: '16px',
                                        padding: '12px 32px',
                                        flex: 1,
                                        '&:hover': {
                                            backgroundColor: '#333'
                                        }
                                    }}
                                >
                                    Buy Now
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<AddShoppingCartIcon />}
                                    onClick={handleAddToCart}
                                    disabled={product.stock_quantity === 0}
                                    sx={{
                                        color: '#000',
                                        borderColor: '#000',
                                        textTransform: 'none',
                                        fontSize: '16px',
                                        padding: '12px 32px',
                                        flex: 1,
                                        '&:hover': {
                                            borderColor: '#000',
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    Add to Cart
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <Box sx={{ backgroundColor: '#f5f5f5', padding: '60px 0' }}>
                    <Container maxWidth="lg">
                        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 4 }}>
                            More from this category
                        </Typography>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: 2
                        }}>
                            {relatedProducts.map(relatedProduct => (
                                <Box
                                    key={relatedProduct.id}
                                    onClick={() => {
                                        navigate(`/store/${slug}/product/${relatedProduct.id}`);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    sx={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '1px solid #e0e0e0',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '150px',
                                            backgroundColor: '#c0c0c0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {relatedProduct.image ? (
                                            <img
                                                src={`${API_STORAGE_URL}/${relatedProduct.image}`}
                                                alt={relatedProduct.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : null}
                                    </Box>
                                    <Box sx={{ padding: '12px' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '12px', marginBottom: 0.5 }}>
                                            {relatedProduct.name}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                                            RM{relatedProduct.price}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Container>
                </Box>
            )}

            {/* Footer */}
            <Box sx={{ backgroundColor: '#000', color: 'white', padding: '40px 0' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {store.logo ? (
                                <img
                                    src={`${API_STORAGE_URL}/${store.logo}`}
                                    alt={store.store_name}
                                    style={{ height: '32px', width: '32px', objectFit: 'contain', borderRadius: '50%' }}
                                />
                            ) : (
                                <Box sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Typography sx={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>
                                        {store.store_name?.charAt(0) || 'S'}
                                    </Typography>
                                </Box>
                            )}
                            <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>{store.store_name}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '14px', color: '#ccc', maxWidth: '400px' }}>
                            {store.address || 'No. 12, Jalan Ampang, Kuala Lumpur, Malaysia'}
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: '#ccc' }}>
                            {store.contact_email || 'support@store.com'}
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Image Modal (Lightbox) */}
            <Modal
                open={imageModalOpen}
                onClose={() => setImageModalOpen(false)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', outline: 'none' }}>
                    <IconButton
                        onClick={() => setImageModalOpen(false)}
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {product.image && (
                        <img
                            src={`${API_STORAGE_URL}/${product.image}`}
                            alt={product.name}
                            style={{
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                                borderRadius: '8px'
                            }}
                        />
                    )}
                </Box>
            </Modal>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default ProductDetailPage;
