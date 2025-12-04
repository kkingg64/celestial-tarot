'use client';
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const TAROT_DECK = [
  { nameEn: "The Fool", nameZh: "愚者", url: "https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg" },
  { nameEn: "The Magician", nameZh: "魔術師", url: "https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg" },
  { nameEn: "The High Priestess", nameZh: "女祭司", url: "https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg" },
  { nameEn: "The Empress", nameZh: "皇后", url: "https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg" },
  { nameEn: "Death", nameZh: "死神", url: "https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg" }
];

function createLuminaBackTexture() {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 512; c.height = 880; 
  const ctx = c.getContext('2d');
  
  const grad = ctx.createRadialGradient(256, 440, 50, 256, 440, 500);
  grad.addColorStop(0, '#1a1025');
  grad.addColorStop(1, '#000000');
  ctx.fillStyle = grad; ctx.fillRect(0,0,512,880);

  ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 2; ctx.beginPath();
  for(let i=0; i<512; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(512-i, 880); }
  ctx.globalAlpha = 0.2; ctx.stroke(); ctx.globalAlpha = 1.0;
  
  ctx.lineWidth = 10; ctx.strokeRect(10,10,492,860);
  ctx.beginPath(); ctx.arc(256, 440, 80, 0, Math.PI*2); ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function TarotCard({ onReveal, isReading, triggerFlip }) {
  const meshRef = useRef();
  const [flipped, setFlipped] = useState(false);
  const [frontMap, setFrontMap] = useState(null);
  const backMap = useMemo(() => createLuminaBackTexture(), []);

  // Trigger from Hand
  if (triggerFlip && !flipped && !isReading) performFlip();

  function performFlip() {
    if (flipped || isReading) return;
    const card = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(card.url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setFrontMap(tex);
      setFlipped(true);
      onReveal(card);
    });
  }

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.1; 
    const target = flipped ? Math.PI : 0;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, target, 0.05);
  });

  return (
    <group ref={meshRef} onClick={performFlip}>
      <mesh position={[0, 0, 0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3.2, 5.5]} />
        <meshStandardMaterial map={frontMap} color={frontMap ? "white" : "#d4af37"} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[3.2, 5.5]} />
        <meshStandardMaterial map={backMap} />
      </mesh>
      <RoundedBox args={[3.25, 5.55, 0.02]} radius={0.1}>
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </RoundedBox>
    </group>
  );
}