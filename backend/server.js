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
    // Secretly modify the question (you can customize this)
    return `Rephrase this in a funny way: ${userQuestion}`;
}

// Root route to handle GET requests
app.get('/', (req, res) => {
    res.send('Backend is working. Send a POST request to /ask');
});

// Route to handle POST requests for questions
app.post('/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required.' });
    }

    try {
        // Modify the user's question
        const modifiedQuestion = modifyQuestion(question);

        // Send request to OpenAI API
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo', // Or GPT-4 if you have access
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

        // Send ChatGPT response back to the frontend
        res.json({ answer: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Error querying OpenAI API:', error.message);
        res.status(500).json({ error: 'Failed to fetch response from OpenAI.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
