
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Environment, Points, PointMaterial } from '@react-three/drei';
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

interface ParticleHeartProps {
  scene: Scene;
  isGlowing?: boolean;
}

const ParticleHeart: React.FC<ParticleHeartProps> = ({ scene, isGlowing }) => {
  const count = 4000;
  
  // Create rich gradient particles
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const colorPalette = [
      new THREE.Color("#5d4037"), // Deep Brown
      new THREE.Color("#a36846"), // Bronze
      new THREE.Color("#d4af37"), // Gold
      new THREE.Color("#f97316")  // Warm Orange
    ];
    
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      
      // Parametric heart formula
      let x = 16 * Math.pow(Math.sin(t), 3);
      let y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
      let z = (Math.random() - 0.5) * 8;

      x /= 12;
      y /= 12;
      z /= 12;

      // Add volumetric noise
      const noise = 0.5;
      pos[i * 3] = x + (Math.random() - 0.5) * noise;
      pos[i * 3 + 1] = y + (Math.random() - 0.5) * noise;
      pos[i * 3 + 2] = z + (Math.random() - 0.5) * noise;

      // Assign random color from palette
      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      cols[i * 3] = col.r;
      cols[i * 3 + 1] = col.g;
      cols[i * 3 + 2] = col.b;
    }
    return [pos, cols];
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow down in specific states
    const isSlower = scene === Scene.QUESTION_1 || scene === Scene.AFFIRMATION || scene === Scene.END_GAME_POPUP;
    const speedMult = isSlower ? 0.3 : 1.0;

    // Breathing
    const breathe = 1 + Math.sin(time * 1.2 * speedMult) * 0.04;
    pointsRef.current.scale.set(breathe, breathe, breathe);
    
    // Rotation
    pointsRef.current.rotation.y = time * 0.08 * speedMult;
    pointsRef.current.rotation.z = Math.sin(time * 0.4) * 0.03;

    // Pulse opacity or size based on glow
    if (materialRef.current) {
      const targetOpacity = isGlowing ? 1.0 : 0.7;
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, 0.1);
      materialRef.current.size = THREE.MathUtils.lerp(materialRef.current.size, isGlowing ? 0.06 : 0.04, 0.1);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          ref={materialRef}
          transparent
          vertexColors
          size={0.04}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.7}
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
  const isFinal = currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP;
  const mainColor = isFinal ? "#fb923c" : (isWarmer ? "#ea580c" : "#6366f1");

  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
        <pointLight position={[-10, -5, -5]} color={mainColor} intensity={2} />
        
        <Stars radius={100} depth={50} count={3500} factor={4} saturation={0} fade speed={0.4} />
        
        <ParticleHeart scene={currentScene} isGlowing={currentScene === Scene.LOYALTY || currentScene === Scene.END_GAME_POPUP} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
