'use server';


import { tasks, runs } from "@trigger.dev/sdk/v3"; 
import type { geminiTask } from "@/src/trigger/gemini";

export async function runGeminiAction(
  prompt: string,
  model: string = "gemini-2.5-flash",
  images: string[] = []
)
 {
  
 
const handle = await tasks.trigger<typeof geminiTask>(
  "gemini-generate",
  {
    prompt,
    model,
    images
  }
);


  let attempts = 0;
  while (attempts < 15) {
    
   
    const run = await runs.retrieve(handle.id);

    if (run.status === "COMPLETED") {
      return { 
        success: true, 
        output: run.output?.text 
      };
    }

    if (run.status === "FAILED" || run.status === "CANCELED" || run.status === "CRASHED") {
      return { 
        success: false, 
        error: "Task failed to complete." 
      };
    }

 
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  return { 
    success: false, 
    error: "Task timed out (took longer than 15s)." 
  };
}