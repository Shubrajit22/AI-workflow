import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const geminiTask = task({
  id: "gemini-generate",
  machine: {
    preset: "micro",
  },
  run: async (payload: { prompt: string; images?: string[]; model?: string }) => {
    
    // 1. Select Model
    const model = genAI.getGenerativeModel({ 
      model: payload.model || "gemini-1.5-pro" 
    });


    const parts: any[] = [];
    if (payload.prompt) parts.push(payload.prompt);

 
    if (payload.images && payload.images.length > 0) {
      for (const imageUrl of payload.images) {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        parts.push({
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: "image/jpeg",
          },
        });
      }
    }

    // 3. Generate
    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    return { text };
  },
});