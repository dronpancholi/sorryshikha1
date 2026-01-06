
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Scene, CornerNode, OptionalContainer } from '../types';
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
  MICRO_MESSAGES,
  CORNER_NODES,
  OPTIONAL_CONTAINERS,
  EXTRA_LAYER_CONTENT
} from '../constants';
import GlassCard from './GlassCard';

interface UIOverlayProps {
  onSceneChange: (scene: Scene) => void;
  isPaused: boolean;
  setIsPaused: (v: boolean) => void;
  dimLevel: number;
  setDimLevel: (v: number) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ onSceneChange, isPaused, setIsPaused, dimLevel, setDimLevel }) => {
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.ENTRY);
  const [progStep, setProgStep] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [showReassurance, setShowReassurance] = useState(false);
  const [activeClarification, setActiveClarification] = useState<string | null>(null);
  const [hadToResponse, setHadToResponse] = useState(false);
  const [valuesUnderstanding, setValuesUnderstanding] = useState(false);
  
  // Phase 5 States
  const [activeMicroMessage, setActiveMicroMessage] = useState<string | null>(null);
  const [activeCornerMsg, setActiveCornerMsg] = useState<{ id: string, msg: string } | null>(null);
  const [holdLine, setHoldLine] = useState<string | null>(null);
  const [openContainers, setOpenContainers] = useState<Set<string>>(new Set());
  const [extraLayerVisible, setExtraLayerVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

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

  // Phase 5: Floating Micro-Messages Logic
  useEffect(() => {
    const showRandomMsg = () => {
      const msg = MICRO_MESSAGES[Math.floor(Math.random() * MICRO_MESSAGES.length)];
      setActiveMicroMessage(msg);
      setTimeout(() => setActiveMicroMessage(null), 4000);
    };
    
    const interval = setInterval(() => {
      if (Math.random() > 0.5) showRandomMsg();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentScene === Scene.TRANSITION_TO_SCROLL) {
      const timer = setTimeout(() => {
        updateScene(Scene.PHASE_2);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentScene]);

  const toggleDoubt = (id: string) => {
    const next = new Set(revealedDoubts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedDoubts(next);
  };

  const toggleContainer = (id: string) => {
    const next = new Set(openContainers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenContainers(next);
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

  const handleCornerClick = (node: CornerNode) => {
    setActiveCornerMsg({ id: node.id, msg: node.message });
    setTimeout(() => setActiveCornerMsg(null), 3000);
  };

  const handleLongPress = (msg: string) => {
    setHoldLine(msg);
    setTimeout(() => setHoldLine(null), 3000);
  };

  return (
    <div className={`relative z-10 w-full ${currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP ? 'min-h-fit' : 'h-screen overflow-hidden'} flex flex-col items-center select-none`}>
      
      {/* Dim Overlay (Phase 5) */}
      <div 
        className="fixed inset-0 pointer-events-none z-[80] transition-colors duration-1000" 
        style={{ backgroundColor: `rgba(0,0,0,${dimLevel})` }} 
      />

      {/* Passive Progress Indicator (Phase 5) */}
      {(currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP) && (
        <motion.div 
          className="fixed top-0 left-0 right-0 h-[1px] bg-pink-500/30 z-[99] origin-left"
          style={{ scaleX }}
        />
      )}

      {/* Floating Micro-Messages (Phase 5) */}
      <AnimatePresence>
        {activeMicroMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[95] text-[10px] uppercase tracking-widest pointer-events-none italic"
            style={{ 
              top: `${Math.random() * 60 + 20}%`, 
              left: `${Math.random() * 60 + 20}%` 
            }}
          >
            {activeMicroMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner Interaction Nodes (Phase 5) */}
      {CORNER_NODES.map((node) => (
        <div 
          key={node.id} 
          className={`fixed z-[99] p-4 cursor-pointer group ${
            node.position === 'top-left' ? 'top-0 left-0' :
            node.position === 'top-right' ? 'top-0 right-0' :
            node.position === 'bottom-left' ? 'bottom-0 left-0' : 'bottom-0 right-0'
          }`}
          onClick={() => handleCornerClick(node)}
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-2 h-2 rounded-full bg-white/40 group-hover:bg-white/80 transition-colors"
          />
          <span className="absolute hidden group-hover:block text-[8px] uppercase tracking-widest opacity-40 mt-2 whitespace-nowrap">Tap</span>
        </div>
      ))}

      <AnimatePresence>
        {activeCornerMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] glass p-6 rounded-2xl text-xs uppercase tracking-[0.3em] opacity-70 pointer-events-none"
          >
            {activeCornerMsg.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-Question Interactive Controls (Phase 5) */}
      {(currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP) && (
        <div className="fixed bottom-6 right-6 z-[99] flex flex-col gap-4 items-end opacity-20 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className="glass w-10 h-10 rounded-full flex items-center justify-center text-[8px] uppercase tracking-tighter"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button 
            onClick={() => setDimLevel(dimLevel === 0 ? 0.6 : 0)} 
            className="glass w-10 h-10 rounded-full flex items-center justify-center text-[8px] uppercase tracking-tighter"
          >
            {dimLevel === 0 ? 'Dim' : 'Back'}
          </button>
        </div>
      )}

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
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-center text-indigo-300 italic mb-8">
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
          <motion.div key="phase2plus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="w-full flex flex-col items-center pb-60">
            
            {/* Memory Wall */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-10 mt-20">
              <h2 className="text-sm uppercase tracking-[0.5em] opacity-40 mb-20 text-center">Things I Never Questioned</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {MEMORY_CARDS.map((card) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.02, rotate: 1, boxShadow: "0 0 40px rgba(163, 104, 70, 0.4)" }}
                    className="glass p-12 rounded-2xl text-center border border-white/10 flex flex-col items-center justify-center transition-all cursor-default"
                  >
                    <span className="text-xl md:text-2xl font-serif italic">{card.text}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Phase 5: Open if you want #1 */}
            <section className="min-h-[50vh] w-full flex flex-col items-center justify-center p-10">
              <div onClick={() => toggleContainer('opt1')} className="glass p-6 rounded-2xl cursor-pointer max-w-sm w-full text-center border-white/5 hover:border-white/10 transition-all">
                <span className="text-xs uppercase tracking-widest opacity-40">{OPTIONAL_CONTAINERS[0].title}</span>
                <p className="mt-2 text-[10px] opacity-20 uppercase tracking-tighter">Open if you want</p>
                <AnimatePresence>
                  {openContainers.has('opt1') && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 text-sm font-serif italic opacity-70">
                      {OPTIONAL_CONTAINERS[0].content}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
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

            {/* Truth Section with Long Press (Phase 5) */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center space-y-12">
              <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} transition={{ staggerChildren: 1.5 }}>
                <motion.h3 variants={lineVariants} className="text-2xl md:text-4xl font-serif font-light mb-4">I didn’t fail in love.</motion.h3>
                <motion.h3 variants={lineVariants} className="text-2xl md:text-4xl font-serif font-light opacity-60">I failed in expression.</motion.h3>
                <motion.div variants={lineVariants} className="pt-8">
                  <span className="text-lg md:text-xl font-medium tracking-widest uppercase block mb-4">And I’m owning that.</span>
                  
                  <div className="mt-12 flex flex-col items-center gap-2">
                    <motion.button 
                      onMouseDown={() => handleLongPress("I'm committed to doing better.")}
                      onTouchStart={() => handleLongPress("I'm committed to doing better.")}
                      className="px-6 py-2 border border-white/10 rounded-full text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
                    >
                      Press and hold
                    </motion.button>
                    <AnimatePresence>
                      {holdLine && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm italic text-pink-300">
                          {holdLine}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            </section>

            {/* Phase 5: Open if you want #2 */}
            <section className="min-h-[50vh] w-full flex flex-col items-center justify-center p-10">
              <div onClick={() => toggleContainer('opt2')} className="glass p-6 rounded-2xl cursor-pointer max-w-sm w-full text-center border-white/5 hover:border-white/10 transition-all">
                <span className="text-xs uppercase tracking-widest opacity-40">{OPTIONAL_CONTAINERS[1].title}</span>
                <p className="mt-2 text-[10px] opacity-20 uppercase tracking-tighter">Open if you want</p>
                <AnimatePresence>
                  {openContainers.has('opt2') && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 text-sm font-serif italic opacity-70">
                      {OPTIONAL_CONTAINERS[1].content}
                    </motion.p>
                  )}
                </AnimatePresence>
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

            {/* Interactive Assurance Slider */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
               <GlassCard className="max-w-md w-full !p-10">
                  <h3 className="text-xl font-serif mb-12">How sure am I about you?</h3>
                  <div className="relative w-full h-12 flex items-center">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={assuranceValue} 
                      onChange={(e) => setAssuranceValue(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-pink-400"
                    />
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] uppercase tracking-widest opacity-40">
                    <span>Certain</span>
                    <span>Still choosing</span>
                  </div>
                  <motion.p 
                    animate={{ opacity: assuranceValue > 80 ? 1 : 0.4 }}
                    className="mt-12 font-serif italic text-pink-200"
                  >
                    {assuranceValue < 30 ? "I'm fixed on you." : assuranceValue > 70 ? "Every day I decide again." : "You are the only choice."}
                  </motion.p>
               </GlassCard>
            </section>

            {/* Commitment Section */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-12 text-center">
              <div className="max-w-3xl space-y-8">
                <motion.h2 whileInView={{ scale: [1, 1.03, 1] }} transition={{ duration: 4, repeat: Infinity }} className="text-3xl md:text-5xl font-serif font-light">I chose you before.</motion.h2>
                <h2 className="text-3xl md:text-5xl font-serif font-light">I choose you now.</h2>
                <h2 className="text-3xl md:text-5xl font-serif font-semibold">And I’ll keep choosing you — without comparisons.</h2>
              </div>
            </section>

            {/* Values Section */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
               <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="max-w-3xl w-full">
                 <h2 className="text-sm uppercase tracking-[0.4em] opacity-40 mb-16">What I Actually Stand For</h2>
                 <div className="space-y-12">
                    {VALUES_TEXT.map((text, index) => (
                      <motion.p key={index} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: index * 0.6 }} viewport={{ once: true }} className={`font-serif text-xl md:text-3xl ${index === 2 ? "text-pink-200" : "text-white/90"}`}>{text}</motion.p>
                    ))}
                 </div>
                 <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 5 }} className="mt-20 flex flex-col items-center">
                   <GlassCard className="max-w-md w-full !p-8">
                     <p className="font-serif text-lg mb-6">Does this make sense to you?</p>
                     <div className="flex gap-4 justify-center">
                       <button className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm">Yes</button>
                       <button onClick={() => setValuesUnderstanding(true)} className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/5 transition-all text-sm opacity-70">I want to understand more</button>
                     </div>
                     <AnimatePresence>{valuesUnderstanding && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-pink-200/80 italic text-sm">Then I’ll explain, not defend.</motion.p>}</AnimatePresence>
                   </GlassCard>
                 </motion.div>
               </motion.div>
            </section>

            {/* Phase 5: Open if you want #3 */}
            <section className="min-h-[50vh] w-full flex flex-col items-center justify-center p-10">
              <div onClick={() => toggleContainer('opt3')} className="glass p-6 rounded-2xl cursor-pointer max-w-sm w-full text-center border-white/5 hover:border-white/10 transition-all">
                <span className="text-xs uppercase tracking-widest opacity-40">{OPTIONAL_CONTAINERS[2].title}</span>
                <p className="mt-2 text-[10px] opacity-20 uppercase tracking-tighter">Open if you want</p>
                <AnimatePresence>
                  {openContainers.has('opt3') && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 text-sm font-serif italic opacity-70">
                      {OPTIONAL_CONTAINERS[2].content}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* "You Matter" Interaction Zone */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-sm uppercase tracking-[0.4em] opacity-40 mb-16">Things I Never Wanted You to Doubt</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
                {DOUBT_TILES.map((tile) => (
                  <motion.div key={tile.id} onClick={() => toggleDoubt(tile.id)} whileHover={{ scale: 1.01 }} className="glass p-10 rounded-3xl cursor-pointer border border-white/10 h-[180px] flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                      {revealedDoubts.has(tile.id) ? (
                        <motion.p key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-serif italic">{tile.revealedText}</motion.p>
                      ) : (
                        <motion.div key="t" className="flex flex-col items-center">
                          <span className="text-xl font-serif">{tile.title}</span>
                          <TapCue text="Open this" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Reality & Effort Section */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center space-y-12">
              <div className="max-w-2xl w-full space-y-8">
                {REALITY_TEXT.map((text, idx) => (
                  <motion.p key={idx} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: idx * 0.8 }} className={`font-serif text-xl md:text-3xl ${idx === 5 ? "text-pink-300" : "opacity-50"}`}>{text}</motion.p>
                ))}
              </div>
            </section>

            {/* Emotional Close */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center space-y-12">
              <div className="max-w-xl space-y-6">
                <p className="text-lg md:text-2xl font-serif font-light leading-relaxed">I’m sorry for the moment I made you feel unheard. <br /> I’m sorry for not protecting your feelings better.</p>
                <p className="text-xl md:text-3xl font-serif italic text-white/90">You deserve certainty — not explanations.</p>
              </div>
              
              <AnimatePresence>
                {currentScene === Scene.PHASE_2 && (
                  <button onClick={() => updateScene(Scene.END_GAME_POPUP)} className="px-16 py-5 rounded-full glass border border-white/20 hover:border-white/60 transition-all tracking-[0.4em] uppercase text-xs font-light">
                    One last thing?
                  </button>
                )}
              </AnimatePresence>

              {endPopupStep === 5 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-12 mt-20">
                   <button onClick={() => setStillHere(true)} className="px-12 py-4 rounded-full border border-white/10 hover:border-white/30 transition-all text-xs tracking-widest uppercase opacity-40">I’m still here.</button>
                   {stillHere && <motion.div animate={{ height: [0, 80] }} className="w-[1px] bg-gradient-to-b from-pink-400 to-transparent" />}
                </motion.div>
              )}

              {/* Phase 5: Hidden Extra Layer Entry */}
              <div className="mt-40">
                <button 
                  onClick={() => setExtraLayerVisible(!extraLayerVisible)}
                  className="text-[10px] uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  There’s a little more here.
                </button>
                <AnimatePresence>
                  {extraLayerVisible && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 max-w-lg mx-auto p-10 glass rounded-3xl border-white/5">
                      <p className="font-serif italic text-lg leading-relaxed opacity-60">
                        {EXTRA_LAYER_CONTENT}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-60" />
            </section>

          </motion.div>
        )}

        {/* Updated End Game Popups */}
        {currentScene === Scene.END_GAME_POPUP && endPopupStep < 5 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <GlassCard className="max-w-md w-full text-center">
                {endPopupStep === 0 && (
                  <>
                    <h3 className="text-2xl font-serif mb-10">One last question?</h3>
                    <div className="flex gap-4">
                      <button onClick={() => setEndPopupStep(1)} className="flex-1 py-4 glass rounded-xl">Okay</button>
                      <button onClick={() => setEndPopupStep(1)} className="flex-1 py-4 glass rounded-xl">Go on</button>
                    </div>
                  </>
                )}

                {endPopupStep === 1 && (
                  <>
                    <h3 className="text-2xl font-serif mb-10">Do you feel chosen here?</h3>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => setEndPopupStep(2)} className="py-4 bg-white text-black font-semibold rounded-xl">Yes</button>
                      <button onClick={() => setEndPopupResponse('proc')} className="py-4 glass rounded-xl text-white/50">I’m still processing</button>
                    </div>
                    {endPopupResponse === 'proc' && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 italic text-sm text-pink-200">
                        That’s completely okay.
                        <button onClick={() => { setEndPopupResponse(null); setEndPopupStep(2); }} className="block mx-auto mt-4 underline opacity-40">Continue</button>
                      </motion.p>
                    )}
                  </>
                )}

                {endPopupStep === 2 && (
                  <>
                    <h3 className="text-2xl font-serif mb-10">Do you love me?</h3>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => setEndPopupStep(3)} className="py-4 bg-white text-black font-semibold rounded-xl">Yes</button>
                      <button onClick={() => setEndPopupResponse('idk')} className="py-4 glass rounded-xl text-white/50">I don’t know yet</button>
                    </div>
                    {endPopupResponse === 'idk' && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 italic text-sm text-pink-300">
                        Take your time. No pressure.
                        <button onClick={() => { setEndPopupResponse(null); setEndPopupStep(3); }} className="block mx-auto mt-4 underline opacity-40">Continue</button>
                      </motion.p>
                    )}
                  </>
                )}

                {endPopupStep === 3 && (
                  <>
                    <h3 className="text-2xl font-serif mb-10">Can I keep showing up like this?</h3>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => setEndPopupStep(5)} className="py-4 bg-white text-black font-semibold rounded-xl">Yes</button>
                      <button onClick={() => setEndPopupResponse('time-final')} className="py-4 glass rounded-xl text-white/50">Take your time</button>
                    </div>
                    {endPopupResponse === 'time-final' && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 italic text-lg text-pink-200">
                        I will.
                        <button onClick={() => { setEndPopupResponse(null); setEndPopupStep(5); }} className="block mx-auto mt-4 underline opacity-40">Okay</button>
                      </motion.p>
                    )}
                  </>
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
