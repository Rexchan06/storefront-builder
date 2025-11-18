import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Alert, CircularProgress, Divider } from '@mui/material';
import StoreNavBar from '../components/StoreNavBar';
import LoadingScreen from '../components/LoadingScreen';
import { useCart } from '../context/CartContext';
import { API_URL } from '../services/api';
import { updatePageForStore } from '../utils/pageUtils';

function CheckoutForm({ store, cartItems, totalAmount, onRedirecting }) {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        notes: ''
    });

    // Auto-fill customer data if logged in
    useEffect(() => {
        const customer = localStorage.getItem('customer');
        if (customer) {
            const customerData = JSON.parse(customer);
            setFormData(prev => ({
                ...prev,
                customer_name: customerData.name || '',
                customer_email: customerData.email || '',
                customer_phone: customerData.phone || '',
                customer_address: customerData.address || '',
            }));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };

            const customerToken = localStorage.getItem('customerToken');
            if (customerToken) {
                headers['Authorization'] = `Bearer ${customerToken}`;
            }

            // Step 1: Create order
            const orderResponse = await fetch(`${API_URL}/api/customer/orders`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    store_id: store.id,
                    customer_name: formData.customer_name,
                    customer_email: formData.customer_email,
                    customer_phone: formData.customer_phone,
                    customer_address: formData.customer_address,
                    items: cartItems.map(item => ({
                        product_id: item.productId,
                        quantity: item.quantity
                    })),
                    payment_method: 'stripe',
                    notes: formData.notes
                })
            });

            const orderData = await orderResponse.json();

            if (!orderResponse.ok) {
                throw new Error(orderData.message || 'Failed to create order');
            }

            const order = orderData.order;

            // Step 2: Create Stripe Checkout Session
            const checkoutResponse = await fetch(`${API_URL}/api/payments/stripe/create-checkout-session`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    order_id: order.id
                })
            });

            const checkoutData = await checkoutResponse.json();

            if (!checkoutResponse.ok) {
                throw new Error(checkoutData.message || 'Failed to create checkout session');
            }

            // Step 3: Redirect to Stripe Checkout
            onRedirecting(true);
            clearCart();
            window.location.href = checkoutData.checkout_url;

        } catch (err) {
            setError(err.message || 'Payment failed. Please try again.');
            setLoading(false);
            onRedirecting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
                Customer Information
            </Typography>

            {error && (
                <Alert severity="error" sx={{ marginBottom: 3 }}>
                    {error}
                </Alert>
            )}

            <TextField
                fullWidth
                label="Full Name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                sx={{ marginBottom: 2 }}
            />

            <TextField
                fullWidth
                label="Email"
                name="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={handleChange}
                required
                sx={{ marginBottom: 2 }}
            />

            <TextField
                fullWidth
                label="Phone Number"
                name="customer_phone"
                type="tel"
                placeholder="+60123456789"
                value={formData.customer_phone}
                onChange={handleChange}
                required
                sx={{ marginBottom: 2 }}
            />

            <TextField
                fullWidth
                label="Delivery Address"
                name="customer_address"
                multiline
                rows={3}
                value={formData.customer_address}
                onChange={handleChange}
                required
                sx={{ marginBottom: 2 }}
            />

            <TextField
                fullWidth
                label="Order Notes (Optional)"
                name="notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                sx={{ marginBottom: 3 }}
            />

            <Divider sx={{ marginBottom: 3 }} />

            <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                Payment
            </Typography>

            <Typography sx={{ marginBottom: 3 }}>
                You will be redirected to Stripe to complete your payment securely.
            </Typography>

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
                    '&:hover': {
                        backgroundColor: '#00a5bb'
                    },
                    '&:disabled': {
                        backgroundColor: '#ccc'
                    }
                }}
            >
                {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                    `Proceed to Pay RM${totalAmount.toFixed(2)}`
                )}
            </Button>

            <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                <Link to={`/store/${slug}/cart`} style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                    ← Back to Cart
                </Link>
            </Box>
        </Box>
    );
}

function CheckoutPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { cart, getCartTotal } = useCart();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/stores/${slug}`);
                const data = await response.json();
                if (response.ok) {
                    setStore(data.store);

                    // Update page title and favicon for this store
                    updatePageForStore(data.store);
                }
            } catch (err) {
                console.error('Failed to fetch store:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, [slug]);

    const cartItems = cart.storeSlug === slug ? cart.items : [];
    const totalAmount = getCartTotal();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!store) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>Store not found</Typography>
            </Box>
        );
    }

    if (cartItems.length === 0 && !redirecting) {
        return (
            <>
                <StoreNavBar store={store} isPublic={true} />
                <Container maxWidth="md" sx={{ marginTop: 4 }}>
                    <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
                        <Typography variant="h5">Your cart is empty</Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate(`/store/${slug}`)}
                            sx={{ marginTop: 2 }}
                        >
                            Continue Shopping
                        </Button>
                    </Paper>
                </Container>
            </>
        );
    }

    if (redirecting) {
        return (
            <>
                <StoreNavBar store={store} isPublic={true} />
                <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        padding: 4
                    }}>
                        <CircularProgress size={60} />
                        <Typography variant="h5" color="text.secondary">
                            Redirecting to secure payment...
                        </Typography>
                    </Box>
                </Box>
            </>
        );
    }

    return (
        <>
            <StoreNavBar store={store} isPublic={true} />

            <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
                <Container maxWidth="md">
                    <Paper elevation={3} sx={{ padding: 4, borderRadius: '12px' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                            Checkout
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', marginBottom: 4 }}>
                            Complete your order at <strong>{store.store_name}</strong>
                        </Typography>

                        {/* Order Summary */}
                        <Box sx={{ backgroundColor: '#f9f9f9', padding: 2, borderRadius: '8px', marginBottom: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                                Order Summary
                            </Typography>
                            {cartItems.map((item) => (
                                <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                                    <Typography>{item.name} x {item.quantity}</Typography>
                                    <Typography fontWeight="bold">RM{(item.price * item.quantity).toFixed(2)}</Typography>
                                </Box>
                            ))}
                            <Divider sx={{ margin: '12px 0' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight="bold">Total</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                    RM{totalAmount.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>

                        <CheckoutForm
                            store={store}
                            cartItems={cartItems}
                            totalAmount={totalAmount}
                            onRedirecting={setRedirecting}
                        />
                    </Paper>
                </Container>
            </Box>
        </>
    );
}

export default CheckoutPage;