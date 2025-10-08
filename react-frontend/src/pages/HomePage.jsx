import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import NavBar from "../components/NavBar";

function HomePage() {
    const navigate = useNavigate();

    return (
        <>
            <NavBar />
            <Box
                sx={{
                    height: 'calc(100vh - 64px)', // Full viewport height minus navbar
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
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '48px', md: '72px' },
                            fontWeight: 'bold',
                            marginBottom: 2
                        }}
                    >
                        <span style={{ color: '#00bcd4' }}>Grow</span>
                        <span style={{ color: 'black' }}> with us</span>
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: { xs: '16px', md: '20px' },
                            color: '#333',  // Darker gray (was #666)
                            marginBottom: 4,
                            lineHeight: 1.6,
                            fontWeight: 500
                        }}
                    >
                        We believe growth happens when we move forward together. Let's share ideas, build connections, and achieve more - side by side.
                    </Typography>

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
                            '&:hover': {
                                backgroundColor: '#333'
                            }
                        }}
                    >
                        Create Store
                    </Button>
                </Box>
            </Box>
        </>
    );
}

export default HomePage;