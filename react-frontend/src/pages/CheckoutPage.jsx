import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Alert, CircularProgress, Divider } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import StoreNavBar from '../components/StoreNavBar';
import { useCart } from '../context/CartContext';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

function CheckoutForm({ store, cartItems, totalAmount }) {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const stripe = useStripe();
    const elements = useElements();

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
                customer_email: customerData.email || ''
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

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        try {
            // Step 1: Create order
            const orderResponse = await fetch('http://localhost:8000/api/customer/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('customerToken') || ''}`
                },
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

            // Step 2: Create payment intent
            const paymentIntentResponse = await fetch('http://localhost:8000/api/payments/stripe/create-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('customerToken') || ''}`
                },
                body: JSON.stringify({
                    order_id: order.id,
                    amount: totalAmount
                })
            });

            const paymentIntentData = await paymentIntentResponse.json();

            if (!paymentIntentResponse.ok) {
                throw new Error(paymentIntentData.message || 'Failed to create payment intent');
            }

            // Step 3: Confirm card payment
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                paymentIntentData.client_secret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: formData.customer_name,
                            email: formData.customer_email,
                            phone: formData.customer_phone,
                            address: {
                                line1: formData.customer_address
                            }
                        }
                    }
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            if (paymentIntent.status === 'succeeded') {
                // Clear cart
                clearCart();

                // Navigate to success page
                navigate(`/store/${slug}/payment-success/${order.id}`);
            }

        } catch (err) {
            setError(err.message || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
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
                Payment Information
            </Typography>

            <Box sx={{
                padding: 2,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: 3
            }}>
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                }} />
            </Box>

            <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!stripe || loading}
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
                    `Pay RM${totalAmount.toFixed(2)}`
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

    const cartItems = cart.storeSlug === slug ? cart.items : [];
    const totalAmount = getCartTotal();

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

    if (cartItems.length === 0) {
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

                        {/* Checkout Form with Stripe */}
                        <Elements stripe={stripePromise}>
                            <CheckoutForm store={store} cartItems={cartItems} totalAmount={totalAmount} />
                        </Elements>
                    </Paper>
                </Container>
            </Box>
        </>
    );
}

export default CheckoutPage;
