import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const router = express.Router();

router.get('/:pnr', async (req, res) => {   

    try {
        const { pnr } = req.params;
        

        const response = await axios.get(
            `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${pnr}`,
            {
                headers: {
                    'x-rapidapi-key': 'e478158057msh11c165be1004632p17cdd0jsnbb1dfee212b8',
                    'x-rapidapi-host': 'irctc-indian-railway-pnr-status.p.rapidapi.com',
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data || 'Failed to fetch railway data';
        console.error(`❌ RapidAPI error [${status}]:`, message);
        res.status(status).json({ error: message });
    }   
});

export default router;