"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Target, Trophy, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import confetti from "canvas-confetti";

type Item = { id: number; left: number; top: number; isGood: boolean };

export default function AppleCatchGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [basketX, setBasketX] = useState(50);
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [basketScale, setBasketScale] = useState(1);
  const [flashSuccess, setFlashSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const targetScore = 15;
  const speed = 0.8;

  // Input
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      let clientX;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
      } else {
        clientX = e.touches[0].clientX;
      }
      
      // Calculate relative to the container
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setBasketX(percentage);
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  // Physics Loop
  useEffect(() => {
    if (gameOver) return;

    let frame: number;
    const loop = () => {
      let hitGood = false;
      let hitBad = false;

      setItems(prev => {
        const next = prev.map(item => {
          const newTop = item.top + speed;
          
          // Collision: Basket is at bottom 10% (top: 85-95)
          // Basket width is ~15%. So if item.left is within basketX - 10 and basketX + 10
          if (newTop > 85 && newTop < 95) {
            if (Math.abs(item.left - basketX) < 10) {
              if (item.isGood) hitGood = true;
              else hitBad = true;
              return { ...item, top: 120 }; // send off screen to be filtered
            }
          }
          return { ...item, top: newTop };
        }).filter(item => item.top < 110);
        return next;
      });

      if (hitBad) {
        setGameOver(true);
        setIsWin(false);
        playIncorrect();
        logActivity({ topic: "Apple Catch", durationMinutes: 1, score });
        addXp(score * 2);
        return;
      }

      if (hitGood) {
        setBasketScale(1.3);
        setFlashSuccess(true);
        setTimeout(() => {
          setBasketScale(1);
          setFlashSuccess(false);
        }, 150);
        setScore(s => {
          const n = s + 1;
          // Play pop sound for every apple
          playPop();
          
          // Mini confetti at the basket
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            confetti({
              particleCount: 15,
              spread: 40,
              origin: { 
                x: (rect.left + (basketX / 100) * rect.width) / window.innerWidth, 
                y: (rect.bottom - 60) / window.innerHeight 
              },
              colors: ['#ef4444', '#22c55e']
            });
          }

          if (n >= targetScore) {
            setGameOver(true);
            setIsWin(true);
            playLevelUp();
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            logActivity({ topic: "Apple Catch", durationMinutes: 1, score: 100 });
            addXp(150);
          }
          return n;
        });
      }

      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [gameOver, basketX, score, targetScore, playPop, playIncorrect, playLevelUp, logActivity, addXp]);

  // Spawner
  useEffect(() => {
    if (gameOver) return;
    let idCounter = 0;
    const spawner = setInterval(() => {
      setItems(prev => [
        ...prev, 
        { 
          id: idCounter++, 
          left: Math.random() * 80 + 10, 
          top: -10, 
          isGood: Math.random() > 0.2 // 80% apples, 20% worms
        }
      ]);
    }, 1200);
    return () => clearInterval(spawner);
  }, [gameOver]);

  if (gameOver) {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-red-50 p-8 rounded-2xl shadow-xl border-2 border-red-500 text-center max-w-sm w-full">
          {isWin ? (
             <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          ) : (
             <Skull className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          
          <h1 className="text-3xl font-bold text-red-900 mb-2">{isWin ? "You did it!" : "Yuck! A Worm!"}</h1>
          <p className="text-lg text-red-700 font-bold mb-6">Caught: {score} / {targetScore} Apples</p>
          <Button onClick={() => window.location.reload()} className="w-full h-12 rounded-full font-bold text-lg bg-red-500 hover:bg-red-600 text-white mb-3">Play Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-12 rounded-full font-bold text-lg border-2 border-red-300 text-red-800">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div 
        ref={containerRef}
        className="w-full max-w-4xl h-[85vh] bg-sky-200 rounded-3xl shadow-2xl border-4 border-slate-800 overflow-hidden relative flex flex-col cursor-none"
      >
        <header className="flex justify-between items-center p-4 relative z-20">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="bg-white/50 hover:bg-white/80 rounded-full font-bold shadow-sm text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit
        </Button>
        <div className={`px-5 py-1.5 rounded-full font-bold text-xl flex items-center shadow-md transition-all ${flashSuccess ? 'bg-green-100 border-2 border-green-500 text-green-600 scale-110' : 'bg-white/80 border-2 border-transparent text-red-600'}`}>
          🍎 {score} / {targetScore}
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
      </div>

      {/* Tree background elements */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-green-500 rounded-full opacity-40 blur-3xl" />
      <div className="absolute top-[-20px] right-[-50px] w-80 h-80 bg-green-400 rounded-full opacity-40 blur-3xl" />

      <main className="absolute inset-0 z-10 pointer-events-none">
        {/* Falling Items */}
        {items.map(item => (
          <motion.div 
            key={item.id}
            animate={{ rotate: item.isGood ? [0, 10, -10, 0] : [0, 360] }}
            transition={{ duration: item.isGood ? 2 : 4, repeat: Infinity, ease: "linear" }}
            className="absolute text-5xl drop-shadow-lg"
            style={{ left: `${item.left}%`, top: `${item.top}%`, transform: 'translateX(-50%)' }}
          >
            {item.isGood ? '🍎' : '🐛'}
          </motion.div>
        ))}

        {/* Basket */}
        <motion.div 
          animate={{ 
            scale: basketScale, 
            x: "-50%",
            filter: flashSuccess ? 'drop-shadow(0px 0px 20px #22c55e)' : 'drop-shadow(0px 0px 0px rgba(0,0,0,0))'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
          className="absolute bottom-10 text-7xl origin-bottom"
          style={{ left: `${basketX}%` }}
        >
          🧺
        </motion.div>
      </main>
      
      <div className="absolute bottom-2 w-full text-center text-sky-800 font-bold opacity-50 pointer-events-none">
        Move mouse or drag to catch apples
      </div>
    </div>
  </div>
  );
}
