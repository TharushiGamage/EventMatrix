const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the receipts directory exists
const receiptDir = path.join(__dirname, '..', 'uploaded_receipts');
if (!fs.existsSync(receiptDir)) {
    fs.mkdirSync(receiptDir, { recursive: true });
}

// Configure disk storage for receipts
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, receiptDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'receipt-' + uniqueSuffix + ext);
    },
});

// Accept only image files (receipts can be jpg/png/webp)
const fileFilter = (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed for receipts'), false);
    }
};

const receiptUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }, // default 5 MB
});

module.exports = receiptUpload;
