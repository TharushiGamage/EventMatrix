const validateEvent = (req, res, next) => {
    const errors = [];
    const { name, date, startTime, endTime, venue, organizedBy, maxParticipants, isPaid, ticketPrice, description, ticketTypes } = req.body;

    // name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Event name is required' });
    } else if (name.length > 200) {
        errors.push({ field: 'name', message: 'Event name must be at most 200 characters' });
    }

    // date — YYYY-MM-DD
    if (!date || typeof date !== 'string') {
        errors.push({ field: 'date', message: 'Event date is required' });
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
        errors.push({ field: 'date', message: 'Date must be in YYYY-MM-DD format' });
    }

    // startTime — HH:mm (24h)
    if (!startTime || typeof startTime !== 'string') {
        errors.push({ field: 'startTime', message: 'Event start time is required' });
    } else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
        errors.push({ field: 'startTime', message: 'Start time must be in HH:mm 24-hour format' });
    }

    // endTime — HH:mm (24h)
    if (!endTime || typeof endTime !== 'string') {
        errors.push({ field: 'endTime', message: 'Event end time is required' });
    } else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) {
        errors.push({ field: 'endTime', message: 'End time must be in HH:mm 24-hour format' });
    }

    // Ensure endTime comes after startTime if both are valid formats
    if (startTime && endTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) && /^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) {
        if (startTime >= endTime) {
            errors.push({ field: 'endTime', message: 'End time must be after start time' });
        }
    }

    // venue
    if (!venue || typeof venue !== 'string' || venue.trim().length === 0) {
        errors.push({ field: 'venue', message: 'Venue is required' });
    } else if (venue.length > 300) {
        errors.push({ field: 'venue', message: 'Venue must be at most 300 characters' });
    }

    // organizedBy
    if (!organizedBy || typeof organizedBy !== 'string' || organizedBy.trim().length === 0) {
        errors.push({ field: 'organizedBy', message: 'Organizer is required' });
    } else if (organizedBy.length > 200) {
        errors.push({ field: 'organizedBy', message: 'Organizer must be at most 200 characters' });
    }

    // maxParticipants
    if (maxParticipants === undefined || maxParticipants === null) {
        errors.push({ field: 'maxParticipants', message: 'Max participants is required' });
    } else if (!Number.isInteger(maxParticipants) || maxParticipants < 1) {
        errors.push({ field: 'maxParticipants', message: 'Max participants must be an integer ≥ 1' });
    }

    // isPaid
    if (isPaid === undefined || isPaid === null || typeof isPaid !== 'boolean') {
        errors.push({ field: 'isPaid', message: 'isPaid is required and must be a boolean' });
    }

    // ticketPrice or ticketTypes — required when isPaid is true
    if (isPaid === true) {
        if (!ticketTypes || !Array.isArray(ticketTypes) || ticketTypes.length === 0) {
            if (ticketPrice === undefined || ticketPrice === null) {
                errors.push({ field: 'ticketPrice', message: 'Ticket price or ticket types are required for paid events' });
            } else if (typeof ticketPrice !== 'number' || ticketPrice <= 0) {
                errors.push({ field: 'ticketPrice', message: 'Ticket price must be > 0 for paid events' });
            }
        } else {
            ticketTypes.forEach((ticket, index) => {
                if (!ticket.name || typeof ticket.name !== 'string' || ticket.name.trim().length === 0) {
                    errors.push({ field: `ticketTypes[${index}].name`, message: 'Ticket name is required' });
                }
                if (ticket.price === undefined || ticket.price === null || typeof ticket.price !== 'number' || ticket.price < 0) {
                    errors.push({ field: `ticketTypes[${index}].price`, message: 'Ticket price must be a number >= 0' });
                }
                if (ticket.totalCount === undefined || ticket.totalCount === null || typeof ticket.totalCount !== 'number' || ticket.totalCount < 1) {
                    errors.push({ field: `ticketTypes[${index}].totalCount`, message: 'Ticket total count must be an integer >= 1' });
                }
                if (!ticket.issuingDates || typeof ticket.issuingDates !== 'string' || ticket.issuingDates.trim().length === 0) {
                    errors.push({ field: `ticketTypes[${index}].issuingDates`, message: 'Ticket issuing dates are required' });
                }
                if (!ticket.issuingTimes || typeof ticket.issuingTimes !== 'string' || ticket.issuingTimes.trim().length === 0) {
                    errors.push({ field: `ticketTypes[${index}].issuingTimes`, message: 'Ticket issuing times are required' });
                }
                if (!ticket.issuingVenues || typeof ticket.issuingVenues !== 'string' || ticket.issuingVenues.trim().length === 0) {
                    errors.push({ field: `ticketTypes[${index}].issuingVenues`, message: 'Ticket issuing venues are required' });
                }
            });
        }
    }

    // description
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
        errors.push({ field: 'description', message: 'Description is required' });
    } else if (description.length > 2000) {
        errors.push({ field: 'description', message: 'Description must be at most 2000 characters' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: errors,
            },
        });
    }

    next();
};

module.exports = validateEvent;
