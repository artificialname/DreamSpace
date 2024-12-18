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
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo', // Replace with 'gpt-4' if applicable
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
        // Log detailed error information
        console.error('Error querying OpenAI API:', error.response?.data || error.message);

        // Handle different types of errors
        if (error.response) {
            // API responded with a status code outside of the 2xx range
            return res.status(error.response.status).json({ error: error.response.data });
        } else if (error.request) {
            // Request was made but no response received
            return res.status(500).json({ error: 'No response received from OpenAI.' });
        } else {
            // Something else went wrong
            return res.status(500).json({ error: 'Failed to fetch response from OpenAI.' });
        }
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
