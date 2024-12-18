const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Secret question modification function
function modifyQuestion(userQuestion) {
    return `Rephrase this in a funny way: ${userQuestion}`;
}

// Route to handle GET request to root
app.get('/', (req, res) => {
    res.send({ message: "Backend is working!" });
});

// Route to handle questions via POST
app.post('/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required.' });
    }

    try {
        // Modify the user's question
        const modifiedQuestion = modifyQuestion(question);

        // Send request to OpenAI API
        console.log('Sending request to OpenAI with question:', modifiedQuestion);
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo', // Use an appropriate model
                messages: [{ role: 'user', content: modifiedQuestion }],
                max_tokens: 150,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Respond with the answer
        res.json({ answer: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Error querying OpenAI API:', error.response?.data || error.message);

        // Handle rate limiting (429) separately
        if (error.response?.status === 429) {
            res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
        } else {
            res.status(500).json({ error: 'Failed to fetch response from OpenAI.' });
        }
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
