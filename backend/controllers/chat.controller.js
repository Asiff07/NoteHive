const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithGemini = async (req, res) => {
    try {
        const { prompt, context } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        let fullPrompt = prompt;
        if (context) {
            fullPrompt = `Context: ${context}\n\nUser Question: ${prompt}`;
        }

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ message: 'Failed to get response from AI' });
    }
};
