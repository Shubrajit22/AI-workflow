'use server';

// 1. ADD 'runs' TO THE IMPORT
import { tasks, runs } from "@trigger.dev/sdk/v3"; 
import type { geminiTask } from "@/src/trigger/gemini";

export async function runGeminiAction(
  prompt: string,
  model: string = "gemini-2.5-flash",
  images: string[] = []
)
 {
  
  // // 1. Start the Task
  // const handle = await tasks.trigger<typeof geminiTask>("gemini-generate", {
  //   prompt: prompt,
  //   model: model,
  //   images: [] 
  // });
const handle = await tasks.trigger<typeof geminiTask>(
  "gemini-generate",
  {
    prompt,
    model,
    images
  }
);

  // 2. Manual Polling Loop
  let attempts = 0;
  while (attempts < 15) {
    
    // FIX: Use 'runs.retrieve' instead of 'tasks.retrieve'
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

    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  // 3. Timeout
  return { 
    success: false, 
    error: "Task timed out (took longer than 15s)." 
  };
}