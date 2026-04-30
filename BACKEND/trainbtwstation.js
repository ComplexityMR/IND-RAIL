import express from 'express';
import axios from 'axios';
import 'dotenv/config';

// mergeParams is no longer strictly needed since params are in this file
const router = express.Router();

router.get('/:fromstation/:tostation', async (req, res) => {
    try {
        const { fromstation, tostation } = req.params;
        
        const response = await axios.get(
            'https://api.railradar.org/api/v1/trains/between',
            {
                params: {

                    from: fromstation,  
                    to: tostation,
                    dataType: 'full',
                    apiKey: 'rr_owq1a9vcxmj5eh5uuca1p3rwzino06n9'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        
        console.error("RailRadar API Error:", error.response?.data || error.message);
        
        const statusCode = error.response?.status || 500;
        res.status(statusCode).json({ 
            error: 'An error occurred while fetching train data.',
            details: error.response?.data || error.message 
        });
    }
});

export default router;