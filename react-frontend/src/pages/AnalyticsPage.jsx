import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  PendingActions as PendingActionsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import AdminBar from '../components/AdminBar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [salesStats, setSalesStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch store data, products, dashboard data, sales stats, and top products in parallel
      const [storeRes, productsRes, dashboardRes, salesRes, topProductsRes] = await Promise.all([
        fetch('http://localhost:8000/api/stores', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch('http://localhost:8000/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch('http://localhost:8000/api/analytics/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch('http://localhost:8000/api/analytics/sales', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch('http://localhost:8000/api/analytics/top-products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
      ]);

      if (!storeRes.ok || !dashboardRes.ok || !salesRes.ok || !topProductsRes.ok) {
        if (storeRes.status === 401 || dashboardRes.status === 401 || salesRes.status === 401 || topProductsRes.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch analytics data');
      }

      const storeData = await storeRes.json();
      const productsData = productsRes.ok ? await productsRes.json() : [];
      const dashboard = await dashboardRes.json();
      const sales = await salesRes.json();
      const topProductsData = await topProductsRes.json();

      setStore(storeData);
      setProducts(productsData);
      setDashboardData(dashboard);
      setSalesStats(sales);
      setTopProducts(topProductsData.top_products || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - parseInt(dateRange));

      const params = new URLSearchParams({
        start_date: startDate.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
      });

      const response = await fetch(`http://localhost:8000/api/analytics/revenue?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRevenueData(data.revenue_by_date || []);
      }
    } catch (err) {
      console.error('Failed to fetch revenue data:', err);
    }
  };

  const formatCurrency = (amount) => {
    return `RM ${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Prepare data for order status pie chart
  const getOrderStatusData = () => {
    if (!salesStats?.revenue_by_status) return [];

    return salesStats.revenue_by_status.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      revenue: parseFloat(item.revenue),
    }));
  };

  const handlePublish = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:8000/api/stores/${store.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: true })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'no_products') {
          alert('Cannot publish store without any active products. Please add at least one product first.');
        } else {
          alert(data.message || 'Failed to publish store');
        }
        return;
      }

      if (response.ok) {
        const publicUrl = `http://localhost:3000/store/${store.store_slug}`;
        const confirmed = window.confirm(
          `🎉 Store published successfully!\n\n` +
          `Your public store URL:\n${publicUrl}\n\n` +
          `Click OK to view your public store, or Cancel to stay here.`
        );

        setStore({ ...store, is_active: true });

        if (confirmed) {
          window.open(publicUrl, '_blank');
        }
      }
    } catch (err) {
      alert('Failed to publish store. Please try again.');
    }
  };

  const COLORS = ['#FF9800', '#2196F3', '#9C27B0', '#4CAF50', '#F44336'];

  if (loading) {
    return (
      <>
        <NavBar />
        {store && <AdminBar store={store} handlePublish={handlePublish} productCount={products.length} />}
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      {store && <AdminBar store={store} handlePublish={handlePublish} productCount={products.length} />}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your store's performance and insights
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: '#4CAF50',
                      borderRadius: '8px',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AttachMoneyIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" component="div">
                    Total Revenue
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  {formatCurrency(dashboardData?.total_revenue || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From completed orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: '#2196F3',
                      borderRadius: '8px',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShoppingCartIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" component="div">
                    Total Orders
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                  {dashboardData?.total_orders || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All time orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: '#FF9800',
                      borderRadius: '8px',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PendingActionsIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" component="div">
                    Pending Orders
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                  {dashboardData?.pending_orders || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Awaiting payment
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: '#9C27B0',
                      borderRadius: '8px',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUpIcon sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" component="div">
                    Avg Order Value
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
                  {formatCurrency(dashboardData?.avg_order_value || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Per completed order
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Revenue Over Time Chart */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Revenue Over Time
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={dateRange}
                    label="Time Period"
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <MenuItem value="7">Last 7 days</MenuItem>
                    <MenuItem value="30">Last 30 days</MenuItem>
                    <MenuItem value="90">Last 90 days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `RM ${value}`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    name="Revenue"
                    dot={{ fill: '#4CAF50' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Order Status Breakdown */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Orders by Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getOrderStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getOrderStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Top Selling Products */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Selling Products
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Rank</strong></TableCell>
                      <TableCell><strong>Product Name</strong></TableCell>
                      <TableCell align="right"><strong>Units Sold</strong></TableCell>
                      <TableCell align="right"><strong>Revenue</strong></TableCell>
                      <TableCell align="right"><strong>Price</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                            No sales data available yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      topProducts.map((product, index) => (
                        <TableRow key={product.id} hover>
                          <TableCell>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#E0E0E0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                color: index < 3 ? 'white' : '#666',
                              }}
                            >
                              {index + 1}
                            </Box>
                          </TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="right">{product.total_quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(product.total_revenue)}</TableCell>
                          <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Orders Summary (from dashboard data) */}
        {dashboardData?.recent_orders && dashboardData.recent_orders.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Orders
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Order #</strong></TableCell>
                        <TableCell><strong>Customer</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell align="right"><strong>Total</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.recent_orders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>#{order.order_number}</TableCell>
                          <TableCell>
                            {order.customer?.name || order.customer_name}
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString('en-MY', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(order.total_amount)}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 2,
                                py: 0.5,
                                borderRadius: '12px',
                                backgroundColor:
                                  order.status === 'completed'
                                    ? '#E8F5E9'
                                    : order.status === 'paid'
                                    ? '#E3F2FD'
                                    : order.status === 'shipped'
                                    ? '#F3E5F5'
                                    : order.status === 'pending'
                                    ? '#FFF3E0'
                                    : '#FFEBEE',
                                color:
                                  order.status === 'completed'
                                    ? '#2E7D32'
                                    : order.status === 'paid'
                                    ? '#1565C0'
                                    : order.status === 'shipped'
                                    ? '#6A1B9A'
                                    : order.status === 'pending'
                                    ? '#EF6C00'
                                    : '#C62828',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                              }}
                            >
                              {order.status}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
};

export default AnalyticsPage;
