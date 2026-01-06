import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scene } from '../types';
import { 
  PROGRESSION_MESSAGES, 
  NO_REBUTTALS, 
  MEMORY_CARDS, 
  CLARIFICATION_CARDS, 
  REALITY_TEXT,
  NOTICE_CARDS,
  PROMISE_CARDS
} from '../constants';
import GlassCard from './GlassCard';

interface UIOverlayProps {
  onSceneChange: (scene: Scene) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ onSceneChange }) => {
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.ENTRY);
  const [progStep, setProgStep] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [showReassurance, setShowReassurance] = useState(false);
  const [activeClarification, setActiveClarification] = useState<string | null>(null);
  
  const [activeNotice, setActiveNotice] = useState<string | null>(null);
  const [activePromise, setActivePromise] = useState<string | null>(null);
  const [assuranceValue, setAssuranceValue] = useState(50);

  const [endPopupStep, setEndPopupStep] = useState(0);

  const updateScene = (newScene: Scene) => {
    setCurrentScene(newScene);
    onSceneChange(newScene);
    if (newScene === Scene.PHASE_2 || newScene === Scene.END_GAME_POPUP) {
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
    } else {
      document.body.style.overflowY = 'hidden';
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    if (currentScene === Scene.TRANSITION_TO_SCROLL) {
      const timer = setTimeout(() => {
        updateScene(Scene.PHASE_2);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentScene]);

  const handleNoClick = () => setNoCount(prev => prev + 1);

  const nextProgression = () => {
    if (progStep < PROGRESSION_MESSAGES.length - 1) {
      setProgStep(prev => prev + 1);
    } else {
      updateScene(Scene.QUESTION_1);
    }
  };

  const TapCue = ({ text = "Tap to open" }: { text?: string }) => (
    <motion.span 
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.2, 0.4, 0.2] }}
      transition={{ repeat: Infinity, duration: 3 }}
      className="text-[10px] uppercase tracking-[0.2em] opacity-40 mt-4 block"
    >
      {text}
    </motion.span>
  );

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const lineVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 1.2 } }
  };

  return (
    <div className={`relative z-20 w-full ${currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP ? 'min-h-fit' : 'h-screen overflow-hidden'} flex flex-col items-center select-none`}>
      <AnimatePresence mode="wait">
        
        {currentScene === Scene.ENTRY && (
          <motion.div key="entry" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center text-center p-6 w-full">
            <motion.h1 className="text-3xl md:text-5xl font-serif font-light mb-12 tracking-wide leading-relaxed">
              Hey Shikha... <br />
              <span className="opacity-70 text-2xl md:text-4xl">can you stay for a minute?</span>
            </motion.h1>
            <button onClick={() => updateScene(Scene.PROGRESSION)} className="px-12 py-4 rounded-full glass border border-white/20 hover:bg-white/10 transition-all duration-300 tracking-widest uppercase text-sm font-light">Continue</button>
            <TapCue text="Tap when ready" />
          </motion.div>
        )}

        {currentScene === Scene.PROGRESSION && (
          <motion.div key={`prog-${progStep}`} variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center text-center p-6 cursor-pointer w-full" onClick={nextProgression}>
            <motion.h2 className="text-4xl md:text-6xl font-serif font-light italic opacity-90">{PROGRESSION_MESSAGES[progStep].text}</motion.h2>
            <TapCue text="Tap to continue" />
          </motion.div>
        )}

        {currentScene === Scene.QUESTION_1 && (
          <motion.div key="q1" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center w-full max-w-lg p-6">
            <GlassCard>
              <h3 className="text-2xl font-serif text-center mb-10 leading-relaxed">
                {noCount === 0 ? "Do you know how important you are to me?" : NO_REBUTTALS[(noCount - 1) % NO_REBUTTALS.length]}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button onClick={() => updateScene(Scene.LOYALTY)} className="px-10 py-3 rounded-full bg-white text-black font-medium hover:scale-105 transition-transform">Yes</button>
                <button onClick={handleNoClick} style={{ transform: `scale(${Math.max(0.4, 1 - noCount * 0.15)})`, opacity: Math.max(0.3, 1 - noCount * 0.1) }} className="px-10 py-3 rounded-full border border-white/30 text-white/70 hover:bg-white/5 transition-all">
                  {noCount > 0 ? "Not yet" : "No"}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {currentScene === Scene.LOYALTY && (
          <motion.div key="loyalty" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center text-center max-w-2xl p-6 w-full">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1.5 }} className="text-xl md:text-3xl font-serif font-light mb-16 leading-relaxed italic">
              “If I wanted to choose someone else, I would have done it long before you were in my life.”
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1.5 }} className="space-y-6">
              <p className="text-2xl md:text-4xl font-serif">I chose you.</p>
              <p className="text-2xl md:text-4xl font-serif font-semibold">I still choose you.</p>
              <button onClick={() => updateScene(Scene.AFFIRMATION)} className="mt-12 px-12 py-4 rounded-full glass border border-white/20 hover:bg-white/10 transition-all text-sm tracking-widest uppercase">Deep down...</button>
              <TapCue text="Click to continue" />
            </motion.div>
          </motion.div>
        )}

        {currentScene === Scene.AFFIRMATION && (
          <motion.div key="affirmation" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center w-full max-w-xl p-6">
            <GlassCard>
              <h3 className="text-2xl font-serif text-center mb-10 leading-relaxed">Do you believe I chose you over everything?</h3>
              <AnimatePresence>
                {showReassurance && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-center text-indigo-300 italic mb-8">
                    That’s okay. I’m here to prove it — not rush you.
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="flex flex-col gap-4">
                <button onClick={() => updateScene(Scene.TRANSITION_TO_SCROLL)} className="w-full py-4 rounded-xl bg-white/90 text-black font-semibold hover:bg-white transition-all shadow-lg">Yes</button>
                <button onClick={() => { setShowReassurance(true); setTimeout(() => setShowReassurance(false), 4000); }} className="w-full py-4 rounded-xl glass text-white/60 hover:text-white/90 transition-all border-white/10">I’m not sure</button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {currentScene === Scene.TRANSITION_TO_SCROLL && (
          <motion.div key="transition" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center text-center p-6 w-full">
             <h2 className="text-2xl md:text-4xl font-serif font-light mb-12 opacity-80 italic">Now let me say everything properly.</h2>
             <motion.div animate={{ opacity: [0, 1, 0], y: [0, 20] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-4">
               <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent" />
             </motion.div>
             <div className="mt-8 text-[10px] uppercase tracking-widest opacity-20">Scroll down</div>
          </motion.div>
        )}

        {(currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP) && (
          <motion.div key="phase2content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="w-full flex flex-col items-center pb-60">
            
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-10 mt-20">
              <h2 className="text-sm uppercase tracking-[0.5em] opacity-40 mb-20 text-center">Things I Never Questioned</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {MEMORY_CARDS.map((card) => (
                  <motion.div key={card.id} whileHover={{ scale: 1.02, rotate: 1 }} className="glass p-12 rounded-2xl text-center border border-white/10 flex flex-col items-center justify-center transition-all cursor-default">
                    <span className="text-xl md:text-2xl font-serif italic">{card.text}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-sm uppercase tracking-[0.5em] opacity-40 mb-20">Little Things I Noticed</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
                {NOTICE_CARDS.map((card) => (
                  <motion.div key={card.id} onClick={() => setActiveNotice(activeNotice === card.id ? null : card.id)} className="glass p-10 rounded-3xl cursor-pointer border border-white/10 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      {activeNotice === card.id ? (
                        <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-lg font-serif italic">{card.content}</motion.p>
                      ) : (
                        <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                          <span className="text-xl font-serif mb-2">{card.title}</span>
                          <TapCue text="Reveal" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center space-y-12">
              <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} transition={{ staggerChildren: 1.5 }}>
                <motion.h3 variants={lineVariants} className="text-2xl md:text-4xl font-serif font-light mb-4">I didn’t fail in love.</motion.h3>
                <motion.h3 variants={lineVariants} className="text-2xl md:text-4xl font-serif font-light opacity-60">I failed in expression.</motion.h3>
                <motion.div variants={lineVariants} className="pt-8">
                  <span className="text-lg md:text-xl font-medium tracking-widest uppercase">I'm owning that.</span>
                </motion.div>
              </motion.div>
            </section>

            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6">
              <div className="flex flex-col md:flex-row gap-6 max-w-5xl w-full">
                {CLARIFICATION_CARDS.map((card) => (
                  <motion.div key={card.id} whileHover={{ scale: 1.01 }} onClick={() => setActiveClarification(activeClarification === card.id ? null : card.id)} className="flex-1 glass p-8 rounded-3xl cursor-pointer border border-white/10 hover:border-white/30 transition-all h-[320px] flex flex-col justify-between overflow-hidden">
                    <AnimatePresence mode="wait">
                      {activeClarification === card.id ? (
                        <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center text-center">
                          <p className="text-lg font-serif italic">{card.content}</p>
                          <TapCue text="Tap to close" />
                        </motion.div>
                      ) : (
                        <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center text-center">
                          <h4 className="text-xs uppercase tracking-[0.3em] opacity-40 mb-4">Focus</h4>
                          <span className="text-xl md:text-2xl font-serif mb-4">{card.title}</span>
                          <TapCue text="Click to read" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-sm uppercase tracking-[0.5em] opacity-40 mb-20">My Promises</h2>
              <div className="flex flex-col gap-6 max-w-2xl w-full">
                {PROMISE_CARDS.map((card) => (
                  <motion.div key={card.id} onClick={() => setActivePromise(activePromise === card.id ? null : card.id)} className="glass p-12 rounded-3xl cursor-pointer border border-white/10 text-center">
                    <AnimatePresence mode="wait">
                      {activePromise === card.id ? (
                        <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-serif italic">{card.content}</motion.p>
                      ) : (
                        <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <span className="text-2xl font-serif block mb-2">{card.title}</span>
                          <TapCue text="Tap to view" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
               <GlassCard className="max-w-md w-full !p-10">
                  <h3 className="text-xl font-serif mb-12">How sure am I about you?</h3>
                  <div className="relative w-full h-12 flex items-center">
                    <input type="range" min="0" max="100" value={assuranceValue} onChange={(e) => setAssuranceValue(parseInt(e.target.value))} className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-pink-500" />
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] uppercase tracking-widest opacity-40"><span>Certain</span><span>Always</span></div>
                  <p className="mt-12 font-serif italic text-pink-200">{assuranceValue < 30 ? "I'm fixed on you." : assuranceValue > 70 ? "I choose you again." : "You are the choice."}</p>
               </GlassCard>
            </section>

            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center space-y-12">
              <div className="max-w-2xl w-full space-y-8">
                {REALITY_TEXT.map((text, idx) => (
                  <motion.p key={idx} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: idx * 0.3 }} className={`font-serif text-xl md:text-3xl ${idx === 5 ? "text-pink-300" : "opacity-50"}`}>{text}</motion.p>
                ))}
              </div>
            </section>

            <section className="min-h-screen w-full flex flex-col items-center justify-center p-12 text-center">
              <AnimatePresence>
                {currentScene === Scene.PHASE_2 && (
                  <button onClick={() => updateScene(Scene.END_GAME_POPUP)} className="px-16 py-5 rounded-full glass border border-white/20 hover:border-white/60 transition-all tracking-[0.4em] uppercase text-xs font-light">One last thing?</button>
                )}
              </AnimatePresence>
              <div className="h-40" />
            </section>

          </motion.div>
        )}

        {currentScene === Scene.END_GAME_POPUP && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <GlassCard className="max-w-md w-full text-center">
                {endPopupStep === 0 && (
                  <>
                    <h3 className="text-2xl font-serif mb-10">One last question?</h3>
                    <div className="flex gap-4"><button onClick={() => setEndPopupStep(1)} className="flex-1 py-4 glass rounded-xl">Okay</button></div>
                  </>
                )}
                {endPopupStep === 1 && (
                  <>
                    <h3 className="text-2xl font-serif mb-10">Do you feel chosen here?</h3>
                    <div className="flex flex-col gap-4"><button onClick={() => setEndPopupStep(2)} className="py-4 bg-white text-black font-semibold rounded-xl">Yes</button></div>
                  </>
                )}
                {endPopupStep === 2 && (
                  <>
                    <h3 className="text-2xl font-serif mb-10">Do you love me?</h3>
                    <div className="flex flex-col gap-4"><button onClick={() => setEndPopupStep(3)} className="py-4 bg-white text-black font-semibold rounded-xl">Yes</button></div>
                  </>
                )}
                {endPopupStep === 3 && (
                  <div className="py-10">
                    <h3 className="text-2xl font-serif mb-6 italic">I'm so glad.</h3>
                    <button onClick={() => updateScene(Scene.PHASE_2)} className="mt-8 text-xs uppercase tracking-widest opacity-40 underline">Back to journey</button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
      <div className={`fixed inset-0 pointer-events-none transition-all duration-1000 z-[-1] ${currentScene === Scene.ENTRY ? 'bg-transparent' : 'bg-black/40'}`} />
    </div>
  );
};

export default UIOverlay;