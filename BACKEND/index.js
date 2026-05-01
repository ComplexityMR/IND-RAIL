import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import airportRoutes from './airportname.js';
import hotels from './ALLhotels.js';
import hotelDetails from './moredetails.js';
import places from './places.js';
import pnr from './pnr.js';
import livemap from './livemap.js';
import livestatus2 from './livestatus2.js';
import trainbtwstation from './trainbtwstation.js';
import ai from './ai.js';
import hotelReviews from './reviews.js';
import livestatus from './livestatus.js';
import map from './map.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://trippingbuddy1.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use('/api/airport', airportRoutes);
app.use('/api/hotels', hotels);
app.use('/api/hotel', places);
app.use('/api/hotelDetails', hotelDetails);
app.use('/api/hotelReviews', hotelReviews);
app.use('/api/rail', pnr);
app.use('/api/livetrains', livemap);
app.use('/api/flight',livestatus);
app.use('/api/railway/live-status', livestatus2);
app.use('/api/trainbtwstation', trainbtwstation);
app.use('/api/flights',map);

app.use('/api/ai/chat', ai);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
