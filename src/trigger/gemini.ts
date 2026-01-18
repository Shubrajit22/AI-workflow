import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const geminiTask = task({
  id: "gemini-generate",
  machine: { preset: "micro" },
  run: async (payload: { prompt: string; images?: string[]; model?: string }) => {
    
    // 1. Setup
    const actualPrompt = payload.prompt || (payload as any).payload?.prompt;
    const actualImages = payload.images || (payload as any).payload?.images || [];
    const modelName = "gemini-2.5-flash"; // Keep using the one that works for you

    console.log(`📦 Processing: ${actualPrompt ? "Has Text" : "No Text"} | Images: ${actualImages.length}`);

    const model = genAI.getGenerativeModel({ model: modelName });
    const parts: any[] = [];
    
    // 2. Handle Text
    if (actualPrompt) {
      parts.push(actualPrompt);
    } else {
      parts.push("What do you see in this image?"); // Fallback prompt for vision
    }

    // 3. Handle Images (The Fix!)
    if (actualImages.length > 0) {
      for (const imgData of actualImages) {
        try {
          // Check if it is Base64 (starts with "data:image...")
          if (imgData.startsWith("data:")) {
             console.log("🔹 Processing Base64 Image...");
             // Extract the actual base64 string (remove "data:image/png;base64,")
             const base64Content = imgData.split(",")[1];
             const mimeType = imgData.substring(imgData.indexOf(":") + 1, imgData.indexOf(";"));
             
             parts.push({
               inlineData: {
                 data: base64Content,
                 mimeType: mimeType,
               },
             });
          } 
          // Otherwise, treat it as a URL (Old way)
          else {
             console.log("🔹 Fetching Image URL...");
             const response = await fetch(imgData);
             const buffer = Buffer.from(await response.arrayBuffer());
             parts.push({
               inlineData: {
                 data: buffer.toString("base64"),
                 mimeType: "image/jpeg",
               },
             });
          }
        } catch (e) { 
          console.error("❌ Failed to process image:", e); 
        }
      }
    }

    // 4. Generate
    console.log(`🚀 Sending to ${modelName}...`);
    try {
        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();
        return { text };
    } catch (error) {
        console.error("❌ Gemini Error:", error);
        throw error;
    }
  },
});