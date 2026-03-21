const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/notifications
// Student fetches their own notifications (most recent first)
// Optional query: ?unreadOnly=true
// ─────────────────────────────────────────────────────────────────────────────
const getMyNotifications = async (req, res, next) => {
    try {
        const filter = { recipient: req.user._id };

        if (req.query.unreadOnly === 'true') {
            filter.isRead = false;
        }

        const notifications = await Notification.find(filter)
            .populate('relatedEvent', 'name date venue')
            .populate('relatedRegistration', 'status studentName')
            .sort({ createdAt: -1 });

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            data: { notifications, unreadCount },
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/notifications/:id/read
// Mark a single notification as read
// ─────────────────────────────────────────────────────────────────────────────
const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user._id, // ensure the notification belongs to this user
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/notifications/read-all
// Mark ALL notifications for the logged-in user as read
// ─────────────────────────────────────────────────────────────────────────────
const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
