const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const auth = require('../middleware/auth');

const router = express.Router();

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { showId, showtimeId, seats } = req.body;
    
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    const showtime = show.showtimes.id(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    if (showtime.availableSeats < seats) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const totalAmount = seats * showtime.price;
    
    const booking = new Booking({
      user: req.user._id,
      show: showId,
      showtimeId,
      seats,
      totalAmount
    });

    await booking.save();
    
    // Clear cache for this show
    req.app.locals.cache.del(`show_${showId}`);
    req.app.locals.cache.del('all_shows');
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Confirm payment
router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update show seats
    const show = await Show.findById(booking.show);
    const showtime = show.showtimes.id(booking.showtimeId);
    showtime.availableSeats -= booking.seats;
    await show.save();

    booking.status = 'confirmed';
    booking.paymentId = paymentId;
    await booking.save();

    // Clear cache
    req.app.locals.cache.del(`show_${booking.show}`);
    req.app.locals.cache.del('all_shows');

    res.json({ message: 'Payment confirmed', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel booking with refund
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'confirmed') {
      // Refund seats
      const show = await Show.findById(booking.show);
      const showtime = show.showtimes.id(booking.showtimeId);
      showtime.availableSeats += booking.seats;
      await show.save();

      // Clear cache
      req.app.locals.cache.del(`show_${booking.show}`);
      req.app.locals.cache.del('all_shows');
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled and refunded', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user bookings
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('show', 'title poster')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;