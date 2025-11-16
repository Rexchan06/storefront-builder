import { useState, useEffect } from 'react'
import { Button, Box, Typography, TextField, InputAdornment, IconButton, Badge, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ReceiptIcon from '@mui/icons-material/Receipt'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { API_STORAGE_URL } from '../services/api'

function StoreNavBar({ store, isPublic = false }) {
    const navigate = useNavigate()
    const { getCartItemCount } = useCart()
    const cartItemCount = getCartItemCount()
    const [customer, setCustomer] = useState(null)
    const [anchorEl, setAnchorEl] = useState(null)

    useEffect(() => {
        // Check if customer is logged in
        const customerToken = localStorage.getItem('customerToken')
        const customerData = localStorage.getItem('customer')
        if (customerToken && customerData) {
            setCustomer(JSON.parse(customerData))
        }
    }, [])

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleOrderHistory = () => {
        handleMenuClose()
        navigate(`/store/${store.store_slug}/orders`)
    }

    const handleLogout = () => {
        localStorage.removeItem('customerToken')
        localStorage.removeItem('customer')
        setCustomer(null)
        handleMenuClose()
        navigate(`/store/${store.store_slug}`)
    }

    return <Box sx={{
        backgroundColor: '#fff',
        padding: '12px 24px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3
    }}>
        {/* Logo and Store Name - Clickable */}
        <Box
            onClick={() => navigate(`/store/${store.store_slug}`)}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                minWidth: 'fit-content',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                '&:hover': {
                    opacity: 0.8
                }
            }}
        >
            {store.logo ? (
                <img
                    src={`${API_STORAGE_URL}/${store.logo}`}
                    alt={store.store_name}
                    style={{ height: '32px', width: '32px', objectFit: 'contain', borderRadius: '50%' }}
                />
            ) : (
                <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                        {store.store_name?.charAt(0) || 'S'}
                    </Typography>
                </Box>
            )}
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px' }}>
                {store.store_name}
            </Typography>
        </Box>

        {/* Search Bar */}
        <TextField
            placeholder="Search bar"
            variant="outlined"
            size="small"
            sx={{
                flex: 1,
                maxWidth: '500px',
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5'
                }
            }}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <SearchIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                )
            }}
        />

        {/* Right Section: Cart, Login/Account */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
                sx={{ color: '#000' }}
                onClick={() => isPublic && navigate(`/store/${store.store_slug}/cart`)}
            >
                <Badge badgeContent={cartItemCount} color="primary">
                    <ShoppingCartIcon />
                </Badge>
            </IconButton>

            {customer ? (
                // Show account menu when logged in
                <>
                    <Button
                        variant="outlined"
                        onClick={handleMenuOpen}
                        startIcon={<AccountCircleIcon />}
                        sx={{
                            borderColor: '#00bcd4',
                            color: '#00bcd4',
                            textTransform: 'none',
                            fontSize: '14px',
                            borderRadius: '6px',
                            padding: '6px 16px',
                            '&:hover': {
                                borderColor: '#00a5bb',
                                backgroundColor: 'rgba(0, 188, 212, 0.04)'
                            }
                        }}
                    >
                        {customer.name}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleOrderHistory}>
                            <ListItemIcon>
                                <ReceiptIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Order History</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Logout</ListItemText>
                        </MenuItem>
                    </Menu>
                </>
            ) : (
                // Show login/register when not logged in
                <>
                    <Button
                        variant="contained"
                        onClick={() => isPublic && navigate(`/store/${store.store_slug}/login`)}
                        sx={{
                            backgroundColor: '#000',
                            color: 'white',
                            textTransform: 'none',
                            fontSize: '14px',
                            borderRadius: '6px',
                            padding: '6px 20px',
                            cursor: isPublic ? 'pointer' : 'default',
                            '&:hover': {
                                backgroundColor: '#333'
                            }
                        }}
                    >
                        Login
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => isPublic && navigate(`/store/${store.store_slug}/register`)}
                        sx={{
                            backgroundColor: '#000',
                            color: 'white',
                            textTransform: 'none',
                            fontSize: '14px',
                            borderRadius: '6px',
                            padding: '6px 20px',
                            cursor: isPublic ? 'pointer' : 'default',
                            '&:hover': {
                                backgroundColor: '#333'
                            }
                        }}
                    >
                        Register
                    </Button>
                </>
            )}
            <IconButton sx={{ color: '#000' }}>
                <MenuIcon />
            </IconButton>
        </Box>
    </Box>
}

export default StoreNavBar