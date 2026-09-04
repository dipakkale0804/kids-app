"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crosshair, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";

export default function NumberHuntGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [score, setScore] = useState(0);
  const [ghosts, setGhosts] = useState<{id: number, top: number, left: number, speed: number, num: number}[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const flashlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      
      if (flashlightRef.current) {
        const x = (clientX / window.innerWidth) * 100;
        const y = (clientY / window.innerHeight) * 100;
        flashlightRef.current.style.background = `radial-gradient(circle 150px at ${x}% ${y}%, transparent 0%, rgba(0,0,0,0.98) 100%)`;
      }
    };
    
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  // Spawner
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setGhosts(prev => {
        if (prev.length > 5) return prev;
        return [...prev, {
          id: Math.random(),
          top: Math.random() * 80 + 10,
          left: Math.random() * 80 + 10,
          speed: Math.random() * 2 + 1,
          num: Math.floor(Math.random() * 20) + 1 // 1 to 20
        }];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Movement loop
  useEffect(() => {
    if (gameOver) return;
    const t = setInterval(() => {
      setGhosts(prev => prev.map(g => ({
        ...g,
        top: Math.max(10, Math.min(90, g.top + (Math.random() - 0.5) * g.speed)),
        left: Math.max(10, Math.min(90, g.left + (Math.random() - 0.5) * g.speed)),
      })));
    }, 100);
    return () => clearInterval(t);
  }, [gameOver]);

  const handleCatch = (id: number, num: number) => {
    if (gameOver) return;
    
    const isEven = num % 2 === 0;
    
    if (isEven) {
      playPop();
      setGhosts(prev => prev.filter(g => g.id !== id));
      
      const newScore = score + 1;
      setScore(newScore);
      
      if (newScore >= 10) {
        setGameOver(true);
        setIsWin(true);
        playLevelUp();
        logActivity({ topic: "Number Hunt", durationMinutes: 1, score: 100 });
        addXp(150);
      }
    } else {
      playIncorrect();
      setGameOver(true);
      setIsWin(false);
      logActivity({ topic: "Number Hunt", durationMinutes: 1, score });
      addXp(score * 5);
    }
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 z-50 relative">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-slate-900 p-8 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] border-2 border-slate-700 text-center max-w-sm w-full">
          {isWin ? (
            <Crosshair className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          ) : (
            <Skull className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          
          <h1 className="text-3xl font-bold text-white mb-2">{isWin ? "Ghost Buster!" : "Oops! That's an Odd Number!"}</h1>
          <p className="text-lg text-slate-400 font-bold mb-6">Score: {score}/10</p>
          <Button onClick={() => window.location.reload()} className="w-full h-12 rounded-full font-bold text-lg bg-indigo-500 hover:bg-indigo-600 text-white mb-3">Hunt Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-12 rounded-full font-bold text-lg border-slate-700 text-slate-300">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative cursor-crosshair">
      <div 
        ref={flashlightRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle 150px at 50% 50%, transparent 0%, rgba(0,0,0,0.98) 100%)`
        }}
      />

      <header className="absolute top-0 w-full flex justify-between items-center p-4 z-20 text-white">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="hover:bg-white/10 font-bold text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit
        </Button>
        <div className="bg-white/10 px-4 py-1.5 rounded-full font-bold text-lg border border-white/20 backdrop-blur-md">
          Catch ONLY the EVEN numbers!
        </div>
        <div className="text-xl font-bold flex items-center bg-black/50 px-3 py-1.5 rounded-xl">
          <Crosshair className="w-5 h-5 mr-2 text-indigo-400" /> {score}/10
        </div>
      </header>

      <main className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
        <AnimatePresence>
          {ghosts.map(ghost => (
            <motion.div
              key={ghost.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, top: `${ghost.top}%`, left: `${ghost.left}%` }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => handleCatch(ghost.id, ghost.num)}
              className="absolute w-20 h-20 hover:scale-110 cursor-crosshair flex flex-col items-center justify-center"
            >
              <div className="relative w-16 h-20 bg-white/20 backdrop-blur-sm rounded-t-full rounded-b-xl border-2 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex flex-col items-center pt-3">
                <span className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{ghost.num}</span>
                <div className="flex gap-3 mt-1.5">
                  <div className="w-2 h-2 bg-black rounded-full shadow-[0_0_5px_white]" />
                  <div className="w-2 h-2 bg-black rounded-full shadow-[0_0_5px_white]" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>
    </div>
  );
}
