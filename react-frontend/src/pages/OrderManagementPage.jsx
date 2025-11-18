import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import AdminBar from '../components/AdminBar';
import LoadingScreen from '../components/LoadingScreen';
import PublishStoreDialog from '../components/PublishStoreDialog';
import { API_URL, API_STORAGE_URL } from '../services/api';

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch orders and store on component mount
  useEffect(() => {
    fetchStoreAndOrders();
  }, []);

  // Filter orders when statusFilter or orders change
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const fetchStoreAndOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch store, orders, and products data in parallel
      const [storeResponse, ordersResponse, productsResponse] = await Promise.all([
        fetch(`${API_URL}/api/stores`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${API_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${API_URL}/api/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
      ]);

      if (!storeResponse.ok || !ordersResponse.ok) {
        if (storeResponse.status === 401 || ordersResponse.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch data');
      }

      const storeData = await storeResponse.json();
      const ordersData = await ordersResponse.json();
      const productsData = productsResponse.ok ? await productsResponse.json() : [];

      setStore(storeData);
      setOrders(ordersData);
      setProducts(productsData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders after update
      fetchStoreAndOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/orders/${orderToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      // Refresh orders after deletion
      fetchStoreAndOrders();
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'info',
      shipped: 'primary',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return `RM ${parseFloat(amount).toFixed(2)}`;
  };

  const handlePublishClick = () => {
    setPublishDialogOpen(true);
  };

  const handlePublishSuccess = (updatedStore) => {
    setStore(updatedStore);
    // Don't close the dialog - let the user close it manually or via "View Store" button
  };

  if (loading) {
    return (
      <>
        <NavBar />
        {store && <AdminBar store={store} handlePublish={handlePublishClick} productCount={products.length} />}
        <LoadingScreen message="Loading orders..." fullScreen={false} />
      </>
    );
  }

  return (
    <>
      <NavBar />
      {store && <AdminBar store={store} handlePublish={handlePublishClick} productCount={products.length} />}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Order Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all orders for your store
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Status Filter */}
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Orders</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Orders Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Order #</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Items</strong></TableCell>
                <TableCell align="right"><strong>Total</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>#{order.order_number}</TableCell>
                    <TableCell>
                      {order.customer ? (
                        <>
                          {order.customer.name}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {order.customer.email}
                          </Typography>
                        </>
                      ) : (
                        <>
                          {order.customer_name}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {order.customer_email}
                          </Typography>
                        </>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{order.order_items?.length || 0} item(s)</TableCell>
                    <TableCell align="right">{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="paid">Paid</MenuItem>
                          <MenuItem value="shipped">Shipped</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleViewDetails(order)}
                        title="View Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(order)}
                        title="Delete Order"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Order Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Order Details - #{selectedOrder?.order_number}
          </DialogTitle>
          <DialogContent dividers>
            {selectedOrder && (
              <Grid container spacing={3}>
                {/* Customer Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Customer Information
                      </Typography>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedOrder.customer?.name || selectedOrder.customer_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedOrder.customer?.email || selectedOrder.customer_email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedOrder.customer?.phone || selectedOrder.customer_phone}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Order Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Order Information
                      </Typography>
                      <Typography variant="body2">
                        <strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong>{' '}
                        <Chip
                          label={selectedOrder.status.toUpperCase()}
                          color={getStatusColor(selectedOrder.status)}
                          size="small"
                        />
                      </Typography>
                      <Typography variant="body2">
                        <strong>Payment Reference:</strong> {selectedOrder.payment_reference || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Shipping Address */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Shipping Address
                      </Typography>
                      <Typography variant="body2">
                        {selectedOrder.customer_address || 'No address provided'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Order Items */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Order Items
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Product</strong></TableCell>
                          <TableCell align="center"><strong>Quantity</strong></TableCell>
                          <TableCell align="right"><strong>Price</strong></TableCell>
                          <TableCell align="right"><strong>Subtotal</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.order_items?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product?.name || item.product_name}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <strong>Total:</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{formatCurrency(selectedOrder.total_amount)}</strong>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete order #{orderToDelete?.order_number}?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Publish Store Dialog */}
        <PublishStoreDialog
          open={publishDialogOpen}
          onClose={() => setPublishDialogOpen(false)}
          store={store}
          onSuccess={handlePublishSuccess}
        />
      </Container>
    </>
  );
};

export default OrderManagementPage;
