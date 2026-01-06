
import React, { useState, Suspense, useEffect } from 'react';
import ThreeScene from './components/ThreeScene';
import UIOverlay from './components/UIOverlay';
import { Scene } from './types';

const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.ENTRY);

  useEffect(() => {
    // Reset scroll position on refresh
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`relative w-full ${currentScene === Scene.PHASE_2 ? 'min-h-screen overflow-y-auto' : 'h-screen overflow-hidden'} bg-[#0a0a0c]`}>
      {/* 3D Background Layer */}
      <Suspense fallback={<div className="fixed inset-0 bg-[#0a0a0c]" />}>
        <ThreeScene currentScene={currentScene} />
      </Suspense>

      {/* UI Interaction Layer */}
      <UIOverlay onSceneChange={setCurrentScene} />
      
      {/* Subtle Noise Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default App;
