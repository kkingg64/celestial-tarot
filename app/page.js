'use client';

import { useState, useRef, useEffect } from 'react';
import Script from 'next/script';
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Loader } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { TarotCard } from '@/components/TarotCard';

export default function Home() {
  const [lang, setLang] = useState('en');
  const [phase, setPhase] = useState('intro'); // 'intro', 'reading', 'result'
  const [cardData, setCardData] = useState(null);
  const [handDetected, setHandDetected] = useState(false);
  const [triggerFlip, setTriggerFlip] = useState(false);
  
  // Refs for Camera
  const videoRef = useRef(null);
  
  // UI Text Logic based on your HTML
  const ui = {
    title: "LUMINA TAROT",
    start: lang === 'en' ? "START READING" : "開始占卜",
    guide: lang === 'en' ? "Flip your hand palm-up to reveal" : "將手掌翻向上方以揭示牌面",
    handStatus: handDetected 
      ? (lang === 'en' ? "HAND DETECTED - PINCH TO REVEAL" : "檢測到手勢 - 捏合手指以揭示")
      : (lang === 'en' ? "Searching for hand..." : "正在尋找手勢...")
  };

  // --- HAND TRACKING SETUP ---
  const startCamera = () => {
    if (typeof window !== 'undefined' && window.Hands) {
      const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5 });
      
      hands.onResults((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          setHandDetected(true);
          const lm = results.multiHandLandmarks[0];
          // Simple Logic: Pinch detection (Index tip vs Thumb tip)
          const p8 = lm[8]; 
          const p4 = lm[4];
          const dist = Math.sqrt(Math.pow(p8.x - p4.x, 2) + Math.pow(p8.y - p4.y, 2));

          if (dist < 0.05 && phase === 'reading') {
            setTriggerFlip(true);
          }
        } else {
          setHandDetected(false);
        }
      });

      if (videoRef.current && window.Camera) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => await hands.send({ image: videoRef.current }),
          width: 320, height: 240
        });
        camera.start();
      }
    }
  };

  const handleStart = () => {
    setPhase('reading');
    setCardData(null);
  };

  const handleReveal = (card) => {
    setTriggerFlip(false);
    
    // Call AI API
    fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt: card.nameEn, language: lang })
    })
    .then(res => res.json())
    .then(data => {
      setCardData({ ...card, fortune: data.text });
      setPhase('result');
    })
    .catch(() => {
      setCardData({ ...card, fortune: "The stars are silent." });
      setPhase('result');
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0a0a12]">
      
      {/* Load MediaPipe */}
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" onLoad={startCamera} />

      {/* --- UI LAYER (Matches Tarot.html) --- */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-10">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto w-full">
          <div className="logo">{ui.title}</div>
          <div className="flex gap-2">
            <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-btn ${lang === 'zh' ? 'active' : ''}`} onClick={() => setLang('zh')}>繁中</button>
          </div>
        </div>

        {/* Center Panel (Readings) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence>
            {/* Phase 1: Result Card */}
            {phase === 'result' && cardData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-panel pointer-events-auto"
              >
                <div style={{ color: '#d4af37', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px', fontSize: '14px' }}>
                  {lang === 'en' ? 'The Oracle Speaks' : '神諭顯示'}
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '15px' }}>
                  {lang === 'en' ? cardData.nameEn : cardData.nameZh}
                </div>
                <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#ddd', fontFamily: 'var(--font-noto)' }}>
                  {cardData.fortune}
                </div>
                <div className="mt-8">
                  <button className="btn-gold" onClick={() => window.location.reload()}>
                    {lang === 'en' ? 'New Reading' : '重新占卜'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Phase 2: Start Button (Intro) */}
            {phase === 'intro' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-auto">
                <button className="btn-gold" onClick={handleStart}>{ui.start}</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls / Guide */}
        <div className="text-center pointer-events-none z-10 mb-8">
          {phase === 'reading' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '14px' }}
            >
              {ui.guide}
              <div style={{ fontSize: '10px', marginTop: '5px', color: handDetected ? '#d4af37' : '#666' }}>
                {ui.handStatus}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Video Feed (Bottom Left - from your HTML) */}
      <div className="video-feed">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline autoPlay muted />
      </div>

      {/* --- 3D SCENE --- */}
      <div className="absolute inset-0 z-0">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 1, 14], fov: 45 }}>
          <color attach="background" args={['#0a0a12']} />
          <ambientLight intensity={0.6} />
          <spotLight position={[5, 10, 10]} intensity={3} color="#ffd700" castShadow />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
          <Sparkles count={150} scale={12} size={3} speed={0.4} opacity={0.6} color="#d4af37" />
          
          {phase !== 'intro' && (
            <TarotCard 
              onReveal={handleReveal} 
              isReading={phase === 'result'} 
              triggerFlip={triggerFlip}
            />
          )}
        </Canvas>
        <Loader containerStyles={{ background: '#0a0a12' }} />
      </div>

    </div>
  );
}