"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import confetti from "canvas-confetti";

type Fish = { id: number; num: number; top: number; left: number; speed: number; direction: number };

export default function MathFishingGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [startTime] = useState(Date.now());
  const [targetNum, setTargetNum] = useState(0);
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    generateTarget();
  }, []);

  const generateTarget = () => {
    setTargetNum(Math.floor(Math.random() * 20) + 1);
  };

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setFishes(prev => {
        if (prev.length > 8) return prev;
        const dir = Math.random() > 0.5 ? 1 : -1;
        return [...prev, {
          id: Math.random(),
          num: Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 1 : targetNum, // 30% chance for target
          top: Math.random() * 60 + 20, // 20% to 80% deep
          left: dir === 1 ? -10 : 110,
          speed: Math.random() * 10 + 5, // 5-15s to cross screen
          direction: dir
        }];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [gameOver, targetNum]);

  const handleCatch = (id: number, num: number) => {
    setFishes(prev => prev.filter(f => f.id !== id));
    
    if (num === targetNum) {
      playPop();
      const nextScore = score + 1;
      setScore(nextScore);
      
      if (nextScore >= 5) {
        setGameOver(true);
        playLevelUp();
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        logActivity({ topic: "Math Fishing", durationMinutes: 1, score: 100 });
        addXp(120);
      } else {
        generateTarget();
      }
    } else {
      playIncorrect();
    }
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-blue-950 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-blue-100 p-8 rounded-2xl shadow-xl border-2 border-blue-500 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-blue-200 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Great Catch!</h1>
          <p className="text-lg text-blue-700 font-bold mb-6">You earned 120 XP!</p>
          <Button onClick={() => window.location.reload()} className="w-full h-12 rounded-full font-bold text-lg bg-blue-500 hover:bg-blue-600 mb-3">Play Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-12 rounded-full font-bold text-lg border-2 border-blue-300 text-blue-800">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 to-blue-800 overflow-hidden relative cursor-crosshair">
      <header className="absolute top-0 w-full flex justify-between p-4 z-20">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="text-white hover:bg-white/20 text-sm font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit
        </Button>
        <div className="bg-white/20 px-6 py-2 rounded-full backdrop-blur-sm border border-white/50 text-white font-bold text-xl shadow-md">
          Catch Fish: {targetNum}
        </div>
        <div className="text-white font-bold text-xl">Score: {score}/5</div>
      </header>

      {/* Ocean Elements Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Bubbles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '100vh', x: `${Math.random() * 100}vw`, opacity: 0 }}
            animate={{ 
              y: '-10vh', 
              opacity: [0, 0.5, 0],
              x: `calc(${Math.random() * 100}vw + ${Math.sin(i) * 50}px)`
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute bottom-0 w-4 h-4 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm"
          />
        ))}
      </div>

      {/* Surface Waves */}
      <div className="absolute top-0 w-full h-32 bg-cyan-300/30 wave-animation z-10" />

      <main className="absolute inset-0 z-10 pt-32">
        <AnimatePresence>
          {fishes.map(f => (
            <motion.div
              key={f.id}
              initial={{ left: `${f.left}%`, top: `${f.top}%`, opacity: 0 }}
              animate={{ 
                left: f.direction === 1 ? '110%' : '-10%', 
                opacity: 1,
                top: [`${f.top}%`, `${f.top - 5}%`, `${f.top}%`]
              }}
              exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)", transition: { duration: 0.2 } }}
              transition={{ 
                left: { duration: f.speed, ease: "linear" },
                top: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              onAnimationComplete={() => setFishes(prev => prev.filter(fish => fish.id !== f.id))}
              onClick={(e) => {
                confetti({
                  particleCount: 15,
                  spread: 40,
                  origin: { 
                    x: e.clientX / window.innerWidth, 
                    y: e.clientY / window.innerHeight 
                  },
                  colors: ['#38bdf8', '#ffffff'] // Water splash colors
                });
                handleCatch(f.id, f.num);
              }}
              className="absolute cursor-pointer group flex items-center justify-center w-24 h-16"
              style={{ transform: `scaleX(${f.direction === -1 ? 1 : -1})` }}
            >
              {/* Simple CSS Fish */}
              <div className="absolute w-20 h-12 bg-orange-500 rounded-[100%] shadow-md border-2 border-orange-600 flex items-center justify-center group-hover:brightness-110 group-hover:scale-105 transition-all">
                {/* Eye */}
                <div className={`absolute top-2.5 ${f.direction === 1 ? 'right-3' : 'left-3'} w-2 h-2 bg-white rounded-full flex items-center justify-center`}><div className="w-1 h-1 bg-black rounded-full" /></div>
                {/* Text (needs counter-rotation if fish is flipped) */}
                <span className="font-bold text-xl text-white drop-shadow-md z-10" style={{ transform: `scaleX(${f.direction === -1 ? 1 : -1})` }}>{f.num}</span>
              </div>
              {/* Tail */}
              <div className={`absolute ${f.direction === 1 ? '-left-3' : '-right-3'} w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ${f.direction === 1 ? 'border-r-[20px] border-r-orange-600' : 'border-l-[20px] border-l-orange-600'}`} />
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </div>
  );
}
