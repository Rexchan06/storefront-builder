import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Checkbox, FormControlLabel } from '@mui/material';
import NavBar from '../components/NavBar';

function StoreFormPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        store_name: '',
        store_slug: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        is_active: true
    });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:8000/api/stores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Store creation failed' });
                }
                return;
            }

            // Store the store data
            localStorage.setItem('store', JSON.stringify(data.store));

            // Redirect to store dashboard
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
                                Create Your Store
                            </Typography>

                            <Box component="form" onSubmit={handleSubmit}>
                                <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Store Name *
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="store_name"
                                    type="text"
                                    placeholder="Enter your store name"
                                    value={formData.store_name}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.store_name}
                                    helperText={errors.store_name ? errors.store_name[0] : ''}
                                    sx={{ marginBottom: 2 }}
                                />

                                <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Store Slug * (URL identifier)
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="store_slug"
                                    type="text"
                                    placeholder="e.g., my-awesome-store"
                                    value={formData.store_slug}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.store_slug}
                                    helperText={errors.store_slug ? errors.store_slug[0] : 'Use lowercase letters, numbers, and hyphens'}
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
                                    placeholder="Describe your store"
                                    value={formData.description}
                                    onChange={handleChange}
                                    error={!!errors.description}
                                    helperText={errors.description ? errors.description[0] : ''}
                                    sx={{ marginBottom: 2 }}
                                />

                                <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Contact Email
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="contact_email"
                                    type="email"
                                    placeholder="contact@yourstore.com"
                                    value={formData.contact_email}
                                    onChange={handleChange}
                                    error={!!errors.contact_email}
                                    helperText={errors.contact_email ? errors.contact_email[0] : ''}
                                    sx={{ marginBottom: 2 }}
                                />

                                <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Contact Phone
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="contact_phone"
                                    type="tel"
                                    placeholder="+1234567890"
                                    value={formData.contact_phone}
                                    onChange={handleChange}
                                    error={!!errors.contact_phone}
                                    helperText={errors.contact_phone ? errors.contact_phone[0] : ''}
                                    sx={{ marginBottom: 2 }}
                                />

                                <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5, color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Address
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="address"
                                    multiline
                                    rows={3}
                                    placeholder="Store address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    error={!!errors.address}
                                    helperText={errors.address ? errors.address[0] : ''}
                                    sx={{ marginBottom: 2 }}
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                        />
                                    }
                                    label="Set store as active"
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
                                    {loading ? 'Creating Store...' : 'Create Store'}
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </Container>
            </Box>
        </>
    );
}

export default StoreFormPage;
