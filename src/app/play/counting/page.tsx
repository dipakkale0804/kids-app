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
  
  const targetScore = 15;
  const speed = 1.5;

  // Input
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
      } else {
        clientX = e.touches[0].clientX;
      }
      setBasketX((clientX / window.innerWidth) * 100);
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
        setScore(s => {
          const n = s + 1;
          playPop();
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
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-red-50 p-12 rounded-[3rem] shadow-2xl border-4 border-red-500 text-center max-w-lg w-full">
          {isWin ? (
             <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
          ) : (
             <Skull className="w-24 h-24 text-red-500 mx-auto mb-6" />
          )}
          
          <h1 className="text-4xl font-black text-red-900 mb-4">{isWin ? "You did it!" : "Yuck! A Worm!"}</h1>
          <p className="text-xl text-red-700 font-bold mb-8">Caught: {score} / {targetScore} Apples</p>
          <Button onClick={() => window.location.reload()} className="w-full h-16 rounded-full font-black text-xl bg-red-500 hover:bg-red-600 text-white mb-4">Play Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-16 rounded-full font-black text-xl border-red-300 text-red-800">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-200 flex flex-col overflow-hidden relative cursor-none">
      <header className="absolute top-0 w-full flex justify-between items-center p-6 z-20">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="bg-white/50 hover:bg-white/80 rounded-full font-bold shadow-sm">
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit
        </Button>
        <div className="bg-white/80 px-6 py-2 rounded-full font-black text-2xl flex items-center shadow-lg text-red-600">
          🍎 {score} / {targetScore}
        </div>
      </header>

      {/* Tree background elements */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-green-500 rounded-full opacity-50 blur-3xl" />
      <div className="absolute top-[-20px] right-[-50px] w-80 h-80 bg-green-400 rounded-full opacity-50 blur-3xl" />

      <main className="absolute inset-0 z-10 pointer-events-none">
        {/* Falling Items */}
        {items.map(item => (
          <div 
            key={item.id}
            className="absolute text-5xl"
            style={{ left: `${item.left}%`, top: `${item.top}%`, transform: 'translateX(-50%)' }}
          >
            {item.isGood ? '🍎' : '🐛'}
          </div>
        ))}

        {/* Basket */}
        <div 
          className="absolute bottom-10 text-7xl"
          style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}
        >
          🧺
        </div>
      </main>
      
      <div className="absolute bottom-2 w-full text-center text-sky-800 font-bold opacity-50 pointer-events-none">
        Move mouse or drag to catch apples
      </div>
    </div>
  );
}
