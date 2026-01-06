
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

    // --- 3D Simplex Noise Implementation ---
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

      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
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
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
    }

    // A robust 3D Heart SDF
    float heartSDF(vec3 p) {
      p.y -= 0.5; // Offset to center better
      float x = p.x;
      float y = p.y;
      float z = p.z;
      
      // Stretching and shaping
      float a = x*x + 2.25*y*y + z*z - 1.0;
      float d = a*a*a - x*x*z*z*z - 0.1125*y*y*z*z*z;
      
      return d * 0.2; // Return distance estimate
    }

    // Fluid distortion
    vec3 distort(vec3 p) {
      float time = uTime * mix(1.0, 0.4, uSceneState);
      
      // 3D Simplex noise for organic fluid volume motion
      float noise = snoise(p * 0.4 + time * 0.15);
      p += noise * 0.15 * vec3(sin(p.z + time), cos(p.x + time), sin(p.y + time));
      
      // Slow organic breathing
      float breathe = sin(time * 0.6) * 0.06;
      p *= (1.0 + breathe);
      
      return p;
    }

    float sceneSDF(vec3 p) {
      // Rotation
      float rotSpeed = uTime * mix(0.12, 0.04, uSceneState);
      float s = sin(rotSpeed), c = cos(rotSpeed);
      p.xz *= mat2(c, -s, s, c);
      
      // Parallax scroll tilt
      float tilt = uScroll * 0.08;
      float st = sin(tilt), ct = cos(tilt);
      p.yz *= mat2(ct, -st, st, ct);
      
      p = distort(p);
      return heartSDF(p);
    }

    vec3 getNormal(vec3 p) {
      vec2 e = vec2(0.002, 0.0);
      return normalize(vec3(
        sceneSDF(p + e.xyy) - sceneSDF(p - e.xyy),
        sceneSDF(p + e.yxy) - sceneSDF(p - e.yxy),
        sceneSDF(p + e.yyx) - sceneSDF(p - e.yyx)
      ));
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      uv.x *= uResolution.x / uResolution.y;
      
      vec3 ro = vec3(0.0, 0.0, -4.0);
      vec3 rd = normalize(vec3(uv, 1.8));
      
      float t = 0.0;
      bool hit = false;
      vec3 p;
      
      // Safe raymarching loop for algebraic surface
      for(int i = 0; i < 80; i++) {
        p = ro + rd * t;
        float d = sceneSDF(p);
        if(abs(d) < 0.001) {
          hit = true;
          break;
        }
        t += max(abs(d), 0.02);
        if(t > 10.0) break;
      }
      
      if(hit) {
        vec3 n = getNormal(p);
        vec3 lightDir = normalize(vec3(2.0, 3.0, -5.0));
        vec3 viewDir = normalize(ro - p);
        vec3 reflectDir = reflect(-lightDir, n);
        
        float diff = max(dot(n, lightDir), 0.0);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 5.0);
        
        // Cocoa -> Bronze -> Gold Palette
        vec3 cocoa = vec3(0.18, 0.10, 0.07);
        vec3 bronze = vec3(0.55, 0.32, 0.18);
        vec3 gold = vec3(0.95, 0.82, 0.45);
        
        vec3 base = mix(cocoa, bronze, diff);
        base = mix(base, gold, fresnel * 0.4 + uGlow * 0.25);
        
        vec3 color = base + spec * gold * 0.5;
        color += gold * uGlow * 0.15; // Inner emotional glow
        
        gl_FragColor = vec4(color, 1.0);
      } else {
        discard;
      }
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
    
    const targetSceneState = (scene === Scene.QUESTION_1 || scene === Scene.AFFIRMATION || scene === Scene.END_GAME_POPUP) ? 1 : 0;
    const targetGlow = isGlowing ? 1 : 0;
    
    material.uniforms.uSceneState.value = THREE.MathUtils.lerp(material.uniforms.uSceneState.value, targetSceneState, 0.03);
    material.uniforms.uGlow.value = THREE.MathUtils.lerp(material.uniforms.uGlow.value, targetGlow, 0.05);
    material.uniforms.uScroll.value = THREE.MathUtils.lerp(material.uniforms.uScroll.value, window.scrollY * 0.01, 0.05);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
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
    <div className="fixed inset-0 z-0 bg-[#0a0a0c]">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }} 
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <Stars radius={100} depth={50} count={3500} factor={6} saturation={0} fade speed={0.15} />
        <LiquidHeart scene={currentScene} isGlowing={currentScene === Scene.LOYALTY || currentScene === Scene.END_GAME_POPUP} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
