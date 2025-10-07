import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import NavBar from '../components/NavBar';

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error for this field when user starts typing
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    // Laravel validation errors
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Registration failed' });
                }
                return;
            }

            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to store dashboard
            navigate('/store-dashboard');
        } catch (err) {
            setErrors({ general: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        // Redirect to Laravel Google OAuth endpoint
        window.location.href = 'http://localhost:8000/api/auth/google';
    };

    return (
        <>
            <NavBar />
            <Box
                sx={{
                    backgroundColor: '#f5f5f5',
                    minHeight: '100vh',
                    paddingBottom: 4
                }}
            >
                <Container maxWidth="xs">
                    <Box
                        sx={{
                            paddingTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                padding: 3,
                                width: '100%',
                                maxWidth: '400px',
                                backgroundColor: 'white',
                                borderRadius: 4
                            }}
                        >
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                marginBottom: 3,
                                color: '#ff5252',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}
                        >
                            Registration
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    marginBottom: 0.5,
                                    color: '#666',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold'
                                }}
                            >
                                Name
                            </Typography>
                            <TextField
                                fullWidth
                                name="name"
                                type="text"
                                placeholder="enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                error={!!errors.name}
                                helperText={errors.name ? errors.name[0] : ''}
                                sx={{ marginBottom: 2 }}
                            />

                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    marginBottom: 0.5,
                                    color: '#666',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold'
                                }}
                            >
                                Email
                            </Typography>
                            <TextField
                                fullWidth
                                name="email"
                                type="email"
                                placeholder="enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                error={!!errors.email}
                                helperText={errors.email ? errors.email[0] : ''}
                                sx={{ marginBottom: 2 }}
                            />

                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    marginBottom: 0.5,
                                    color: '#666',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold'
                                }}
                            >
                                Password
                            </Typography>
                            <TextField
                                fullWidth
                                name="password"
                                type="password"
                                placeholder="enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                error={!!errors.password}
                                helperText={errors.password ? errors.password[0] : ''}
                                sx={{ marginBottom: 2 }}
                            />

                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    marginBottom: 0.5,
                                    color: '#666',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold'
                                }}
                            >
                                Confirm Password
                            </Typography>
                            <TextField
                                fullWidth
                                name="password_confirmation"
                                type="password"
                                placeholder="confirm your password"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                required
                                sx={{ marginBottom: 3 }}
                            />

                            {errors.general && (
                                <Typography
                                    color="error"
                                    sx={{ marginBottom: 2, textAlign: 'center' }}
                                >
                                    {errors.general}
                                </Typography>
                            )}

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    backgroundColor: '#ff5252',
                                    color: 'white',
                                    textTransform: 'none',
                                    padding: '12px',
                                    marginBottom: 2,
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: '#ff4444'
                                    }
                                }}
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </Button>

                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    marginBottom: 2
                                }}
                            >
                                <Box sx={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
                                <Typography sx={{ color: '#666' }}>or</Typography>
                                <Box sx={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleGoogleRegister}
                                sx={{
                                    backgroundColor: 'black',
                                    color: 'white',
                                    textTransform: 'none',
                                    padding: '12px',
                                    marginBottom: 2,
                                    display: 'flex',
                                    gap: 1,
                                    '&:hover': {
                                        backgroundColor: '#333'
                                    }
                                }}
                            >
                                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                    <path fill="none" d="M0 0h48v48H0z"/>
                                </svg>
                                Google
                            </Button>

                            <Typography
                                sx={{
                                    textAlign: 'center',
                                    color: '#666',
                                    fontSize: '14px'
                                }}
                            >
                                Have an account?{' '}
                                <span
                                    onClick={() => navigate('/login')}
                                    style={{
                                        color: 'black',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Click here
                                </span>
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            </Container>
            </Box>
        </>
    );
}

export default RegisterPage;
