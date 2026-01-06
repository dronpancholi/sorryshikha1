
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from '../types';

// Shader for the Fluid Heart Material
const FluidMaterialShader = {
  uniforms: {
    uTime: { value: 0 },
    uGlow: { value: 0 },
    uColorCocoa: { value: new THREE.Color('#2d1a12') },
    uColorBronze: { value: new THREE.Color('#a36846') },
    uColorGold: { value: new THREE.Color('#fbbf24') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    
    // Simple noise function
    float hash(float n) { return fract(sin(n) * 43758.5453123); }
    float noise(vec3 x) {
      vec3 p = floor(x);
      vec3 f = fract(x);
      f = f*f*(3.0-2.0*f);
      float n = p.x + p.y*57.0 + 113.0*p.z;
      return mix(mix(mix( hash(n+0.0), hash(n+1.0),f.x),
                     mix( hash(n+57.0), hash(n+58.0),f.x),f.y),
                 mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                     mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
    }

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Liquid displacement
      vec3 pos = position;
      float noiseVal = noise(pos * 1.5 + uTime * 0.5);
      pos += normal * noiseVal * 0.15;
      
      vPosition = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uGlow;
    uniform vec3 uColorCocoa;
    uniform vec3 uColorBronze;
    uniform vec3 uColorGold;

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
      
      // Cocoa to Bronze base
      vec3 color = mix(uColorCocoa, uColorBronze, vNormal.y * 0.5 + 0.5);
      
      // Add Gold accents and Fresnel glow
      color = mix(color, uColorGold, fresnel * 0.5 + uGlow * 0.3);
      
      // Subtle pulse
      float pulse = sin(uTime * 1.2) * 0.5 + 0.5;
      color += uColorGold * pulse * 0.1 * uGlow;

      gl_FragColor = vec4(color, 0.95);
    }
  `
};

const HeartMesh: React.FC<{ scene: Scene }> = ({ scene }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate a robust Heart Shape
  const heartShape = useMemo(() => {
    const s = 1.5;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, -0.3 * s, -0.6 * s, -0.3 * s, -0.6 * s, 0);
    shape.bezierCurveTo(-0.6 * s, 0.4 * s, 0, 0.8 * s, 0, 1.2 * s);
    shape.bezierCurveTo(0, 0.8 * s, 0.6 * s, 0.4 * s, 0.6 * s, 0);
    shape.bezierCurveTo(0.6 * s, -0.3 * s, 0, -0.3 * s, 0, 0);
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.4,
    bevelEnabled: true,
    bevelSegments: 16,
    steps: 2,
    bevelSize: 0.2,
    bevelThickness: 0.2,
  }), []);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    
    const t = state.clock.getElapsedTime();
    materialRef.current.uniforms.uTime.value = t;

    // Pulse based on scene
    const isSpecial = scene === Scene.LOYALTY || scene === Scene.END_GAME_POPUP;
    const targetGlow = isSpecial ? 1.0 : 0.3;
    materialRef.current.uniforms.uGlow.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uGlow.value,
      targetGlow,
      0.05
    );

    // Gentle rotation
    meshRef.current.rotation.y = Math.sin(t * 0.2) * 0.2;
    meshRef.current.rotation.z = Math.PI + Math.sin(t * 0.1) * 0.05;
    
    // Breathing scale
    const scale = 1 + Math.sin(t * 0.8) * 0.03;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh 
        ref={meshRef} 
        rotation={[0, 0, Math.PI]} 
        position={[0, -0.5, 0]}
      >
        <extrudeGeometry args={[heartShape, extrudeSettings]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={FluidMaterialShader.vertexShader}
          fragmentShader={FluidMaterialShader.fragmentShader}
          uniforms={FluidMaterialShader.uniforms}
          transparent={true}
        />
      </mesh>
    </Float>
  );
};

interface SceneProps {
  currentScene: Scene;
}

const ThreeScene: React.FC<SceneProps> = ({ currentScene }) => {
  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0c]">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }} 
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0a0a0c']} />
        
        {/* Ambient environment for richness */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#a36846" />
        <pointLight position={[-10, -10, 5]} intensity={0.5} color="#fbbf24" />
        
        <HeartMesh scene={currentScene} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
