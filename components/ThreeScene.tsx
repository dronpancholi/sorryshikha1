
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

const AbstractHeart: React.FC<AbstractHeartProps> = ({ active, color = "#ff6b81" }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow down during interactions (active means we are in deeper scenes)
    const speedMultiplier = active ? 0.3 : 1.0;
    
    meshRef.current.rotation.y = time * 0.15 * speedMultiplier;
    meshRef.current.position.y = Math.sin(time * 0.8) * 0.1;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={active ? 1.1 : 0.75}>
        <MeshDistortMaterial
          color={color}
          speed={1.2}
          distort={0.35}
          radius={1}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.15}
          metalness={0.8}
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
  
  // Transitioning colors to Pink/Rose palette
  // isDeep: Soft, glowing pink
  // isWarmer: Vibrant rose
  // Initial: Muted indigo-violet
  const mainColor = isDeep ? "#ff85a2" : (isWarmer ? "#db2777" : "#818cf8");

  return (
    <div className="fixed inset-0 z-0 bg-[#070708]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color={mainColor} intensity={1} />
        
        {/* Subtle background atmosphere */}
        <Stars radius={120} depth={40} count={1200} factor={4} saturation={0} fade speed={0.5} />
        
        <AbstractHeart active={isWarmer} color={mainColor} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
