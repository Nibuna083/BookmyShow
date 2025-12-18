const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  number: { type: String, required: true },
  row: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['standard', 'premium', 'sofa'], 
    default: 'standard' 
  },
  price: { type: Number, required: true }
});

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  show: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Show', 
    required: true 
  },
  showtimeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  theaterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater',
    required: true
  },
  movieTitle: { type: String, required: true },
  theaterName: { type: String, required: true },
  showDate: { type: Date, required: true },
  showTime: { type: String, required: true },
  screen: { type: String, required: true },
  seats: [seatSchema],
  totalSeats: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  convenienceFee: { 
    type: Number, 
    default: function() {
      return Math.ceil(this.subtotal * 0.1); // 10% convenience fee
    } 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'expired', 'refunded'], 
    default: 'pending' 
  },
  payment: {
    method: { 
      type: String, 
      enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'],
      required: true
    },
    transactionId: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    amount: { type: Number },
    paymentDate: { type: Date }
  },
  qrCode: { type: String },
  bookingReference: { type: String, unique: true },
  cancellationPolicy: {
    allowed: { type: Boolean, default: true },
    refundPercentage: { type: Number, default: 50 },
    deadline: { 
      type: Date,
      default: function() {
        const deadline = new Date(this.showDate);
        deadline.setHours(deadline.getHours() - 4); // 4 hours before show
        return deadline;
      }
    }
  },
  additionalServices: [{
    name: String,
    quantity: Number,
    price: Number
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate booking reference before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    const count = await this.constructor.countDocuments();
    this.bookingReference = `BMS${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Virtual for formatted booking date
bookingSchema.virtual('formattedDate').get(function() {
  return this.showDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Indexes for faster queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ show: 1, showtimeId: 1 });
bookingSchema.index({ bookingReference: 1 }, { unique: true });
bookingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 }); // Auto-delete pending bookings after 30 minutes

module.exports = mongoose.model('Booking', bookingSchema);