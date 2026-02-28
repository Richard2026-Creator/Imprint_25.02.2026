import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Undo2, Volume2, VolumeX, X, Heart } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { LibraryImage, StudioSettings, SessionResult, SwipeDecision } from '../types';
import { SwipeCard } from '../components/SwipeCard';
import { analyzeSession } from '../services/intelligence';

interface DiscoveryProps {
  library: LibraryImage[];
  settings: StudioSettings;
  clientName?: string;
  onComplete: (result: SessionResult) => void;
  onCancel: () => void;
}

const cardVariants = {
  enter: {
    scale: 0.96,
    opacity: 0,
  },
  center: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 220,
      damping: 28,
      mass: 1
    }
  },
  exit: (direction: 'left' | 'right' | null) => ({
    x: direction === 'right' ? 1000 : direction === 'left' ? -1000 : 0,
    rotate: direction === 'right' ? 15 : direction === 'left' ? -15 : 0,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 24
    }
  })
};

interface DiscoveryCardProps {
  image: LibraryImage;
  lastDirection: 'left' | 'right' | null;
  onSwipe: (direction: 'left' | 'right') => void;
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ image, lastDirection, onSwipe }) => {
  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 200], [-15, 15]);
  const opacity = useTransform(dragX, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
  const preferOpacity = useTransform(dragX, [0, 100], [0, 1]);
  const rejectOpacity = useTransform(dragX, [0, -100], [0, 1]);

  return (
    <motion.div
      key={image.id}
      custom={lastDirection}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      drag="x"
      style={{ x: dragX, rotate, opacity }}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1.1}
      onDragEnd={(_, info) => {
        const threshold = 100;
        const velocityThreshold = 400;
        if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
          onSwipe('right');
        } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
          onSwipe('left');
        }
      }}
      className="absolute w-[calc(100%-3rem)] h-[42vh] md:w-[400px] md:h-[400px] md:max-h-[55vh] flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
    >
      <SwipeCard image={image} />
      <motion.div style={{ opacity: preferOpacity }} className="absolute top-10 right-10 bg-[#faf8f2]/90 backdrop-blur rounded-full p-4 ios-shadow pointer-events-none">
        <Heart size={32} className="text-[#3d3935] fill-[#3d3935]" />
      </motion.div>
      <motion.div style={{ opacity: rejectOpacity }} className="absolute top-10 left-10 bg-[#faf8f2]/90 backdrop-blur rounded-full p-4 ios-shadow pointer-events-none">
        <X size={32} className="text-[#a39e93]" />
      </motion.div>
    </motion.div>
  );
};

