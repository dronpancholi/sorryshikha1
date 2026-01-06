
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
}

const AbstractHeart: React.FC<AbstractHeartProps> = ({ active, color = "#be185d", timeSpentFactor }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Smooth speed transitions for 60FPS feel
    const interactionSlowdown = active ? 0.3 : 1.0;
    const timeSlowdown = 1 - (timeSpentFactor * 0.5); 
    const finalSpeedMultiplier = interactionSlowdown * timeSlowdown;
    
    meshRef.current.rotation.y = time * 0.12 * finalSpeedMultiplier;
    // Added a subtle breath-like scale animation
    const scaleFactor = 1 + Math.sin(time * 0.5) * 0.05;
    meshRef.current.scale.setScalar(scaleFactor);
    meshRef.current.position.y = Math.sin(time * 0.6) * 0.12;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={active ? 1.15 : 0.8}>
        <MeshDistortMaterial
          color={color}
          speed={1.4}
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
}

const ThreeScene: React.FC<SceneProps> = ({ currentScene }) => {
  const [startTime] = useState(Date.now());
  const [timeSpentFactor, setTimeSpentFactor] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setTimeSpentFactor(Math.min(elapsed / 600, 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const isWarmer = currentScene !== Scene.ENTRY && currentScene !== Scene.PROGRESSION;
  const isDeep = currentScene === Scene.LOYALTY || currentScene === Scene.AFFIRMATION || currentScene === Scene.END_GAME_POPUP;
  
  let baseColor = isDeep ? "#ec4899" : (isWarmer ? "#be185d" : "#500724");
  
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
  const targetWarmRgb = { r: 249, g: 115, b: 150 }; 
  
  const finalRgb = {
    r: startRgb.r + (targetWarmRgb.r - startRgb.r) * timeSpentFactor,
    g: startRgb.g + (targetWarmRgb.g - startRgb.g) * timeSpentFactor,
    b: startRgb.b + (targetWarmRgb.b - startRgb.b) * timeSpentFactor
  };
  
  const mainColor = rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b);

  return (
    <div className="fixed inset-0 z-0 bg-[#070708]">
      <Canvas 
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 5], fov: 45 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, -10, -10]} color={mainColor} intensity={2} />
        <Stars radius={120} depth={50} count={1500} factor={6} saturation={0.5} fade speed={0.4} />
        <AbstractHeart active={isWarmer} color={mainColor} timeSpentFactor={timeSpentFactor} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
