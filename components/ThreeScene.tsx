
import React, { useEffect, useRef } from 'react';
import { Scene } from '../types';

interface SceneProps {
  currentScene: Scene;
}

const ThreeScene: React.FC<SceneProps> = ({ currentScene }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w: number, h: number;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let time = 0;
    let animationFrameId: number;

    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, w, h);

      // Position: center or slightly lower center
      const centerX = w / 2;
      const centerY = h / 2 + (h * 0.08); 
      const baseRadius = Math.min(w, h) * 0.35;

      ctx.save();
      ctx.beginPath();

      // Smooth, organic motion using sine waves for fluid deformation
      for (let i = 0; i <= Math.PI * 2 + 0.1; i += 0.05) {
        const noise =
          Math.sin(i * 3 + time * 2) * 18 +
          Math.sin(i * 6 - time * 1.5) * 12;

        const radius = baseRadius + noise;
        const x = centerX + Math.cos(i) * radius;
        const y = centerY + Math.sin(i) * radius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();

      // Radial gradient for premium orange liquid appearance
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.2,
        centerX,
        centerY,
        baseRadius * 1.3
      );

      // Palette: Vibrant Orange -> Amber -> Soft Gold (around 20-25% opacity)
      gradient.addColorStop(0, "rgba(255, 170, 80, 0.30)");
      gradient.addColorStop(0.5, "rgba(220, 120, 40, 0.22)");
      gradient.addColorStop(1, "rgba(120, 60, 20, 0.12)");

      ctx.fillStyle = gradient;
      
      // Subtly soften the edges with a blur
      ctx.filter = 'blur(10px)';
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0c]">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default ThreeScene;
