import express from 'express';
import axios from 'axios';

// 1. Create a Router
const router = express.Router();

let flightCache = [];
let lastFetchTime = 0;

const OPENSKY_URL = 'https://opensky-network.org/api/states/all';

// This function runs independently and updates the cache
const updateFlightCache = async () => {
    try {
        const response = await axios.get(OPENSKY_URL, {
            headers: { 
                'Authorization': `Basic ${Buffer.from('complexity_mr-api-client:MM7TIEtWL06CI8k2cN5EaKoC2V6U9Q9y').toString('base64')}` 
            }
        });
        flightCache = response.data.states || [];
        lastFetchTime = Date.now();
        console.log(`✅ Success! Cache updated: ${flightCache.length} flights.`);
    } catch (error) {
        if (error.response) {
            console.error(`❌ API Error: ${error.response.status} - ${error.response.statusText}`);
            if (error.response.status === 429) {
                console.error("👉 Your IP is still blocked. Use a Mobile Hotspot!");
            }
            if (error.response.status === 401) {
                console.error("👉 Check your email! Did you click the verification link for the new account?");
            }
        } else {
            console.error("❌ Network Error:", error.message);
        }
    }
};

// Update once every 2 minutes
setInterval(updateFlightCache, 120000); 
updateFlightCache(); // Initial fetch

// 2. Change app.get to router.get
// Path is just '/' because the main server will handle the '/api/flights' part
router.get('/', (req, res) => {
    res.json({
        data: flightCache,
        updatedAt: lastFetchTime
    });
});

// 3. Export the router
export default router;