
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scene } from '../types';
import { 
  PROGRESSION_MESSAGES, 
  NO_REBUTTALS, 
  MEMORY_CARDS, 
  CLARIFICATION_CARDS, 
  VALUES_TEXT, 
  DOUBT_TILES, 
  REALITY_TEXT,
  NOTICE_CARDS,
  PROMISE_CARDS,
  PHASE5_BLURRED_LINES,
  PHASE5_HEADSPACE,
  PHASE5_EXPECTATIONS,
  PHASE5_EXTRA_CURIOSITY
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
  const [valuesUnderstanding, setValuesUnderstanding] = useState(false);
  
  // Phase 5 Interaction States
  const [heldBlurIndex, setHeldBlurIndex] = useState<number | null>(null);
  const [isHoldingAgreement, setIsHoldingAgreement] = useState(false);
  const [activeHeadspace, setActiveHeadspace] = useState<string | null>(null);
  const [curiosityState, setCuriosityState] = useState<'idle' | 'little' | 'good'>('idle');
  const [headspaceText, setHeadspaceText] = useState<string | null>(null);

  // Notice & Promise States
  const [activeNotice, setActiveNotice] = useState<string | null>(null);
  const [activePromise, setActivePromise] = useState<string | null>(null);
  const [revealedDoubts, setRevealedDoubts] = useState<Set<string>>(new Set());
  const [assuranceValue, setAssuranceValue] = useState(50);

  // End Game Sequence
  const [endPopupStep, setEndPopupStep] = useState(0);
  const [endPopupResponse, setEndPopupResponse] = useState<string | null>(null);
  const [stillHere, setStillHere] = useState(false);

  const updateScene = (newScene: Scene) => {
    setCurrentScene(newScene);
    onSceneChange(newScene);
    if (newScene === Scene.PHASE_2 || newScene === Scene.END_GAME_POPUP) {
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
    } else {
      document.body.style.overflowY = 'hidden';
    }
  };

  useEffect(() => {
    if (currentScene === Scene.TRANSITION_TO_SCROLL) {
      const timer = setTimeout(() => {
        updateScene(Scene.PHASE_2);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentScene]);

  useEffect(() => {
    if (activeHeadspace) {
      const h = PHASE5_HEADSPACE.find(item => item.id === activeHeadspace);
      setHeadspaceText(h ? h.line : null);
      const timer = setTimeout(() => {
        setHeadspaceText(null);
        setActiveHeadspace(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeHeadspace]);

  const toggleDoubt = (id: string) => {
    const next = new Set(revealedDoubts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedDoubts(next);
  };

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
    <div className={`relative z-10 w-full ${currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP ? 'min-h-fit' : 'h-screen overflow-hidden'} flex flex-col items-center select-none`}>
      {/* Screen Warming Overlay for Silent Agreement */}
      <motion.div 
        animate={{ opacity: isHoldingAgreement ? 0.3 : 0 }} 
        className="fixed inset-0 bg-pink-500/10 pointer-events-none z-50" 
      />

      <AnimatePresence mode="wait">
        
        {/* Phase 1 Scenes */}
        {currentScene === Scene.ENTRY && (
          <motion.div key="entry" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center text-center p-6">
            <motion.h1 
              whileHover={{ scale: 1.02, rotate: 0.5 }} 
              className="text-3xl md:text-5xl font-serif font-light mb-12 tracking-wide leading-relaxed"
            >
              Hey Shikha... <br />
              <span className="opacity-70 text-2xl md:text-4xl">can you stay for a minute?</span>
            </motion.h1>
            <button onClick={() => updateScene(Scene.PROGRESSION)} className="px-12 py-4 rounded-full glass border border-white/20 hover:bg-white/10 transition-all duration-300 tracking-widest uppercase text-sm font-light">Continue</button>
            <TapCue text="Tap when ready" />
          </motion.div>
        )}

        {currentScene === Scene.PROGRESSION && PROGRESSION_MESSAGES[progStep] && (
          <motion.div key={`prog-${progStep}`} variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center text-center p-6 cursor-pointer" onClick={nextProgression}>
            <motion.h2 
              whileHover={{ x: [0, -3, 3, 0], scale: 1.01 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-serif font-light italic opacity-90 transition-all duration-1000"
            >
              {PROGRESSION_MESSAGES[progStep].text}
            </motion.h2>
            <TapCue text="Tap to continue" />
          </motion.div>
        )}

        {currentScene === Scene.QUESTION_1 && (
          <motion.div key="q1" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center w-full max-w-lg p-6">
            <GlassCard>
              <h3 className="text-2xl font-serif text-center mb-10 leading-relaxed">
                {noCount === 0 ? "Do you know how important you are to me?" : NO_REBUTTALS[(noCount - 1) % NO_REBUTTALS.length]}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center h-20">
                <button onClick={() => updateScene(Scene.LOYALTY)} className="px-10 py-3 rounded-full bg-white text-black font-medium hover:scale-105 transition-transform">Yes</button>
                <button onClick={handleNoClick} style={{ transform: `scale(${Math.max(0.4, 1 - noCount * 0.15)})`, opacity: Math.max(0.3, 1 - noCount * 0.1) }} className="px-10 py-3 rounded-full border border-white/30 text-white/70 hover:bg-white/5 transition-all">
                  {noCount > 0 ? "Not yet" : "No"}
                </button>
              </div>
              <div className="text-center mt-6">
                <TapCue text="Your choice matters" />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {currentScene === Scene.LOYALTY && (
          <motion.div key="loyalty" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center text-center max-w-2xl p-6">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 2 }} className="text-xl md:text-3xl font-serif font-light mb-16 leading-relaxed italic">
              “If I wanted to choose someone else, I would have done it long before you were in my life.”
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5, duration: 2 }} className="space-y-6">
              <p className="text-2xl md:text-4xl font-serif">But I didn’t.</p>
              <p className="text-2xl md:text-4xl font-serif">I chose you.</p>
              <p className="text-2xl md:text-4xl font-serif font-semibold">I still choose you.</p>
              <button onClick={() => updateScene(Scene.AFFIRMATION)} className="mt-12 px-12 py-4 rounded-full glass border border-white/20 hover:bg-white/10 transition-all text-sm tracking-widest uppercase">Deep down...</button>
              <TapCue text="Tap to breathe" />
            </motion.div>
          </motion.div>
        )}

        {currentScene === Scene.AFFIRMATION && (
          <motion.div key="affirmation" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center w-full max-w-xl p-6">
            <GlassCard>
              <h3 className="text-2xl font-serif text-center mb-10 leading-relaxed">Do you believe I chose you over everything?</h3>
              <AnimatePresence>
                {showReassurance && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-center text-pink-300 italic mb-8">
                    That’s okay. I’m here to prove it — not rush you.
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="flex flex-col gap-4">
                <button onClick={() => updateScene(Scene.TRANSITION_TO_SCROLL)} className="w-full py-4 rounded-xl bg-white/90 text-black font-semibold hover:bg-white transition-all shadow-lg">Yes</button>
                <button onClick={() => { setShowReassurance(true); setTimeout(() => setShowReassurance(false), 4000); }} className="w-full py-4 rounded-xl glass text-white/60 hover:text-white/90 transition-all border-white/10">I’m not sure</button>
              </div>
              <div className="text-center">
                <TapCue text="Gently choose" />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {currentScene === Scene.TRANSITION_TO_SCROLL && (
          <motion.div key="transition" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center text-center p-6">
             <h2 className="text-2xl md:text-4xl font-serif font-light mb-12 opacity-80 italic">Now that you’re here… let me say everything properly.</h2>
             <motion.div 
               animate={{ opacity: [0, 1, 0], y: [0, 20] }} 
               transition={{ duration: 2, repeat: Infinity }}
               className="flex flex-col items-center gap-4"
             >
               <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent" />
             </motion.div>
             <div className="mt-8 text-[10px] uppercase tracking-widest opacity-20">Opening the path</div>
          </motion.div>
        )}

        {/* Phase 2+ Scrollable Experience */}
        {(currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP) && (
          <motion.div key="phase2plus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="w-full flex flex-col items-center">
            
            {/* Memory Wall */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-10 mt-20">
              <h2 className="text-sm uppercase tracking-[0.5em] opacity-40 mb-20 text-center">Things I Never Questioned</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {MEMORY_CARDS.map((card) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.02, rotate: 1, boxShadow: "0 0 40px rgba(219, 39, 119, 0.4)" }}
                    className="glass p-12 rounded-2xl text-center border border-white/10 flex flex-col items-center justify-center transition-all cursor-default"
                  >
                    <span className="text-xl md:text-2xl font-serif italic">{card.text}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Read Between the Lines (NEW PHASE 5) */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-sm uppercase tracking-[0.4em] opacity-40 mb-16">Things That Don’t Need Explaining</h2>
              <div className="max-w-2xl w-full space-y-12">
                {PHASE5_BLURRED_LINES.map((line, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-4 group">
                    <motion.p 
                      animate={{ filter: heldBlurIndex === idx ? 'blur(0px)' : 'blur(8px)', opacity: heldBlurIndex === idx ? 1 : 0.4 }}
                      className="text-2xl md:text-3xl font-serif italic"
                    >
                      {line}
                    </motion.p>
                    <button 
                      onMouseDown={() => setHeldBlurIndex(idx)}
                      onMouseUp={() => setHeldBlurIndex(null)}
                      onMouseLeave={() => setHeldBlurIndex(null)}
                      onTouchStart={() => setHeldBlurIndex(idx)}
                      onTouchEnd={() => setHeldBlurIndex(null)}
                      className="text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity px-6 py-2 border border-white/10 rounded-full"
                    >
                      Press and hold to read
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Silent Agreement (NEW PHASE 5) */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
               <h2 className="text-2xl font-serif font-light mb-16">Some things don’t need answers.</h2>
               <div className="relative group">
                 <motion.button 
                   whileTap={{ scale: 0.95 }}
                   onMouseDown={() => setIsHoldingAgreement(true)}
                   onMouseUp={() => setIsHoldingAgreement(false)}
                   onMouseLeave={() => setIsHoldingAgreement(false)}
                   onTouchStart={() => setIsHoldingAgreement(true)}
                   onTouchEnd={() => setIsHoldingAgreement(false)}
                   className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors"
                 >
                   <motion.div 
                     animate={{ scale: isHoldingAgreement ? 1.5 : 1, opacity: isHoldingAgreement ? 0.8 : 0.3 }}
                     className="w-8 h-8 rounded-full bg-white" 
                   />
                 </motion.button>
                 <p className="mt-8 text-[10px] uppercase tracking-widest opacity-40">Hold if you agree</p>
               </div>
            </section>

            {/* My Headspace (NEW PHASE 5) */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-sm uppercase tracking-[0.4em] opacity-40 mb-16">My Headspace Right Now</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl w-full mb-12">
                {PHASE5_HEADSPACE.map((item) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setActiveHeadspace(item.id)}
                    className={`glass p-8 rounded-3xl cursor-pointer border border-white/10 flex flex-col items-center justify-center h-48 transition-all ${activeHeadspace === item.id ? 'border-pink-500/50' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-full mb-4 ${item.id === 'calm' ? 'bg-indigo-400/20' : item.id === 'overthinking' ? 'bg-pink-400/20' : 'bg-rose-400/20'} blur-sm animate-pulse`} />
                    <span className="text-lg font-serif mb-2">{item.title}</span>
                    <TapCue text="Tap to see" />
                  </motion.div>
                ))}
              </div>
              <AnimatePresence>
                {headspaceText && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }} 
                    className="text-xl md:text-2xl font-serif italic text-pink-200"
                  >
                    {headspaceText}
                  </motion.p>
                )}
              </AnimatePresence>
            </section>

            {/* Little Things I Noticed */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-sm uppercase tracking-[0.5em] opacity-40 mb-20">Little Things I Noticed</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
                {NOTICE_CARDS.map((card) => (
                  <motion.div 
                    key={card.id}
                    onClick={() => setActiveNotice(activeNotice === card.id ? null : card.id)}
                    className="glass p-10 rounded-3xl cursor-pointer border border-white/10 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden"
                  >
                    <AnimatePresence mode="wait">
                      {activeNotice === card.id ? (
                        <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-lg font-serif italic">
                          {card.content}
                        </motion.p>
                      ) : (
                        <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                          <span className="text-xl font-serif mb-2">{card.title}</span>
                          <TapCue text="Tap to open" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Time-Aware Section (NEW PHASE 5) */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-12 text-center space-y-12">
              <h2 className="text-sm uppercase tracking-[0.4em] opacity-40 mb-8">Right Now</h2>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 2, staggerChildren: 1 }}
                className="max-w-2xl space-y-8"
              >
                <motion.p className="text-2xl md:text-4xl font-serif font-light">It’s January 6.</motion.p>
                <motion.p className="text-2xl md:text-4xl font-serif font-light opacity-60">I should probably be solving maths problems.</motion.p>
                <motion.p className="text-2xl md:text-4xl font-serif font-light italic">Instead, I wanted this to exist.</motion.p>
              </motion.div>
            </section>

            {/* No Expectations Zone (NEW PHASE 5) */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-sm uppercase tracking-[0.4em] opacity-40 mb-16">No Expectations From This</h2>
              <div className="space-y-12">
                {PHASE5_EXPECTATIONS.map((text, idx) => (
                  <motion.p 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.8, duration: 1.5 }}
                    viewport={{ once: true }}
                    className="text-xl md:text-3xl font-serif font-light opacity-80"
                  >
                    {text}
                  </motion.p>
                ))}
              </div>
            </section>

            {/* Clarification Cards */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6">
              <div className="flex flex-col md:flex-row gap-6 max-w-5xl w-full">
                {CLARIFICATION_CARDS.map((card) => (
                  <motion.div 
                    key={card.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setActiveClarification(activeClarification === card.id ? null : card.id)}
                    className="flex-1 glass p-8 rounded-3xl cursor-pointer border border-white/10 hover:border-white/30 transition-all h-[320px] flex flex-col justify-between overflow-hidden"
                  >
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

            {/* If I Ever Hurt You Again */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-sm uppercase tracking-[0.5em] opacity-40 mb-20">If I Ever Hurt You Again</h2>
              <div className="flex flex-col gap-6 max-w-2xl w-full">
                {PROMISE_CARDS.map((card) => (
                  <motion.div 
                    key={card.id}
                    onClick={() => setActivePromise(activePromise === card.id ? null : card.id)}
                    className="glass p-12 rounded-3xl cursor-pointer border border-white/10 text-center"
                  >
                    <AnimatePresence mode="wait">
                      {activePromise === card.id ? (
                        <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-serif italic">
                          {card.content}
                        </motion.p>
                      ) : (
                        <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <span className="text-2xl font-serif block mb-2">{card.title}</span>
                          <TapCue text="Tap gently" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Optional Curiosity (NEW PHASE 5) */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-2xl font-serif mb-12">Still curious?</h2>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setCuriosityState('little')}
                  className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/5 transition-all text-sm tracking-widest uppercase"
                >
                  A little
                </button>
                <button 
                  onClick={() => setCuriosityState('good')}
                  className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/5 transition-all text-sm tracking-widest uppercase opacity-40"
                >
                  I’m good
                </button>
              </div>
              <AnimatePresence>
                {curiosityState === 'little' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-12 max-w-lg mx-auto">
                    <p className="font-serif italic text-lg leading-relaxed opacity-80">
                      {PHASE5_EXTRA_CURIOSITY}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Final Emotional Close - Presence Ending (NEW PHASE 5) */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center space-y-12">
              <div className="max-w-xl space-y-6">
                <p className="text-xl md:text-3xl font-serif font-light leading-relaxed">
                  This exists whether you open everything or not.
                </p>
                <p className="text-lg md:text-xl font-serif italic opacity-40">
                  I’m just here.
                </p>
              </div>
              <div className="h-60" />
            </section>

          </motion.div>
        )}

      </AnimatePresence>
      
      <div className={`fixed inset-0 pointer-events-none transition-all duration-1000 z-[-1] ${currentScene === Scene.ENTRY ? 'bg-transparent' : 'bg-black/40'}`} />
    </div>
  );
};

export default UIOverlay;
