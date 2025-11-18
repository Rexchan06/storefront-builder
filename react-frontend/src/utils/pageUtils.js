import { API_STORAGE_URL } from '../services/api';

/**
 * Updates the page title and favicon for a store
 * @param {Object} store - The store object containing store_name and logo
 */
export const updatePageForStore = (store) => {
    if (!store) return;

    // Update page title
    document.title = store.store_name || 'Store';

    // Update favicon
    const favicon = document.querySelector("link[rel*='icon']");
    if (favicon) {
        if (store.logo) {
            // Use store logo as favicon
            favicon.href = `${API_STORAGE_URL}/${store.logo}`;
            favicon.type = 'image/png';
        } else {
            // Fallback to default Miles favicon
            favicon.href = '/favicon.svg';
            favicon.type = 'image/svg+xml';
        }
    }
};

/**
 * Resets the page title and favicon to Miles defaults
 */
export const resetPageToMiles = () => {
    document.title = 'Miles';
    const favicon = document.querySelector("link[rel*='icon']");
    if (favicon) {
        favicon.href = '/favicon.svg';
        favicon.type = 'image/svg+xml';
    }
};
