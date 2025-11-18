import { Button, Box, Typography, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function AdminBar({ store, handlePublish, productCount = 0 }) {
    const navigate = useNavigate()

    const getPublishButtonState = () => {
        if (productCount === 0) {
            return {
                text: 'Add Products First',
                disabled: true,
                color: '#9e9e9e',
                hoverColor: '#9e9e9e'
            }
        }
        if (store.is_active) {
            return {
                text: 'Store is Live',
                disabled: false,
                color: '#4caf50',
                hoverColor: '#f44336'
            }
        }
        return {
            text: 'Publish Store',
            disabled: false,
            color: '#4caf50',
            hoverColor: '#45a049'
        }
    }

    const publishState = getPublishButtonState()

    return <Box sx={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }}>
        <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Admin Mode</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
                variant="text"
                onClick={() => navigate('/store-dashboard')}
                sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '14px',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                Store Dashboard
            </Button>
            <Button
                variant="text"
                onClick={() => navigate('/product-form')}
                sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '14px',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                Add Product
            </Button>
            <Button
                variant="text"
                onClick={() => navigate('/orders')}
                sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '14px',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                Orders
            </Button>
            <Button
                variant="text"
                onClick={() => navigate('/analytics')}
                sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '14px',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                Analytics
            </Button>
            <Tooltip
                title={
                    productCount === 0
                        ? 'Add at least one product before publishing'
                        : store.is_active
                            ? 'Click to unpublish and hide your store'
                            : 'Click to make your store publicly accessible'
                }
                placement="bottom"
            >
                <span>
                    <Button
                        variant="contained"
                        onClick={handlePublish}
                        disabled={publishState.disabled}
                        sx={{
                            backgroundColor: publishState.color,
                            color: 'white',
                            textTransform: 'none',
                            fontSize: '14px',
                            fontWeight: 500,
                            borderRadius: '6px',
                            padding: '6px 20px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: publishState.disabled ? publishState.color : publishState.hoverColor,
                                transform: publishState.disabled ? 'none' : 'scale(1.02)'
                            },
                            '&.Mui-disabled': {
                                backgroundColor: publishState.color,
                                color: 'white',
                                opacity: 1
                            }
                        }}
                    >
                        {publishState.text}
                    </Button>
                </span>
            </Tooltip>
        </Box>
    </Box>
}

export default AdminBar