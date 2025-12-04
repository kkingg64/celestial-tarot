import { Groq } from 'groq-sdk';

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // 1. CHECK: Do we have an API Key?
    // If running locally in HK without a VPN, this might fail, so we fallback to simulation.
    // When running on Vercel (USA), this key will exist and work.
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.log("No API Key found. Using Simulation Mode.");
      return simulateResponse();
    }

    // 2. REAL AI MODE (For Vercel/Deployment)
    const groq = new Groq({ apiKey: apiKey });

    const systemPrompt = `
      You are an ancient mystical consciousness. 
      The user has drawn the tarot card: "${prompt}".
      Give a cryptic but inspiring reading based on this card.
      Keep it under 3 sentences. Do not mention that you are an AI.
      Tone: Ethereal, Cosmic, Deep.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Reveal my fate.' }
      ],
      model: 'llama3-8b-8192',
    });

    const text = completion.choices[0]?.message?.content || "The stars are silent.";
    
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("AI Error, switching to simulation:", error);
    // If the Real AI crashes (e.g. 403 Blocked in HK), we fall back to Simulation!
    return simulateResponse();
  }
}

// Helper function for Simulation
async function simulateResponse() {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const fortunes = [
    "The shadows whisper of a new beginning. What you fear is actually a doorway.",
    "The stars align to suggest caution. Silence will be your strongest weapon today.",
    "A chaotic energy surrounds this card. Embrace the storm, for it clears the path.",
    "You are holding on too tight. Let go, and the answer will float to the surface.",
  ];
  const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  return new Response(JSON.stringify({ text: randomFortune + " (Simulated)" }), {
    headers: { 'Content-Type': 'application/json' },
  });
}