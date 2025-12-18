const mongoose = require('mongoose');
const Show = require('./models/Show');
const Theater = require('./models/Theater');
require('dotenv').config();

// Helper function to generate random date within a range
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate showtimes
function generateShowtimes(theaterId, screen, days = 14) {
  const showtimes = [];
  const times = ['10:00 AM', '1:30 PM', '4:00 PM', '7:00 PM', '10:00 PM'];
  const today = new Date();
  
  for (let day = 0; day < days; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    // Randomly select 2-4 showtimes per day
    const showCount = 2 + Math.floor(Math.random() * 3);
    const selectedTimes = [...times]
      .sort(() => 0.5 - Math.random())
      .slice(0, showCount);
    
    for (const time of selectedTimes) {
      const totalSeats = 100 + Math.floor(Math.random() * 50); // 100-150 seats
      const price = 150 + Math.floor(Math.random() * 200); // 150-350 INR
      
      // Create seat map
      const seats = new Map();
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const premiumRows = ['A', 'B'];
      const sofaRows = ['J'];
      let seatNumber = 1;
      
      for (const row of rows) {
        const rowSeats = [];
        const seatType = premiumRows.includes(row) ? 'premium' : sofaRows.includes(row) ? 'sofa' : 'standard';
        const seatsInRow = 10 + (row === 'F' ? 0 : Math.floor(Math.random() * 3) - 1); // 9-11 seats per row
        
        for (let i = 1; i <= seatsInRow; i++) {
          rowSeats.push({
            number: seatNumber.toString().padStart(2, '0'),
            row,
            status: Math.random() > 0.9 ? 'booked' : 'available', // 10% chance of being booked
            type: seatType
          });
          seatNumber++;
        }
        
        seats.set(row, rowSeats);
      }
      
      showtimes.push({
        date,
        time,
        theater: '', // Will be populated with theater name
        theaterId,
        screen,
        totalSeats,
        availableSeats: totalSeats - Math.floor(totalSeats * 0.1), // 10% already booked
        price,
        seats: Object.fromEntries(seats),
        seatLayout: {
          rows: rows.length,
          cols: 12,
          gapAfterRow: 2,
          gapAfterCol: 4
        }
      });
    }
  }
  
  return showtimes;
}

// Sample Theaters
const sampleTheaters = [
  {
    name: "PVR Cinemas: Phoenix Marketcity",
    location: {
      address: "3rd Floor, Phoenix Market City, Mahadevpura",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560048",
      coordinates: { lat: 12.9931, lng: 77.6974 }
    },
    contact: {
      phone: "+91 80 6720 0000",
      email: "info@pvr.in"
    },
    facilities: ['3d', 'dolby', 'food', 'parking', 'wheelchair'],
    screens: [
      { name: "Screen 1", capacity: 180 },
      { name: "Screen 2", capacity: 150 },
      { name: "Screen 3 (IMAX)", capacity: 220 }
    ]
  },
  {
    name: "INOX: Forum Mall",
    location: {
      address: "3rd Floor, Forum Mall, Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
      coordinates: { lat: 12.9352, lng: 77.6245 }
    },
    contact: {
      phone: "+91 80 2206 7890",
      email: "support@inoxmovies.com"
    },
    facilities: ['3d', 'dolby', 'food', 'parking'],
    screens: [
      { name: "Screen 1", capacity: 200 },
      { name: "Screen 2", capacity: 180 }
    ]
  },
  {
    name: "Cinepolis: Nexus Shantiniketan",
    location: {
      address: "4th Floor, Nexus Shantiniketan, Whitefield",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560048",
      coordinates: { lat: 12.9850, lng: 77.7421 }
    },
    contact: {
      phone: "+91 80 4622 1000",
      email: "info@cinepolis.com"
    },
    facilities: ['3d', 'dolby', 'imax', 'food', 'parking', 'wheelchair'],
    screens: [
      { name: "Screen 1 (4DX)", capacity: 150 },
      { name: "Screen 2", capacity: 120 },
      { name: "Screen 3", capacity: 100 },
      { name: "Screen 4 (IMAX)", capacity: 250 }
    ]
  }
];

