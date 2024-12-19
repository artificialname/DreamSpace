const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.post('/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini', // Use GPT-4o mini model
                messages: [{ role: 'user', content: question }],
                max_tokens: 2000,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json({ answer: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Error querying OpenAI API:', error.response?.data || error.message);

        if (error.response?.status === 429) {
            res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
        } else if (error.response?.status === 401) {
            res.status(401).json({ error: 'Unauthorized. Check your API key.' });
        } else {
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
