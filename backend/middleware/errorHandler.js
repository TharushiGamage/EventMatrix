const errorHandler = (err, _req, res, _next) => {
    console.error('=== GLOBAL ERROR HANDLER ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('===========================');

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: err.message || 'An unexpected server error occurred',
        },
    });
};

module.exports = errorHandler;
