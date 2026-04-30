import express from 'express';
import axios from 'axios';

const router = express.Router();

// GET /api/hotelReviews/:hotelid
router.get('/:hotelid', async (req, res) => {
  const { hotelid } = req.params;
  
  try {
    const response = await axios.get(
      `https://api.liteapi.travel/v3.0/data/reviews?hotelId=${hotelid}&limit=20`,
      {
        headers: {
          // Make sure your .env has LITE_API_KEY defined
          "X-API-Key": process.env.LITE_API_KEY, 
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error("Error fetching hotel reviews:", error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || "Failed to fetch reviews from provider"
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "Internal server error while fetching reviews" 
    });
  }
});

export default router;