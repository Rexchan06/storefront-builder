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
                <Typography>Admin Mode</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/product-form')}
                        sx={{ backgroundColor: '#4caf50' }}
                    >
                        Add Product
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handlePublish}
                        disabled={store.is_active}
                        sx={{ backgroundColor: '#2196f3' }}
                    >
                        {store.is_active ? 'Published' : 'Publish Store'}
                    </Button>
                </Box>
            </Box>

            {/* Store Template - Super Basic */}
            <Container maxWidth="lg" sx={{ marginTop: 4 }}>
                {/* Store Header */}
                <Box sx={{ textAlign: 'center', marginBottom: 4, padding: 3, border: '1px solid #ddd' }}>
                    <Typography variant="h3">{store.store_name}</Typography>
                    {store.description && <Typography variant="body1" sx={{ marginTop: 2 }}>{store.description}</Typography>}
                    {store.contact_email && <Typography variant="body2">Email: {store.contact_email}</Typography>}
                    {store.contact_phone && <Typography variant="body2">Phone: {store.contact_phone}</Typography>}
                    {store.address && <Typography variant="body2">Address: {store.address}</Typography>}
                </Box>

                {/* Products Section */}
                <Box sx={{ marginBottom: 4 }}>
                    <Typography variant="h5" sx={{ marginBottom: 2 }}>Products</Typography>

                    {products.length === 0 ? (
                        <Box sx={{ padding: 3, border: '1px dashed #ccc', textAlign: 'center' }}>
                            <Typography>No products yet. Click "Add Product" to add your first product.</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
                            {products.map(product => (
                                <Box key={product.id} sx={{ border: '1px solid #ddd', padding: 2 }}>
                                    {product.image && (
                                        <Box sx={{ marginBottom: 1, textAlign: 'center' }}>
                                            <img
                                                src={`http://localhost:8000/storage/${product.image}`}
                                                alt={product.name}
                                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                            />
                                        </Box>
                                    )}
                                    <Typography variant="h6">{product.name}</Typography>
                                    {product.category && (
                                        <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                            {product.category}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" sx={{ marginTop: 1 }}>{product.description}</Typography>
                                    <Typography variant="h6" sx={{ marginTop: 1 }}>RM {product.price}</Typography>
                                    <Typography variant="caption">Stock: {product.stock_quantity}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Container>
        </>
    );
}

export default StoreDashboardPage;
