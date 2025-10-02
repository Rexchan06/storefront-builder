import { Button, Box, Typography } from '@mui/material'

function NavBar() {
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
                <Button
                    variant="text"
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
            </Box>
        </Box>
    )
}

export default NavBar