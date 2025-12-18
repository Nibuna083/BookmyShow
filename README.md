# BookMyShow Clone

A minimal BookMyShow-like application built with React.js, Node.js, and MongoDB.

## Features

### User Features
- ✅ User Registration & Login
- ✅ User Logout
- ✅ View Available Shows
- ✅ Book Tickets
- ✅ Mock Payment Gateway
- ✅ Cancel Booking with Refund
- ✅ View My Bookings

### Technical Features
- ✅ JWT Authentication
- ✅ In-memory Caching (Node-Cache)
- ✅ RESTful API Design
- ✅ Responsive UI
- ✅ Error Handling

## Tech Stack

- **Frontend**: React.js, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Caching**: Node-Cache (in-memory)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your MongoDB connection:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookmyshow
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. Seed sample data:
```bash
node seed.js
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React app:
```bash
npm start
```

## Usage

1. Open http://localhost:3000 in your browser
2. Register a new account or login
3. Browse available shows
4. Select a show and choose showtime
5. Book tickets and proceed to payment
6. Use the mock payment gateway
7. View your bookings in "My Bookings"
8. Cancel bookings for refund if needed

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Shows
- `GET /api/shows` - Get all shows (cached)
- `GET /api/shows/:id` - Get show by ID (cached)

### Bookings
- `POST /api/bookings` - Create booking
- `POST /api/bookings/:id/confirm` - Confirm payment
- `POST /api/bookings/:id/cancel` - Cancel booking with refund
- `GET /api/bookings` - Get user bookings

## Architecture Highlights

- **Caching**: Fast retrieval of show data using in-memory cache
- **Authentication**: Secure JWT-based authentication
- **State Management**: React hooks for client-side state
- **Error Handling**: Comprehensive error handling on both frontend and backend
- **Responsive Design**: Mobile-friendly UI components

## Future Enhancements

- Real payment gateway integration
- Seat selection interface
- Email notifications
- Admin panel for show management
- Redis for distributed caching
- Real-time seat availability updates