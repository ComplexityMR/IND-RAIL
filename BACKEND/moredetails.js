import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const router = express.Router();

router.get("/:hotelid", async (req, res) => {
  try {
    const { hotelid } = req.params;

    const response = await axios.get(
      `https://api.liteapi.travel/v3.0/data/hotel?hotelId=${hotelid}`,
      {
        headers: {
          'X-Api-Key': process.env.LITE_API_KEY, 
          'Accept': 'application/json'
        }
      }
    );

    const hotel = response.data;

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json(hotel);
  } catch (err) {
    console.error("Backend Error:", err.message);
    
    // Better Error Handling:
    // If LiteAPI returns a 404 (hotel doesn't exist), pass that 404 to React 
    // instead of defaulting to a 500 error.
    if (err.response) {
      return res.status(err.response.status).json({ error: err.response.data });
    }
    
    res.status(500).json({ error: err.message });
  }
});

export default router; // <-- Use ES module export