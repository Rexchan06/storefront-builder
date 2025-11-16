import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material';
import StoreNavBar from '../../components/StoreNavBar';
import LoadingScreen from '../../components/LoadingScreen';
import { API_URL, API_STORAGE_URL } from '../../services/api';

function CustomerRegisterPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [storeLoading, setStoreLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/stores/${slug}`);
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

        // Frontend validation for password confirmation
        if (formData.password !== formData.password_confirmation) {
            setErrors({ password_confirmation: ['Passwords do not match'] });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/customer/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    store_id: store.id,
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    password_confirmation: formData.password_confirmation,
                    phone: formData.phone,
                    address: formData.address
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Registration failed' });
                }
                return;
            }

            // Store customer token and data (auto-login)
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
        return <LoadingScreen />;
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
                            Create Account
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'center', color: '#666', marginBottom: 4 }}>
                            Register for an account at <strong>{store.store_name}</strong>
                        </Typography>

                        {errors.general && (
                            <Alert severity="error" sx={{ marginBottom: 3 }}>
                                {errors.general}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                error={!!errors.name}
                                helperText={errors.name ? errors.name[0] : ''}
                                sx={{ marginBottom: 3 }}
                            />

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
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                placeholder="+60123456789"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                error={!!errors.phone}
                                helperText={errors.phone ? errors.phone[0] : ''}
                                sx={{ marginBottom: 3 }}
                            />

                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                multiline
                                rows={3}
                                placeholder="Enter your full delivery address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                error={!!errors.address}
                                helperText={errors.address ? errors.address[0] : ''}
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
                                helperText={errors.password ? errors.password[0] : 'Minimum 8 characters'}
                                sx={{ marginBottom: 3 }}
                            />

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="password_confirmation"
                                type="password"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                required
                                error={!!errors.password_confirmation}
                                helperText={errors.password_confirmation ? errors.password_confirmation[0] : ''}
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
                                {loading ? 'Creating Account...' : 'Register'}
                            </Button>

                            <Typography variant="body2" sx={{ textAlign: 'center', color: '#666' }}>
                                Already have an account?{' '}
                                <Link
                                    to={`/store/${slug}/login`}
                                    style={{ color: '#00bcd4', textDecoration: 'none', fontWeight: 'bold' }}
                                >
                                    Login here
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

export default CustomerRegisterPage;
