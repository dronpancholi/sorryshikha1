
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
}

const UIOverlay: React.FC<UIOverlayProps> = ({ onSceneChange }) => {
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.ENTRY);
  const [progStep, setProgStep] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [showReassurance, setShowReassurance] = useState(false);
  const [activeClarification, setActiveClarification] = useState<string | null>(null);
  const [valuesUnderstanding, setValuesUnderstanding] = useState(false);
  
  // Phase 5 States
  const [activeMicroMessage, setActiveMicroMessage] = useState<string | null>(null);
  const [activeCornerMsg, setActiveCornerMsg] = useState<{ id: string, msg: string } | null>(null);
  const [holdLine, setHoldLine] = useState<string | null>(null);
  const [isHoldingAgreement, setIsHoldingAgreement] = useState(false);
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
      animate={{ opacity: [0.2, 0.5, 0.2] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      className="text-[10px] uppercase tracking-[0.2em] opacity-40 mt-4 block"
    >
      {text}
    </motion.span>
  );

  // Cast to any to avoid complex type errors when spreading transition.ease arrays onto motion components
  const sectionVariants = {
    initial: { opacity: 0, y: 40, scale: 0.98 },
    whileInView: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
    },
    viewport: { once: false, amount: 0.2 }
  } as any;

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
      
      {/* Screen Warming Overlay for Silent Agreement */}
      <motion.div 
        animate={{ opacity: isHoldingAgreement ? 0.3 : 0 }} 
        className="fixed inset-0 bg-pink-500/10 pointer-events-none z-50 transition-opacity duration-700" 
      />

      {/* Passive Progress Indicator */}
      {(currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP) && (
        <motion.div 
          className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 to-rose-400 z-[99] origin-left shadow-[0_0_10px_rgba(236,72,153,0.5)]"
          style={{ scaleX }}
        />
      )}

      {/* Floating Micro-Messages */}
      <AnimatePresence>
        {activeMicroMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 0.5, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="fixed z-[95] text-[10px] uppercase tracking-widest pointer-events-none italic font-light text-pink-100"
            style={{ 
              top: `${Math.random() * 60 + 20}%`, 
              left: `${Math.random() * 60 + 20}%` 
            }}
          >
            {activeMicroMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner Interaction Nodes */}
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
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-3 h-3 rounded-full bg-white/40 group-hover:bg-pink-400 transition-colors shadow-lg"
          />
        </div>
      ))}

      <AnimatePresence mode="wait">
        {/* Phase 1 Scenes */}
        {currentScene === Scene.ENTRY && (
          <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen flex flex-col items-center justify-center text-center p-6">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              className="text-3xl md:text-5xl font-serif font-light mb-12 tracking-wide leading-relaxed"
            >
              Hey Shikha... <br />
              <span className="opacity-70 text-2xl md:text-4xl">can you stay for a minute?</span>
            </motion.h1>
            <motion.button 
              whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => updateScene(Scene.PROGRESSION)} 
              className="px-12 py-4 rounded-full glass border border-white/20 hover:bg-white/10 transition-all duration-300 tracking-widest uppercase text-sm font-light"
            >
              Continue
            </motion.button>
            <TapCue text="Tap when ready" />
          </motion.div>
        )}

        {currentScene === Scene.PROGRESSION && PROGRESSION_MESSAGES[progStep] && (
          <motion.div key={`prog-${progStep}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="h-screen flex flex-col items-center justify-center text-center p-6 cursor-pointer" onClick={nextProgression}>
            <motion.h2 
              whileHover={{ scale: 1.02 }}
              className="text-4xl md:text-6xl font-serif font-light italic opacity-90"
            >
              {PROGRESSION_MESSAGES[progStep].text}
            </motion.h2>
            <TapCue text="Tap to continue" />
          </motion.div>
        )}

        {currentScene === Scene.QUESTION_1 && (
          <motion.div key="q1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-screen flex flex-col items-center justify-center w-full max-w-lg p-6">
            <GlassCard className="hover:border-pink-500/30 transition-colors">
              <h3 className="text-2xl font-serif text-center mb-10 leading-relaxed">
                {noCount === 0 ? "Do you know how important you are to me?" : NO_REBUTTALS[(noCount - 1) % NO_REBUTTALS.length]}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center h-20">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => updateScene(Scene.LOYALTY)} className="px-10 py-3 rounded-full bg-white text-black font-medium hover:bg-pink-50 transition-colors">Yes</motion.button>
                <motion.button whileHover={{ x: [0, -5, 5, 0] }} onClick={handleNoClick} style={{ transform: `scale(${Math.max(0.4, 1 - noCount * 0.15)})`, opacity: Math.max(0.3, 1 - noCount * 0.1) }} className="px-10 py-3 rounded-full border border-white/30 text-white/70 hover:bg-white/5 transition-all">
                  {noCount > 0 ? "Not yet" : "No"}
                </motion.button>
              </div>
              <div className="text-center mt-6">
                <TapCue text="Your choice matters" />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Phase 2+ Scrollable Experience */}
        {(currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP) && (
          <motion.div key="phase2plus" className="w-full flex flex-col items-center pb-60">
            
            {/* Memory Wall */}
            <motion.section 
              {...sectionVariants}
              className="min-h-screen w-full flex flex-col items-center justify-center p-10 mt-20"
            >
              <h2 className="text-sm uppercase tracking-[0.5em] opacity-40 mb-20 text-center">Things I Never Questioned</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Added missing index parameter to map callback */}
                {MEMORY_CARDS.map((card, index) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ 
                      scale: 1.05, 
                      rotate: index % 2 === 0 ? 1 : -1,
                      boxShadow: "0 20px 40px rgba(236, 72, 153, 0.15)",
                      borderColor: "rgba(236, 72, 153, 0.3)"
                    }}
                    className="glass p-12 rounded-2xl text-center border border-white/10 flex flex-col items-center justify-center transition-all cursor-default"
                  >
                    <span className="text-xl md:text-2xl font-serif italic">{card.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Optional Containers */}
            <motion.section {...sectionVariants} className="min-h-[50vh] w-full flex flex-col items-center justify-center p-10">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleContainer('opt1')} 
                className="glass p-8 rounded-3xl cursor-pointer max-w-sm w-full text-center border-white/5 hover:border-pink-500/20 transition-all"
              >
                <span className="text-xs uppercase tracking-widest opacity-40">{OPTIONAL_CONTAINERS[0].title}</span>
                <p className="mt-2 text-[10px] opacity-20 uppercase tracking-tighter">Open if you want</p>
                <AnimatePresence>
                  {openContainers.has('opt1') && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 text-sm font-serif italic opacity-70 leading-relaxed">
                      {OPTIONAL_CONTAINERS[0].content}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.section>

            {/* Little Things Noticed */}
            <motion.section {...sectionVariants} className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-sm uppercase tracking-[0.5em] opacity-40 mb-20">Little Things I Noticed</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
                {NOTICE_CARDS.map((card) => (
                  <motion.div 
                    key={card.id}
                    whileHover={{ scale: 1.03, borderColor: "rgba(236,72,153,0.3)" }}
                    onClick={() => setActiveNotice(activeNotice === card.id ? null : card.id)}
                    className="glass p-10 rounded-3xl cursor-pointer border border-white/10 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden transition-all shadow-md hover:shadow-pink-900/10"
                  >
                    <AnimatePresence mode="wait">
                      {activeNotice === card.id ? (
                        <motion.p key="c" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="text-lg font-serif italic text-pink-50">
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
            </motion.section>

            {/* Long Press Interaction */}
            <motion.section {...sectionVariants} className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center space-y-12">
              <div className="max-w-2xl w-full">
                <h3 className="text-2xl md:text-4xl font-serif font-light mb-4">I didn’t fail in love.</h3>
                <h3 className="text-2xl md:text-4xl font-serif font-light opacity-60">I failed in expression.</h3>
                <div className="mt-16 flex flex-col items-center gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                      whileTap={{ scale: 0.95 }}
                      onMouseDown={() => handleLongPress("I'm committed to doing better.")}
                      onTouchStart={() => handleLongPress("I'm committed to doing better.")}
                      className="px-8 py-3 border border-white/10 rounded-full text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                    >
                      Press and hold to hear a promise
                    </motion.button>
                    <AnimatePresence>
                      {holdLine && (
                        <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm italic text-pink-300 font-serif">
                          {holdLine}
                        </motion.p>
                      )}
                    </AnimatePresence>
                </div>
              </div>
            </motion.section>

            {/* If I Ever Hurt You Again */}
            <motion.section {...sectionVariants} className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-sm uppercase tracking-[0.5em] opacity-40 mb-20">If I Ever Hurt You Again</h2>
              <div className="flex flex-col gap-6 max-w-2xl w-full">
                {PROMISE_CARDS.map((card) => (
                  <motion.div 
                    key={card.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => setActivePromise(activePromise === card.id ? null : card.id)}
                    className="glass p-12 rounded-3xl cursor-pointer border border-white/10 text-center transition-all hover:bg-white/[0.05]"
                  >
                    <AnimatePresence mode="wait">
                      {activePromise === card.id ? (
                        <motion.p key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-serif italic text-pink-100">
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
            </motion.section>

            {/* Assurance Slider */}
            <motion.section {...sectionVariants} className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
               <GlassCard className="max-w-md w-full !p-12 hover:shadow-2xl transition-shadow">
                  <h3 className="text-xl font-serif mb-12">How sure am I about you?</h3>
                  <div className="relative w-full h-12 flex items-center">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={assuranceValue} 
                      onChange={(e) => setAssuranceValue(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] uppercase tracking-widest opacity-40">
                    <span>Certain</span>
                    <span>Still choosing</span>
                  </div>
                  <motion.p 
                    animate={{ scale: [1, 1.02, 1], opacity: assuranceValue > 80 ? 1 : 0.6 }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="mt-12 font-serif italic text-pink-200"
                  >
                    {assuranceValue < 30 ? "I'm fixed on you." : assuranceValue > 70 ? "Every day I decide again." : "You are the only choice."}
                  </motion.p>
               </GlassCard>
            </motion.section>

            {/* Hidden Extra Layer */}
            <motion.section {...sectionVariants} className="mt-40 text-center pb-40">
                <motion.button 
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  onClick={() => setExtraLayerVisible(!extraLayerVisible)}
                  className="text-[10px] uppercase tracking-widest opacity-20 transition-all cursor-pointer border-b border-white/5 pb-2"
                >
                  There’s a little more here.
                </motion.button>
                <AnimatePresence>
                  {extraLayerVisible && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="mt-12 max-w-lg mx-auto p-12 glass rounded-3xl border-white/10 shadow-xl">
                      <p className="font-serif italic text-lg leading-relaxed opacity-60 text-pink-50">
                        {EXTRA_LAYER_CONTENT}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
            </motion.section>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UIOverlay;
