import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Button, IconButton, Card, CardContent, CardMedia } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StoreNavBar from '../../components/StoreNavBar';
import LoadingScreen from '../../components/LoadingScreen';
import { useCart } from '../../context/CartContext';
import { useState, useEffect } from 'react';
import { API_URL, API_STORAGE_URL } from '../../services/api';
import { updatePageForStore } from '../../utils/pageUtils';

function ShoppingCartPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <LoadingScreen />;
    }

    if (!store) {
        return null;
    }

    const cartItems = cart.storeSlug === slug ? cart.items : [];
    const total = getCartTotal();

    return (
        <>
            <StoreNavBar store={store} isPublic={true} />

            <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
                        Shopping Cart
                    </Typography>

                    {cartItems.length === 0 ? (
                        <Box
                            sx={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '60px 40px',
                                textAlign: 'center'
                            }}
                        >
                            <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: '#ccc', marginBottom: 2 }} />
                            <Typography variant="h5" sx={{ color: '#666', marginBottom: 2 }}>
                                Your cart is empty
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#999', marginBottom: 3 }}>
                                Add some products to get started!
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate(`/store/${slug}`)}
                                sx={{
                                    backgroundColor: '#00bcd4',
                                    color: 'white',
                                    textTransform: 'none',
                                    padding: '10px 30px',
                                    '&:hover': {
                                        backgroundColor: '#00a5bb'
                                    }
                                }}
                            >
                                Continue Shopping
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 3 }}>
                            {/* Cart Items */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {cartItems.map((item) => {
                                    const itemPrice = parseFloat(item.price);
                                    const displayPrice = isNaN(itemPrice) ? '0.00' : itemPrice.toFixed(2);
                                    const itemSubtotal = isNaN(itemPrice) ? '0.00' : (itemPrice * item.quantity).toFixed(2);

                                    return (
                                        <Card key={item.productId} sx={{ display: 'flex', padding: 2 }}>
                                            <CardMedia
                                                component="img"
                                                sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '8px' }}
                                                image={
                                                    item.image
                                                        ? `${API_STORAGE_URL}/${item.image}`
                                                        : '/placeholder.png'
                                                }
                                                alt={item.name}
                                            />
                                            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                                                        {item.name}
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ color: '#00bcd4', fontWeight: 'bold' }}>
                                                        RM {displayPrice}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                                                    {/* Quantity Controls */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                            sx={{
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: '4px'
                                                            }}
                                                        >
                                                            <RemoveIcon fontSize="small" />
                                                        </IconButton>
                                                        <Typography sx={{ minWidth: '40px', textAlign: 'center', fontWeight: 'bold' }}>
                                                            {item.quantity}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                            disabled={item.quantity >= item.stock}
                                                            sx={{
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: '4px'
                                                            }}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>

                                                    {/* Subtotal and Remove */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                            RM {itemSubtotal}
                                                        </Typography>
                                                        <IconButton
                                                            onClick={() => removeFromCart(item.productId)}
                                                            sx={{ color: '#f44336' }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Box>

                            {/* Cart Summary */}
                            <Box>
                                <Card sx={{ padding: 3, position: 'sticky', top: 20 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
                                        Order Summary
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <Typography sx={{ color: '#666' }}>Subtotal ({cartItems.length} items)</Typography>
                                        <Typography sx={{ fontWeight: 'bold' }}>RM {total.toFixed(2)}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, paddingBottom: 2, borderBottom: '1px solid #e0e0e0' }}>
                                        <Typography sx={{ color: '#666' }}>Shipping</Typography>
                                        <Typography sx={{ fontWeight: 'bold', color: '#00bcd4' }}>FREE</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00bcd4' }}>
                                            RM {total.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => navigate(`/store/${slug}/checkout`)}
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
                                            }
                                        }}
                                    >
                                        Proceed to Checkout
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate(`/store/${slug}`)}
                                        sx={{
                                            color: '#00bcd4',
                                            borderColor: '#00bcd4',
                                            textTransform: 'none',
                                            padding: '12px',
                                            fontSize: '16px',
                                            '&:hover': {
                                                borderColor: '#00a5bb',
                                                backgroundColor: 'transparent'
                                            }
                                        }}
                                    >
                                        Continue Shopping
                                    </Button>
                                </Card>
                            </Box>
                        </Box>
                    )}
                </Container>
            </Box>
        </>
    );
}

export default ShoppingCartPage;
