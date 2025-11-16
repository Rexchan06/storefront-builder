import { Button, Box, Typography, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function AdminBar({ store, handlePublish, productCount = 0 }) {
    const navigate = useNavigate()

    const getPublishButtonState = () => {
        if (productCount === 0) {
            return {
                text: 'Add Products First',
                disabled: true,
                color: '#9e9e9e'
            }
        }
        if (store.is_active) {
            return {
                text: 'Live',
                disabled: true,
                color: '#4caf50'
            }
        }
        return {
            text: 'Publish Store',
            disabled: false,
            color: '#4caf50'
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
                title={productCount === 0 ? 'Add at least one product before publishing' : ''}
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
                            '&:hover': {
                                backgroundColor: publishState.disabled ? publishState.color : '#45a049'
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