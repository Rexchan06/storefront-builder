import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Alert,
    Collapse,
    IconButton,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    ShoppingCart as ShoppingCartIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import StoreNavBar from '../../components/StoreNavBar';
import LoadingScreen from '../../components/LoadingScreen';
import { API_URL } from '../../services/api';
import { updatePageForStore } from '../../utils/pageUtils';

function CustomerOrderHistoryPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

    useEffect(() => {
        // Check if customer is logged in
        const customerToken = localStorage.getItem('customerToken');
        if (!customerToken) {
            navigate(`/store/${slug}/login`);
            return;
        }

        fetchStoreAndOrders();
    }, [slug, navigate]);

    const fetchStoreAndOrders = async () => {
        try {
            setLoading(true);
            const customerToken = localStorage.getItem('customerToken');

            // Fetch store info
            const storeResponse = await fetch(`${API_URL}/api/public/stores/${slug}`);
            const storeData = await storeResponse.json();

            if (!storeResponse.ok) {
                throw new Error(storeData.message || 'Failed to load store');
            }

            setStore(storeData.store);

            // Update page title and favicon for this store
            updatePageForStore(storeData.store);

            // Fetch customer orders
            const ordersResponse = await fetch(`${API_URL}/api/customer/orders`, {
                headers: {
                    'Authorization': `Bearer ${customerToken}`,
                    'Accept': 'application/json'
                }
            });

            if (ordersResponse.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customer');
                navigate(`/store/${slug}/login`);
                return;
            }

            const ordersData = await ordersResponse.json();

            if (!ordersResponse.ok) {
                throw new Error(ordersData.message || 'Failed to load orders');
            }

            setOrders(ordersData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (orderId) => {
        setOrderToCancel(orderId);
        setCancelDialogOpen(true);
    };

    const handleCancelConfirm = async () => {
        if (!orderToCancel) return;

        try {
            const customerToken = localStorage.getItem('customerToken');
            const response = await fetch(`${API_URL}/api/customer/orders/${orderToCancel}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${customerToken}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            setCancelDialogOpen(false);
            setOrderToCancel(null);

            if (!response.ok) {
                setSuccessMessage({
                    title: 'Error',
                    message: data.message || 'Failed to cancel order'
                });
                setSuccessDialogOpen(true);
                return;
            }

            setSuccessMessage({
                title: 'Order Cancelled',
                message: 'Your order has been cancelled successfully.'
            });
            setSuccessDialogOpen(true);
            fetchStoreAndOrders(); // Refresh orders
        } catch (err) {
            setCancelDialogOpen(false);
            setOrderToCancel(null);
            setSuccessMessage({
                title: 'Error',
                message: 'Failed to cancel order: ' + err.message
            });
            setSuccessDialogOpen(true);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'paid':
                return 'success';
            case 'shipped':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const OrderRow = ({ order }) => {
        const isExpanded = expandedOrder === order.id;

        return (
            <>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell>
                        <IconButton
                            size="small"
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                            #{order.order_number}
                        </Typography>
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                        <Chip
                            label={order.status.toUpperCase()}
                            color={getStatusColor(order.status)}
                            size="small"
                        />
                    </TableCell>
                    <TableCell>
                        <Typography fontWeight="bold">
                            RM{parseFloat(order.total_amount).toFixed(2)}
                        </Typography>
                    </TableCell>
                    <TableCell align="right">
                        {order.status === 'pending' && (
                            <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() => handleCancelClick(order.id)}
                            >
                                Cancel
                            </Button>
                        )}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Order Details
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Payment Method:</strong> {order.payment_method.toUpperCase()}
                                    </Typography>
                                    {order.notes && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            <strong>Notes:</strong> {order.notes}
                                        </Typography>
                                    )}
                                </Box>

                                <Typography variant="subtitle2" gutterBottom>
                                    Order Items
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                            <TableCell align="right">Unit Price</TableCell>
                                            <TableCell align="right">Subtotal</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.order_items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    {item.product ? item.product.name : item.product_name}
                                                </TableCell>
                                                <TableCell align="right">{item.quantity}</TableCell>
                                                <TableCell align="right">
                                                    RM{parseFloat(item.unit_price).toFixed(2)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    RM{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} align="right">
                                                <strong>Total:</strong>
                                            </TableCell>
                                            <TableCell align="right">
                                                <strong>RM{parseFloat(order.total_amount).toFixed(2)}</strong>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle2" gutterBottom>
                                    Delivery Information
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Name:</strong> {order.customer_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Email:</strong> {order.customer_email}
                                </Typography>
                                {order.customer_phone && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Phone:</strong> {order.customer_phone}
                                    </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Address:</strong> {order.customer_address}
                                </Typography>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </>
        );
    };

    if (loading) {
        return <LoadingScreen message="Loading your orders..." />;
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {store && <StoreNavBar store={store} />}

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ReceiptIcon sx={{ fontSize: 32, color: '#00bcd4' }} />
                        <Typography variant="h4" fontWeight="bold">
                            Order History
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                        View and manage your orders
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {!error && orders.length === 0 && (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <ShoppingCartIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Orders Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            You haven't placed any orders yet. Start shopping to see your order history here.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(`/store/${slug}`)}
                        >
                            Start Shopping
                        </Button>
                    </Paper>
                )}

                {!error && orders.length > 0 && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell />
                                    <TableCell><strong>Order Number</strong></TableCell>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Total</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order) => (
                                    <OrderRow key={order.id} order={order} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Cancel Confirmation Dialog */}
                <Dialog
                    open={cancelDialogOpen}
                    onClose={() => setCancelDialogOpen(false)}
                >
                    <DialogTitle>Cancel Order</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCancelDialogOpen(false)} color="primary">
                            No, Keep Order
                        </Button>
                        <Button onClick={handleCancelConfirm} color="error" variant="contained">
                            Yes, Cancel Order
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Success/Error Dialog */}
                <Dialog
                    open={successDialogOpen}
                    onClose={() => setSuccessDialogOpen(false)}
                >
                    <DialogTitle>{successMessage.title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {successMessage.message}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSuccessDialogOpen(false)} variant="contained" color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default CustomerOrderHistoryPage;
