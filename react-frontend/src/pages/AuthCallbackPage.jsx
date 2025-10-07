import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

function AuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
            // Redirect to login with error
            navigate('/login?error=' + encodeURIComponent(error));
            return;
        }

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));

                // Store token and user in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // Redirect to store dashboard
                navigate('/store-dashboard');
            } catch (err) {
                console.error('Failed to parse user data:', err);
                navigate('/login?error=Authentication failed');
            }
        } else {
            navigate('/login?error=Missing authentication data');
        }
    }, [navigate, searchParams]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
                gap: 2
            }}
        >
            <CircularProgress />
            <Typography variant="h6" sx={{ color: '#666' }}>
                Completing authentication...
            </Typography>
        </Box>
    );
}

export default AuthCallbackPage;
