// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Hangar = require('../models/Hangar');
const auth = require('../middleware/auth');

// Create booking
router.post('/', auth, async (req, res) => {
    try {
        // Check if hangar exists
        const hangar = await Hangar.findById(req.body.hangarId);
        if (!hangar) {
            return res.status(404).json({ error: 'Hangar not found' });
        }

        // Create booking object
        const booking = new Booking({
            ...req.body,
            customerId: req.user._id,  // Set from authenticated user
            status: 'pending',
            paymentStatus: 'pending'
        });

        // Validate dates
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        if (startDate >= endDate) {
            return res.status(400).json({ 
                error: 'End date must be after start date' 
            });
        }

        // Check hangar availability
        const conflictingBooking = await Booking.findOne({
            hangarId: req.body.hangarId,
            status: { $nin: ['cancelled'] },
            $or: [
                {
                    startDate: { $lt: endDate },
                    endDate: { $gt: startDate }
                }
            ]
        });

        if (conflictingBooking) {
            return res.status(400).json({ 
                error: 'Hangar is not available for these dates' 
            });
        }

        await booking.save();
        
        // Populate related fields
        await booking.populate('hangarId', 'name location');

        res.status(201).json(booking);
    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ 
            message: 'Error creating booking', 
            error: error.message 
        });
    }
});

// Get all bookings for current user
router.get('/customer', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.user._id })
            .populate('hangarId', 'name location')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific booking
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            customerId: req.user._id
        }).populate('hangarId', 'name location');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            customerId: req.user._id,
            status: { $nin: ['cancelled', 'completed'] }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;