export async function POST(req) {
  // 1. Get the card name from the front-end
  const { prompt } = await req.json();

  // 2. Simulate the AI "thinking" time (1.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 3. Select a random pre-written fortune
  const fortunes = [
    "The shadows whisper of a new beginning. What you fear is actually a doorway.",
    "The stars align to suggest caution. Silence will be your strongest weapon today.",
    "A chaotic energy surrounds this card. Embrace the storm, for it clears the path.",
    "You are holding on too tight. Let go, and the answer will float to the surface.",
    "The universe sees your effort. A sudden reward is approaching from the East.",
    "Old patterns are breaking. The glitch in your reality is a feature, not a bug."
  ];

  const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  
  // 4. Send it back to the app
  return new Response(JSON.stringify({ text: randomFortune }), {
    headers: { 'Content-Type': 'application/json' },
  });
}