#!/usr/bin/env node

// Gemini API Key Checker
require("dotenv").config({ path: "./config.env" });

console.log("🔍 Checking Gemini API Key Configuration...");
console.log("==========================================");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.log("❌ GEMINI_API_KEY is not set");
  process.exit(1);
}

console.log(`✅ GEMINI_API_KEY is set`);
console.log(`📏 Length: ${apiKey.length} characters`);
console.log(`🔑 Starts with: ${apiKey.substring(0, 10)}...`);

// Check if it's a placeholder
if (apiKey === "your_gemini_api_key_here") {
  console.log("❌ GEMINI_API_KEY is still using placeholder value");
  console.log("💡 Please update it with your actual Gemini API key");
  process.exit(1);
}

// Check if it looks like a valid API key
if (apiKey.length < 20) {
  console.log("❌ GEMINI_API_KEY seems too short");
  process.exit(1);
}

if (!apiKey.startsWith("AIza")) {
  console.log(
    "❌ GEMINI_API_KEY format seems incorrect (should start with AIza)"
  );
  process.exit(1);
}

console.log("✅ GEMINI_API_KEY appears to be valid");
console.log("🎯 Ready to use Gemini AI!");

// Test the API key with a simple request
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testApiKey() {
  try {
    console.log("\n🧪 Testing API key with Gemini...");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent('Say "Hello" in Mongolian');
    const response = await result.response;
    const text = response.text();

    console.log("✅ API key test successful!");
    console.log(`🤖 Response: ${text}`);
  } catch (error) {
    console.log("❌ API key test failed:");
    console.log(`   Error: ${error.message}`);

    if (error.message.includes("API_KEY")) {
      console.log("💡 The API key might be invalid or expired");
    } else if (error.message.includes("quota")) {
      console.log("💡 You might have exceeded your API quota");
    } else if (error.message.includes("network")) {
      console.log("💡 Network connection issue");
    }
  }
}

testApiKey();
