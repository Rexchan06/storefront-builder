import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Button, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavBar from '../components/NavBar';
import AdminBar from '../components/AdminBar';
import StoreNavBar from '../components/StoreNavBar';
import LoadingScreen from '../components/LoadingScreen';
import PublishStoreDialog from '../components/PublishStoreDialog';
import { API_URL, API_STORAGE_URL } from '../services/api';

function StoreDashboardPage() {
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);

    useEffect(() => {
        const fetchStoreAndProducts = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch store
                const storeResponse = await fetch(`${API_URL}/api/stores`, {
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
                const productsResponse = await fetch(`${API_URL}/api/products`, {
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

    const handleEditProduct = (productId) => {
        navigate('/product-form', { state: { productId } });
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/api/products/${productToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                if (data.action === 'deactivated') {
                    // Product was deactivated, update in state
                    setProducts(products.map(p =>
                        p.id === productToDelete.id
                            ? { ...p, is_active: false }
                            : p
                    ));
                    alert(data.message + '\n\n' + data.note);
                } else {
                    // Product was permanently deleted, remove from state
                    setProducts(products.filter(p => p.id !== productToDelete.id));
                    alert(data.message);
                }
                setDeleteDialogOpen(false);
                setProductToDelete(null);
            } else {
                alert(data.message || 'Failed to delete product');
            }
        } catch (err) {
            alert('Failed to delete product. Please try again.');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setProductToDelete(null);
    };

    const handlePublishClick = () => {
        setPublishDialogOpen(true);
    };

    const handlePublishSuccess = (updatedStore) => {
        setStore(updatedStore);
        setPublishDialogOpen(false);
    };

    if (loading) {
        return <LoadingScreen />;
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
            <AdminBar store={store} handlePublish={handlePublishClick} productCount={products.length} />

            {/* Store Navbar */}
            <StoreNavBar store={store} />

            {/* Hero Section */}
            <Box
                sx={{
                    backgroundImage: store.background_image
                        ? `url(${API_STORAGE_URL}/${store.background_image})`
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
                                fontSize: { xs: '32px', md: '48px' },
                                color: '#000'
                            }}
                        >
                            {store.store_name}
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                color: '#00bcd4',
                                fontSize: { xs: '18px', md: '24px' },
                                fontWeight: 500,
                                lineHeight: 1.6,
                                marginBottom: 2
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
                                <Typography sx={{ color: '#666' }}>No products yet. Click "Add Product" to add your first product.</Typography>
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
                                                        src={`${API_STORAGE_URL}/${product.image}`}
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
                                                <Box sx={{ display: 'flex', gap: 1, marginTop: 1, justifyContent: 'center' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditProduct(product.id)}
                                                        sx={{
                                                            backgroundColor: '#00bcd4',
                                                            color: 'white',
                                                            padding: '6px',
                                                            '&:hover': {
                                                                backgroundColor: '#00a5bb'
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteClick(product)}
                                                        sx={{
                                                            backgroundColor: '#f44336',
                                                            color: 'white',
                                                            padding: '6px',
                                                            '&:hover': {
                                                                backgroundColor: '#d32f2f'
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
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
                                        src={`${API_STORAGE_URL}/${store.logo}`}
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

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Delete Product</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Publish Store Dialog */}
            <PublishStoreDialog
                open={publishDialogOpen}
                onClose={() => setPublishDialogOpen(false)}
                store={store}
                onSuccess={handlePublishSuccess}
            />
        </>
    );
}

export default StoreDashboardPage;
