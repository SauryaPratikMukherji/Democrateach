const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  // Use a different way to check models if possible, 
  // or just try common ones.
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.0-pro"
  ];

  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hi");
      console.log(`SUCCESS: ${m}`);
      return;
    } catch (err) {
      console.error(`FAILED: ${m} - ${err.message}`);
    }
  }
}

listModels();
