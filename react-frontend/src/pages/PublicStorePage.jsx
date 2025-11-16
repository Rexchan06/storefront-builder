import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Container, Button, Snackbar, Alert, TextField,
    Drawer, IconButton, Slider, FormControl, InputLabel, Select,
    MenuItem, Badge, Chip, InputAdornment, CircularProgress
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import StoreNavBar from '../components/StoreNavBar';
import LoadingScreen from '../components/LoadingScreen';
import { useCart } from '../context/CartContext';
import { API_URL, API_STORAGE_URL, buildQueryString } from '../services/api';

function PublicStorePage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // Core state
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Search & Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        priceMin: 0,
        priceMax: 10000,
        sort: 'newest'
    });
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 8,
        total: 0
    });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page on new search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch categories for filter dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/stores/${slug}/categories`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setCategories(data.categories || []);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };

        if (slug) {
            fetchCategories();
        }
    }, [slug]);

    // Fetch store and products with filters
    const fetchPublicStore = useCallback(async () => {
        try {
            setLoading(true);

            // Build query parameters
            const params = {
                page: currentPage,
                per_page: 8,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(filters.category && { category: filters.category }),
                ...(filters.priceMin > 0 && { price_min: filters.priceMin }),
                ...(filters.priceMax < 10000 && { price_max: filters.priceMax }),
                sort: filters.sort
            };

            const queryString = buildQueryString(params);
            const response = await fetch(`${API_URL}/api/public/stores/${slug}${queryString}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Store not found');
                setLoading(false);
                return;
            }

            setStore(data.store);
            setProducts(data.products || []);
            setPagination(data.pagination || {
                current_page: 1,
                last_page: 1,
                per_page: 8,
                total: 0
            });
        } catch (err) {
            setError('Failed to load store. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [slug, currentPage, debouncedSearch, filters]);

    useEffect(() => {
        fetchPublicStore();
    }, [fetchPublicStore]);

    const handleAddToCart = (product) => {
        if (product.stock_quantity === 0) {
            setSnackbar({ open: true, message: 'Product out of stock', severity: 'error' });
            return;
        }
        addToCart(product, slug);
        setSnackbar({ open: true, message: `${product.name} added to cart!`, severity: 'success' });
    };

    const handleBuyNow = (product) => {
        if (product.stock_quantity === 0) {
            setSnackbar({ open: true, message: 'Product out of stock', severity: 'error' });
            return;
        }
        addToCart(product, slug);
        navigate(`/store/${slug}/checkout`);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Search handlers
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setDebouncedSearch('');
    };

    // Filter handlers
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleClearFilters = () => {
        setFilters({
            category: '',
            priceMin: 0,
            priceMax: 10000,
            sort: 'newest'
        });
        setCurrentPage(1);
    };

    const handleApplyFilters = () => {
        setFilterDrawerOpen(false);
    };

    // Pagination handlers
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextPage = () => {
        if (currentPage < pagination.last_page) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Count active filters
    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.category) count++;
        if (filters.priceMin > 0) count++;
        if (filters.priceMax < 10000) count++;
        if (filters.sort !== 'newest') count++;
        return count;
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5" sx={{ color: '#666' }}>{error}</Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>This store may not be available or published yet.</Typography>
            </Box>
        );
    }

    if (!store) {
        return null;
    }

    return (
        <>
            {/* Store Navbar - Public Mode */}
            <StoreNavBar store={store} isPublic={true} />

            {/* Hero Section */}
            <Box
                sx={{
                    backgroundImage: store.background_image
                        ? `url(${API_STORAGE_URL}/${store.background_image})`
                        : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(240, 240, 240, 0.7)',
                        zIndex: 0
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 'bold',
                                marginBottom: 2,
                                fontSize: { xs: '32px', md: '48px' },
                                color: '#000'
                            }}
                        >
                            {store.store_name}
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                color: '#00bcd4',
                                fontSize: { xs: '18px', md: '24px' },
                                fontWeight: 500,
                                lineHeight: 1.6,
                                marginBottom: 2
                            }}
                        >
                            {store.description || 'Your one-stop online shop for the latest gadgets, accessories, and lifestyle products'}
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Products Section */}
            <Box sx={{ backgroundColor: '#b3d9f2', padding: '60px 0' }}>
                <Container maxWidth="lg">
                    <Box sx={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px' }}>
                        <Typography
                            variant="h4"
                            sx={{
                                textAlign: 'center',
                                marginBottom: 3,
                                fontWeight: 'bold'
                            }}
                        >
                            <span style={{ color: '#000' }}>Our </span>
                            <span style={{ color: '#00bcd4' }}>Products</span>
                        </Typography>

                        {/* Search and Filter Controls */}
                        <Box sx={{ display: 'flex', gap: 2, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Search Bar */}
                            <TextField
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                sx={{ flex: 1, minWidth: '250px' }}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#666' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchQuery && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={handleClearSearch}>
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Filter Button */}
                            <Badge badgeContent={getActiveFilterCount()} color="primary">
                                <Button
                                    variant="outlined"
                                    startIcon={<FilterListIcon />}
                                    onClick={() => setFilterDrawerOpen(true)}
                                    sx={{
                                        color: '#000',
                                        borderColor: '#e0e0e0',
                                        textTransform: 'none',
                                        '&:hover': {
                                            borderColor: '#00bcd4',
                                            backgroundColor: 'rgba(0, 188, 212, 0.04)'
                                        }
                                    }}
                                >
                                    Filters
                                </Button>
                            </Badge>

                            {/* Active Filters Chips */}
                            {filters.category && (
                                <Chip
                                    label={`Category: ${filters.category}`}
                                    onDelete={() => handleFilterChange('category', '')}
                                    size="small"
                                    sx={{ backgroundColor: '#e3f2fd' }}
                                />
                            )}
                            {(filters.priceMin > 0 || filters.priceMax < 10000) && (
                                <Chip
                                    label={`Price: RM${filters.priceMin} - RM${filters.priceMax}`}
                                    onDelete={() => {
                                        handleFilterChange('priceMin', 0);
                                        handleFilterChange('priceMax', 10000);
                                    }}
                                    size="small"
                                    sx={{ backgroundColor: '#e3f2fd' }}
                                />
                            )}
                        </Box>

                        {/* Results Summary */}
                        {(debouncedSearch || getActiveFilterCount() > 0) && (
                            <Box sx={{ marginBottom: 2 }}>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    {pagination.total} {pagination.total === 1 ? 'result' : 'results'} found
                                    {debouncedSearch && ` for "${debouncedSearch}"`}
                                </Typography>
                            </Box>
                        )}

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 6 }}>
                                <CircularProgress />
                            </Box>
                        ) : products.length === 0 ? (
                            <Box sx={{ padding: 6, backgroundColor: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                                <Typography sx={{ color: '#666' }}>No products available at the moment.</Typography>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                                    gap: 2,
                                    marginBottom: 4
                                }}>
                                    {products.map(product => (
                                        <Box
                                            key={product.id}
                                            sx={{
                                                backgroundColor: '#fff',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: '1px solid #e0e0e0'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: '150px',
                                                    backgroundColor: '#c0c0c0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }}
                                            >
                                                {product.image ? (
                                                    <img
                                                        src={`${API_STORAGE_URL}/${product.image}`}
                                                        alt={product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : null}
                                            </Box>
                                            <Box sx={{ padding: '12px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '12px', marginBottom: 0.5 }}>
                                                            {product.name}
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                                                            RM{product.price}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Typography variant="caption" sx={{ fontSize: '11px', color: '#666' }}>
                                                            {product.stock_quantity}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, marginTop: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleBuyNow(product)}
                                                        disabled={product.stock_quantity === 0}
                                                        sx={{
                                                            backgroundColor: '#000',
                                                            color: 'white',
                                                            textTransform: 'none',
                                                            fontSize: '11px',
                                                            padding: '4px 12px',
                                                            borderRadius: '4px',
                                                            minWidth: 'auto',
                                                            '&:hover': {
                                                                backgroundColor: '#333'
                                                            }
                                                        }}
                                                    >
                                                        Buy Now
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={product.stock_quantity === 0}
                                                        sx={{
                                                            color: '#000',
                                                            borderColor: '#e0e0e0',
                                                            textTransform: 'none',
                                                            fontSize: '11px',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            minWidth: 'auto',
                                                            '&:hover': {
                                                                borderColor: '#000',
                                                                backgroundColor: 'transparent'
                                                            }
                                                        }}
                                                    >
                                                        {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Pagination */}
                                {pagination.last_page > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, marginTop: 3 }}>
                                        <Button
                                            startIcon={<ChevronLeftIcon />}
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                            sx={{
                                                color: currentPage === 1 ? '#ccc' : '#666',
                                                textTransform: 'none',
                                                fontSize: '14px',
                                                '&:hover': {
                                                    backgroundColor: currentPage === 1 ? 'transparent' : 'rgba(0, 0, 0, 0.04)'
                                                }
                                            }}
                                        >
                                            Back
                                        </Button>
                                        <Typography sx={{ fontSize: '14px', color: '#666' }}>
                                            {pagination.current_page} of {pagination.last_page}
                                        </Typography>
                                        <Button
                                            endIcon={<ChevronRightIcon />}
                                            onClick={handleNextPage}
                                            disabled={currentPage === pagination.last_page}
                                            sx={{
                                                color: currentPage === pagination.last_page ? '#ccc' : '#666',
                                                textTransform: 'none',
                                                fontSize: '14px',
                                                '&:hover': {
                                                    backgroundColor: currentPage === pagination.last_page ? 'transparent' : 'rgba(0, 0, 0, 0.04)'
                                                }
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ backgroundColor: '#000', color: 'white', padding: '40px 0' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        {/* Left Side: Logo, Store Name, and Info */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {store.logo ? (
                                    <img
                                        src={`${API_STORAGE_URL}/${store.logo}`}
                                        alt={store.store_name}
                                        style={{ height: '32px', width: '32px', objectFit: 'contain', borderRadius: '50%', filter: 'brightness(0) invert(1)' }}
                                    />
                                ) : (
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography sx={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>
                                            {store.store_name?.charAt(0) || 'S'}
                                        </Typography>
                                    </Box>
                                )}
                                <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>{store.store_name}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: '14px', color: '#ccc', maxWidth: '400px' }}>
                                {store.address || 'No. 12, Jalan Ampang, Kuala Lumpur, Malaysia'}
                            </Typography>
                            <Typography sx={{ fontSize: '14px', color: '#ccc' }}>
                                {store.contact_email || 'support@store.com'}
                            </Typography>
                        </Box>

                        {/* Right Side: Links */}
                        <Box sx={{ display: 'flex', gap: 4 }}>
                            <Typography sx={{ cursor: 'pointer', fontSize: '14px', '&:hover': { color: '#00bcd4' } }}>
                                Link 1
                            </Typography>
                            <Typography sx={{ cursor: 'pointer', fontSize: '14px', '&:hover': { color: '#00bcd4' } }}>
                                Link 2
                            </Typography>
                            <Typography sx={{ cursor: 'pointer', fontSize: '14px', '&:hover': { color: '#00bcd4' } }}>
                                Link 3
                            </Typography>
                            <Typography sx={{ cursor: 'pointer', fontSize: '14px', '&:hover': { color: '#00bcd4' } }}>
                                Link 4
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Filter Drawer */}
            <Drawer
                anchor="right"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: '400px' }, padding: 3 }
                }}
            >
                {/* Drawer Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Filters
                    </Typography>
                    <IconButton onClick={() => setFilterDrawerOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Category Filter */}
                <Box sx={{ marginBottom: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={filters.category}
                            label="Category"
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Price Range Filter */}
                <Box sx={{ marginBottom: 3 }}>
                    <Typography variant="subtitle2" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                        Price Range
                    </Typography>
                    <Box sx={{ paddingX: 1 }}>
                        <Typography variant="body2" sx={{ marginBottom: 1, color: '#666' }}>
                            Min: RM{filters.priceMin}
                        </Typography>
                        <Slider
                            value={filters.priceMin}
                            onChange={(e, value) => handleFilterChange('priceMin', value)}
                            min={0}
                            max={filters.priceMax}
                            step={10}
                            sx={{ color: '#00bcd4' }}
                        />
                        <Typography variant="body2" sx={{ marginTop: 2, marginBottom: 1, color: '#666' }}>
                            Max: RM{filters.priceMax}
                        </Typography>
                        <Slider
                            value={filters.priceMax}
                            onChange={(e, value) => handleFilterChange('priceMax', value)}
                            min={filters.priceMin}
                            max={10000}
                            step={10}
                            sx={{ color: '#00bcd4' }}
                        />
                    </Box>
                </Box>

                {/* Sort Order */}
                <Box sx={{ marginBottom: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={filters.sort}
                            label="Sort By"
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                        >
                            <MenuItem value="newest">Newest First</MenuItem>
                            <MenuItem value="oldest">Oldest First</MenuItem>
                            <MenuItem value="price_asc">Price: Low to High</MenuItem>
                            <MenuItem value="price_desc">Price: High to Low</MenuItem>
                            <MenuItem value="name_asc">Name: A to Z</MenuItem>
                            <MenuItem value="name_desc">Name: Z to A</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, marginTop: 'auto' }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleClearFilters}
                        sx={{
                            color: '#666',
                            borderColor: '#e0e0e0',
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: '#666',
                                backgroundColor: 'transparent'
                            }
                        }}
                    >
                        Clear All
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleApplyFilters}
                        sx={{
                            backgroundColor: '#00bcd4',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#0097a7'
                            }
                        }}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Drawer>
        </>
    );
}

export default PublicStorePage;
