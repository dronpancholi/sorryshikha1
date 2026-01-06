
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from '../types';

// Shader for the Fluid Heart using Raymarching
const LiquidHeartShader = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2() },
    uSceneState: { value: 0 }, // 0: Normal, 1: Slow/Interaction
    uGlow: { value: 0 }, // 0: Normal, 1: Emotional Glow
    uScroll: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uSceneState;
    uniform float uGlow;
    uniform float uScroll;

    // Standard Simplex Noise for Fluid Dynamics
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 a0 = x - floor(x + 0.5);
      float m1 = 1.79284291400159 - 0.85373472095314 * ( a0.x*a0.x + h.x*h.x );
      float m2 = 1.79284291400159 - 0.85373472095314 * ( a0.y*a0.y + h.y*h.y );
      float m3 = 1.79284291400159 - 0.85373472095314 * ( a0.z*a0.z + h.z*h.z );
      vec3 g;
      g.x  = a0.x  * m1;
      g.y  = a0.y  * m2;
      g.z  = a0.z  * m3;
      return 130.0 * dot(m, g);
    }

    // A more robust Heart SDF for Raymarching
    float heartSDF(vec3 p) {
      // Center and scale the heart
      p.y -= 0.25;
      float x = p.x;
      float y = p.y;
      float z = p.z;
      
      // Algebraic heart surface bound - softer gradients for raymarching
      float a = x*x + 2.25*y*y + z*z - 1.0;
      float d = a*a*a - x*x*z*z*z - 0.1125*y*y*z*z*z;
      
      // Return a conservative distance approximation
      return d * 0.15;
    }

    // Fluid distortion
    vec3 distort(vec3 p) {
      float time = uTime * mix(1.0, 0.3, uSceneState);
      
      // Use larger noise scale for liquid feel
      float n = snoise(p.xy * 0.4 + time * 0.05);
      p += n * 0.15 * sin(time * 0.3 + p.z * 0.5);
      
      // Breathing - subtle volume change
      float breathe = sin(time * 0.6) * 0.08;
      p *= (1.0 + breathe);
      
      return p;
    }

    float sceneSDF(vec3 p) {
      // Apply rotation slowly
      float time = uTime * mix(0.15, 0.05, uSceneState);
      float s = sin(time), c = cos(time);
      mat2 rot = mat2(c, -s, s, c);
      p.xz *= rot;
      
      // Parallax scroll tilt (subtle)
      float tilt = uScroll * 0.05;
      float st = sin(tilt), ct = cos(tilt);
      p.yz *= mat2(ct, -st, st, ct);
      
      p = distort(p);
      return heartSDF(p);
    }

    vec3 getNormal(vec3 p) {
      vec2 e = vec2(0.005, 0.0);
      return normalize(vec3(
        sceneSDF(p + e.xyy) - sceneSDF(p - e.xyy),
        sceneSDF(p + e.yxy) - sceneSDF(p - e.yxy),
        sceneSDF(p + e.yyx) - sceneSDF(p - e.yyx)
      ));
    }

    void main() {
      // Coordinate normalization
      vec2 uv = (vUv - 0.5) * 2.0;
      uv.x *= uResolution.x / uResolution.y;
      
      // Ray setup
      vec3 ro = vec3(0.0, 0.0, -4.5);
      vec3 rd = normalize(vec3(uv, 2.5));
      
      float t = 0.0;
      bool hit = false;
      vec3 p;
      
      // Raymarching loop - small fixed steps for algebraic surfaces
      for(int i = 0; i < 96; i++) {
        p = ro + rd * t;
        float d = sceneSDF(p);
        
        // We look for a sign change or a very small distance
        if(d < 0.001) {
          hit = true;
          break;
        }
        
        // Safe step size for liquid surface
        t += max(abs(d), 0.02);
        if(t > 12.0) break;
      }
      
      vec3 color = vec3(0.0);
      
      if(hit) {
        vec3 n = getNormal(p);
        vec3 lightDir = normalize(vec3(2.0, 2.0, -5.0));
        vec3 viewDir = normalize(-rd);
        
        float diff = max(dot(n, lightDir), 0.0);
        vec3 reflectDir = reflect(-lightDir, n);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
        
        // Material: Cocoa -> Bronze -> Gold
        vec3 cocoa = vec3(0.25, 0.15, 0.12);
        vec3 bronze = vec3(0.64, 0.41, 0.27);
        vec3 gold = vec3(0.93, 0.79, 0.42);
        
        // Dynamic blending based on surface orientation and glow state
        vec3 baseColor = mix(cocoa, bronze, n.y * 0.5 + 0.5);
        baseColor = mix(baseColor, gold, uGlow * 0.4 + spec * 0.3);
        
        // Fresnel for that "liquid glass" wrap-around light
        float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 4.0);
        
        color = baseColor * (diff + 0.2) + spec * 0.5 + fresnel * gold * 0.4;
        color += gold * uGlow * 0.2; // Extra emotional warmth
        
        // Subsurface scatter approximation
        color += cocoa * (1.0 - diff) * 0.2;
      } else {
        discard;
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

const LiquidHeart: React.FC<{ scene: Scene; isGlowing?: boolean }> = ({ scene, isGlowing }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();
  
  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uSceneState: { value: 0 },
      uGlow: { value: 0 },
      uScroll: { value: 0 },
    };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    material.uniforms.uResolution.value.set(size.width, size.height);
    
    // Smooth transitions for state uniforms
    const targetSceneState = (scene === Scene.QUESTION_1 || scene === Scene.AFFIRMATION || scene === Scene.END_GAME_POPUP) ? 1 : 0;
    material.uniforms.uSceneState.value = THREE.MathUtils.lerp(material.uniforms.uSceneState.value, targetSceneState, 0.03);
    
    const targetGlow = isGlowing ? 1 : 0;
    material.uniforms.uGlow.value = THREE.MathUtils.lerp(material.uniforms.uGlow.value, targetGlow, 0.05);
    
    material.uniforms.uScroll.value = THREE.MathUtils.lerp(material.uniforms.uScroll.value, window.scrollY * 0.01, 0.05);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[viewport.width * 2.5, viewport.height * 2.5]} />
      <shaderMaterial
        vertexShader={LiquidHeartShader.vertexShader}
        fragmentShader={LiquidHeartShader.fragmentShader}
        transparent={true}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
};

interface SceneProps {
  currentScene: Scene;
}

const ThreeScene: React.FC<SceneProps> = ({ currentScene }) => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }} 
        gl={{ 
          alpha: true,
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
        
        <Stars radius={100} depth={60} count={3000} factor={6} saturation={0} fade speed={0.2} />
        
        <LiquidHeart scene={currentScene} isGlowing={currentScene === Scene.LOYALTY || currentScene === Scene.END_GAME_POPUP} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
