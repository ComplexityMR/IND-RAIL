import express from 'express';
import axios from 'axios';
import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const router = express.Router();
const BASE_URL = 'http://localhost:5000';
let lastRequestTime = 0;

function extractStations(question) {
    const upper = question.toUpperCase();
    const words = upper.split(/\s+/);

    const fromIndex = words.indexOf('FROM');
    const toIndex = words.indexOf('TO');

    const stations = {
        from: fromIndex !== -1 ? words[fromIndex + 1] : null,
        to: toIndex !== -1 ? words[toIndex + 1] : null
    };

    console.log('Extracted stations:', stations);
    return stations;
}

async function fetchRelevantData(question) {
    const q = question.toLowerCase();
    let data = {};

    try {
        if (q.includes('pnr')) {
            const pnrMatch = question.match(/\d{10}/);
            if (pnrMatch) {
                const res = await axios.get(`${BASE_URL}/api/rail/${pnrMatch[0]}`);
                data.pnr = res.data;
            }
        }

        if (q.includes('train') || q.includes('from') || q.includes('between')) {
            const stations = extractStations(question);
            if (stations.from && stations.to) {
                console.log(`Fetching trains: ${stations.from} → ${stations.to}`);
                const res = await axios.get(`${BASE_URL}/api/trainbtwstation/${stations.from}/${stations.to}`);
                data.trains = res.data;
                console.log('Train data received:', JSON.stringify(data.trains).slice(0, 200));
            }
        }

        if (q.includes('live') || q.includes('status') || q.includes('running')) {
            const trainNo = question.match(/\d{5}/);
            if (trainNo) {
                const res = await axios.get(`${BASE_URL}/api/railway/live-status/${trainNo[0]}`);
                data.liveStatus = res.data;
            }
        }

        if (q.includes('hotel') || q.includes('stay') || q.includes('accommodation')) {
            const res = await axios.get(`${BASE_URL}/api/hotels`);
            data.hotels = res.data;
        }

        if (q.includes('airport') || q.includes('flight') || q.includes('terminal')) {
            const res = await axios.get(`${BASE_URL}/api/airport`);
            data.airports = res.data;
        }

    } catch (err) {
        console.error('Error fetching data:', err.message);
    }

    return data;
}

router.post('/', async (req, res) => {
    const now = Date.now();
    if (now - lastRequestTime < 1000) {
        return res.status(429).json({
            error: 'Please wait a moment before sending another message.'
        });
    }
    lastRequestTime = now;

    try {
        const { question, history = [] } = req.body;

        console.log('Question received:', question);

        const data = await fetchRelevantData(question);

        console.log('Data fetched:', Object.keys(data));

        const messages = [
            {
                role: 'system',
                content: `You are a helpful travel assistant for an Indian travel app.
                          You help users with train info, hotel bookings, airport details, and PNR status.
                          Always respond in a friendly, concise manner.
                          Format train/hotel data in a readable way.
                          If train data is provided, always list the trains with their numbers, names, departure and arrival times.
                          Never say you couldn't find data if data is present in the API response.`
            },
            ...history.map(h => ({
                role: h.role === 'assistant' ? 'assistant' : 'user',
                content: h.content
            })),
            {
                role: 'user',
                content: `
                    User Question: ${question}

                    Relevant Data from APIs: ${JSON.stringify(data, null, 2)}

                    Answer the user's question naturally using the data above.
                    If no relevant data was found, politely say you couldn't find the information.
                `
            }
        ];

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages,
            max_tokens: 1024,
            temperature: 0.7
        });

        const answer = response.choices[0].message.content;

        console.log('Answer generated:', answer.slice(0, 100));

        res.json({
            answer,
            history: [
                ...history,
                { role: 'user', content: question },
                { role: 'assistant', content: answer }
            ]
        });

    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json({
                error: 'AI is busy right now, please try again in a moment.'
            });
        }
        console.error('FULL ERROR:', error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;