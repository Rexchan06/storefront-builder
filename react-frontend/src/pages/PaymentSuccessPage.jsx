import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Container, Paper, Button, CircularProgress, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StoreNavBar from '../components/StoreNavBar';
import LoadingScreen from '../components/LoadingScreen';
import { API_URL } from '../services/api';
import { updatePageForStore } from '../utils/pageUtils';

function PaymentSuccessPage() {
    const { slug, orderId } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if customer is logged in
        const customerToken = localStorage.getItem('customerToken');
        setIsLoggedIn(!!customerToken);

        const fetchData = async () => {
            try {
                // Fetch store
                const storeResponse = await fetch(`${API_URL}/api/public/stores/${slug}`);
                const storeData = await storeResponse.json();
                if (storeResponse.ok) {
                    setStore(storeData.store);

                    // Update page title and favicon for this store
                    updatePageForStore(storeData.store);
                }

                // Verify payment and update order status
                if (orderId) {
                    const verifyResponse = await fetch(`${API_URL}/api/payments/stripe/verify-payment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ order_id: orderId })
                    });

                    if (verifyResponse.ok) {
                        const verifyData = await verifyResponse.json();
                        setOrder(verifyData.order);
                    } else {
                        // If verification fails, still fetch order details
                        const orderResponse = await fetch(`${API_URL}/api/public/orders/${orderId}`, {
                            headers: {
                                'Accept': 'application/json'
                            }
                        });
                        const orderData = await orderResponse.json();
                        if (orderResponse.ok) {
                            setOrder(orderData);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, orderId]);

    if (loading) {
        return <LoadingScreen message="Processing payment..." />;
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
                            <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50' }} />
                        </Box>

                        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 1, color: '#4caf50' }}>
                            Payment Successful!
                        </Typography>

                        <Typography variant="body1" sx={{ color: '#666', marginBottom: 4 }}>
                            Thank you for your order. Your payment has been processed successfully.
                        </Typography>

                        {order && (
                            <Box sx={{ backgroundColor: '#f9f9f9', padding: 3, borderRadius: '8px', marginBottom: 3, textAlign: 'left' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                                    Order Details
                                </Typography>

                                <Box sx={{ marginBottom: 1 }}>
                                    <Typography variant="body2" color="textSecondary">Order Number</Typography>
                                    <Typography variant="body1" fontWeight="bold">{order.order_number}</Typography>
                                </Box>

                                <Box sx={{ marginBottom: 1 }}>
                                    <Typography variant="body2" color="textSecondary">Order Date</Typography>
                                    <Typography variant="body1">{new Date(order.created_at).toLocaleDateString()}</Typography>
                                </Box>

                                <Box sx={{ marginBottom: 2 }}>
                                    <Typography variant="body2" color="textSecondary">Delivery Address</Typography>
                                    <Typography variant="body1">{order.customer_address}</Typography>
                                </Box>

                                <Divider sx={{ margin: '16px 0' }} />

                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                                    Items
                                </Typography>

                                {order.order_items && order.order_items.map((item) => (
                                    <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                                        <Typography>{item.product_name} x {item.quantity}</Typography>
                                        <Typography fontWeight="bold">RM{parseFloat(item.total_price).toFixed(2)}</Typography>
                                    </Box>
                                ))}

                                <Divider sx={{ margin: '16px 0' }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6" fontWeight="bold">Total Amount</Typography>
                                    <Typography variant="h6" fontWeight="bold" color="primary">
                                        RM{parseFloat(order.total_amount).toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* <Typography variant="body2" sx={{ color: '#666', marginBottom: 3 }}>
                            A confirmation email has been sent to <strong>{order?.customer_email}</strong>
                        </Typography> */}

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate(`/store/${slug}`)}
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
                                Continue Shopping
                            </Button>

                            {order && isLoggedIn && (
                                <Button
                                    variant="outlined"
                                    component={Link}
                                    to={`/store/${slug}/orders`}
                                    sx={{
                                        borderColor: '#00bcd4',
                                        color: '#00bcd4',
                                        textTransform: 'none',
                                        padding: '12px 24px',
                                        '&:hover': {
                                            borderColor: '#00a5bb',
                                            backgroundColor: 'rgba(0, 188, 212, 0.04)'
                                        }
                                    }}
                                >
                                    View Order History
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </>
    );
}

export default PaymentSuccessPage;
