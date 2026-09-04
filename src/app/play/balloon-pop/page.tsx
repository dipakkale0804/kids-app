"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import confetti from "canvas-confetti";

const BALLOON_COLORS = [
  "bg-red-500", "bg-blue-500", "bg-emerald-500", "bg-yellow-400", "bg-purple-500", "bg-pink-500"
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type Balloon = {
  id: number;
  letter: string;
  color: string;
  left: number; // percentage
  speed: number;
  delay: number;
};

export default function BalloonPopGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [startTime] = useState(Date.now());
  const [targetLetter, setTargetLetter] = useState("A");
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [balloonIdCounter, setBalloonIdCounter] = useState(0);

  const WIN_SCORE = 5;

  // Initialize target
  useEffect(() => {
    generateTarget();
  }, []);

  // Continuous balloon generation
  useEffect(() => {
    if (gameOver) return;

    const spawnInterval = setInterval(() => {
      setBalloons(prev => {
        // Keep max 15 balloons on screen at a time
        if (prev.length > 15) return prev.filter((_, i) => i > 0); 
        
        // 30% chance to spawn the target letter, otherwise random
        const isTarget = Math.random() < 0.3;
        const letter = isTarget 
          ? targetLetter 
          : ALPHABET[Math.floor(Math.random() * ALPHABET.length)];

        const newBalloon: Balloon = {
          id: balloonIdCounter,
          letter,
          color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
          left: Math.floor(Math.random() * 80) + 10, // 10% to 90%
          speed: Math.random() * 5 + 5, // 5 to 10 seconds to float up
          delay: Math.random() * 1,
        };
        
        setBalloonIdCounter(c => c + 1);
        return [...prev, newBalloon];
      });
    }, 1200); // spawn every 1.2 seconds

    return () => clearInterval(spawnInterval);
  }, [gameOver, targetLetter, balloonIdCounter]);

  const generateTarget = () => {
    const randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    setTargetLetter(randomLetter);
  };

  const handlePop = (id: number, letter: string) => {
    if (gameOver) return;

    // Remove the balloon
    setBalloons(prev => prev.filter(b => b.id !== id));

    if (letter === targetLetter) {
      playPop();
      const newScore = score + 1;
      setScore(newScore);

      if (newScore >= WIN_SCORE) {
        setGameOver(true);
        playLevelUp();
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        
        logActivity({
          topic: "Balloon Pop",
          durationMinutes: Math.max(1, Math.ceil((Date.now() - startTime) / 60000)),
          score: 100
        });
        addXp(100);
      } else {
        // Generate new target after a successful pop to keep it fresh
        generateTarget();
      }
    } else {
      playIncorrect();
    }
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border-2 border-slate-100 text-center max-w-sm w-full"
        >
          <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Level Cleared!</h1>
          <p className="text-lg text-slate-500 font-bold mb-6">You earned 100 XP!</p>
          <Button 
            size="lg"
            onClick={() => router.push('/adventure')}
            className="w-full h-12 rounded-full font-bold text-lg shadow-md bg-indigo-500 hover:bg-indigo-600"
          >
            Continue Adventure
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[85vh] bg-sky-100 dark:bg-sky-950 rounded-3xl shadow-2xl border-4 border-slate-800 overflow-hidden relative flex flex-col">
        <header className="flex justify-between items-center p-4 relative z-20">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/adventure')}
          className="rounded-full font-bold bg-white/50 hover:bg-white/80 backdrop-blur-sm text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit Game
        </Button>
        
        <div className="bg-white px-6 py-2 rounded-full shadow-md border-2 border-sky-200">
          <span className="text-slate-500 font-bold mr-2 text-lg">Find:</span>
          <span className="text-2xl font-bold text-sky-500 drop-shadow-sm">{targetLetter}</span>
        </div>

        <div className="bg-white px-5 py-2 rounded-full shadow-md border-2 border-sky-200 font-bold text-lg text-slate-700">
          Score: {score}/{WIN_SCORE}
        </div>
      </header>

      {/* Floating Clouds Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ x: [0, 1000, 0] }} 
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 text-6xl opacity-40 drop-shadow-md"
        >☁️</motion.div>
        <motion.div 
          animate={{ x: [0, -800, 0] }} 
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-20 text-8xl opacity-30 drop-shadow-md"
        >☁️</motion.div>
        <motion.div 
          animate={{ x: [0, 600, 0] }} 
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 left-1/3 text-7xl opacity-50 drop-shadow-md"
        >☁️</motion.div>
      </div>

      {/* Balloon Play Area */}
      <main className="flex-1 relative z-10 w-full max-w-5xl mx-auto h-full">
        <AnimatePresence>
          {balloons.map((b) => (
            <motion.div
              key={b.id}
              initial={{ top: '110%', opacity: 0, x: 0 }}
              animate={{ 
                top: '-20%', 
                opacity: 1,
                x: [0, 30, -30, 20, -20, 0] // Swaying effect
              }}
              exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)", transition: { duration: 0.2 } }}
              transition={{ 
                top: { duration: b.speed, delay: b.delay, ease: "linear" },
                x: { duration: b.speed, delay: b.delay, ease: "easeInOut", repeat: Infinity },
                opacity: { duration: 0.5, delay: b.delay }
              }}
              onAnimationComplete={() => {
                // Auto-remove balloon when it goes off screen to save memory
                setBalloons(prev => prev.filter(balloon => balloon.id !== b.id));
              }}
              className="absolute cursor-pointer group"
              style={{ left: `${b.left}%` }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                confetti({
                  particleCount: 15,
                  spread: 40,
                  origin: { 
                    x: (rect.left + rect.width / 2) / window.innerWidth, 
                    y: (rect.top + rect.height / 2) / window.innerHeight 
                  },
                  colors: ['#ef4444', '#3b82f6', '#10b981', '#facc15']
                });
                handlePop(b.id, b.letter);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Balloon Graphic */}
              <div className="relative flex flex-col items-center">
                <div className={`w-16 h-20 md:w-20 md:h-24 rounded-[50%] ${b.color} shadow-lg flex items-center justify-center border-b-2 border-black/10 group-hover:brightness-110 transition-all`}>
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 w-2 h-4 md:w-3 md:h-6 bg-white/30 rounded-full blur-[2px] rotate-12" />
                  <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-md select-none">{b.letter}</span>
                </div>
                {/* Balloon Knot & String */}
                <div className={`w-2 h-2 md:w-3 md:h-3 ${b.color} rounded-sm rotate-45 -mt-1 md:-mt-1.5 border-b border-black/10`} />
                <div className="w-0.5 h-8 md:h-12 bg-white/50 -mt-1" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}
