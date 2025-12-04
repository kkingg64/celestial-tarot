'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { motion } from 'framer-motion';
import { TarotCard } from '@/components/TarotCard';

export default function Home() {
  const [fortune, setFortune] = useState("");
  const [cardName, setCardName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReveal = async (card) => {
    setCardName(card);
    setLoading(true);

    try {
      // Call our AI Backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: card }),
      });
      const data = await response.json();
      setFortune(data.text);
    } catch (e) {
      console.error(e);
      setFortune("The stars are cloudy... try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-full bg-slate-950 overflow-hidden relative selection:bg-purple-500 selection:text-white">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#d8b4fe" />
          <spotLight position={[0, 5, 0]} intensity={2} angle={0.5} penumbra={1} color="#fcd34d" />
          
          {/* Environment */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Sparkles count={100} scale={6} size={2} speed={0.4} opacity={0.5} color="#d8b4fe" />
          
          {/* The Card */}
          <TarotCard onReveal={handleReveal} isReading={loading} />
        </Canvas>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 pointer-events-none">
        
        {/* Header */}
        <div className="absolute top-10 w-full text-center">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-amber-100 text-4xl font-light tracking-[0.3em] uppercase opacity-80">
            Celestial Hand
          </h1>
        </div>

        {/* Fortune Display */}
        {(loading || fortune) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md p-8 bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-lg text-center pointer-events-auto"
          >
            <h2 className="text-amber-200 text-xl font-serif mb-4 uppercase tracking-widest">
              {loading ? "Divining..." : cardName}
            </h2>
            <p className="text-purple-100 text-lg font-light leading-relaxed font-sans">
              {loading ? (
                <span className="animate-pulse">Consulting the Aether...</span>
              ) : (
                fortune
              )}
            </p>
            
            {!loading && (
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-white"
              >
                Draw Again
              </button>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}