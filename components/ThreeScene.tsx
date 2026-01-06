
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from '../types';

// Fix for missing JSX types for Three.js elements in some environments
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
    }
  }
}

interface AbstractHeartProps {
  active: boolean;
  color?: string;
  timeSpentFactor: number; // 0 to 1
  isPaused: boolean;
}

const AbstractHeart: React.FC<AbstractHeartProps> = ({ active, color = "#be185d", timeSpentFactor, isPaused }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current || isPaused) return;
    const time = state.clock.getElapsedTime();
    
    // Slow down during interactions AND as more time passes (Phase 5)
    const interactionSlowdown = active ? 0.3 : 1.0;
    const timeSlowdown = 1 - (timeSpentFactor * 0.5); // Slows up to 50%
    const finalSpeedMultiplier = interactionSlowdown * timeSlowdown;
    
    meshRef.current.rotation.y = time * 0.12 * finalSpeedMultiplier;
    meshRef.current.position.y = Math.sin(time * 0.6) * 0.12;
  });

  return (
    <Float speed={isPaused ? 0 : 1.8} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={active ? 1.15 : 0.8}>
        <MeshDistortMaterial
          color={color}
          speed={isPaused ? 0 : 1.4}
          distort={0.4}
          radius={1}
          emissive={color}
          emissiveIntensity={0.4 + (timeSpentFactor * 0.2)}
          roughness={0.1}
          metalness={0.7}
        />
      </Sphere>
    </Float>
  );
};

interface SceneProps {
  currentScene: Scene;
  isPaused?: boolean;
}

const ThreeScene: React.FC<SceneProps> = ({ currentScene, isPaused = false }) => {
  const [startTime] = useState(Date.now());
  const [timeSpentFactor, setTimeSpentFactor] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Cap at 10 minutes (600 seconds) for max "warmth"
      setTimeSpentFactor(Math.min(elapsed / 600, 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Logic to determine color and state based on the emotional journey
  const isWarmer = currentScene !== Scene.ENTRY && currentScene !== Scene.PROGRESSION;
  const isDeep = currentScene === Scene.LOYALTY || currentScene === Scene.AFFIRMATION || currentScene === Scene.END_GAME_POPUP;
  
  // Transitioning colors to a "dark girly pink" palette:
  // Initial: Dark Burgundy Rose (#500724)
  // isWarmer: Deep Pink (#be185d)
  // isDeep: Vibrant Rose (#ec4899)
  let baseColor = isDeep ? "#ec4899" : (isWarmer ? "#be185d" : "#500724");
  
  // Temperature Shift (Phase 5): As time passes, shift slightly towards a warmer/softer orange-pink
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };
  
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
  };

  const startRgb = hexToRgb(baseColor);
  const targetWarmRgb = { r: 249, g: 115, b: 150 }; // Warm coral-pink
  
  const finalRgb = {
    r: startRgb.r + (targetWarmRgb.r - startRgb.r) * timeSpentFactor,
    g: startRgb.g + (targetWarmRgb.g - startRgb.g) * timeSpentFactor,
    b: startRgb.b + (targetWarmRgb.b - startRgb.b) * timeSpentFactor
  };
  
  const mainColor = rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b);

  return (
    <div className="fixed inset-0 z-0 bg-[#070708]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, -10, -10]} color={mainColor} intensity={2} />
        
        {/* Background "stardust" in a subtle pink hue */}
        <Stars radius={120} depth={50} count={1500} factor={6} saturation={0.5} fade speed={isPaused ? 0 : 0.4} />
        
        <AbstractHeart active={isWarmer} color={mainColor} timeSpentFactor={timeSpentFactor} isPaused={isPaused} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
