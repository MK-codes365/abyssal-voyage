import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env or .env.local
dotenv.config({ path: [".env.local", ".env"] });

// Configure AWS Polly Client
const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// The script text perfectly matching our DiveIntro.tsx timeline
const NARRATION_STEPS = [
  { id: 1, text: "Take a deep breath. The surface is calm." },
  { id: 2, text: "But beneath these shimmering waves..." },
  { id: 3, text: "An alien world quietly waits." },
  { id: 4, text: "A realm of absolute darkness and crushing pressure." },
  { id: 5, text: "Where sunlight is a distant memory." },
  { id: 6, text: "Prepare your descent into the abyss." },
  { id: 7, text: "Dive in. Explore the unseen." },
];

async function generateNarration() {
  const outputDir = path.join(process.cwd(), "public", "audio");
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }

  console.log("Generating high-quality AWS Polly mp3 files...");

  for (const step of NARRATION_STEPS) {
    const filename = `narration-${step.id}.mp3`;
    const filepath = path.join(outputDir, filename);

    // Wrap text in SSML tags to make the delivery much slower and more dramatic
    const slowText = `<speak><prosody rate="slow">${step.text}</prosody></speak>`;

    const command = new SynthesizeSpeechCommand({
      Text: slowText,
      TextType: "ssml",
      OutputFormat: "mp3",
      VoiceId: "Joanna", // High-quality cinematic female voice
      Engine: "neural",   // Premium lifelike neural generation
    });

    try {
      const response = await pollyClient.send(command);
      const audioStream = response.AudioStream;

      if (audioStream) {
        // AWS SDK v3 streams need to be piped/written out this way
        const chunks = [];
        for await (const chunk of audioStream) {
          chunks.push(chunk);
        }
        fs.writeFileSync(filepath, Buffer.concat(chunks));
        console.log(`✅ Successfully generated: ${filename} -> "${step.text}"`);
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${filename}:`, error.message);
      process.exit(1);
    }
  }

  console.log("\nAll done! The 7 MP3s have been magically baked into /public/audio/ 🎬");
}

// Kick it off
generateNarration();
