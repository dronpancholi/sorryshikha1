
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Environment, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from '../types';

// Fix for missing JSX types for Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
    }
  }
}

interface ParticleHeartProps {
  active: boolean;
}

const ParticleHeart: React.FC<ParticleHeartProps> = ({ active }) => {
  const points = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      
      // Parametric heart formula
      let x = 16 * Math.pow(Math.sin(t), 3);
      let y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
      let z = (Math.random() - 0.5) * 10; // Depth

      // Scale down
      x /= 12;
      y /= 12;
      z /= 12;

      // Add noise to make it a cloud/volume rather than a line
      const noise = 0.4;
      x += (Math.random() - 0.5) * noise;
      y += (Math.random() - 0.5) * noise;
      z += (Math.random() - 0.5) * noise;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow breathing
    const scale = 1 + Math.sin(time * 1.5) * 0.05;
    ref.current.scale.set(scale, scale, scale);
    
    // Slow rotation
    ref.current.rotation.y = time * 0.1;
    ref.current.rotation.z = Math.sin(time * 0.5) * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#a36846" // Bronze/Brown
          size={0.035}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </Float>
  );
};

interface SceneProps {
  currentScene: Scene;
}

const ThreeScene: React.FC<SceneProps> = ({ currentScene }) => {
  const isWarmer = currentScene !== Scene.ENTRY && currentScene !== Scene.PROGRESSION;
  const isFinal = currentScene === Scene.PHASE_2;
  
  // Adjusted lighting for bronze particles
  const mainColor = isFinal ? "#fb923c" : (isWarmer ? "#ea580c" : "#6366f1");

  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        {/* Ambient light for base visibility */}
        <ambientLight intensity={0.3} />
        
        {/* Key light */}
        <pointLight position={[10, 10, 10]} intensity={1.0} color="#fff" />
        
        {/* Colored filler light */}
        <pointLight position={[-10, -5, -5]} color={mainColor} intensity={1.5} />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        
        <ParticleHeart active={isWarmer} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
