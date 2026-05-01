const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  console.log("Starting generation...");
  try {
    const result = await model.generateContent("Hello, who are you?");
    console.log("Response:", result.response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