export const Discovery: React.FC<DiscoveryProps> = ({ library, settings, clientName, onComplete, onCancel }) => {
  const [sessionStack, setSessionStack] = useState<LibraryImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<SwipeDecision[]>([]);
  const [lastDecisionTime, setLastDecisionTime] = useState(Date.now());
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [undoAvailable, setUndoAvailable] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };
    if (showVolumeSlider) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVolumeSlider]);
  const [lastDirection, setLastDirection] = useState<'left' | 'right' | null>(null);
  const [undoUsedForCurrent, setUndoUsedForCurrent] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSwipeSound = useCallback(async () => {
    if (isMuted || volume === 0) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Use triangle wave for a softer but more audible "thump" than sine
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

      const targetGain = volume * 0.4;
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }, [isMuted, volume]);

  useEffect(() => {
    const activePool = library.filter(img => img.isActive !== false);
    const randomized = [...activePool].sort(() => Math.random() - 0.5);
    setSessionStack(randomized.slice(0, settings.sessionLength));
    setLastDecisionTime(Date.now());

    // Pre-initialize and UNLOCK audio context on first user interaction
    const initAudio = () => {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create and play a tiny silent buffer to unlock the context
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      // Remove listeners
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('click', initAudio);
    };

    window.addEventListener('pointerdown', initAudio);
    window.addEventListener('touchstart', initAudio);
    window.addEventListener('click', initAudio);

    return () => {
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('click', initAudio);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [library, settings]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const now = Date.now();
    const currentImg = sessionStack[currentIndex];

    setLastDirection(direction);

    const decision: SwipeDecision = {
      imageId: currentImg.id,
      direction,
      responseTimeMs: now - lastDecisionTime,
      undoUsed: undoUsedForCurrent,
      roomType: currentImg.roomType,
      styleCategories: currentImg.styleCategories,
    };

    const newDecisions = [...decisions, decision];
    setDecisions(newDecisions);
    setUndoAvailable(true);
    setUndoUsedForCurrent(false);
    playSwipeSound();

    if (currentIndex < sessionStack.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setLastDecisionTime(now);
    } else {
      const summary = analyzeSession(newDecisions, settings.categories);
      onComplete({
        id: crypto.randomUUID(),
        date: Date.now(),
        clientName,
        decisions: newDecisions,
        summary,
      });
    }
  };

  const handleUndo = () => {
    if (!undoAvailable || currentIndex === 0) return;
    setLastDirection(null);
    setDecisions(prev => prev.slice(0, -1));
    setCurrentIndex(prev => prev - 1);
    setUndoAvailable(false);
    setUndoUsedForCurrent(true);
    setLastDecisionTime(Date.now());
  };

  if (sessionStack.length === 0) return null;

  const progressPercentage = (currentIndex / sessionStack.length) * 100;

  return (
    <div className="fixed inset-0 bg-[#f4f1ea] z-[60] flex flex-col overflow-hidden">
      <div className="pt-18 pb-6 px-6 bg-[#f4f1ea]/95 backdrop-blur-md z-[100] ios-shadow border-b border-[#dfd9ce]">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onCancel} className="p-2 -ml-2 text-[#a39e93] active:scale-90 transition-transform">
            <X size={20} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#a39e93]">Discovery</span>
            <span className="serif text-xs italic mt-0.5">{clientName ? `Vision for ${clientName}` : 'Explore your vision'}</span>
          </div>
          <div className="relative" ref={volumeRef}>
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 -mr-2 text-[#a39e93] active:scale-90 transition-transform"
            >
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 p-3 bg-[#faf8f2] border border-[#dfd9ce] rounded-2xl ios-shadow z-[110] flex flex-col items-center gap-3"
                >
                  <div className="h-24 w-8 relative flex items-center justify-center">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setVolume(val);
                        if (val > 0) setIsMuted(false);
                      }}
                      className="absolute w-20 h-1 -rotate-90 appearance-none bg-[#ede8df] rounded-full cursor-pointer accent-[#3d3935]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-full hover:bg-[#ede8df] transition-colors flex items-center justify-center"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button
                      onClick={() => playSwipeSound()}
                      className="text-[8px] font-bold uppercase tracking-widest text-[#3d3935] hover:underline"
                    >
                      Test
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-4 space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-[#c9c4b9]">Progress</span>
            <div className="flex items-baseline gap-1">
              <span className="serif text-lg text-[#3d3935] leading-none tabular-nums">{currentIndex + 1}</span>
              <span className="text-[8px] font-bold text-[#c9c4b9] tracking-widest leading-none">/ {sessionStack.length}</span>
            </div>
          </div>
          <div className="h-[2px] w-full bg-[#ede8df] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#3d3935]"
              initial={false}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 relative px-6 overflow-visible grid place-items-center">
        {/* Background card to create the "deck" feel */}
        {currentIndex + 1 < sessionStack.length && (
          <div className="absolute w-[calc(100%-3rem)] h-[42vh] md:w-[400px] md:h-[400px] md:max-h-[55vh] flex items-center justify-center pointer-events-none">
            <div className="w-full h-full bg-[#ede8df] rounded-[3.5rem] overflow-hidden ios-shadow border border-[#dfd9ce] opacity-40 scale-[0.96]">
              <img src={sessionStack[currentIndex + 1].url} className="w-full h-full object-cover grayscale blur-[1px]" />
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout" custom={lastDirection}>
          <DiscoveryCard
            key={sessionStack[currentIndex].id}
            image={sessionStack[currentIndex]}
            lastDirection={lastDirection}
            onSwipe={handleSwipe}
          />
        </AnimatePresence>
      </div>

      <div className="pb-16 pt-8 flex justify-center items-center gap-10 bg-[#f4f1ea] z-[80]">
        <button onClick={() => handleSwipe('left')} className="flex flex-col items-center gap-2 group transition-all">
          <div className="w-16 h-16 rounded-full border border-[#dfd9ce] flex items-center justify-center text-[#c9c4b9] bg-[#faf8f2] ios-shadow active:scale-90 hover:text-[#3d3935] hover:border-[#dfd9ce] transition-all">
            <X size={28} strokeWidth={1} />
          </div>
          <span className="text-[8px] uppercase tracking-widest font-bold text-[#a39e93]">Reject</span>
        </button>
        <button onClick={handleUndo} disabled={!undoAvailable} className={`flex flex-col items-center gap-2 transition-all ${undoAvailable ? 'opacity-100' : 'opacity-20 grayscale cursor-not-allowed'}`}>
          <div className="w-12 h-12 rounded-full border border-[#3d3935] flex items-center justify-center text-[#3d3935] bg-[#faf8f2] ios-shadow active:scale-90 transition-transform">
            <Undo2 size={18} strokeWidth={1.5} />
          </div>
          <span className="text-[8px] uppercase tracking-widest font-bold">Undo</span>
        </button>
        <button onClick={() => handleSwipe('right')} className="flex flex-col items-center gap-2 group transition-all">
          <div className="w-16 h-16 rounded-full border border-[#dfd9ce] flex items-center justify-center text-[#3d3935] bg-[#faf8f2] ios-shadow active:scale-90 hover:border-[#dfd9ce] transition-all">
            <Heart size={28} strokeWidth={1} className="group-hover:fill-[#3d3935] group-active:fill-[#3d3935] transition-colors" />
          </div>
          <span className="text-[8px] uppercase tracking-widest font-bold text-[#3d3935]">Prefer</span>
        </button>
      </div>
    </div>
  );
};