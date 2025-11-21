require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        console.log('Testing Gemini API with key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
        // For listing models we need to use the API directly or check if the SDK supports it easily.
        // The SDK doesn't have a direct listModels method on the instance in some versions, 
        // but let's try to just use a model that definitely exists like 'gemini-pro' again but catch the error fully.

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = "Hello";
        console.log('Sending prompt to gemini-1.5-flash...');
        const result = await model.generateContent(prompt);
        console.log('Success:', await result.response.text());

    } catch (error) {
        console.error('Gemini API Test Failed:', error);
        if (error.response) {
            console.error('Error Response:', error.response);
        }
    }
}

testGemini();
