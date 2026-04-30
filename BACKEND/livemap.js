import express from 'express';
import axios from 'axios';
import 'dotenv/config';
import { createKeyRotator } from './keyRotator.js'; // Adjust path if needed

const router = express.Router();

// Initialize the rotator specifically for the MAP keys
const mapKeys = createKeyRotator(process.env.RAILRADAR_MAP_KEYS);

router.get('/', async (req, res) => {
    let retries = 0;
    const maxRetries = mapKeys.getKeyCount();

    // Loop to try the next key if the current one is exhausted
    while (retries < maxRetries) {
        const apiKey = mapKeys.getNextKey();
        
        try {
            const response = await axios.get(
                'https://api.railradar.org/api/v1/trains/live-map',
                { params: { apiKey: apiKey } } // Using dynamic key
            );
            
            // If successful, send data and exit the function immediately
            return res.json(response.data); 
            
        } catch (error) {
            // Check if the error is a Rate Limit Error (429)
            if (error.response && error.response.status === 429) {
                console.warn(`Map API Key exhausted. Retrying... (${retries + 1}/${maxRetries})`);
                retries++; // Increment retry count and loop again
            } else {
                // If it's any other error (like 500 or 404), fail normally
                console.error('Error fetching live trains:', error.message);
                return res.status(500).json({ error: 'Failed to fetch live trains' });
            }
        }
    }

    // If the loop finishes, it means ALL keys in the map pool are exhausted
    console.error('All Map API keys exhausted.');
    return res.status(429).json({ error: 'Rate limit exceeded across all map keys.' });
});

export default router;