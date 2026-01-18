import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const geminiTask = task({
  id: "gemini-generate",
  machine: { preset: "micro" },
  run: async (payload: { prompt: string; images?: string[]; model?: string }) => {
    

    const actualPrompt = payload.prompt || (payload as any).payload?.prompt;
    const actualImages = payload.images || (payload as any).payload?.images || [];
    const modelName = "gemini-2.5-flash"; // Keep using the one that works for you

    console.log(`📦 Processing: ${actualPrompt ? "Has Text" : "No Text"} | Images: ${actualImages.length}`);

    const model = genAI.getGenerativeModel({ model: modelName });
    const parts: any[] = [];
    
    
    if (actualPrompt) {
      parts.push(actualPrompt);
    } else {
      parts.push("What do you see in this image?"); 
    }

    
    if (actualImages.length > 0) {
      for (const imgData of actualImages) {
        try {
         
          if (imgData.startsWith("data:")) {
             console.log("🔹 Processing Base64 Image...");
           
             const base64Content = imgData.split(",")[1];
             const mimeType = imgData.substring(imgData.indexOf(":") + 1, imgData.indexOf(";"));
             
             parts.push({
               inlineData: {
                 data: base64Content,
                 mimeType: mimeType,
               },
             });
          } 
       
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