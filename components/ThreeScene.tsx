
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

const AbstractHeart: React.FC<AbstractHeartProps> = ({ active, color = "#be185d" }) => {
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
          emissiveIntensity={0.4}
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
  
  // Transitioning colors to a "dark girly pink" palette:
  // isDeep: Vibrant Rose (#ec4899) - A bright but rich pink for moments of clarity.
  // isWarmer: Deep Pink (#be185d) - A sophisticated, darker girly pink.
  // Initial: Dark Burgundy Rose (#500724) - Very dark pink to start, setting a serious but feminine tone.
  const mainColor = isDeep ? "#ec4899" : (isWarmer ? "#be185d" : "#500724");

  return (
    <div className="fixed inset-0 z-0 bg-[#070708]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, -10, -10]} color={mainColor} intensity={2} />
        
        {/* Background "stardust" in a subtle pink hue */}
        <Stars radius={120} depth={50} count={1500} factor={6} saturation={0.5} fade speed={0.4} />
        
        <AbstractHeart active={isWarmer} color={mainColor} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
