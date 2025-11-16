/**
 * API Service Layer
 * Centralized configuration for all API calls
 */

// Base API URL from environment variable
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const API_STORAGE_URL = `${API_URL}/storage`;

/**
 * Get authentication headers
 * Checks for both store owner token and customer token
 * @returns {Object} Headers object with Authorization if token exists
 */
export const getAuthHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    // Check for store owner token
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        // Check for customer token
        const customerToken = localStorage.getItem('customerToken');
        if (customerToken) {
            headers['Authorization'] = `Bearer ${customerToken}`;
        }
    }

    return headers;
};

/**
 * Make an API request with error handling
 * @param {string} endpoint - API endpoint (e.g., '/api/products')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @param {boolean} includeAuth - Whether to include auth headers (default: true)
 * @returns {Promise} Response data
 */
export const apiRequest = async (endpoint, options = {}, includeAuth = true) => {
    try {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

        const fetchOptions = {
            ...options,
            headers: {
                ...(includeAuth ? getAuthHeaders() : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }),
                ...options.headers,
            },
        };

        const response = await fetch(url, fetchOptions);

        // Parse JSON response
        const data = await response.json();

        if (!response.ok) {
            // Throw error with message from API
            throw new Error(data.message || data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

/**
 * Build query string from parameters object
 * @param {Object} params - Key-value pairs for query parameters
 * @returns {string} Query string (e.g., '?key1=value1&key2=value2')
 */
export const buildQueryString = (params) => {
    const filteredParams = Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const queryString = new URLSearchParams(filteredParams).toString();
    return queryString ? `?${queryString}` : '';
};

// API endpoint helpers
export const API_ENDPOINTS = {
    // Auth
    register: '/api/register',
    login: '/api/login',
    logout: '/api/logout',

    // Customer Auth
    customerRegister: '/api/customer/register',
    customerLogin: '/api/customer/login',
    customerLogout: '/api/customer/logout',

    // Stores
    stores: '/api/stores',
    storeById: (id) => `/api/stores/${id}`,
    publicStore: (slug) => `/api/public/stores/${slug}`,
    storeCategories: (slug) => `/api/public/stores/${slug}/categories`,

    // Products
    products: '/api/products',
    productById: (id) => `/api/products/${id}`,

    // Orders
    orders: '/api/orders',
    orderById: (id) => `/api/orders/${id}`,
    orderStatus: (id) => `/api/orders/${id}/status`,
    orderStatistics: '/api/orders/statistics',

    // Customer Orders
    customerOrders: '/api/customer/orders',
    customerOrderById: (id) => `/api/customer/orders/${id}`,
    customerOrderCancel: (id) => `/api/customer/orders/${id}/cancel`,
    publicOrder: (id) => `/api/public/orders/${id}`,

    // Payments
    stripeCheckout: '/api/payments/stripe/create-checkout-session',
    stripeVerify: '/api/payments/stripe/verify-payment',

    // Analytics
    analytics: {
        dashboard: '/api/analytics/dashboard',
        sales: '/api/analytics/sales',
        topProducts: '/api/analytics/top-products',
        revenue: '/api/analytics/revenue',
    },
};

export default {
    API_URL,
    API_STORAGE_URL,
    getAuthHeaders,
    apiRequest,
    buildQueryString,
    API_ENDPOINTS,
};
