const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { 
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String }
  },
  facilities: [{
    type: String,
    enum: ['3d', 'dolby', 'imax', 'food', 'parking', 'wheelchair']
  }],
  screens: [{
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    seatLayout: {
      rows: { type: Number, default: 10 },
      cols: { type: Number, default: 12 },
      gapAfterRow: { type: Number, default: 2 },
      gapAfterCol: { type: Number, default: 4 },
      premiumRows: { type: [String], default: ['A', 'B'] },
      sofaRows: { type: [String], default: [] }
    }
  }],
  openingTime: { type: String, default: '10:00 AM' },
  closingTime: { type: String, default: '11:30 PM' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Theater', theaterSchema);
