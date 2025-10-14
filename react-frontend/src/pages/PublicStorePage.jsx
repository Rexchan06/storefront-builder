import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Container, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StoreNavBar from '../components/StoreNavBar';

function PublicStorePage() {
    const { slug } = useParams();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPublicStore = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/public/stores/${slug}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || 'Store not found');
                    setLoading(false);
                    return;
                }

                setStore(data.store);
                setProducts(data.products);
            } catch (err) {
                setError('Failed to load store. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPublicStore();
    }, [slug]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5" sx={{ color: '#666' }}>{error}</Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>This store may not be available or published yet.</Typography>
            </Box>
        );
    }

    if (!store) {
        return null;
    }

    return (
        <>
            {/* Store Navbar - Public Mode */}
            <StoreNavBar store={store} isPublic={true} />

            {/* Hero Section */}
            <Box
                sx={{
                    backgroundImage: store.background_image
                        ? `url(http://localhost:8000/storage/${store.background_image})`
                        : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(240, 240, 240, 0.7)',
                        zIndex: 0
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 'bold',
                                marginBottom: 2,
                                fontSize: { xs: '32px', md: '48px' }
                            }}
                        >
                            <span style={{ color: '#00bcd4' }}>{store.store_slug?.split(' ')[0] || 'Innovation'}</span>
                            <span style={{ color: '#000' }}> {store.store_slug?.split(' ').slice(1).join(' ') || 'delivered to your doorstep'}</span>
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#555',
                                fontSize: '16px',
                                lineHeight: 1.6
                            }}
                        >
                            {store.description || 'Your one-stop online shop for the latest gadgets, accessories, and lifestyle products'}
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Products Section */}
            <Box sx={{ backgroundColor: '#b3d9f2', padding: '60px 0' }}>
                <Container maxWidth="lg">
                    <Box sx={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px' }}>
                        <Typography
                            variant="h4"
                            sx={{
                                textAlign: 'center',
                                marginBottom: 4,
                                fontWeight: 'bold'
                            }}
                        >
                            <span style={{ color: '#000' }}>Our </span>
                            <span style={{ color: '#00bcd4' }}>Products</span>
                        </Typography>

                        {products.length === 0 ? (
                            <Box sx={{ padding: 6, backgroundColor: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                                <Typography sx={{ color: '#666' }}>No products available at the moment.</Typography>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                                    gap: 2,
                                    marginBottom: 4
                                }}>
                                    {products.map(product => (
                                        <Box
                                            key={product.id}
                                            sx={{
                                                backgroundColor: '#fff',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: '1px solid #e0e0e0'
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
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }}
                                            >
                                                {product.image ? (
                                                    <img
                                                        src={`http://localhost:8000/storage/${product.image}`}
                                                        alt={product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : null}
                                            </Box>
                                            <Box sx={{ padding: '12px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '12px', marginBottom: 0.5 }}>
                                                            {product.name}
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                                                            RM{product.price}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Typography variant="caption" sx={{ fontSize: '11px', color: '#666' }}>
                                                            {product.stock_quantity}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, marginTop: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#000',
                                                            color: 'white',
                                                            textTransform: 'none',
                                                            fontSize: '11px',
                                                            padding: '4px 12px',
                                                            borderRadius: '4px',
                                                            minWidth: 'auto',
                                                            '&:hover': {
                                                                backgroundColor: '#333'
                                                            }
                                                        }}
                                                    >
                                                        Buy Now
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            color: '#000',
                                                            borderColor: '#e0e0e0',
                                                            textTransform: 'none',
                                                            fontSize: '11px',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            minWidth: 'auto',
                                                            '&:hover': {
                                                                borderColor: '#000',
                                                                backgroundColor: 'transparent'
                                                            }
                                                        }}
                                                    >
                                                        Add to Cart
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Pagination */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, marginTop: 3 }}>
                                    <Button
                                        startIcon={<ChevronLeftIcon />}
                                        sx={{
                                                color: '#666',
                                            textTransform: 'none',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Back
                                    </Button>
                                    <Typography sx={{ fontSize: '14px', color: '#666' }}>
                                        1 of 5
                                    </Typography>
                                    <Button
                                        endIcon={<ChevronRightIcon />}
                                        sx={{
                                            color: '#666',
                                            textTransform: 'none',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Next
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ backgroundColor: '#000', color: 'white', padding: '40px 0' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        {/* Left Side: Logo, Store Name, and Info */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {store.logo ? (
                                    <img
                                        src={`http://localhost:8000/storage/${store.logo}`}
                                        alt={store.store_name}
                                        style={{ height: '32px', width: '32px', objectFit: 'contain', borderRadius: '50%', filter: 'brightness(0) invert(1)' }}
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

                        {/* Right Side: Links */}
                        <Box sx={{ display: 'flex', gap: 4 }}>
                            <Typography sx={{ cursor: 'pointer', fontSize: '14px', '&:hover': { color: '#00bcd4' } }}>
                                Link 1
                            </Typography>
                            <Typography sx={{ cursor: 'pointer', fontSize: '14px', '&:hover': { color: '#00bcd4' } }}>
                                Link 2
                            </Typography>
                            <Typography sx={{ cursor: 'pointer', fontSize: '14px', '&:hover': { color: '#00bcd4' } }}>
                                Link 3
                            </Typography>
                            <Typography sx={{ cursor: 'pointer', fontSize: '14px', '&:hover': { color: '#00bcd4' } }}>
                                Link 4
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </>
    );
}

export default PublicStorePage;
