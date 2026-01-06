
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Environment, Center, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from '../types';

// --- ROBUST LIQUID SHADER MATERIAL ---
// This shader relies on standard vertex displacement on a real mesh.
// It is guaranteed to render a visible object even if noise functions degrade.

const LiquidMetalShader = {
  uniforms: {
    uTime: { value: 0 },
    uGlow: { value: 0 }, // 0 to 1
    uColorDeep: { value: new THREE.Color('#3E2723') }, // Cocoa
    uColorMid: { value: new THREE.Color('#8D6E63') },  // Bronze
    uColorHighlight: { value: new THREE.Color('#FFD54F') }, // Soft Gold
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vDisplacement;

    // Pseudo-random noise
    float random(vec3 scale, float seed) {
      return fract(sin(dot(gl_Position.xyz + seed, scale)) * 43758.5453 + seed);
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      vec3 normalDir = normalize(normal);

      // --- LIQUID MOTION ---
      // We combine slow sine waves to create a breathing, molten surface effect
      
      // Large slow wave
      float wave1 = sin(pos.y * 2.0 + uTime * 1.5);
      
      // Smaller ripple
      float wave2 = cos(pos.x * 3.0 + pos.z * 3.0 + uTime * 2.0);
      
      // Combined displacement
      float displacement = (wave1 * 0.15 + wave2 * 0.05);
      
      // Apply displacement along normal
      pos += normalDir * displacement;

      vDisplacement = displacement;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalMatrix * normalDir;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorDeep;
    uniform vec3 uColorMid;
    uniform vec3 uColorHighlight;
    uniform float uGlow;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vDisplacement;

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);
      
      // lighting calculations
      vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
      
      // Diffuse (soft base lighting)
      float diff = max(dot(normal, lightDir), 0.0);
      
      // Fresnel (Rim lighting for glass/liquid look)
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
      
      // Specular (Shiny highlights)
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);

      // --- COLOR BLENDING ---
      // Mix Deep Cocoa and Bronze based on diffuse light and displacement
      vec3 baseColor = mix(uColorDeep, uColorMid, diff * 0.8 + 0.2);
      
      // Add subtle height-based color shift (lighter at peaks of waves)
      baseColor = mix(baseColor, uColorMid, vDisplacement * 2.0);

      // Add Fresnel Glow (Gold rim)
      vec3 finalColor = mix(baseColor, uColorHighlight, fresnel * (0.6 + uGlow * 0.4));
      
      // Add Specular Highlight
      finalColor += uColorHighlight * spec * 0.5;
      
      // Emotional Glow boost
      finalColor += uColorHighlight * uGlow * 0.2;

      gl_FragColor = vec4(finalColor, 0.95);
    }
  `
};

const FluidHeartMesh: React.FC<{ scene: Scene }> = ({ scene }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // --- GEOMETRY GENERATION ---
  // We use ExtrudeGeometry to guarantee a solid 3D shape.
  // We apply high bevel settings to make it look round and soft (not blocky).
  const heartGeometry = useMemo(() => {
    const x = 0, y = 0;
    const shape = new THREE.Shape();
    // Standard Heart Shape definition
    shape.moveTo(x + 5, y + 5);
    shape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    shape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    shape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    shape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    shape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    shape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

    const extrudeSettings = {
      depth: 4, // Thick extrusion
      bevelEnabled: true,
      bevelSegments: 32, // VERY SMOOTH BEVELS
      steps: 10,
      bevelSize: 3, // Large bevel to round off edges
      bevelThickness: 3, // Roundness depth
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((state) => {
    if (!materialRef.current || !meshRef.current) return;
    
    // Update Time
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

    // Handle Emotional Glow based on Scene
    const isHighEmotion = scene === Scene.LOYALTY || scene === Scene.AFFIRMATION || scene === Scene.END_GAME_POPUP;
    const targetGlow = isHighEmotion ? 1.0 : 0.0;
    
    materialRef.current.uniforms.uGlow.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uGlow.value,
      targetGlow,
      0.03
    );

    // Subtle Rotation for life
    meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
  });

  return (
    <Float 
      speed={1.5} 
      rotationIntensity={0.2} 
      floatIntensity={0.5} 
      floatingRange={[-0.2, 0.2]}
    >
      <Center>
        <mesh 
          ref={meshRef} 
          geometry={heartGeometry} 
          scale={0.12} // Adjusted scale to fit screen
          rotation={[Math.PI, 0, 0]} // Flip it right side up
        >
          <shaderMaterial
            ref={materialRef}
            vertexShader={LiquidMetalShader.vertexShader}
            fragmentShader={LiquidMetalShader.fragmentShader}
            uniforms={LiquidMetalShader.uniforms}
            transparent={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Center>
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
        camera={{ position: [0, 0, 18], fov: 35 }} 
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance" 
        }}
      >
        <color attach="background" args={['#0a0a0c']} />
        
        {/* Background Atmosphere */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        {/* The Main Heart Object */}
        <FluidHeartMesh scene={currentScene} />
        
        {/* Lighting Environment */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
        <pointLight position={[-10, -5, 5]} intensity={1} color="#8d6e63" />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
