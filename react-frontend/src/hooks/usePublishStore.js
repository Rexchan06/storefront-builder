import { useState } from 'react';
import { API_URL } from '../services/api';

/**
 * Custom hook for publishing/unpublishing a store
 * Centralizes the publish logic to avoid duplication across pages
 */
export const usePublishStore = () => {
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState(null);

    const publishStore = async (storeId, currentStatus) => {
        setPublishing(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const newStatus = !currentStatus;

            const response = await fetch(`${API_URL}/api/stores/${storeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ is_active: newStatus })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update store status');
            }

            return {
                success: true,
                isActive: newStatus,
                store: data.store
            };
        } catch (err) {
            setError(err.message);
            return {
                success: false,
                error: err.message
            };
        } finally {
            setPublishing(false);
        }
    };

    return {
        publishStore,
        publishing,
        error
    };
};

export default usePublishStore;
