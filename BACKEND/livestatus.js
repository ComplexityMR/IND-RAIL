import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import Flight from './Flight.js'; 
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const routeDatabase = require('./airports.json');

const router = express.Router();

const MONGO_URI = process.env.DB_CONNECT_KEY;
const BDC_API_KEY = process.env.BDC_API_KEY || 'your_free_key_here'; 

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas (Flights)"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// --- 1. GLOBAL SYNC LOGIC ---
async function syncGlobalSky() {
    console.log(`\n[${new Date().toLocaleTimeString()}] Starting Global Sync...`);
    try {
        const res = await axios.get('https://opensky-network.org/api/states/all', {
            auth: {
                username: 'prateek44-api-client',
                password: process.env.OPENAPI_KEY // Removed quotes to use the actual variable
            },
            timeout: 30000
        });

        const states = res.data.states || [];
        if (states.length === 0) return;

        const bulkOps = states.map(s => {
            const rawCallsign = (s[1] || "").trim().toUpperCase();
            if (!rawCallsign) return null;

            const route = routeDatabase[rawCallsign] || ["Unknown", "Unknown"];
            const apiContactTime = new Date(s[4] * 1000);

            return {
                updateOne: {
                    filter: { callsign: rawCallsign },
                    update: {
                        $set: {
                            icao24: s[0],
                            src: route[0],
                            dest: route[1],
                            country : s[2],
                            lon: s[5],
                            lat: s[6],
                            baro_alt: s[7],
                            alt: s[7] ? Math.round(s[7] * 3.28084) : 0,
                            velocity: s[9],
                            gs: s[9] ? Math.round(s[9] * 1.94384) : 0,
                            onGround: s[8],
                            track: s[10],
                            vrate: s[11],
                            lastSeen: apiContactTime
                        }
                    },
                    upsert: true
                }
            };
        }).filter(op => op !== null);

        if (bulkOps.length > 0) {
            const result = await Flight.bulkWrite(bulkOps, { ordered: false });
            console.log(`Sync Complete: ${result.upsertedCount} new, ${result.modifiedCount} updated.`);
        }

        // --- NEW: CLEANUP LOGIC ---
        // Removes flights not seen in the last 2 hours to keep the DB fresh
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const deleteResult = await Flight.deleteMany({ lastSeen: { $lt: twoHoursAgo } });
        
        if (deleteResult.deletedCount > 0) {
            console.log(`Cleanup: Removed ${deleteResult.deletedCount} stale flights.`);
        }

    } catch (err) {
        console.error("Sync Failed:", err.message);
    }
}

// Sync every 2 minutes
setInterval(syncGlobalSky, 2 * 1000 * 60);
syncGlobalSky(); 

// --- 2. THE API ENDPOINT ---
router.get('/:callsign', async (req, res) => {
    const callsign = req.params.callsign.toUpperCase();

    try {
        const flight = await Flight.findOne({ callsign });

        if (!flight) {
            return res.status(404).json({ error: "Flight not found." });
        }

        let locationName = "Over Open Water / Unknown";

        if (flight.lat && flight.lon) {
            try {
                const bdcRes = await axios.get(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${flight.lat}&longitude=${flight.lon}&localityLanguage=en`
                );
                
                const data = bdcRes.data;
                locationName = data.locality || data.city || data.principalSubdivision || data.countryName || "Unknown Location";
                
                if (data.countryName && locationName !== data.countryName) {
                    locationName += `, ${data.countryName}`;
                }
            } catch (bdcErr) {
                console.error("BigDataCloud Error:", bdcErr.message);
                locationName = "Position Tracking Active";
            }
        }

        const isLive = (new Date() - flight.lastSeen) < 3600000;

        res.json({
            ...flight._doc,
            isLive,
            currentLocation: locationName, 
            message: isLive ? "Currently Live" : `Signal lost. Last seen at ${flight.lastSeen.toLocaleTimeString()}`
        });
    } catch (err) {
        res.status(500).json({ error: "Database search error" });
    }
});

export default router;
