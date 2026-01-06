
import React, { useState, Suspense, useEffect } from 'react';
import ThreeScene from './components/ThreeScene';
import UIOverlay from './components/UIOverlay';
import { Scene } from './types';

const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.ENTRY);

  useEffect(() => {
    // Ensure smooth entry from top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`relative w-full ${currentScene === Scene.PHASE_2 ? 'min-h-screen overflow-y-auto' : 'h-screen overflow-hidden'} bg-[#070708] selection:bg-pink-500/20`}>
      {/* 3D Background Layer */}
      <Suspense fallback={<div className="fixed inset-0 bg-[#070708]" />}>
        <ThreeScene currentScene={currentScene} />
      </Suspense>

      {/* UI Interaction Layer */}
      <UIOverlay onSceneChange={setCurrentScene} />
      
      {/* Subtle Depth Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default App;
