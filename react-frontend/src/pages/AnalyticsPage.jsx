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
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import AdminBar from '../components/AdminBar';
import LoadingScreen from '../components/LoadingScreen';
import PublishStoreDialog from '../components/PublishStoreDialog';
import { API_URL, API_STORAGE_URL } from '../services/api';
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
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
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
        fetch(`${API_URL}/api/stores`, {
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
        fetch(`${API_URL}/api/analytics/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${API_URL}/api/analytics/sales`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${API_URL}/api/analytics/top-products`, {
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

      const response = await fetch(`${API_URL}/api/analytics/revenue?${params}`, {
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

  const handlePublishClick = () => {
    setPublishDialogOpen(true);
  };

  const handlePublishSuccess = (updatedStore) => {
    setStore(updatedStore);
    setPublishDialogOpen(false);
  };

  const COLORS = ['#FF9800', '#2196F3', '#9C27B0', '#4CAF50', '#F44336'];

  if (loading) {
    return (
      <>
        <NavBar />
        {store && <AdminBar store={store} handlePublish={handlePublishClick} productCount={products.length} />}
        <LoadingScreen message="Loading analytics..." fullScreen={false} />
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
            Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            An overview of your store's performance.
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
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  Total Revenue
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(dashboardData?.total_revenue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  Total Orders
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {dashboardData?.total_orders || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  Pending Orders
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {dashboardData?.pending_orders || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  Avg Order Value
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(dashboardData?.avg_order_value || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3}>
          {/* Revenue Over Time Chart */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Revenue Over Time
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={dateRange}
                    label="Period"
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <MenuItem value="7">7 days</MenuItem>
                    <MenuItem value="30">30 days</MenuItem>
                    <MenuItem value="90">90 days</MenuItem>
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
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Order Status Breakdown */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Orders by Status
              </Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getOrderStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getOrderStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} orders`, props.payload.name]} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => `${value} (${entry.payload.value})`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Top Selling Products */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Top Selling Products
              </Typography>
              <TableContainer sx={{ maxHeight: 350, overflow: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Product</strong></TableCell>
                      <TableCell align="right"><strong>Sold</strong></TableCell>
                      <TableCell align="right"><strong>Revenue</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                            No sales data yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      topProducts.slice(0, 5).map((product) => (
                        <TableRow key={product.id} hover>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="right">{product.total_quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(product.total_revenue)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

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

export default AnalyticsPage;