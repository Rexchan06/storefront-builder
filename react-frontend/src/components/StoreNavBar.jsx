import { Button, Box, Typography, TextField, InputAdornment, IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import MenuIcon from '@mui/icons-material/Menu'
import { useNavigate } from 'react-router-dom'

function StoreNavBar({ store, isPublic = false }) {
    const navigate = useNavigate()
    return <Box sx={{
        backgroundColor: '#fff',
        padding: '12px 24px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3
    }}>
        {/* Logo and Store Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 'fit-content' }}>
            {store.logo ? (
                <img
                    src={`http://localhost:8000/storage/${store.logo}`}
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

        {/* Right Section: Cart, Login, Register, Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ color: '#000' }}>
                <ShoppingCartIcon />
            </IconButton>
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
            <IconButton sx={{ color: '#000' }}>
                <MenuIcon />
            </IconButton>
        </Box>
    </Box>
}

export default StoreNavBar