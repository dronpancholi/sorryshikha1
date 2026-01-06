
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from '../types';

interface AbstractHeartProps {
  active: boolean;
  color?: string;
  timeSpentFactor: number;
}

const AbstractHeart: React.FC<AbstractHeartProps> = ({ active, color = "#be185d", timeSpentFactor }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Smooth speed transitions for 60FPS
    const interactionSlowdown = active ? 0.35 : 1.0;
    const timeSlowdown = 1 - (timeSpentFactor * 0.4); 
    const finalSpeedMultiplier = interactionSlowdown * timeSlowdown;
    
    meshRef.current.rotation.y = time * 0.15 * finalSpeedMultiplier;
    meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.1;
    
    // Soft scale pulse
    const scaleFactor = 1 + Math.sin(time * 0.8) * 0.04;
    meshRef.current.scale.setScalar(scaleFactor * (active ? 1.15 : 0.85));
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.1;
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
          emissiveIntensity={0.5 + (timeSpentFactor * 0.2)}
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
  const [startTime] = useState(Date.now());
  const [timeSpentFactor, setTimeSpentFactor] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setTimeSpentFactor(Math.min(elapsed / 600, 1)); // Cap at 10 mins
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const isWarmer = currentScene !== Scene.ENTRY && currentScene !== Scene.PROGRESSION;
  const isDeep = currentScene === Scene.LOYALTY || currentScene === Scene.AFFIRMATION || currentScene === Scene.END_GAME_POPUP;
  
  let baseColor = isDeep ? "#ec4899" : (isWarmer ? "#be185d" : "#500724");
  
  // Dynamic color interpolation for temperature shift
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
        gl={{ 
          antialias: true, 
          powerPreference: 'high-performance', 
          alpha: true,
          stencil: false,
          depth: true
        }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]} // Support high-DPI screens without killing performance
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color={mainColor} intensity={2} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0.5} fade speed={0.5} />
        <AbstractHeart active={isWarmer} color={mainColor} timeSpentFactor={timeSpentFactor} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
