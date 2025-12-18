const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Show = require('../models/Show');
const Booking = require('../models/Booking');

// Get available seats for a showtime
router.get('/:showId/showtimes/:showtimeId/seats', auth, async (req, res) => {
  try {
    const { showId, showtimeId } = req.params;
    
    const show = await Show.findOne(
      { _id: showId, 'showtimes._id': showtimeId },
      { 'showtimes.$': 1, title: 1 }
    );

    if (!show) {
      return res.status(404).json({ message: 'Show or showtime not found' });
    }

    const showtime = show.showtimes[0];
    res.json({
      showId: show._id,
      showTitle: show.title,
      showtimeId: showtime._id,
      theater: showtime.theater,
      screen: showtime.screen,
      date: showtime.date,
      time: showtime.time,
      price: showtime.price,
      seats: showtime.seats,
      seatLayout: showtime.seatLayout
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Select seats (temporary hold)
router.post('/select', auth, async (req, res) => {
  const { showId, showtimeId, seatNumbers } = req.body;
  const userId = req.user.id;
  
  if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ message: 'Please select at least one seat' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the show and showtime
    const show = await Show.findOne({
      _id: showId,
      'showtimes._id': showtimeId
    }).session(session);

    if (!show) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Show or showtime not found' });
    }

    const showtime = show.showtimes.id(showtimeId);
    if (!showtime) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // Check seat availability and mark as selected
    for (const seatNumber of seatNumbers) {
      const [row, number] = seatNumber.split('-');
      const seat = showtime.seats.get(row)?.find(s => s.number === number);
      
      if (!seat || seat.status !== 'available') {
        await session.abortTransaction();
        return res.status(400).json({ 
          message: `Seat ${seatNumber} is not available` 
        });
      }
      
      seat.status = 'selected';
    }

    // Save the show with updated seat status
    await show.save({ session });
    
    // Create a temporary booking (will be confirmed after payment)
    const booking = new Booking({
      user: userId,
      show: showId,
      showtimeId: showtime._id,
      theaterId: showtime.theaterId,
      movieTitle: show.title,
      theaterName: showtime.theater,
      showDate: showtime.date,
      showTime: showtime.time,
      screen: showtime.screen,
      seats: seatNumbers.map(seatNumber => {
        const [row, number] = seatNumber.split('-');
        const seat = showtime.seats.get(row).find(s => s.number === number);
        return {
          number,
          row,
          type: seat.type,
          price: showtime.price * (seat.type === 'premium' ? 1.5 : seat.type === 'sofa' ? 2 : 1)
        };
      }),
      totalSeats: seatNumbers.length,
      subtotal: seatNumbers.reduce((total, seatNumber) => {
        const [row, number] = seatNumber.split('-');
        const seat = showtime.seats.get(row).find(s => s.number === number);
        const multiplier = seat.type === 'premium' ? 1.5 : seat.type === 'sofa' ? 2 : 1;
        return total + (showtime.price * multiplier);
      }, 0),
      status: 'pending',
      payment: {
        method: '',
        status: 'pending'
      }
    });

    await booking.save({ session });
    await session.commitTransaction();
    
    res.json({
      message: 'Seats selected successfully',
      bookingId: booking._id,
      totalAmount: booking.totalAmount,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes to complete payment
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error selecting seats:', error);
    res.status(500).json({ message: 'Error selecting seats', error: error.message });
  } finally {
    session.endSession();
  }
});

// Confirm booking after payment
router.post('/confirm', auth, async (req, res) => {
  const { bookingId, paymentMethod, paymentId } = req.body;
  const userId = req.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the booking
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: 'pending'
    }).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Booking not found or already processed' });
    }

    // Update booking status
    booking.status = 'confirmed';
    booking.payment = {
      method: paymentMethod,
      transactionId: paymentId,
      status: 'completed',
      amount: booking.totalAmount,
      paymentDate: new Date()
    };

    // Update seat status in the show
    await Show.updateOne(
      { _id: booking.show, 'showtimes._id': booking.showtimeId },
      { 
        $inc: { 'showtimes.$.availableSeats': -booking.totalSeats },
        $set: {
          'showtimes.$.seats': booking.seats.map(seat => ({
            ...seat,
            status: 'booked'
          }))
        }
      },
      { session }
    );

    await booking.save({ session });
    await session.commitTransaction();
    
    // In a real app, you would send a confirmation email here
    
    res.json({
      message: 'Booking confirmed successfully',
      booking: {
        id: booking._id,
        reference: booking.bookingReference,
        movie: booking.movieTitle,
        theater: booking.theaterName,
        screen: booking.screen,
        date: booking.showDate,
        time: booking.showTime,
        seats: booking.seats.map(s => `${s.row}${s.number}`).join(', '),
        totalAmount: booking.totalAmount,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(booking.bookingReference)}`
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error confirming booking:', error);
    res.status(500).json({ message: 'Error confirming booking', error: error.message });
  } finally {
    session.endSession();
  }
});

// Release seats if payment fails or times out
router.post('/release', auth, async (req, res) => {
  const { bookingId } = req.body;
  const userId = req.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find and delete the pending booking
    const booking = await Booking.findOneAndDelete({
      _id: bookingId,
      user: userId,
      status: 'pending'
    }).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'No pending booking found' });
    }

    // Update seat status back to available
    await Show.updateOne(
      { _id: booking.show, 'showtimes._id': booking.showtimeId },
      { 
        $inc: { 'showtimes.$.availableSeats': booking.totalSeats },
        $set: {
          'showtimes.$.seats': booking.seats.map(seat => ({
            ...seat,
            status: 'available'
          }))
        }
      },
      { session }
    );

    await session.commitTransaction();
    res.json({ message: 'Seats released successfully' });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error releasing seats:', error);
    res.status(500).json({ message: 'Error releasing seats', error: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
