import express from 'express';
import axios from 'axios';
import 'dotenv/config';
import { createKeyRotator } from './keyRotator.js'; // Adjust path if needed

const router = express.Router();

// Initialize the rotator specifically for the LIVE STATUS keys
const statusKeys = createKeyRotator(process.env.RAILRADAR_LIVESTATUS_KEYS);

router.get('/:trainId/:date', async (req, res) => {
    const { trainId, date } = req.params;
    console.log("🔍 Fetching train:", trainId, "date:", date);

    let retries = 0;
    const maxRetries = statusKeys.getKeyCount();

    // Loop to try the next key if the current one is exhausted
    while (retries < maxRetries) {
        const apiKey = statusKeys.getNextKey();
        
        try {
            const response = await axios.get(
                `https://api.railradar.org/api/v1/trains/${trainId}`,
                { params: { journeyDate: date, dataType: 'full', apiKey: apiKey } } // Using dynamic key
            );

            console.log("✅ API response successful.");
            // If successful, send data and exit the function immediately
            return res.json(response.data);
            
        } catch (error) {
            // Check if the error is a Rate Limit Error (429)
            if (error.response && error.response.status === 429) {
                console.warn(`Live Status Key exhausted. Retrying... (${retries + 1}/${maxRetries})`);
                retries++; // Increment retry count and loop again
            } else {
                // If it's any other error, fail normally
                console.error("❌ Full error:", error.response?.data || error.message);
                return res.status(500).json({ error: 'Failed to fetch live status' });
            }
        }
    }

    // If the loop finishes, it means ALL keys in the status pool are exhausted
    console.error('All Live Status API keys exhausted.');
    return res.status(429).json({ error: 'Rate limit exceeded across all status keys.' });
});

export default router;