'use client';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export function TarotCard({ onReveal, isReading }) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Animation logic loop
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Floating animation
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = Math.sin(t) * 0.1; // Bob up and down

    // Rotation Logic
    const targetRotation = flipped ? Math.PI : 0; // 180 degrees if flipped
    
    // Smoothly interpolate current rotation to target rotation
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotation,
      0.1
    );
    
    // Smoothly scale up on hover
    const targetScale = hovered ? 1.1 : 1;
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
    );
  });

  const handleClick = () => {
    if (flipped || isReading) return;
    setFlipped(true);
    
    // Pick a random card for the demo
    const cards = ["The Moon", "The Star", "Death", "The Fool", "The Magician"];
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    
    onReveal(randomCard);
  };

  return (
    <group 
      ref={meshRef} 
      onClick={handleClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Front of Card (The Reveal) */}
      <RoundedBox args={[2, 3.5, 0.05]} radius={0.1} position={[0, 0, 0.03]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.5} />
      </RoundedBox>
      {/* Back of Card (The Design) */}
      <RoundedBox args={[2, 3.5, 0.05]} radius={0.1} position={[0, 0, -0.03]}>
        <meshStandardMaterial color="#4c1d95" roughness={0.5} metalness={0.8} />
      </RoundedBox>
      
      {/* Decorative Text on Back */}
      <Text 
        position={[0, 0, -0.06]} 
        rotation={[0, Math.PI, 0]} 
        fontSize={0.2} 
        color="#F4E4BC"
      >
        CLICK TO REVEAL
      </Text>
    </group>
  );
}