import { Groq } from 'groq-sdk';

export async function POST(req) {
  try {
    const { prompt, language } = await req.json();

    // 1. Try to use Real AI
    if (process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      const isChinese = language === 'zh';
      const systemPrompt = isChinese 
        ? `你是神秘的塔羅牌占卜師。用戶抽到了 "${prompt}"。請用繁體中文給出一段神秘、富有哲理但正面的解讀。請保持在三句話以內。`
        : `You are a mystic tarot reader. The user drew "${prompt}". Give a cryptic but inspiring reading. Keep it under 3 sentences.`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: isChinese ? '揭示我的命運' : 'Reveal my fate.' }
        ],
        model: 'llama3-8b-8192',
      });

      return new Response(JSON.stringify({ text: completion.choices[0]?.message?.content }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error("No API Key");
    }

  } catch (error) {
    console.log("Using Simulation Fallback due to error/block:", error.message);
    return simulateResponse(req.language || 'zh');
  }
}

// Fallback logic
async function simulateResponse(lang) {
  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const zh = [
    "命運之輪正在轉動，舊的結束是新的開始。",
    "不要抗拒改變，擁抱未知的混亂，那裡有你的答案。",
    "星辰顯示現在是行動的時刻，猶豫會錯失良機。"
  ];
  const en = [
    "The wheel of fate turns; an ending is but a new beginning.",
    "Do not resist change. Embrace the chaos, for your answer lies within.",
    "The stars suggest immediate action. Hesitation is your enemy."
  ];
  
  const text = lang === 'zh' 
    ? zh[Math.floor(Math.random() * zh.length)] 
    : en[Math.floor(Math.random() * en.length)];

  return new Response(JSON.stringify({ text: text + " (Simulated)" }), {
    headers: { 'Content-Type': 'application/json' },
  });
}