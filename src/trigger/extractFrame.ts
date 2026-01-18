// src/trigger/extractFrame.ts
import { task } from "@trigger.dev/sdk/v3";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const extractFrameTask = task({
  id: "extract-frame",
  machine: { preset: "micro" },

  run: async (payload: { videoUrl: string; timestamp?: string }) => {
    const ts = payload.timestamp || "0";
    const output = `/tmp/frame-${Date.now()}.jpg`;

    await execAsync(
      `ffmpeg -ss ${ts} -i "${payload.videoUrl}" -frames:v 1 "${output}"`
    );

    // Upload extracted frame to Transloadit (reuse image template)
    // return { imageUrl }
  },
});
