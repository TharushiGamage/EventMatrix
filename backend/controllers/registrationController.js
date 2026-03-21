const path = require('path');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const WaitingList = require('../models/WaitingList');
const Event = require('../models/Event');

// ─── Helper: create a notification record ────────────────────────────────────
const createNotification = async ({ recipient, message, type, relatedEvent, relatedRegistration }) => {
    await Notification.create({ recipient, message, type, relatedEvent, relatedRegistration });
};

// ─── Helper: notify all unnotified waiting-list students for an event ─────────
const notifyWaitingList = async (event) => {
    const waiters = await WaitingList.find({ event: event._id, notified: false });
    for (const waiter of waiters) {
        await createNotification({
            recipient: waiter.student,
            message: `Good news! A spot has opened up for "${event.name}" that you previously couldn't register for. Register now before it fills up again!`,
            type: 'waitlist_available',
            relatedEvent: event._id,
        });
        waiter.notified = true;
        waiter.notifiedAt = new Date();
        await waiter.save();
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/registrations
// Student registers for an event
//   - Non-paid  → status: 'confirmed' immediately
//   - Paid      → status stays null until receipt is uploaded (see uploadReceipt)
// ─────────────────────────────────────────────────────────────────────────────
const registerForEvent = async (req, res, next) => {
    try {
        const { eventId, studentName, studentEmail, studentId, contactNo, faculty, ticketType } = req.body;

        // 1. Find the event (Event model uses custom uuid `id`, not _id)
        const event = await Event.findOne({ id: eventId });
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // 2. Check if student already has an active registration for this event
        const existing = await Registration.findOne({
            student: req.user._id,
            event: event._id,
            status: { $nin: ['cancelled', 'rejected'] },
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event',
            });
        }

        // 3. Count current confirmed/approved/pending registrations
        const currentCount = await Registration.countDocuments({
            event: event._id,
            status: { $in: ['confirmed', 'pending', 'approved'] },
        });

        // 4. Capacity check
        if (currentCount >= event.maxParticipants) {
            // Record this student on the waiting list (ignore duplicate)
            await WaitingList.findOneAndUpdate(
                { student: req.user._id, event: event._id },
                { student: req.user._id, event: event._id, notified: false },
                { upsert: true, new: true }
            );

            return res.status(200).json({
                success: false,
                code: 'EVENT_FULL',
                message: `Can't register for this event because max capacity (${event.maxParticipants}) has been reached. We'll notify you when a spot opens up!`,
            });
        }

        // 5. Determine ticket price from the chosen ticket type (if paid)
        let ticketPrice = 0;
        if (event.isPaid) {
            if (!ticketType) {
                return res.status(400).json({ success: false, message: 'Please select a ticket type for this paid event' });
            }
            const chosenTicket = event.ticketTypes.find(t => t.name === ticketType);
            if (!chosenTicket) {
                return res.status(400).json({ success: false, message: `Ticket type "${ticketType}" not found for this event` });
            }
            ticketPrice = chosenTicket.price;
        }

        // 6. Create the registration
        const registration = await Registration.create({
            student: req.user._id,
            event: event._id,
            studentName,
            studentEmail,
            studentId,
            contactNo,
            faculty: faculty || '',
            ticketType: event.isPaid ? ticketType : '',
            ticketPrice,
            // Non-paid → confirmed immediately; Paid → needs receipt upload next
            status: event.isPaid ? 'pending' : 'confirmed',
        });

        return res.status(201).json({
            success: true,
            message: event.isPaid
                ? 'Registration submitted. Please upload your payment receipt to complete the process.'
                : 'Successfully registered for the event!',
            data: registration,
        });
    } catch (error) {
        // Duplicate key error — already registered
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You are already registered for this event' });
        }
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/registrations/:id/upload-receipt
// Student uploads payment receipt (paid events only)
// Uses receiptUpload multer middleware; file available as req.file
// Sets status to 'pending' for organizer review
// ─────────────────────────────────────────────────────────────────────────────
const uploadReceipt = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please attach a receipt image' });
        }

        const registration = await Registration.findOne({
            _id: req.params.id,
            student: req.user._id,
        });

        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        if (registration.status === 'confirmed') {
            return res.status(400).json({ success: false, message: 'This is a free event — no receipt needed' });
        }

        if (['approved', 'cancelled', 'rejected'].includes(registration.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot upload receipt for a registration that is already '${registration.status}'`,
            });
        }

        // Store relative URL so it can be served as a static file
        registration.receiptUrl = `/uploaded_receipts/${req.file.filename}`;
        registration.receiptUploadedAt = new Date();
        registration.status = 'pending';
        await registration.save();

        res.status(200).json({
            success: true,
            message: 'Receipt uploaded successfully. Your registration is pending organizer review.',
            data: registration,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/registrations/:id
// Student cancels their own registration
// Triggers waiting-list notifications if capacity drops below max
// ─────────────────────────────────────────────────────────────────────────────
const cancelRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findOne({
            _id: req.params.id,
            student: req.user._id,
        }).populate('event');

        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        if (registration.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Registration is already cancelled' });
        }

        const wasActive = ['confirmed', 'approved', 'pending'].includes(registration.status);

        registration.status = 'cancelled';
        await registration.save();

        // If the cancellation frees up a seat, notify waiting-list students
        if (wasActive) {
            const event = registration.event;
            const currentCount = await Registration.countDocuments({
                event: event._id,
                status: { $in: ['confirmed', 'pending', 'approved'] },
            });

            if (currentCount < event.maxParticipants) {
                await notifyWaitingList(event);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Registration cancelled successfully',
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/registrations/my
// Student views their own registration history
// ─────────────────────────────────────────────────────────────────────────────
const getMyRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.find({ student: req.user._id })
            .populate('event', 'name date startTime endTime venue isPaid image')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: registrations,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/registrations/pending
// Organizer views all pending registrations (across their events)
// Optional query: ?eventId=<uuid>
// ─────────────────────────────────────────────────────────────────────────────
const getPendingRegistrations = async (req, res, next) => {
    try {
        const filter = { status: 'pending' };

        // If organizer wants to filter by a specific event
        if (req.query.eventId) {
            const event = await Event.findOne({ id: req.query.eventId });
            if (event) filter.event = event._id;
        }

        const registrations = await Registration.find(filter)
            .populate('event', 'name date venue isPaid ticketTypes')
            .populate('student', 'name email studentId')
            .sort({ createdAt: 1 }); // oldest first so organizer clears in order

        res.status(200).json({
            success: true,
            data: registrations,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/registrations/:id/review
// Organizer approves or rejects a pending registration
// Body: { action: 'approve' | 'reject', notes: '...' }
// Sends a notification to the student in both cases
// ─────────────────────────────────────────────────────────────────────────────
const reviewRegistration = async (req, res, next) => {
    try {
        const { action, notes } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: "action must be 'approve' or 'reject'" });
        }

        const registration = await Registration.findById(req.params.id).populate('event');
        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        if (registration.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Only pending registrations can be reviewed. Current status: '${registration.status}'`,
            });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        registration.status = newStatus;
        registration.reviewedBy = req.user._id;
        registration.reviewedAt = new Date();
        registration.reviewNotes = notes || '';
        await registration.save();

        // Send notification to the student
        const eventName = registration.event.name;
        const notifType = action === 'approve' ? 'registration_approved' : 'registration_rejected';
        const notifMessage = action === 'approve'
            ? `Your payment for "${eventName}" has been approved! You are now officially registered.`
            : `Your payment for "${eventName}" was rejected. Reason: ${notes || 'No reason provided'}. Please contact the organizer for more details.`;

        await createNotification({
            recipient: registration.student,
            message: notifMessage,
            type: notifType,
            relatedEvent: registration.event._id,
            relatedRegistration: registration._id,
        });

        res.status(200).json({
            success: true,
            message: `Registration ${newStatus} and student notified.`,
            data: registration,
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/registrations/attendance/:eventId
// Admin/Organizer views confirmed+approved registrations for an event (attendance)
// ─────────────────────────────────────────────────────────────────────────────
const getAttendance = async (req, res, next) => {
    try {
        const event = await Event.findOne({ id: req.params.eventId });
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        const registrations = await Registration.find({
            event: event._id,
            status: { $in: ['confirmed', 'approved'] },
        })
            .populate('student', 'name email studentId')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            data: {
                event: { id: event.id, name: event.name, date: event.date, maxParticipants: event.maxParticipants },
                totalRegistered: registrations.length,
                registrations,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerForEvent,
    uploadReceipt,
    cancelRegistration,
    getMyRegistrations,
    getPendingRegistrations,
    reviewRegistration,
    getAttendance,
};
