import express from 'express';
import { MongoClient } from 'mongodb';

// 1. Create a Router instead of an App
const router = express.Router(); // 

// 2. Connect to MongoDB (using your .env variable as discussed!)
const uri = process.env.DB_CONNECT_KEY || "mongodb+srv://trippingbuddy:PratsCR7@cluster0.fekvjin.mongodb.net/";
const client = new MongoClient(uri);

// 3. Change app.get to router.get
// Notice the path is just '/:icao' because server.js handles the '/api/airport' part
router.get('/:icao', async (req, res) => {
    try {
        const { icao } = req.params;
        const database = client.db('test');
        const airports = database.collection('airportnames');

        const query = { ident: icao.toUpperCase().trim() };
        const projection = { _id: 0, name: 1, latitude_deg: 1, longitude_deg: 1 };

        const airport = await airports.findOne(query, { projection });

        if (airport) {
            res.status(200).json(airport);
        } else {
            res.status(404).json({ message: "Airport not found" });
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 4. Export the router so server.js can import it!
export default router;