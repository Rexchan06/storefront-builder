import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, Button, CircularProgress } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import StoreNavBar from '../components/StoreNavBar';

function PaymentFailedPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
            }
        };

        fetchStore();
    }, [slug]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
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
                <Container maxWidth="md">
                    <Paper elevation={3} sx={{ padding: 4, borderRadius: '12px', textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                            <ErrorIcon sx={{ fontSize: 80, color: '#f44336' }} />
                        </Box>

                        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 1, color: '#f44336' }}>
                            Payment Failed
                        </Typography>

                        <Typography variant="body1" sx={{ color: '#666', marginBottom: 2 }}>
                            Unfortunately, we couldn't process your payment.
                        </Typography>

                        <Box sx={{ backgroundColor: '#fff3e0', padding: 2, borderRadius: '8px', marginBottom: 3 }}>
                            <Typography variant="body2" sx={{ color: '#e65100' }}>
                                <strong>Common reasons for payment failure:</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', marginTop: 1, textAlign: 'left', marginLeft: 2 }}>
                                • Insufficient funds in your account<br />
                                • Incorrect card details<br />
                                • Card expired or blocked<br />
                                • Transaction declined by your bank<br />
                                • Network or connection issues
                            </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ color: '#666', marginBottom: 3 }}>
                            Please check your payment details and try again, or use a different payment method.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate(`/store/${slug}/cart`)}
                                sx={{
                                    backgroundColor: '#00bcd4',
                                    color: 'white',
                                    textTransform: 'none',
                                    padding: '12px 24px',
                                    '&:hover': {
                                        backgroundColor: '#00a5bb'
                                    }
                                }}
                            >
                                Retry Payment
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => navigate(`/store/${slug}`)}
                                sx={{
                                    borderColor: '#666',
                                    color: '#666',
                                    textTransform: 'none',
                                    padding: '12px 24px',
                                    '&:hover': {
                                        borderColor: '#333',
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                Continue Shopping
                            </Button>
                        </Box>

                        <Typography variant="caption" sx={{ color: '#999', marginTop: 3, display: 'block' }}>
                            Need help? Contact {store.contact_email || 'store support'}
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        </>
    );
}

export default PaymentFailedPage;
