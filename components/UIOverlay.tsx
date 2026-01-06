
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scene, ProgressionMessage } from '../types';
import { PROGRESSION_MESSAGES, NO_REBUTTALS, MEMORY_CARDS, CLARIFICATION_CARDS, VALUES_TEXT, DOUBT_TILES, REALITY_TEXT } from '../constants';
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
  const [hadToResponse, setHadToResponse] = useState(false);
  const [valuesUnderstanding, setValuesUnderstanding] = useState(false);
  
  // Phase 4 States
  const [revealedDoubts, setRevealedDoubts] = useState<Set<string>>(new Set());
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

  const toggleDoubt = (id: string) => {
    const next = new Set(revealedDoubts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedDoubts(next);
  };

  const handleNoClick = () => setNoCount(prev => prev + 1);

  const handleNotSureClick = () => {
    setShowReassurance(true);
    setTimeout(() => setShowReassurance(false), 4000);
  };

  const nextProgression = () => {
    if (progStep < PROGRESSION_MESSAGES.length - 1) {
      setProgStep(prev => prev + 1);
    } else {
      updateScene(Scene.QUESTION_1);
    }
  };

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
      <AnimatePresence mode="wait">
        
        {/* Phase 1 Scenes */}
        {currentScene === Scene.ENTRY && (
          <motion.div key="entry" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center text-center p-6">
            <motion.h1 
              whileHover={{ scale: 1.02 }} 
              className="text-3xl md:text-5xl font-serif font-light mb-12 tracking-wide leading-relaxed"
            >
              Hey Shikha... <br />
              <span className="opacity-70 text-2xl md:text-4xl">can you stay for a minute?</span>
            </motion.h1>
            <button onClick={() => updateScene(Scene.PROGRESSION)} className="px-12 py-4 rounded-full glass border border-white/20 hover:bg-white/10 transition-all duration-300 tracking-widest uppercase text-sm font-light">Continue</button>
          </motion.div>
        )}

        {currentScene === Scene.PROGRESSION && PROGRESSION_MESSAGES[progStep] && (
          <motion.div key={`prog-${progStep}`} variants={containerVariants} initial="initial" animate="animate" exit="exit" className="h-screen flex flex-col items-center justify-center text-center p-6 cursor-pointer" onClick={nextProgression}>
            <motion.h2 
              whileHover={{ x: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
              className="text-4xl md:text-6xl font-serif font-light italic opacity-90 transition-all duration-1000"
            >
              {PROGRESSION_MESSAGES[progStep].text}
            </motion.h2>
            <div className="mt-12 text-xs uppercase tracking-[0.3em] opacity-40 animate-pulse">Tap to continue</div>
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
                <button onClick={handleNotSureClick} className="w-full py-4 rounded-xl glass text-white/60 hover:text-white/90 transition-all border-white/10">I’m not sure</button>
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
          </motion.div>
        )}

        {/* Phase 2, 3 & 4: Full Scrollable Experience */}
        {(currentScene === Scene.PHASE_2 || currentScene === Scene.END_GAME_POPUP) && (
          <motion.div key="phase2plus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="w-full flex flex-col items-center pb-40">
            
            {/* 1. Memory Wall */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-10 mt-20">
              <h2 className="text-sm uppercase tracking-[0.5em] opacity-40 mb-20 text-center">Things I Never Questioned</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {MEMORY_CARDS.map((card) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.02, rotateY: 5, rotateX: 2, boxShadow: "0 0 40px rgba(163, 104, 70, 0.3)" }}
                    className="glass p-12 rounded-2xl text-center border border-white/10 flex items-center justify-center transition-all cursor-default"
                  >
                    <span className="text-xl md:text-2xl font-serif italic">{card.text}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 2. Truth Section */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center space-y-12">
              <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} transition={{ staggerChildren: 1.5 }}>
                <motion.h3 variants={lineVariants} className="text-2xl md:text-4xl font-serif font-light mb-4">I didn’t fail in love.</motion.h3>
                <motion.h3 variants={lineVariants} className="text-2xl md:text-4xl font-serif font-light opacity-60">I failed in expression.</motion.h3>
                <motion.div variants={lineVariants} className="pt-8">
                  <span className="text-lg md:text-xl font-medium tracking-widest uppercase">And I’m owning that.</span>
                </motion.div>
              </motion.div>
            </section>

            {/* 3. Interactive Clarification Cards */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6">
              <div className="flex flex-col md:flex-row gap-6 max-w-5xl w-full">
                {CLARIFICATION_CARDS.map((card) => (
                  <motion.div 
                    key={card.id}
                    whileHover={{ y: -5 }}
                    onClick={() => setActiveClarification(activeClarification === card.id ? null : card.id)}
                    className="flex-1 glass p-8 rounded-3xl cursor-pointer border border-white/10 hover:border-white/30 transition-all h-[300px] flex flex-col justify-between overflow-hidden relative"
                  >
                    <AnimatePresence mode="wait">
                      {activeClarification === card.id ? (
                        <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col justify-center text-center">
                          <p className="text-lg font-serif italic">{card.content}</p>
                          <span className="mt-8 text-[10px] uppercase tracking-widest opacity-30">Tap to close</span>
                        </motion.div>
                      ) : (
                        <motion.div key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col justify-center text-center">
                          <h4 className="text-sm uppercase tracking-[0.3em] opacity-50 mb-4">Focus</h4>
                          <span className="text-xl md:text-2xl font-serif">{card.title}</span>
                          <span className="mt-8 text-[10px] uppercase tracking-widest opacity-30">Tap to reveal</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 4. Choice Reinforcement */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6">
               <GlassCard className="max-w-md w-full text-center">
                  <h3 className="text-2xl font-serif mb-12">Do you know why I’m here?</h3>
                  <div className="space-y-4">
                    <button onClick={() => setHadToResponse(false)} className="w-full py-4 rounded-xl border border-white/20 hover:bg-white/10 transition-all font-medium">Because you chose me</button>
                    <button onClick={() => setHadToResponse(true)} className="w-full py-4 rounded-xl border border-white/10 hover:border-white/5 transition-all text-white/50">Because you had to</button>
                  </div>
                  <AnimatePresence>{hadToResponse && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-indigo-300 italic">I wouldn’t build this if I didn’t want to be here.</motion.p>}</AnimatePresence>
               </GlassCard>
            </section>

            {/* 5. Commitment Section */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-12 text-center">
              <div className="max-w-3xl space-y-8">
                <motion.h2 whileInView={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="text-3xl md:text-5xl font-serif font-light">I chose you before.</motion.h2>
                <h2 className="text-3xl md:text-5xl font-serif font-light">I choose you now.</h2>
                <h2 className="text-3xl md:text-5xl font-serif font-semibold">And I’ll keep choosing you — without comparisons.</h2>
              </div>
            </section>

            {/* Values Section */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
               <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-10%" }} className="max-w-3xl w-full">
                 <h2 className="text-sm uppercase tracking-[0.4em] opacity-40 mb-16">What I Actually Stand For</h2>
                 <div className="space-y-12">
                    {VALUES_TEXT.map((text, index) => (
                      <motion.p key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: index * 0.8 }} viewport={{ once: true }} className={`font-serif text-xl md:text-3xl leading-relaxed ${index === 2 ? "text-indigo-200" : "text-white/90"}`}>{text}</motion.p>
                    ))}
                 </div>
                 <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 6 }} className="mt-20 flex flex-col items-center">
                   <GlassCard className="max-w-md w-full !p-8">
                     <p className="font-serif text-lg mb-6">Does this make sense to you?</p>
                     <div className="flex gap-4 justify-center">
                       <button className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm">Yes</button>
                       <button onClick={() => setValuesUnderstanding(true)} className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/5 transition-all text-sm opacity-70">I want to understand more</button>
                     </div>
                     <AnimatePresence>{valuesUnderstanding && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 text-orange-200/80 italic text-sm">Then I’ll explain, not defend.</motion.p>}</AnimatePresence>
                   </GlassCard>
                 </motion.div>
               </motion.div>
            </section>

            {/* NEW: C. “YOU MATTER” INTERACTION ZONE */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-sm uppercase tracking-[0.4em] opacity-40 mb-16">Things I Never Wanted You to Doubt</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
                {DOUBT_TILES.map((tile) => (
                  <motion.div 
                    key={tile.id}
                    onClick={() => toggleDoubt(tile.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass p-10 rounded-3xl cursor-pointer border border-white/10 relative overflow-hidden h-[180px] flex items-center justify-center"
                  >
                    <AnimatePresence mode="wait">
                      {revealedDoubts.has(tile.id) ? (
                        <motion.p key="revealed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-lg md:text-xl font-serif italic text-bronze-200">
                          {tile.revealedText}
                        </motion.p>
                      ) : (
                        <motion.span key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-lg md:text-2xl font-serif">
                          {tile.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 6. Effort Showcase */}
            <section className="h-[40vh] w-full flex items-center justify-center">
              <p className="text-xs uppercase tracking-[0.5em] opacity-30 text-center max-w-xs leading-loose">This took time. <br /> Not to impress you — <br /> but because you’re worth effort.</p>
            </section>

            {/* NEW: E. REALITY & EFFORT SECTION */}
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center space-y-12">
              <div className="max-w-2xl w-full space-y-8">
                {REALITY_TEXT.map((text, idx) => (
                  <motion.p 
                    key={idx} 
                    initial={{ opacity: 0 }} 
                    whileInView={{ opacity: 1 }} 
                    transition={{ duration: 1.5, delay: idx * 1 }} 
                    viewport={{ once: true }} 
                    className={`font-serif text-xl md:text-3xl ${idx === 3 || idx === 5 ? "text-orange-200 font-medium" : "opacity-60"}`}
                  >
                    {text}
                  </motion.p>
                ))}
              </div>
            </section>

            {/* 7. Emotional Close (Modified to trigger popups) */}
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

              {/* Final Presence Interaction */}
              <AnimatePresence>
                {endPopupStep === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-12 mt-20">
                     <button 
                       onClick={() => setStillHere(true)}
                       className="px-12 py-4 rounded-full border border-white/10 hover:border-white/30 transition-all text-xs tracking-widest uppercase opacity-40 hover:opacity-100"
                     >
                       I’m still here.
                     </button>
                     {stillHere && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-1 h-20 bg-gradient-to-b from-orange-400 to-transparent rounded-full" />
                     )}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="h-40" />
            </section>

          </motion.div>
        )}

        {/* NEW: D. PLAYFUL BUT WARM POP-UPS (END GAME) */}
        {currentScene === Scene.END_GAME_POPUP && endPopupStep < 3 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <GlassCard className="max-w-md w-full text-center">
                {endPopupStep === 0 && (
                  <>
                    <h3 className="text-2xl font-serif mb-10">Can I ask you something honestly?</h3>
                    <div className="flex gap-4">
                      <button onClick={() => setEndPopupStep(1)} className="flex-1 py-4 glass rounded-xl hover:bg-white/10">Okay</button>
                      <button onClick={() => setEndPopupStep(1)} className="flex-1 py-4 glass rounded-xl hover:bg-white/10">Hmm…</button>
                    </div>
                  </>
                )}

                {endPopupStep === 1 && (
                  <>
                    <h3 className="text-2xl font-serif mb-10">Do you love me?</h3>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => setEndPopupStep(2)} className="py-4 bg-white text-black font-semibold rounded-xl hover:scale-[1.02] transition-transform">Yes</button>
                      <button onClick={() => setEndPopupResponse('love-doubt')} className="py-4 glass rounded-xl text-white/60">I don’t know</button>
                    </div>
                    {endPopupResponse === 'love-doubt' && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 italic text-sm text-indigo-300">
                        That’s okay. Love isn’t a button. It’s a process.
                        <button onClick={() => { setEndPopupResponse(null); setEndPopupStep(2); }} className="block mx-auto mt-4 text-xs underline opacity-50">Continue</button>
                      </motion.p>
                    )}
                  </>
                )}

                {endPopupStep === 2 && (
                  <>
                    <h3 className="text-2xl font-serif mb-10">Will you let me keep choosing you?</h3>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => setEndPopupStep(3)} className="py-4 bg-white text-black font-semibold rounded-xl">Yes</button>
                      <button onClick={() => setEndPopupResponse('time')} className="py-4 glass rounded-xl text-white/60">Take your time</button>
                    </div>
                    {endPopupResponse === 'time' && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 italic text-lg text-orange-200">
                        I will.
                        <button onClick={() => { setEndPopupResponse(null); setEndPopupStep(3); }} className="block mx-auto mt-4 text-xs underline opacity-50">Okay</button>
                      </motion.p>
                    )}
                  </>
                )}
              </GlassCard>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
      
      {/* Dynamic Background Shade */}
      <div className={`fixed inset-0 pointer-events-none transition-colors duration-1000 z-[-1] ${currentScene === Scene.ENTRY || currentScene === Scene.PROGRESSION ? 'bg-transparent' : 'bg-black/40'}`} />
    </div>
  );
};

export default UIOverlay;
