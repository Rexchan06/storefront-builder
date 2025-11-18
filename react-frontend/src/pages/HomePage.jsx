import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Fade, Grow } from '@mui/material';
import NavBar from "../components/NavBar";

function HomePage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <NavBar />
            <Box
                sx={{
                    flexGrow: 1,
                    backgroundImage: 'url(hero-bg.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '0 20px'
                }}
            >
                {/* Hero Content */}
                <Box sx={{ maxWidth: '750px' }}>
                    {/* Title with fade-in and slide-up animation */}
                    <Fade in={true} timeout={1000}>
                        <Box>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '48px', md: '72px' },
                                    fontWeight: 'bold',
                                    marginBottom: 2,
                                    animation: 'slideUp 0.8s ease-out',
                                    '@keyframes slideUp': {
                                        from: {
                                            opacity: 0,
                                            transform: 'translateY(30px)'
                                        },
                                        to: {
                                            opacity: 1,
                                            transform: 'translateY(0)'
                                        }
                                    }
                                }}
                            >
                                <span style={{ color: '#00bcd4' }}>Grow</span>
                                <span style={{ color: 'black' }}> with us</span>
                            </Typography>
                        </Box>
                    </Fade>

                    {/* Subtitle with delayed fade-in and glow effect */}
                    <Fade in={true} timeout={1500}>
                        <Box
                            sx={{
                                animation: 'fadeInGlow 1.2s ease-out 0.3s both',
                                '@keyframes fadeInGlow': {
                                    '0%': {
                                        opacity: 0,
                                        transform: 'translateY(20px)',
                                        textShadow: 'none'
                                    },
                                    '50%': {
                                        textShadow: '0 0 20px rgba(0, 188, 212, 0.3)'
                                    },
                                    '100%': {
                                        opacity: 1,
                                        transform: 'translateY(0)',
                                        textShadow: 'none'
                                    }
                                }
                            }}
                        >
                            <Typography
                                variant="body1"
                                sx={{
                                    fontSize: { xs: '18px', md: '22px' },
                                    color: '#333',
                                    marginBottom: 4,
                                    lineHeight: 1.7,
                                    fontWeight: 600,
                                    letterSpacing: '0.3px',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                We believe growth happens when we move forward together. Let's share ideas, build connections, and achieve more - side by side.
                            </Typography>
                        </Box>
                    </Fade>

                    {/* Button with delayed grow animation */}
                    <Grow in={true} timeout={1000} style={{ transformOrigin: 'center' }}>
                        <Box sx={{ animation: 'buttonPop 0.6s ease-out 0.8s both',
                            '@keyframes buttonPop': {
                                '0%': {
                                    opacity: 0,
                                    transform: 'scale(0.8)'
                                },
                                '50%': {
                                    transform: 'scale(1.05)'
                                },
                                '100%': {
                                    opacity: 1,
                                    transform: 'scale(1)'
                                }
                            }
                        }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/register')}
                                sx={{
                                    backgroundColor: 'black',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    padding: '12px 32px',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#333',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                Create Store
                            </Button>
                        </Box>
                    </Grow>
                </Box>
            </Box>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    backgroundColor: '#1a1a1a',
                    color: '#999',
                    py: 2,
                    mt: 'auto',
                    textAlign: 'center'
                }}
            >
                <Typography variant="body2" sx={{ fontSize: '12px' }}>
                    © {new Date().getFullYear()} <span style={{ color: '#00bcd4' }}>Miles</span>. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
}

export default HomePage;