
import React, { useState, Suspense, useEffect } from 'react';
import ThreeScene from './components/ThreeScene';
import UIOverlay from './components/UIOverlay';
import { Scene } from './types';

const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.ENTRY);

  useEffect(() => {
    // Force scroll to top on mount
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`relative w-full ${currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP ? 'min-h-screen overflow-y-auto' : 'h-screen overflow-hidden'} bg-[#070708]`}>
      {/* 3D Background Layer */}
      <Suspense fallback={
        <div className="fixed inset-0 bg-[#070708] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      }>
        <ThreeScene currentScene={currentScene} />
      </Suspense>

      {/* UI Interaction Layer */}
      <UIOverlay onSceneChange={setCurrentScene} />
      
      {/* Subtle Noise Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default App;
