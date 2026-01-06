
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from '../types';

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
    const speedMultiplier = active ? 0.35 : 1.0;
    
    meshRef.current.rotation.y = time * 0.15 * speedMultiplier;
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.15;
    
    // Pulse scale slightly
    const pulse = 1 + Math.sin(time * 0.8) * 0.05;
    meshRef.current.scale.setScalar(pulse * (active ? 1.2 : 0.85));
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          speed={1.5}
          distort={0.35}
          radius={1}
          emissive={color}
          emissiveIntensity={0.6}
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
  const isWarmer = currentScene !== Scene.ENTRY && currentScene !== Scene.PROGRESSION;
  const isDeep = currentScene === Scene.LOYALTY || currentScene === Scene.AFFIRMATION || currentScene === Scene.END_GAME_POPUP;
  
  const mainColor = isDeep ? "#ec4899" : (isWarmer ? "#be185d" : "#500724");

  return (
    <div className="fixed inset-0 z-0 bg-[#070708]">
      <Canvas 
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color={mainColor} intensity={2} />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0.5} fade speed={0.5} />
        
        <AbstractHeart active={isWarmer} color={mainColor} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
