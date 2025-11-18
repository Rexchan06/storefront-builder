import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavBar from '../components/NavBar';
import AdminBar from '../components/AdminBar';
import LoadingScreen from '../components/LoadingScreen';
import PublishStoreDialog from '../components/PublishStoreDialog';
import { API_URL, API_STORAGE_URL } from '../services/api';

function ProductFormPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const productId = location.state?.productId;
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        stock_quantity: '',
        is_active: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [existingImage, setExistingImage] = useState(null);
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

                // If editing, fetch product details
                if (productId) {
                    const productResponse = await fetch(`${API_URL}/api/products/${productId}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (productResponse.ok) {
                        const productData = await productResponse.json();
                        setFormData({
                            name: productData.name,
                            category: productData.category || '',
                            description: productData.description || '',
                            price: productData.price,
                            stock_quantity: productData.stock_quantity,
                            is_active: productData.is_active
                        });
                        if (productData.image) {
                            setExistingImage(productData.image);
                            setImagePreview(`${API_STORAGE_URL}/${productData.image}`);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching store:', err);
            }
        };

        fetchStoreAndProducts();
    }, [navigate, productId]);

    const handlePublishClick = () => {
        setPublishDialogOpen(true);
    };

    const handlePublishSuccess = (updatedStore) => {
        setStore(updatedStore);
        // Don't close the dialog - let the user close it manually or via "View Store" button
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            // Create FormData object for file upload
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('category', formData.category);
            submitData.append('description', formData.description);
            submitData.append('price', formData.price);
            submitData.append('stock_quantity', formData.stock_quantity);
            submitData.append('is_active', formData.is_active ? '1' : '0');

            // Append image file if selected
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            // For PUT requests, we need to use _method workaround for Laravel
            if (productId) {
                submitData.append('_method', 'PUT');
            }

            const url = productId
                ? `${API_URL}/api/products/${productId}`
                : `${API_URL}/api/products`;

            const response = await fetch(url, {
                method: 'POST', // Always POST, Laravel will read _method for PUT
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type, browser will set it with boundary for FormData
                },
                body: submitData
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || (productId ? 'Product update failed' : 'Product creation failed') });
                }
                return;
            }

            // Redirect back to store dashboard
            navigate('/store-dashboard');
        } catch (err) {
            setErrors({ general: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!store) {
        return <LoadingScreen />;
    }

    return (
        <>
            <NavBar />
            <AdminBar store={store} handlePublish={handlePublishClick} productCount={products.length} />
            <Box
                sx={{
                    backgroundColor: '#b3d9f2',
                    minHeight: '100vh',
                    paddingTop: 8,
                    paddingBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={0}
                        sx={{
                            padding: 5,
                            backgroundColor: '#f5f5f5',
                            borderRadius: 3
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                marginBottom: 4,
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}
                        >
                            <span style={{ color: '#000' }}>{productId ? 'Edit' : 'Add'} </span>
                            <span style={{ color: '#f44336' }}>{productId ? 'Product' : 'Products'}</span>
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#000', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '11px' }}>
                                Product Name
                            </Typography>
                            <TextField
                                fullWidth
                                name="name"
                                type="text"
                                placeholder="Wireless Bluetooth Earbuds"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                error={!!errors.name}
                                helperText={errors.name ? errors.name[0] : ''}
                                sx={{
                                    marginBottom: 3,
                                    backgroundColor: 'white',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px'
                                    }
                                }}
                            />

                            <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#000', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '11px' }}>
                                Category
                            </Typography>
                            <TextField
                                fullWidth
                                name="category"
                                type="text"
                                placeholder="Electronics"
                                value={formData.category}
                                onChange={handleChange}
                                error={!!errors.category}
                                helperText={errors.category ? errors.category[0] : ''}
                                sx={{
                                    marginBottom: 3,
                                    backgroundColor: 'white',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px'
                                    }
                                }}
                            />

                            <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#000', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '11px' }}>
                                        Price
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="price"
                                        type="number"
                                        placeholder="RM129"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        inputProps={{ step: '0.01', min: '0' }}
                                        error={!!errors.price}
                                        helperText={errors.price ? errors.price[0] : ''}
                                        sx={{
                                            backgroundColor: 'white',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px'
                                            }
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#000', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '11px' }}>
                                        Quantity
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="stock_quantity"
                                        type="number"
                                        placeholder="50"
                                        value={formData.stock_quantity}
                                        onChange={handleChange}
                                        required
                                        inputProps={{ step: '1', min: '0' }}
                                        error={!!errors.stock_quantity}
                                        helperText={errors.stock_quantity ? errors.stock_quantity[0] : ''}
                                        sx={{
                                            backgroundColor: 'white',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px'
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#000', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '11px' }}>
                                Description
                            </Typography>
                            <TextField
                                fullWidth
                                name="description"
                                multiline
                                rows={5}
                                placeholder="Experience premium sound quality with noise cancellation and up to 24 hours of battery life"
                                value={formData.description}
                                onChange={handleChange}
                                error={!!errors.description}
                                helperText={errors.description ? errors.description[0] : ''}
                                sx={{
                                    marginBottom: 3,
                                    backgroundColor: 'white',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px'
                                    }
                                }}
                            />

                            <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#000', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '11px' }}>
                                Product Image
                            </Typography>
                            <Box
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: '8px',
                                    padding: 4,
                                    textAlign: 'center',
                                    backgroundColor: 'white',
                                    marginBottom: 3,
                                    cursor: 'pointer',
                                    minHeight: '150px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}
                            >
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    id="file-upload"
                                />
                                {imagePreview ? (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '10px' }}
                                        />
                                        <Typography variant="caption" sx={{ color: '#666' }}>
                                            {imageFile?.name}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <>
                                        <CloudUploadIcon sx={{ fontSize: 40, color: '#ccc', marginBottom: 1 }} />
                                        <Typography sx={{ color: '#666', fontSize: '14px' }}>
                                            Drag and Drop file or{' '}
                                            <label htmlFor="file-upload" style={{ color: '#000', textDecoration: 'underline', cursor: 'pointer' }}>
                                                Choose file
                                            </label>
                                        </Typography>
                                    </>
                                )}
                            </Box>
                            {errors.image && (
                                <Typography variant="caption" color="error" sx={{ display: 'block', marginBottom: 2 }}>
                                    {errors.image[0]}
                                </Typography>
                            )}

                            {errors.general && (
                                <Typography
                                    color="error"
                                    sx={{ marginBottom: 2, textAlign: 'center' }}
                                >
                                    {errors.general}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, marginTop: 4 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/store-dashboard')}
                                    sx={{
                                        color: '#666',
                                        borderColor: '#ccc',
                                        textTransform: 'none',
                                        padding: '10px 30px',
                                        fontSize: '14px',
                                        borderRadius: '6px',
                                        backgroundColor: 'white',
                                        '&:hover': {
                                            borderColor: '#999',
                                            backgroundColor: '#f9f9f9'
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        backgroundColor: '#000',
                                        color: 'white',
                                        textTransform: 'none',
                                        padding: '10px 30px',
                                        fontSize: '14px',
                                        borderRadius: '6px',
                                        '&:hover': {
                                            backgroundColor: '#333'
                                        }
                                    }}
                                >
                                    {loading ? (productId ? 'Updating...' : 'Adding...') : (productId ? 'Update' : 'Add')}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            </Box>

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

export default ProductFormPage;
