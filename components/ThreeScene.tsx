
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Environment, MeshTransmissionMaterial } from '@react-three/drei';
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

const FluidHeart: React.FC<{ scene: Scene; isGlowing?: boolean }> = ({ scene, isGlowing }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Custom geometry for an organic heart-like shape
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 5, y + 5);
    shape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    shape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    shape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    shape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    shape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    shape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);
    
    const extrudeSettings = { depth: 4, bevelEnabled: true, bevelSegments: 12, steps: 2, bevelSize: 2, bevelThickness: 4 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    geometry.rotateX(Math.PI); // Flip it right side up
    return geometry;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Liquid undulation logic
    const isSlower = scene === Scene.QUESTION_1 || scene === Scene.AFFIRMATION || scene === Scene.END_GAME_POPUP;
    const speedMult = isSlower ? 0.4 : 1.0;

    // Rhythmic pulsing
    const breathe = 0.15 + Math.sin(time * 0.8 * speedMult) * 0.008;
    meshRef.current.scale.set(breathe, breathe, breathe);
    
    // Slow rotation
    meshRef.current.rotation.y = time * 0.12 * speedMult;
    meshRef.current.rotation.z = Math.sin(time * 0.3) * 0.05;
    
    // Interactive tilt response could be added here by passing mouse coords
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} geometry={heartShape}>
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={3}
          roughness={0.15}
          anisotropy={0.1}
          distortion={0.5}
          distortionScale={0.3}
          temporalDistortion={0.1}
          clearcoat={0.8}
          attenuationDistance={2}
          attenuationColor="#5d4037" // Cocoa Brown
          color={isGlowing ? "#d4af37" : "#a36846"} // Gold vs Bronze
          emissive={isGlowing ? "#f97316" : "#5d4037"}
          emissiveIntensity={isGlowing ? 0.8 : 0.3}
        />
      </mesh>
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
      <Canvas camera={{ position: [0, 0, 10], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#fff" />
        <pointLight position={[-10, -5, -5]} color={mainColor} intensity={2.5} />
        
        <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade speed={0.3} />
        
        <FluidHeart scene={currentScene} isGlowing={currentScene === Scene.LOYALTY || currentScene === Scene.END_GAME_POPUP} />
        
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
