import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Checkbox, FormControlLabel } from '@mui/material';
import NavBar from '../components/NavBar';

function StoreFormPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        store_name: '',
        store_slug: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        address: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [backgroundImageFile, setBackgroundImageFile] = useState(null);
    const [backgroundImagePreview, setBackgroundImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackgroundImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackgroundImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setBackgroundImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Common input field style
    const inputStyle = {
        marginBottom: 3,
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            '& fieldset': {
                borderColor: '#d0d0d0',
            },
            '&:hover fieldset': {
                borderColor: '#999',
            }
        }
    };

    const labelStyle = {
        display: 'block',
        marginBottom: 0.5,
        color: '#000',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        fontSize: '11px',
        letterSpacing: '0.5px'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const token = localStorage.getItem('token');

        try {
            // Create FormData object for file upload
            const submitData = new FormData();
            submitData.append('store_name', formData.store_name);
            submitData.append('store_slug', formData.store_slug);
            submitData.append('description', formData.description);
            submitData.append('contact_email', formData.contact_email);
            submitData.append('contact_phone', formData.contact_phone);
            submitData.append('address', formData.address);

            // Append logo file if selected
            if (logoFile) {
                submitData.append('logo', logoFile);
            }

            // Append background image file if selected
            if (backgroundImageFile) {
                submitData.append('background_image', backgroundImageFile);
            }

            const response = await fetch('http://localhost:8000/api/stores', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type, browser will set it with boundary for FormData
                },
                body: submitData
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Store creation failed' });
                }
                return;
            }

            // Store the store data
            localStorage.setItem('store', JSON.stringify(data.store));

            // Redirect to store dashboard
            navigate('/store-dashboard');
        } catch (err) {
            setErrors({ general: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavBar />
            {/* Header Section with Background */}
            <Box
                sx={{
                    backgroundImage: 'url(/hero-bg.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '50px 0',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.35)',
                        zIndex: 0
                    }
                }}
            >
                <Container maxWidth="md">
                    <Typography
                        component="h1"
                        variant="h3"
                        sx={{
                            fontWeight: 'bold',
                            textAlign: 'center',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <span style={{ color: '#000' }}>Store </span>
                        <span style={{ color: '#ff5722' }}>Details</span>
                    </Typography>
                </Container>
            </Box>

            {/* Form Section with White Background */}
            <Box
                sx={{
                    backgroundColor: '#fff',
                    minHeight: 'calc(100vh - 200px)',
                    paddingBottom: 4
                }}
            >
                <Container maxWidth="md">
                    <Box
                        sx={{
                            paddingTop: 4,
                            paddingBottom: 4,
                        }}
                    >
                            <Box component="form" onSubmit={handleSubmit}>
                                <Typography variant="caption" sx={labelStyle}>
                                    Store Name *
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="store_name"
                                    type="text"
                                    placeholder="Trendy Tech Gadgets"
                                    value={formData.store_name}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.store_name}
                                    helperText={errors.store_name ? errors.store_name[0] : ''}
                                    sx={inputStyle}
                                />

                                <Typography variant="caption" sx={labelStyle}>
                                    Store URL Slug *
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="store_slug"
                                    type="text"
                                    placeholder="trendy-tech-gadgets"
                                    value={formData.store_slug}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.store_slug}
                                    helperText={errors.store_slug ? errors.store_slug[0] : 'This will be used in your store URL (e.g., /store/trendy-tech-gadgets). Use lowercase letters and hyphens only.'}
                                    sx={inputStyle}
                                />

                                <Typography variant="caption" sx={labelStyle}>
                                    Address
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="address"
                                    placeholder="No. 12, Jalan Ampang, Kuala Lumpur, Malaysia"
                                    value={formData.address}
                                    onChange={handleChange}
                                    error={!!errors.address}
                                    helperText={errors.address ? errors.address[0] : ''}
                                    sx={inputStyle}
                                />

                                <Typography variant="caption" sx={labelStyle}>
                                    Contact Email
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="contact_email"
                                    type="email"
                                    placeholder="support@trendytech.com"
                                    value={formData.contact_email}
                                    onChange={handleChange}
                                    error={!!errors.contact_email}
                                    helperText={errors.contact_email ? errors.contact_email[0] : ''}
                                    sx={inputStyle}
                                />

                                <Typography variant="caption" sx={labelStyle}>
                                    Contact Phone
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="contact_phone"
                                    type="tel"
                                    placeholder="+60123456789"
                                    value={formData.contact_phone}
                                    onChange={handleChange}
                                    error={!!errors.contact_phone}
                                    helperText={errors.contact_phone ? errors.contact_phone[0] : ''}
                                    sx={inputStyle}
                                />

                                <Typography variant="caption" sx={labelStyle}>
                                    Store Description / Slogan
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="description"
                                    multiline
                                    rows={4}
                                    placeholder="Innovation delivered to your doorstep. Your one-stop online shop for the latest gadgets, accessories, and lifestyle products."
                                    value={formData.description}
                                    onChange={handleChange}
                                    error={!!errors.description}
                                    helperText={errors.description ? errors.description[0] : 'This will be displayed prominently on your store page as your slogan or description.'}
                                    sx={inputStyle}
                                />

                                <Typography variant="caption" sx={labelStyle}>
                                    Upload Logo Design
                                </Typography>
                                <Box
                                    component="label"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                        height: '120px',
                                        border: '2px dashed #d0d0d0',
                                        borderRadius: '8px',
                                        backgroundColor: '#fafafa',
                                        cursor: 'pointer',
                                        marginBottom: 3,
                                        '&:hover': {
                                            borderColor: '#999',
                                            backgroundColor: '#f0f0f0'
                                        }
                                    }}
                                >
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Logo Preview"
                                            style={{ maxHeight: '100px', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <Typography sx={{ color: '#999', fontStyle: 'italic', fontSize: '14px' }}>
                                            Drag and Drop file or <span style={{ color: '#1976d2' }}>Choose file</span>
                                        </Typography>
                                    )}
                                </Box>
                                {errors.logo && (
                                    <Typography variant="caption" color="error" sx={{ display: 'block', marginBottom: 2, marginTop: -2 }}>
                                        {errors.logo[0]}
                                    </Typography>
                                )}

                                <Typography variant="caption" sx={labelStyle}>
                                    Upload Background Image
                                </Typography>
                                <Box
                                    component="label"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                        height: '120px',
                                        border: '2px dashed #d0d0d0',
                                        borderRadius: '8px',
                                        backgroundColor: '#fafafa',
                                        cursor: 'pointer',
                                        marginBottom: 3,
                                        '&:hover': {
                                            borderColor: '#999',
                                            backgroundColor: '#f0f0f0'
                                        }
                                    }}
                                >
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleBackgroundImageChange}
                                    />
                                    {backgroundImagePreview ? (
                                        <img
                                            src={backgroundImagePreview}
                                            alt="Background Preview"
                                            style={{ maxHeight: '100px', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <Typography sx={{ color: '#999', fontStyle: 'italic', fontSize: '14px' }}>
                                            Drag and Drop file or <span style={{ color: '#1976d2' }}>Choose file</span>
                                        </Typography>
                                    )}
                                </Box>
                                {errors.background_image && (
                                    <Typography variant="caption" color="error" sx={{ display: 'block', marginBottom: 2, marginTop: -2 }}>
                                        {errors.background_image[0]}
                                    </Typography>
                                )}

                                {errors.general && (
                                    <Typography
                                        color="error"
                                        sx={{ marginBottom: 2, textAlign: 'center' }}
                                    >
                                        {errors.general}
                                    </Typography>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{
                                            backgroundColor: '#000',
                                            color: 'white',
                                            textTransform: 'none',
                                            padding: '12px 48px',
                                            fontWeight: 600,
                                            fontSize: '16px',
                                            borderRadius: '8px',
                                            '&:hover': {
                                                backgroundColor: '#333'
                                            },
                                            '&:disabled': {
                                                backgroundColor: '#666',
                                                color: '#ccc'
                                            }
                                        }}
                                    >
                                        {loading ? 'Creating Store...' : 'Launch My Store'}
                                    </Button>
                                </Box>
                            </Box>
                    </Box>
                </Container>
            </Box>
        </>
    );
}

export default StoreFormPage;
