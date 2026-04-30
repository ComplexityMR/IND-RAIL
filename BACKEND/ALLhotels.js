import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const router = express.Router();

router.get('/search/:country/:city/:adults/:children/:checkin/:checkout', async (req, res) => {
  try {
    const { country, city, adults, children, checkin, checkout } = req.params;

    // --- NEW: Grab pagination params from query string (defaults: offset 0, limit 50) ---
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 50;

    // 1. If the frontend sends "Any" for an empty city, convert it back
    const searchQuery = city === "Any" ? "" : city;

    console.log(`[Backend] Searching hotels in ${searchQuery || country} (Offset: ${offset}, Limit: ${limit})...`);

    // ==========================================
    // STEP 1: FETCH STATIC HOTEL DATA (Images, Names, Locations)
    // ==========================================
    const staticResponse = await axios.get('https://api.liteapi.travel/v3.0/data/hotels', {
      headers: {
        'X-API-Key': process.env.LITE_API_KEY, 
        'Accept': 'application/json'
      },
      params: {
        countryCode: country, 
        cityName: searchQuery,
        limit: limit, // <-- Dynamic limit
        offset: offset // <-- Dynamic offset
      }
    });
    
    const hotelsData = staticResponse.data.data;

    // If no hotels are found in that city, return an empty array early
    if (!hotelsData || hotelsData.length === 0) {
      return res.status(200).json({ data: [], hasMore: false });
    }

    // ==========================================
    // STEP 2: EXTRACT IDs FOR PRICING
    // ==========================================
    const hotelIds = hotelsData.map(hotel => hotel.id);

    console.log(`[Backend] Found ${hotelIds.length} hotels. Fetching live prices...`);

    // ==========================================
    // STEP 3: FETCH LIVE PRICES
    // ==========================================
    const childrenAgesArray = Array(parseInt(children) || 0).fill(9);
    const ratesResponse = await axios.post(
      'https://api.liteapi.travel/v3.0/hotels/rates',
      {
        hotelIds: hotelIds,
        checkin: checkin,
        checkout: checkout,
        currency: "INR",    // Change to USD, EUR, etc. if needed
        guestNationality: "IN", 
        occupancies: [
          {
            adults: parseInt(adults) || 1,
            children: childrenAgesArray
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.LITE_API_KEY
        }
      }
    );

    const ratesData = ratesResponse.data.data || [];
    const expireIn=ratesData[0]?.et;
    const tax=ratesData[0]?.roomTypes?.[0]?.rates?.[0]?.retailRate?.taxesAndFees?.[0]?.amount ;
    const finalHotelsWithPrices = hotelsData.map(hotel => {
      // 1. Find the rate object for this specific hotel
      const hotelRate = ratesData.find(rateObj => rateObj.hotelId === hotel.id);
    
      let finalPrice = null;
      let finalCurrency = "INR";
      let isRefundable = false;
      let cancelCost = 0;
   
      // 2. If we found a rate, carefully extract the price and cancellation data
      if (hotelRate && hotelRate.roomTypes && hotelRate.roomTypes.length > 0) {
          const firstRoom = hotelRate.roomTypes[0];
          
          if (firstRoom.suggestedSellingPrice) {
              finalPrice = firstRoom.suggestedSellingPrice.amount;
              finalCurrency = firstRoom.suggestedSellingPrice.currency;
          }
      
          // MOVED HERE: Safely extract refundable tag and cancel cost from the matched hotelRate
          isRefundable = hotelRate?.roomTypes?.[0]?.rates?.[0]?.cancellationPolicies?.refundableTag === "RFN";
          cancelCost = hotelRate?.roomTypes?.[0]?.rates?.[0]?.cancellationPolicies?.cancelPolicyInfos?.[0]?.amount || 0;
      }
      
      return {
        ...hotel,
        price: finalPrice,
        currency: finalCurrency,
        isAvailable: finalPrice !== null,
        isRefundable: isRefundable, 
        cancelCost: cancelCost,
        expireIn:expireIn,
        tax:tax 
      };
    })
    // 3. Filter out sold-out hotels (ones where price is still null)
    .filter(hotel => hotel.isAvailable);

    console.log(`[Backend] Returning ${finalHotelsWithPrices.length} available hotels with prices.`);

    // Send the final combined data back to React
    // --- NEW: Add hasMore flag so frontend knows when to stop scrolling ---
    res.status(200).json({ 
      data: finalHotelsWithPrices,
      hasMore: hotelsData.length === limit 
    });

  } catch (error) {
    console.error("LiteAPI Error:", error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({ 
      success: false,
      message: "Failed to fetch hotel data",
      details: error.response?.data || error.message
    });
  }
});

router.post('/hotelRates', async (req, res) => {
  try {
    const { hotelId, checkin, checkout, adults, children } = req.body;
    
    const childrenAgesArray = Array(parseInt(children) || 0).fill(9);

    const ratesResponse = await axios.post(
      'https://api.liteapi.travel/v3.0/hotels/rates',
      {
        hotelIds: [hotelId], 
        checkin: checkin,
        checkout: checkout,
        currency: "INR",
        guestNationality: "IN",
        roomMapping: true, // <-- CRITICAL: Gets photos & descriptions with the price
        occupancies: [
          {
            adults: parseInt(adults) || 1,
            children: childrenAgesArray
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.LITE_API_KEY
        }
      }
    );

    const hotelRateData = ratesResponse.data.data?.[0]?.roomTypes || [];
    res.status(200).json({ success: true, rates: hotelRateData });

  } catch (error) {
    console.error("Rates Fetch Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to fetch rates" });
  }
});

export default router;