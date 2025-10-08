import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Button } from '@mui/material';
import NavBar from '../components/NavBar';

function StoreDashboardPage() {
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStoreAndProducts = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch store
                const storeResponse = await fetch('http://localhost:8000/api/stores', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const storeData = await storeResponse.json();

                if (!storeResponse.ok) {
                    if (storeResponse.status === 404) {
                        navigate('/store-form');
                        return;
                    }
                    throw new Error(storeData.message || 'Failed to fetch store');
                }

                setStore(storeData);

                // Fetch products
                const productsResponse = await fetch('http://localhost:8000/api/products', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (productsResponse.ok) {
                    const productsData = await productsResponse.json();
                    setProducts(productsData);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreAndProducts();
    }, [navigate]);

    const handlePublish = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:8000/api/stores/${store.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_active: true })
            });

            if (response.ok) {
                const publicUrl = `http://localhost:8000/store/${store.store_slug}`;
                alert(`Store published!\nPublic URL: ${publicUrl}`);
                setStore({ ...store, is_active: true });
            }
        } catch (err) {
            alert('Failed to publish store');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!store) {
        return null;
    }

    return (
        <>
            {/* Admin Navbar */}
            <NavBar />

            {/* Admin Bar */}
            <Box sx={{
                backgroundColor: '#333',
                color: 'white',
                padding: '10px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography sx={{ fontWeight: 'bold' }}>Admin Mode</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/product-form')}
                        sx={{ backgroundColor: '#4caf50', textTransform: 'none' }}
                    >
                        Add Product
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handlePublish}
                        disabled={store.is_active}
                        sx={{ backgroundColor: '#2196f3', textTransform: 'none' }}
                    >
                        {store.is_active ? 'Published' : 'Publish Store'}
                    </Button>
                </Box>
            </Box>

            {/* Store Navbar */}
            <Box sx={{
                backgroundColor: '#fff',
                padding: '15px 40px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                {store.logo && (
                    <img
                        src={`http://localhost:8000/storage/${store.logo}`}
                        alt={store.store_name}
                        style={{ height: '40px', objectFit: 'contain' }}
                    />
                )}
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {store.store_name}
                </Typography>
            </Box>

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
                    <Box sx={{ backgroundColor: '#e8e8e8', borderRadius: '12px', padding: '40px' }}>
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
                            <Box sx={{ padding: 6, backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center' }}>
                                <Typography sx={{ color: '#666' }}>No products yet. Click "Add Product" to add your first product.</Typography>
                            </Box>
                        ) : (
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                                gap: 3
                            }}>
                                {products.map(product => (
                                    <Box
                                        key={product.id}
                                        sx={{
                                            backgroundColor: '#fff',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            padding: 2
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: '200px',
                                                backgroundColor: '#c0c0c0',
                                                borderRadius: '8px',
                                                marginBottom: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {product.image ? (
                                                <img
                                                    src={`http://localhost:8000/storage/${product.image}`}
                                                    alt={product.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <Typography sx={{ color: '#888' }}>No Image</Typography>
                                            )}
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: 0.5 }}>
                                            {product.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                RM {product.price}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#666' }}>
                                                Qty: {product.stock_quantity}
                                            </Typography>
                                        </Box>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            sx={{
                                                backgroundColor: '#000',
                                                color: 'white',
                                                textTransform: 'none',
                                                borderRadius: '6px',
                                                padding: '8px',
                                                '&:hover': {
                                                    backgroundColor: '#333'
                                                }
                                            }}
                                        >
                                            Buy Now
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ backgroundColor: '#000', color: 'white', padding: '40px 0' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {store.logo && (
                                <img
                                    src={`http://localhost:8000/storage/${store.logo}`}
                                    alt={store.store_name}
                                    style={{ height: '30px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                                />
                            )}
                            <Typography sx={{ fontWeight: 'bold' }}>{store.store_name}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 4 }}>
                            <Typography sx={{ cursor: 'pointer', '&:hover': { color: '#00bcd4' } }}>
                                {store.contact_email || 'Link 1'}
                            </Typography>
                            <Typography sx={{ cursor: 'pointer', '&:hover': { color: '#00bcd4' } }}>
                                {store.contact_phone || 'Link 2'}
                            </Typography>
                            <Typography sx={{ cursor: 'pointer', '&:hover': { color: '#00bcd4' } }}>
                                {store.address || 'Link 3'}
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </>
    );
}

export default StoreDashboardPage;
