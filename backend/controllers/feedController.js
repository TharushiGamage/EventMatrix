const Event = require('../models/Event');

// Slim fields returned in the feed list
const FEED_LIST_FIELDS = 'id name date startTime endTime venue organizedBy isPaid ticketPrice ticketTypes image';

// GET /api/v1/feed
const getFeedEvents = async (req, res, next) => {
    try {
        const {
            search = '',
            filter = 'all',       // all | paid | free
            category = 'upcoming', // upcoming | past | all
            page = 1,
            limit = 20,
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

        // Category — upcoming / past
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        if (category === 'upcoming') {
            query.date = { $gte: today };
        } else if (category === 'past') {
            query.date = { $lt: today };
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Sort — upcoming events: ascending date, past events: descending date
        const sortOrder = category === 'past' ? -1 : 1;

        const [events, totalItems] = await Promise.all([
            Event.find(query)
                .select(FEED_LIST_FIELDS)
                .sort({ date: sortOrder, time: sortOrder })
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

// GET /api/v1/feed/:id
const getFeedEventDetail = async (req, res, next) => {
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

// Calendar-relevant fields (slim payload for calendar cells)
const CALENDAR_FIELDS = 'id name date startTime endTime venue isPaid';

// GET /api/v1/feed/calendar
const getCalendarEvents = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        // Validate required params
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        if (!month || !year || isNaN(monthNum) || isNaN(yearNum)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'month and year are required query parameters',
                },
            });
        }

        if (monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'month must be between 1 and 12',
                },
            });
        }

        if (yearNum < 2000 || yearNum > 2100) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'year must be between 2000 and 2100',
                },
            });
        }

        // Compute first and last day of the month (YYYY-MM-DD strings)
        const firstDay = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
        const lastDay = new Date(yearNum, monthNum, 0); // day 0 of next month = last day of this month
        const lastDayStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

        const events = await Event.find({
            date: { $gte: firstDay, $lte: lastDayStr },
        })
            .select(CALENDAR_FIELDS)
            .sort({ date: 1, startTime: 1 });

        // Group events by date
        const groupedByDate = {};
        events.forEach((event) => {
            const eventObj = event.toJSON();
            if (!groupedByDate[eventObj.date]) {
                groupedByDate[eventObj.date] = [];
            }
            groupedByDate[eventObj.date].push(eventObj);
        });

        res.status(200).json({
            success: true,
            data: {
                month: monthNum,
                year: yearNum,
                totalEvents: events.length,
                events: groupedByDate,
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/feed/:id/image
const getEventImage = async (req, res, next) => {
    try {
        const event = await Event.findOne({ id: req.params.id }).select('id image');

        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: `Event with ID '${req.params.id}' not found`,
                },
            });
        }

        if (!event.image) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'IMAGE_NOT_FOUND',
                    message: `No image uploaded for event '${req.params.id}'`,
                },
            });
        }

        const imageUrl = `/uploaded_images/${event.image}`;

        res.status(200).json({
            success: true,
            data: {
                eventId: event.id,
                image: event.image,
                imageUrl,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFeedEvents,
    getFeedEventDetail,
    getCalendarEvents,
    getEventImage,
};
