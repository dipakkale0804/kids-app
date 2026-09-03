"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";

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
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-blue-100 p-12 rounded-[3rem] shadow-2xl border-4 border-blue-500 text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-blue-200 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-blue-900 mb-4">Great Catch!</h1>
          <p className="text-xl text-blue-700 font-bold mb-8">You earned 120 XP!</p>
          <Button onClick={() => window.location.reload()} className="w-full h-16 rounded-full font-black text-xl bg-blue-500 hover:bg-blue-600 mb-4">Play Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-16 rounded-full font-black text-xl border-blue-300 text-blue-800">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 to-blue-800 overflow-hidden relative cursor-crosshair">
      <header className="absolute top-0 w-full flex justify-between p-6 z-20">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="text-white hover:bg-white/20">
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit
        </Button>
        <div className="bg-white/20 px-8 py-3 rounded-full backdrop-blur-sm border-2 border-white/50 text-white font-black text-2xl shadow-lg">
          Catch Fish: {targetNum}
        </div>
        <div className="text-white font-black text-2xl">Score: {score}/5</div>
      </header>

      {/* Surface Waves */}
      <div className="absolute top-0 w-full h-32 bg-cyan-300/30 wave-animation" />

      <main className="absolute inset-0 z-10 pt-32">
        <AnimatePresence>
          {fishes.map(f => (
            <motion.div
              key={f.id}
              initial={{ left: `${f.left}%`, opacity: 0 }}
              animate={{ left: f.direction === 1 ? '110%' : '-10%', opacity: 1 }}
              transition={{ duration: f.speed, ease: "linear" }}
              onAnimationComplete={() => setFishes(prev => prev.filter(fish => fish.id !== f.id))}
              onClick={() => handleCatch(f.id, f.num)}
              className="absolute cursor-pointer hover:scale-110 flex items-center justify-center w-32 h-20"
              style={{ top: `${f.top}%`, transform: `scaleX(${f.direction === -1 ? 1 : -1})` }}
            >
              {/* Simple CSS Fish */}
              <div className="absolute w-24 h-16 bg-orange-500 rounded-[100%] shadow-lg border-2 border-orange-600 flex items-center justify-center">
                {/* Eye */}
                <div className={`absolute top-3 ${f.direction === 1 ? 'right-4' : 'left-4'} w-3 h-3 bg-white rounded-full flex items-center justify-center`}><div className="w-1 h-1 bg-black rounded-full" /></div>
                {/* Text (needs counter-rotation if fish is flipped) */}
                <span className="font-black text-2xl text-white drop-shadow-md z-10" style={{ transform: `scaleX(${f.direction === -1 ? 1 : -1})` }}>{f.num}</span>
              </div>
              {/* Tail */}
              <div className={`absolute ${f.direction === 1 ? '-left-4' : '-right-4'} w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ${f.direction === 1 ? 'border-r-[25px] border-r-orange-600' : 'border-l-[25px] border-l-orange-600'}`} />
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </div>
  );
}