// Sample Movies
const sampleMovies = [
  {
    title: "Avengers: Endgame",
    description: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
    duration: 181,
    genre: "Action, Adventure, Sci-Fi",
    rating: 8.4,
    language: "English",
    director: "Anthony Russo, Joe Russo",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"],
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg"
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    duration: 152,
    genre: "Action, Crime, Drama",
    rating: 9.0,
    language: "English",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine", "Gary Oldman"],
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
  },
  {
    title: "RRR",
    description: "A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920s.",
    duration: 187,
    genre: "Action, Drama",
    rating: 7.8,
    language: "Telugu",
    director: "S.S. Rajamouli",
    cast: ["N.T. Rama Rao Jr.", "Ram Charan", "Ajay Devgn", "Alia Bhatt", "Shriya Saran"],
    poster: "https://image.tmdb.org/t/p/w500/7g3BW8BL2eG6b0Yz0vFDoVFDW96.jpg"
  },
  {
    title: "Kantara",
    description: "A humble and honest police officer's life is mysteriously connected to a Yajna performed by an unorthodox traveler 200 years ago and is haunted by it. Unable to recollect his memories, he begins to discover his past after his father's death.",
    duration: 148,
    genre: "Action, Drama, Thriller",
    rating: 8.2,
    language: "Kannada",
    director: "Rishab Shetty",
    cast: ["Rishab Shetty", "Sapthami Gowda", "Kishore Kumar G.", "Achyuth Kumar"],
    poster: "https://image.tmdb.org/t/p/w500/3CxUndGhUcZdt1Zggjdb2HkLLQX.jpg"
  },
  {
    title: "Drishyam 2",
    description: "A gripping tale of an investigation and a family which is threatened by it. Will Georgekutty be able to protect his family this time?",
    duration: 152,
    genre: "Crime, Drama, Mystery",
    rating: 8.5,
    language: "Malayalam",
    director: "Jeethu Joseph",
    cast: ["Mohanlal", "Meena", "Ansiba", "Esther Anil", "Murali Gopy"],
    poster: "https://image.tmdb.org/t/p/w500/AbBD2xsgN2WUxTUEKxNQ7qW0vLT.jpg"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Promise.all([
      Show.deleteMany({}),
      Theater.deleteMany({})
    ]);
    
    // Insert theaters and get their IDs
    const insertedTheaters = await Theater.insertMany(sampleTheaters);
    console.log(`${insertedTheaters.length} theaters inserted`);
    
    // Create shows with showtimes for each theater
    const showsToInsert = [];
    
    for (const movie of sampleMovies) {
      const show = {
        ...movie,
        showtimes: []
      };
      
      // Assign showtimes to random screens in random theaters
      const theaterCount = Math.min(insertedTheaters.length, 1 + Math.floor(Math.random() * 2)); // 1-2 theaters per movie
      const selectedTheaters = [...insertedTheaters]
        .sort(() => 0.5 - Math.random())
        .slice(0, theaterCount);
      
      for (const theater of selectedTheaters) {
        const screen = theater.screens[Math.floor(Math.random() * theater.screens.length)].name;
        const showtimes = generateShowtimes(theater._id, screen, 7); // 7 days of showtimes
        
        // Add theater name to each showtime
        const showtimesWithTheater = showtimes.map(st => ({
          ...st,
          theater: theater.name
        }));
        
        show.showtimes.push(...showtimesWithTheater);
      }
      
      showsToInsert.push(show);
    }
    
    // Insert shows
    const insertedShows = await Show.insertMany(showsToInsert);
    console.log(`${insertedShows.length} shows with showtimes inserted`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();