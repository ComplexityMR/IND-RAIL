import express from 'express';
import axios from 'axios';

const router = express.Router();

// NEW ROUTE: Fetch places from LiteAPI securely
// This will be accessible at: http://localhost:5000/api/hotel/places
router.get('/places', async (req, res) => {
    // 1. Get the search text from the frontend's request
    const searchQuery = req.query.query;

    if (!searchQuery) {
        return res.status(400).json({ error: "Search query is required" });
    }

    try {
        console.log(`[Backend] Fetching LiteAPI for: ${searchQuery}`);

        // 2. Make the request to the main LiteAPI link
        const response = await axios.get(
            `https://api.liteapi.travel/v3.0/data/places?textQuery=${searchQuery}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Api-Key": "sand_733ddb5c-6223-4c31-bdf1-5c65cdc054b8" // ⚠️ Insert your REAL LiteAPI key here
                }
            }
        );
        
        // 3. Send the successful response back to the React frontend
        // FIXED: Only send response.data to avoid the circular JSON crash
        res.json(response.data); 

    } catch (error) {
        console.error("[Backend] LiteAPI Error:", error.message);
        
        // Send a clean error to the frontend if something fails
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to fetch from LiteAPI" });
        }
    }
});

// Export the router so your main server.js can use it
export default router;