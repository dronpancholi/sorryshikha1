
import React, { useRef } from 'react';
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
}

const AbstractHeart: React.FC<AbstractHeartProps> = ({ active, color = "#f9a8d4" }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow down during interactions (active means we are in deeper scenes)
    const speedMultiplier = active ? 0.3 : 1.0;
    
    meshRef.current.rotation.y = time * 0.12 * speedMultiplier;
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
          emissiveIntensity={0.35}
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
  // Logic to determine color and state based on the emotional journey
  const isWarmer = currentScene !== Scene.ENTRY && currentScene !== Scene.PROGRESSION;
  const isDeep = currentScene === Scene.LOYALTY || currentScene === Scene.AFFIRMATION || currentScene === Scene.END_GAME_POPUP;
  
  // Transitioning colors to a "perfect girly pink" palette:
  // isDeep: Sakura Pink (#f9a8d4) - soft, glowing, and sweet
  // isWarmer: Vibrant Rose Pink (#ec4899) - full of life and warmth
  // Initial: Soft Lavender Pink (#ddd6fe) - gentle and slightly mysterious to start
  const mainColor = isDeep ? "#f9a8d4" : (isWarmer ? "#ec4899" : "#ddd6fe");

  return (
    <div className="fixed inset-0 z-0 bg-[#070708]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, -10, -10]} color={mainColor} intensity={1.5} />
        
        {/* Subtle background atmosphere with slightly more visible "stardust" */}
        <Stars radius={120} depth={50} count={1500} factor={6} saturation={0} fade speed={0.4} />
        
        <AbstractHeart active={isWarmer} color={mainColor} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
