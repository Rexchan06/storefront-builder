import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Reusable Loading Screen Component
 * Provides a consistent loading experience across the application
 */
function LoadingScreen({ message = 'Loading...', fullScreen = true }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: fullScreen ? '100vh' : '200px',
                gap: 2,
                animation: 'fadeIn 0.3s ease-in',
                '@keyframes fadeIn': {
                    from: { opacity: 0 },
                    to: { opacity: 1 }
                }
            }}
        >
            <CircularProgress
                size={60}
                thickness={4}
                sx={{
                    color: '#00bcd4',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.6 },
                        '100%': { opacity: 1 }
                    }
                }}
            />
            {message && (
                <Typography
                    variant="body1"
                    sx={{
                        color: '#666',
                        fontSize: '16px',
                        fontWeight: 500
                    }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );
}

export default LoadingScreen;
