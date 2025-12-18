const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  genre: { type: String, required: true },
  rating: { type: Number, default: 0 },
  poster: { type: String, default: '' },
  language: { type: String, default: 'English' },
  director: { type: String, default: '' },
  cast: [{ type: String }],
  showtimes: [{
    date: { type: Date, required: true },
    time: { type: String, required: true },
    theater: { type: String, required: true },
    theaterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater' },
    screen: { type: String, default: 'Screen 1' },
    totalSeats: { type: Number, default: 100 },
    availableSeats: { type: Number, default: 100 },
    price: { type: Number, required: true },
    seats: {
      type: Map,
      of: [{
        number: { type: String, required: true },
        row: { type: String, required: true },
        status: { type: String, enum: ['available', 'booked', 'selected'], default: 'available' },
        type: { type: String, enum: ['standard', 'premium', 'sofa'], default: 'standard' }
      }],
      default: {}
    },
    seatLayout: {
      rows: { type: Number, default: 10 },
      cols: { type: Number, default: 12 },
      gapAfterRow: { type: Number, default: 2 },
      gapAfterCol: { type: Number, default: 4 }
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Show', showSchema);