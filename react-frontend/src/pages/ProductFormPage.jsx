import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Checkbox, FormControlLabel } from '@mui/material';
import NavBar from '../components/NavBar';

function ProductFormPage() {
    const navigate = useNavigate();
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

            const response = await fetch('http://localhost:8000/api/products', {
                method: 'POST',
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
                    setErrors({ general: data.message || 'Product creation failed' });
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

    return (
        <>
            <NavBar />
            <Box
                sx={{
                    backgroundColor: '#f5f5f5',
                    minHeight: '100vh',
                    paddingBottom: 4
                }}
            >
                <Container maxWidth="md">
                    <Box
                        sx={{
                            paddingTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 4,
                                width: '100%',
                                backgroundColor: 'white',
                                borderRadius: 4
                            }}
                        >
                            <Typography
                                component="h1"
                                variant="h4"
                                sx={{
                                    marginBottom: 3,
                                    color: '#333',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}
                            >
                                Add New Product
                            </Typography>

                            <Box component="form" onSubmit={handleSubmit}>
                                <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Product Name *
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="name"
                                    type="text"
                                    placeholder="Enter product name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.name}
                                    helperText={errors.name ? errors.name[0] : ''}
                                    sx={{ marginBottom: 2 }}
                                />

                                <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Category
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="category"
                                    type="text"
                                    placeholder="e.g., Electronics, Clothing, Food"
                                    value={formData.category}
                                    onChange={handleChange}
                                    error={!!errors.category}
                                    helperText={errors.category ? errors.category[0] : ''}
                                    sx={{ marginBottom: 2 }}
                                />

                                <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Description
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="description"
                                    multiline
                                    rows={4}
                                    placeholder="Describe your product"
                                    value={formData.description}
                                    onChange={handleChange}
                                    error={!!errors.description}
                                    helperText={errors.description ? errors.description[0] : ''}
                                    sx={{ marginBottom: 2 }}
                                />

                                <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Price * (in RM)
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="price"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    inputProps={{ step: '0.01', min: '0' }}
                                    error={!!errors.price}
                                    helperText={errors.price ? errors.price[0] : ''}
                                    sx={{ marginBottom: 2 }}
                                />

                                <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Stock Quantity *
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="stock_quantity"
                                    type="number"
                                    placeholder="0"
                                    value={formData.stock_quantity}
                                    onChange={handleChange}
                                    required
                                    inputProps={{ step: '1', min: '0' }}
                                    error={!!errors.stock_quantity}
                                    helperText={errors.stock_quantity ? errors.stock_quantity[0] : ''}
                                    sx={{ marginBottom: 2 }}
                                />

                                <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Product Image (Optional)
                                </Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    sx={{ marginBottom: 1, textTransform: 'none', justifyContent: 'flex-start' }}
                                >
                                    {imageFile ? imageFile.name : 'Choose Image'}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </Button>
                                {imagePreview && (
                                    <Box sx={{ marginBottom: 2, textAlign: 'center' }}>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                                        />
                                    </Box>
                                )}
                                {errors.image && (
                                    <Typography variant="caption" color="error" sx={{ display: 'block', marginBottom: 2 }}>
                                        {errors.image[0]}
                                    </Typography>
                                )}

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                        />
                                    }
                                    label="Set product as active (visible to customers)"
                                    sx={{ marginBottom: 3 }}
                                />

                                {errors.general && (
                                    <Typography
                                        color="error"
                                        sx={{ marginBottom: 2, textAlign: 'center' }}
                                    >
                                        {errors.general}
                                    </Typography>
                                )}

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => navigate('/store-dashboard')}
                                        sx={{
                                            color: '#666',
                                            borderColor: '#666',
                                            textTransform: 'none',
                                            padding: '12px',
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{
                                            backgroundColor: '#4caf50',
                                            color: 'white',
                                            textTransform: 'none',
                                            padding: '12px',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            '&:hover': {
                                                backgroundColor: '#45a049'
                                            }
                                        }}
                                    >
                                        {loading ? 'Adding Product...' : 'Add Product'}
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Container>
            </Box>
        </>
    );
}

export default ProductFormPage;
