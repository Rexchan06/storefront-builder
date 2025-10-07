import { useState, useEffect } from 'react'
import { Button, Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function NavBar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in by checking for token
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('store');

        // Update state
        setIsLoggedIn(false);

        // Redirect to login
        navigate('/login');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                backgroundColor: 'white',
                borderBottom: '1px solid #e0e0e0'
            }}
        >
            {/* Logo Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'black'
                    }}
                />
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 'bold',
                        color: 'black',
                        fontSize: '24px'
                    }}
                >
                    Miles
                </Typography>
            </Box>

            {/* Buttons Section */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                {isLoggedIn ? (
                    <Button
                        variant="contained"
                        onClick={handleLogout}
                        sx={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            textTransform: 'none',
                            fontSize: '16px',
                            fontWeight: 500,
                            borderRadius: '8px',
                            '&:hover': {
                                backgroundColor: '#d32f2f'
                            }
                        }}
                    >
                        Logout
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="text"
                            onClick={() => navigate('/login')}
                            sx={{
                                color: '#666',
                                textTransform: 'none',
                                fontSize: '16px',
                                fontWeight: 500
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/register')}
                            sx={{
                                backgroundColor: 'black',
                                color: 'white',
                                textTransform: 'none',
                                fontSize: '16px',
                                fontWeight: 500,
                                borderRadius: '8px',
                                '&:hover': {
                                    backgroundColor: '#333'
                                }
                            }}
                        >
                            Register
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    )
}

export default NavBar