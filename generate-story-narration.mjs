import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const STORY_STEPS = [
  { id: "epi", text: "Welcome to the Sunlight Zone. Here, the ocean breathes. The water is warm, teeming with vibrant life and endless fields of phytoplankton that power the world. But as we drift deeper, the light begins to fracture, and the true journey begins." },
  { id: "meso", text: "We cross into the Twilight Zone. The pressure mounts around us, squeezing the hull. Sunlight surrenders to a perpetual, ghostly indigo. The creatures here, bioluminescent jellyfish and lantern fish, become their own stars in a rapidly darkening sky." },
  { id: "bathy", text: "The Midnight Zone. We have plunged beyond the reach of the sun. The water temperature plummets to near freezing. Down here, survival is a game of stealth and patience. Predators like the elusive anglerfish wait in absolute blackness, guided only by the flicker of their own biological lures." },
  { id: "abysso", text: "The Abyssal Zone. A vast, silent graveyard that spans most of the ocean floor. The pressure is crushing, equivalent to a stampede of elephants balancing on a single point. Food here falls from above like a slow, eternal snow, burying the remains of giants that have fallen from the light." },
  { id: "hadal", text: "The Hadal Zone. Named after Hades, the underworld. We are falling into the deepest gashes of the earth's crust. It is a forbidding landscape of perpetual darkness. Yet against all odds, delicate, ghostly life still moves in the mud. You have reached the absolute bottom of the world." },
];

async function generateNarration() {
  const outputDir = path.join(process.cwd(), "public", "audio");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log("Generating 5-part AWS Polly story mp3s...");

  for (const step of STORY_STEPS) {
    const filename = `story-${step.id}.mp3`;
    const filepath = path.join(outputDir, filename);

    // Using un-accelerated SSML for a rich, documentary-style cinematic read
    const storyText = `<speak><prosody rate="medium">${step.text}</prosody></speak>`;

    const command = new SynthesizeSpeechCommand({
      Text: storyText,
      TextType: "ssml",
      OutputFormat: "mp3",
      VoiceId: "Joanna", 
      Engine: "neural",   
    });

    try {
      const response = await pollyClient.send(command);
      const audioStream = response.AudioStream;

      if (audioStream) {
        const chunks = [];
        for await (const chunk of audioStream) chunks.push(chunk);
        fs.writeFileSync(filepath, Buffer.concat(chunks));
        console.log(`✅ Baked: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Failed on ${filename}:`, error.message);
      process.exit(1);
    }
  }

  console.log("Story generation complete! 📖");
}

generateNarration();
