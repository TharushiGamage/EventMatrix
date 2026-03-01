const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const eventSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            maxlength: 200,
        },
        date: {
            type: String,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        venue: {
            type: String,
            required: true,
            maxlength: 300,
        },
        organizedBy: {
            type: String,
            required: true,
            maxlength: 200,
        },
        maxParticipants: {
            type: Number,
            required: true,
            min: 1,
        },
        isPaid: {
            type: Boolean,
            required: true,
        },
        ticketPrice: {
            type: Number,
            default: null,
        },
        ticketTypes: [{
            name: { type: String, required: true },
            price: { type: Number, required: true, min: 0 },
            totalCount: { type: Number, required: true, min: 1 },
            issuingDates: { type: String, required: true },
            issuingTimes: { type: String, required: true },
            issuingVenues: { type: String, required: true }
        }],
        description: {
            type: String,
            required: true,
            maxlength: 2000,
        },
    },
    {
        timestamps: true,
    }
);

// Transform output: expose `id`, hide `_id` and `__v`
eventSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model('Event', eventSchema);
