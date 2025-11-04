import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material';
import StoreNavBar from '../../components/StoreNavBar';

function CustomerLoginPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [storeLoading, setStoreLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/public/stores/${slug}`);
                const data = await response.json();
                if (response.ok) {
                    setStore(data.store);
                }
            } catch (err) {
                console.error('Failed to fetch store:', err);
            } finally {
                setStoreLoading(false);
            }
        };

        fetchStore();
    }, [slug]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error for this field
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

        try {
            const response = await fetch('http://localhost:8000/api/customer/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    store_id: store.id,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Login failed' });
                }
                return;
            }

            // Store customer token and data
            localStorage.setItem('customerToken', data.token);
            localStorage.setItem('customer', JSON.stringify(data.customer));

            // Redirect back to store
            navigate(`/store/${slug}`);
        } catch (err) {
            setErrors({ general: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    if (storeLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    if (!store) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Store not found</Typography>
            </Box>
        );
    }

    return (
        <>
            <StoreNavBar store={store} isPublic={true} />

            <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
                <Container maxWidth="sm">
                    <Paper elevation={3} sx={{ padding: 4, borderRadius: '12px' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 1 }}>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'center', color: '#666', marginBottom: 4 }}>
                            Login to your account at <strong>{store.store_name}</strong>
                        </Typography>

                        {errors.general && (
                            <Alert severity="error" sx={{ marginBottom: 3 }}>
                                {errors.general}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                error={!!errors.email}
                                helperText={errors.email ? errors.email[0] : ''}
                                sx={{ marginBottom: 3 }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                error={!!errors.password}
                                helperText={errors.password ? errors.password[0] : ''}
                                sx={{ marginBottom: 3 }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    backgroundColor: '#00bcd4',
                                    color: 'white',
                                    textTransform: 'none',
                                    padding: '12px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    marginBottom: 2,
                                    '&:hover': {
                                        backgroundColor: '#00a5bb'
                                    },
                                    '&:disabled': {
                                        backgroundColor: '#ccc'
                                    }
                                }}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>

                            <Typography variant="body2" sx={{ textAlign: 'center', color: '#666' }}>
                                Don't have an account?{' '}
                                <Link
                                    to={`/store/${slug}/register`}
                                    style={{ color: '#00bcd4', textDecoration: 'none', fontWeight: 'bold' }}
                                >
                                    Register here
                                </Link>
                            </Typography>
                        </Box>
                    </Paper>

                    <Box sx={{ textAlign: 'center', marginTop: 3 }}>
                        <Link
                            to={`/store/${slug}`}
                            style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}
                        >
                            ← Back to Store
                        </Link>
                    </Box>
                </Container>
            </Box>
        </>
    );
}

export default CustomerLoginPage;
