// Test file to check if Gemini API is working
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

async function testGeminiAPI() {
  try {
    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Log if API key exists
    console.log("Gemini API Key Available:", apiKey ? "Yes (key is set)" : "No (missing key)");
    
    if (!apiKey) {
      console.error("ERROR: No Gemini API key found in environment variables.");
      console.log("Please make sure GEMINI_API_KEY is set in your .env file.");
      return;
    }
    
    // Initialize the GenAI
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Google Generative AI initialized.");
    
    // Check the @google/generative-ai package version
    const packageInfo = require('@google/generative-ai/package.json');
    console.log("@google/generative-ai package version:", packageInfo.version);
    
    // Try different model names
    console.log("\nAttempting test with different model names:");
    
    const modelNames = [
      "gemini-pro",
      "gemini-1.0-pro",
      "gemini-1.5-pro",
      "models/gemini-pro"
    ];
    
    let success = false;
    for (const modelName of modelNames) {
      try {
        console.log(`\nTrying model: "${modelName}"...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = "Write a short greeting in one sentence.";
        console.log("Sending prompt:", prompt);
        
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        console.log("SUCCESS with model:", modelName);
        console.log("Response:", response);
        
        success = true;
        break; // Exit loop if successful
      } catch (modelError) {
        console.error(`Failed with model "${modelName}":`, modelError.message);
      }
    }
    
    if (!success) {
      console.error("\nAll model attempts failed. Please check Gemini API compatibility.");
    }
    
  } catch (error) {
    console.error("\nAPI TEST FAILED");
    console.error("-----------------------");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    // More detailed error information
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    
    // Check for common issues
    if (error.message.includes("API key")) {
      console.error("\nPossible cause: Invalid API key format or unauthorized key");
      console.error("Solution: Check that your API key is correct and has been activated");
    } else if (error.message.includes("network")) {
      console.error("\nPossible cause: Network connectivity issues");
      console.error("Solution: Check your internet connection");
    } else if (error.message.includes("quota")) {
      console.error("\nPossible cause: API quota exceeded");
      console.error("Solution: Check your usage limits in the Google AI Studio dashboard");
    }
  }
}

// Run the test
testGeminiAPI(); 