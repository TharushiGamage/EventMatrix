const errorHandler = (err, _req, res, _next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected server error occurred',
        },
    });
};

module.exports = errorHandler;
