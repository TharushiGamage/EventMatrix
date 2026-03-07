const Event = require('../models/Event');

// GET /api/v1/events
const getAllEvents = async (req, res, next) => {
    try {
        const {
            search = '',
            filter = 'all',
            page = 1,
            limit = 12,
            sortBy = 'date',
            order = 'asc',
        } = req.query;

        // Build query
        const query = {};

        // Search — case-insensitive across name, venue, organizedBy
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { name: regex },
                { venue: regex },
                { organizedBy: regex },
            ];
        }

        // Filter — paid / free
        if (filter === 'paid') {
            query.isPaid = true;
        } else if (filter === 'free') {
            query.isPaid = false;
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
        const skip = (pageNum - 1) * limitNum;

        // Sort
        const allowedSortFields = ['date', 'name', 'createdAt'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
        const sortOrder = order === 'desc' ? -1 : 1;

        const [events, totalItems] = await Promise.all([
            Event.find(query)
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limitNum),
            Event.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: {
                events,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    totalItems,
                    totalPages: Math.ceil(totalItems / limitNum),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/events/stats
const getStats = async (_req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const [totalEvents, upcomingEvents, paidEvents, freeEvents] = await Promise.all([
            Event.countDocuments(),
            Event.countDocuments({ date: { $gte: today } }),
            Event.countDocuments({ isPaid: true }),
            Event.countDocuments({ isPaid: false }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalEvents,
                upcomingEvents,
                paidEvents,
                freeEvents,
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/events/:id
const getEventById = async (req, res, next) => {
    try {
        const event = await Event.findOne({ id: req.params.id });

        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: `Event with ID '${req.params.id}' not found`,
                },
            });
        }

        res.status(200).json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/v1/events
const createEvent = async (req, res, next) => {
    try {
        const {
            name, date, startTime, endTime, venue, organizedBy,
            maxParticipants, isPaid, ticketPrice, description, ticketTypes
        } = req.body;

        const image = req.file ? req.file.filename : null;

        const event = await Event.create({
            name,
            date,
            startTime,
            endTime,
            venue,
            organizedBy,
            maxParticipants,
            isPaid,
            ticketPrice: isPaid ? ticketPrice : null,
            ticketTypes: isPaid ? (ticketTypes || []) : [],
            description,
            image,
        });

        res.status(201).json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/v1/events/:id
const updateEvent = async (req, res, next) => {
    try {
        const event = await Event.findOne({ id: req.params.id });

        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: `Event with ID '${req.params.id}' not found`,
                },
            });
        }

        const {
            name, date, startTime, endTime, venue, organizedBy,
            maxParticipants, isPaid, ticketPrice, description, ticketTypes
        } = req.body;

        event.name = name;
        event.date = date;
        event.startTime = startTime;
        event.endTime = endTime;
        event.venue = venue;
        event.organizedBy = organizedBy;
        event.maxParticipants = maxParticipants;
        event.isPaid = isPaid;
        event.ticketPrice = isPaid ? ticketPrice : null;
        event.ticketTypes = isPaid ? (ticketTypes || []) : [];
        event.description = description;

        if (req.file) {
            event.image = req.file.filename;
        }

        await event.save();

        res.status(200).json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/v1/events/:id
const deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findOneAndDelete({ id: req.params.id });

        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: `Event with ID '${req.params.id}' not found`,
                },
            });
        }

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/events/check-overlap
const checkOverlap = async (req, res, next) => {
    try {
        const { date, startTime, endTime } = req.query;

        if (!date || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'date, startTime, and endTime are required query parameters',
                }
            });
        }

        // Find events on the same date where the times overlap
        // Overlap condition:
        // (Existing Start < Proposed End) AND (Existing End > Proposed Start)

        const overlappingEvents = await Event.find({
            date: date,
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        });

        if (overlappingEvents.length > 0) {
            return res.status(200).json({
                success: true,
                data: {
                    hasOverlap: true,
                    conflicts: overlappingEvents.map(e => ({
                        id: e.id,
                        name: e.name,
                        startTime: e.startTime,
                        endTime: e.endTime,
                        venue: e.venue
                    }))
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                hasOverlap: false,
                conflicts: []
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllEvents,
    getStats,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    checkOverlap,
};
