const Resource = require('../models/Resource');
const ResourceBooking = require('../models/ResourceBooking');

const isTimeOverlap = (existingStart, existingEnd, requestStart, requestEnd) =>
  existingStart < requestEnd && existingEnd > requestStart;

const validateDateAndTime = ({ date, startTime, endTime }) => {
  if (!date || !startTime || !endTime) {
    return 'date, startTime, and endTime are required';
  }

  if (endTime <= startTime) {
    return 'endTime must be later than startTime';
  }

  return null;
};

const getResources = async (req, res, next) => {
  try {
    const { search = '', type = 'all', status = 'all' } = req.query;
    const query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { category: regex },
        { location: regex },
        { description: regex },
      ];
    }

    if (type !== 'all') query.type = type;
    if (status !== 'all') query.status = status;

    const resources = await Resource.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { resources },
    });
  } catch (error) {
    next(error);
  }
};

const getResourceStats = async (_req, res, next) => {
  try {
    const [totalResources, availableResources, reservedResources, maintenanceResources] =
      await Promise.all([
        Resource.countDocuments(),
        Resource.countDocuments({ status: 'available' }),
        Resource.countDocuments({ status: 'reserved' }),
        Resource.countDocuments({ status: 'maintenance' }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalResources,
        availableResources,
        reservedResources,
        maintenanceResources,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const query = {};

    if (req.user?.role === 'Organizer') {
      query.createdBy = req.user._id;
    }

    const bookings = await ResourceBooking.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

const createResource = async (req, res, next) => {
  try {
    const {
      name,
      type,
      category,
      location,
      capacity,
      totalUnits,
      availableUnits,
      status,
      description,
    } = req.body;

    if (!name || !type || !location || !description) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'name, type, location, and description are required',
        },
      });
    }

    if (!['venue', 'equipment'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'type must be either venue or equipment',
        },
      });
    }

    if (!['available', 'reserved', 'maintenance'].includes(status || 'available')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid resource status',
        },
      });
    }

    if (type === 'venue' && (capacity == null || Number(capacity) < 1)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'capacity is required for venue resources',
        },
      });
    }

    if (type === 'equipment') {
      if (totalUnits == null || Number(totalUnits) < 1) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'totalUnits must be greater than 0 for equipment',
          },
        });
      }

      if (availableUnits == null || Number(availableUnits) < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'availableUnits must be 0 or more',
          },
        });
      }

      if (Number(availableUnits) > Number(totalUnits)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'availableUnits cannot exceed totalUnits',
          },
        });
      }
    }

    const resource = await Resource.create({
      name: name.trim(),
      type,
      category: (category || (type === 'venue' ? 'Venue' : 'Equipment')).trim(),
      location: location.trim(),
      capacity: type === 'venue' ? Number(capacity) : null,
      totalUnits: type === 'equipment' ? Number(totalUnits) : 1,
      availableUnits: type === 'equipment' ? Number(availableUnits) : 1,
      status: status || 'available',
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

const checkResourceAvailability = async (req, res, next) => {
  try {
    const { date, startTime, endTime, venue, equipment = [] } = req.body;

    const basicValidationError = validateDateAndTime({ date, startTime, endTime });
    if (basicValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: basicValidationError,
        },
      });
    }

    if (!venue) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'venue is required',
        },
      });
    }

    const selectedVenue = await Resource.findOne({ type: 'venue', name: venue });
    if (!selectedVenue) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Selected venue not found',
        },
      });
    }

    if (selectedVenue.status === 'maintenance') {
      return res.status(200).json({
        success: true,
        data: {
          available: false,
          message: 'Selected venue is under maintenance.',
          conflicts: ['Selected venue is under maintenance.'],
          alternatives: [],
        },
      });
    }

    const sameDayBookings = await ResourceBooking.find({
      date,
      status: { $ne: 'cancelled' },
    });

    const overlappingBookings = sameDayBookings.filter((booking) =>
      isTimeOverlap(booking.startTime, booking.endTime, startTime, endTime)
    );

    const venueConflict = overlappingBookings.find((booking) => booking.venue === venue);

    if (venueConflict) {
      const alternativeVenuesRaw = await Resource.find({
        type: 'venue',
        status: { $ne: 'maintenance' },
        name: { $ne: venue },
      });

      const alternativeVenues = alternativeVenuesRaw
        .filter((candidate) => !overlappingBookings.find((booking) => booking.venue === candidate.name))
        .slice(0, 5)
        .map((candidate) => candidate.name);

      return res.status(200).json({
        success: true,
        data: {
          available: false,
          message: 'Selected venue is already booked for this time slot.',
          conflicts: ['Selected venue is already booked for this time slot.'],
          alternatives: alternativeVenues,
        },
      });
    }

    const equipmentConflicts = [];
    const alternatives = [];

    for (const equipmentName of equipment) {
      const equipmentResource = await Resource.findOne({ type: 'equipment', name: equipmentName });

      if (!equipmentResource) {
        equipmentConflicts.push(`${equipmentName} was not found.`);
        continue;
      }

      if (equipmentResource.status === 'maintenance') {
        equipmentConflicts.push(`${equipmentName} is under maintenance.`);
        continue;
      }

      const alreadyBookedCount = overlappingBookings.reduce((count, booking) => {
        const found = booking.equipment.find((item) => item.name === equipmentName);
        return count + (found ? found.quantity : 0);
      }, 0);

      const remainingUnits = equipmentResource.availableUnits - alreadyBookedCount;
      if (remainingUnits < 1) {
        equipmentConflicts.push(`${equipmentName} does not have enough available units.`);

        const alternativeEquipment = await Resource.find({
          type: 'equipment',
          category: equipmentResource.category,
          status: { $ne: 'maintenance' },
          name: { $ne: equipmentName },
        });

        const validAlternatives = alternativeEquipment.filter((alt) => {
          const altBookedCount = overlappingBookings.reduce((count, booking) => {
            const found = booking.equipment.find((item) => item.name === alt.name);
            return count + (found ? found.quantity : 0);
          }, 0);
          return alt.availableUnits - altBookedCount > 0;
        });

        validAlternatives.forEach((alt) => alternatives.push(alt.name));
      }
    }

    if (equipmentConflicts.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          available: false,
          message: equipmentConflicts[0],
          conflicts: equipmentConflicts,
          alternatives: [...new Set(alternatives)].slice(0, 5),
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        available: true,
        message: 'Resources are available.',
        conflicts: [],
        alternatives: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

const createResourceBooking = async (req, res, next) => {
  try {
    const { eventName, organizer, date, startTime, endTime, venue, equipment = [] } = req.body;

    if (!eventName || !organizer || !venue) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'eventName, organizer, venue, date, startTime, and endTime are required',
        },
      });
    }

    const basicValidationError = validateDateAndTime({ date, startTime, endTime });
    if (basicValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: basicValidationError,
        },
      });
    }

    const selectedVenue = await Resource.findOne({ type: 'venue', name: venue });
    if (!selectedVenue || selectedVenue.status === 'maintenance') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'RESOURCE_CONFLICT',
          message: 'Selected venue is unavailable.',
        },
      });
    }

    const sameDayBookings = await ResourceBooking.find({
      date,
      status: { $ne: 'cancelled' },
    });

    const overlappingBookings = sameDayBookings.filter((booking) =>
      isTimeOverlap(booking.startTime, booking.endTime, startTime, endTime)
    );

    if (overlappingBookings.find((booking) => booking.venue === venue)) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'RESOURCE_CONFLICT',
          message: 'Selected venue is already booked for this time slot.',
        },
      });
    }

    const equipmentBookings = [];

    for (const equipmentName of equipment) {
      const equipmentResource = await Resource.findOne({ type: 'equipment', name: equipmentName });

      if (!equipmentResource || equipmentResource.status === 'maintenance') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'RESOURCE_CONFLICT',
            message: `${equipmentName} is unavailable.`,
          },
        });
      }

      const alreadyBookedCount = overlappingBookings.reduce((count, booking) => {
        const found = booking.equipment.find((item) => item.name === equipmentName);
        return count + (found ? found.quantity : 0);
      }, 0);

      if (equipmentResource.availableUnits - alreadyBookedCount < 1) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'RESOURCE_CONFLICT',
            message: `${equipmentName} does not have enough available units.`,
          },
        });
      }

      equipmentBookings.push({
        resourceId: equipmentResource.id,
        name: equipmentName,
        quantity: 1,
      });
    }

    const booking = await ResourceBooking.create({
      eventName: eventName.trim(),
      organizer: organizer.trim(),
      date,
      startTime,
      endTime,
      venue: venue.trim(),
      venueResourceId: selectedVenue.id,
      equipment: equipmentBookings,
      status: 'confirmed',
      createdBy: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceStats,
  getBookings,
  createResource,
  checkResourceAvailability,
  createResourceBooking,
};
