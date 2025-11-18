import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    CircularProgress,
    TextField,
    InputAdornment,
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import usePublishStore from '../hooks/usePublishStore';

/**
 * Professional Publish Store Dialog
 * Replaces the native window.confirm with a Material-UI Dialog
 */
function PublishStoreDialog({ open, onClose, store, onSuccess }) {
    const { publishStore, publishing } = usePublishStore();
    const [showSuccess, setShowSuccess] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [storeUrl, setStoreUrl] = useState('');
    const [wasPublishing, setWasPublishing] = useState(false);

    useEffect(() => {
        if (store) {
            const url = `${window.location.origin}/store/${store.store_slug}`;
            setStoreUrl(url);
        }
    }, [store]);

    const handlePublish = async () => {
        if (!store) return;

        const result = await publishStore(store.id, store.is_active);

        if (result.success) {
            // Simple: if store is active now, we just published. If inactive, we just unpublished.
            setWasPublishing(result.store.is_active);
            setShowSuccess(true);
            if (onSuccess) {
                onSuccess(result.store);
            }
        }
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(storeUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const handleClose = () => {
        onClose();
        // Reset states after dialog closes to prevent flash
        setTimeout(() => {
            setShowSuccess(false);
            setCopiedUrl(false);
            setWasPublishing(false);
        }, 200);
    };

    if (!store) return null;

    const isPublishing = !store.is_active;
    const actionText = isPublishing ? 'Publish' : 'Unpublish';

    return (
        <Dialog
            open={open}
            onClose={publishing ? null : handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    padding: 1
                }
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={handleClose}
                disabled={publishing}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: '#666'
                }}
            >
                <CloseIcon />
            </IconButton>

            {showSuccess ? (
                // Success State
                <>
                    <DialogContent sx={{ textAlign: 'center', paddingTop: 4, paddingBottom: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                            <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50' }} />
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 1, color: '#4caf50' }}>
                            {wasPublishing ? 'Store Published!' : 'Store Unpublished'}
                        </Typography>

                        <Typography variant="body1" sx={{ color: '#666', marginBottom: 3 }}>
                            {wasPublishing
                                ? 'Your store is now live and accessible to customers.'
                                : 'Your store is now hidden from public view.'}
                        </Typography>

                        {wasPublishing && (
                            <Box sx={{ backgroundColor: '#f5f5f5', padding: 2, borderRadius: '8px', marginBottom: 2 }}>
                                <Typography variant="body2" sx={{ color: '#666', marginBottom: 1 }}>
                                    Share your store URL:
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={storeUrl}
                                    size="small"
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleCopyUrl}
                                                    edge="end"
                                                    sx={{
                                                        color: copiedUrl ? '#4caf50' : '#00bcd4'
                                                    }}
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'white'
                                        }
                                    }}
                                />
                                {copiedUrl && (
                                    <Typography variant="caption" sx={{ color: '#4caf50', marginTop: 0.5, display: 'block' }}>
                                        URL copied to clipboard!
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ padding: 3, paddingTop: 0, gap: 1 }}>
                        {wasPublishing ? (
                            <>
                                <Button
                                    onClick={() => window.open(storeUrl, '_blank')}
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        borderColor: '#00bcd4',
                                        color: '#00bcd4',
                                        textTransform: 'none',
                                        padding: '10px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            borderColor: '#00a5bb',
                                            backgroundColor: 'rgba(0, 188, 212, 0.04)'
                                        }
                                    }}
                                >
                                    View Store
                                </Button>
                                <Button
                                    onClick={handleClose}
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#00bcd4',
                                        textTransform: 'none',
                                        padding: '10px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            backgroundColor: '#00a5bb'
                                        }
                                    }}
                                >
                                    Close
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={handleClose}
                                variant="contained"
                                fullWidth
                                sx={{
                                    backgroundColor: '#00bcd4',
                                    textTransform: 'none',
                                    padding: '10px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: '#00a5bb'
                                    }
                                }}
                            >
                                Close
                            </Button>
                        )}
                    </DialogActions>
                </>
            ) : (
                // Confirmation State
                <>
                    <DialogTitle sx={{ paddingTop: 3, paddingBottom: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {actionText} Your Store?
                        </Typography>
                    </DialogTitle>

                    <DialogContent>
                        <Typography variant="body1" sx={{ color: '#666', marginBottom: 2 }}>
                            {isPublishing ? (
                                <>
                                    Are you sure you want to <strong>publish</strong> your store?
                                    <br />
                                    <br />
                                    Your store will become publicly accessible at:
                                    <Box
                                        component="span"
                                        sx={{
                                            display: 'block',
                                            marginTop: 1,
                                            padding: '8px 12px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace',
                                            fontSize: '14px',
                                            color: '#00bcd4',
                                            wordBreak: 'break-all'
                                        }}
                                    >
                                        {storeUrl}
                                    </Box>
                                </>
                            ) : (
                                <>
                                    Are you sure you want to <strong>unpublish</strong> your store?
                                    <br />
                                    <br />
                                    Your store will be hidden from public view and customers won't be able to access it.
                                </>
                            )}
                        </Typography>

                        {!isPublishing && (
                            <Alert severity="warning" sx={{ marginTop: 2 }}>
                                Active customer sessions may be disrupted.
                            </Alert>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ padding: 3, paddingTop: 2 }}>
                        <Button
                            onClick={handleClose}
                            disabled={publishing}
                            sx={{
                                color: '#666',
                                textTransform: 'none',
                                padding: '8px 24px',
                                fontSize: '16px',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePublish}
                            disabled={publishing}
                            variant="contained"
                            sx={{
                                backgroundColor: isPublishing ? '#4caf50' : '#f44336',
                                color: 'white',
                                textTransform: 'none',
                                padding: '8px 32px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: isPublishing ? '#45a049' : '#d32f2f'
                                },
                                '&:disabled': {
                                    backgroundColor: '#ccc'
                                }
                            }}
                        >
                            {publishing ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={20} sx={{ color: 'white' }} />
                                    <span>{actionText}ing...</span>
                                </Box>
                            ) : (
                                actionText
                            )}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}

export default PublishStoreDialog;
