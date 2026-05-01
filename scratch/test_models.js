const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  try {
    // There is no direct listModels in the SDK easily accessible this way, 
    // but we can try to hit the API or just use a known stable name.
    console.log("Testing gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-1.5-flash!");
  } catch (err) {
    console.error("Error with gemini-1.5-flash:", err.message);
    
    try {
      console.log("Testing gemini-1.5-flash-latest...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent("Hello");
      console.log("Success with gemini-1.5-flash-latest!");
    } catch (err2) {
      console.error("Error with gemini-1.5-flash-latest:", err2.message);
    }
  }
}

listModels();
