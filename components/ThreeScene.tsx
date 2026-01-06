
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from '../types';

// --- Abstract Orange Fluid Shader ---
const AbstractFluidShader = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2() },
    uGlow: { value: 0 },
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
    uniform float uGlow;
    uniform float uScroll;

    // --- 3D Simplex Noise ---
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 1.0/7.0;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    // Sphere SDF
    float sdSphere(vec3 p, float r) {
      return length(p) - r;
    }

    float map(vec3 p) {
      // Rotation and scroll-based movement
      float angle = uTime * 0.1;
      p.xz *= mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
      p.y += uScroll * 0.1;

      // Abstract deformation using multi-layered noise
      float noise = snoise(p * 0.6 + uTime * 0.4) * 0.4;
      noise += snoise(p * 1.5 - uTime * 0.2) * 0.15;
      
      float sphere = sdSphere(p, 1.4);
      return sphere + noise;
    }

    vec3 calcNormal(vec3 p) {
      const float h = 0.001;
      const vec2 k = vec2(1, -1);
      return normalize(
        k.xyy * map(p + k.xyy * h) +
        k.yyx * map(p + k.yyx * h) +
        k.yxy * map(p + k.yxy * h) +
        k.xxx * map(p + k.xxx * h)
      );
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      uv.x *= uResolution.x / uResolution.y;

      vec3 ro = vec3(0.0, 0.0, -4.5);
      vec3 rd = normalize(vec3(uv, 2.5));

      float t = 0.0;
      bool hit = false;
      vec3 p;

      for(int i = 0; i < 70; i++) {
        p = ro + rd * t;
        float d = map(p);
        if(abs(d) < 0.001) {
          hit = true;
          break;
        }
        t += d;
        if(t > 10.0) break;
      }

      vec3 color = vec3(0.0);
      float alpha = 0.0;

      if(hit) {
        vec3 n = calcNormal(p);
        vec3 viewDir = normalize(ro - p);
        vec3 lightDir = normalize(vec3(2.0, 3.0, -5.0));
        
        float diff = max(dot(n, lightDir), 0.0);
        float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);

        // Palette: Vivid Orange -> Amber -> Soft Gold
        vec3 orange = vec3(1.0, 0.45, 0.1);
        vec3 amber = vec3(0.8, 0.25, 0.05);
        vec3 gold = vec3(1.0, 0.8, 0.3);

        vec3 base = mix(amber, orange, diff);
        color = mix(base, gold, fresnel * 0.7 + uGlow * 0.3);
        
        // Final alpha for a subtle background presence
        alpha = 0.25; 
      }

      gl_FragColor = vec4(color, alpha);
    }
  `
};

const RaymarchedFluid: React.FC<{ scene: Scene }> = ({ scene }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uGlow: { value: 0 },
    uScroll: { value: 0 },
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    material.uniforms.uResolution.value.set(size.width, size.height);
    material.uniforms.uScroll.value = window.scrollY * 0.05;

    const targetGlow = (scene === Scene.LOYALTY || scene === Scene.END_GAME_POPUP) ? 1.0 : 0.0;
    material.uniforms.uGlow.value = THREE.MathUtils.lerp(material.uniforms.uGlow.value, targetGlow, 0.03);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
      <shaderMaterial
        vertexShader={AbstractFluidShader.vertexShader}
        fragmentShader={AbstractFluidShader.fragmentShader}
        uniforms={uniforms}
        transparent={true}
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
    <div className="fixed inset-0 z-0 bg-[#0a0a0c]">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
        <RaymarchedFluid scene={currentScene} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
