"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Target, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import confetti from "canvas-confetti";

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

type Mole = { hole: number, letter: string, isVowel: boolean };

export default function WhackAVowelGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [activeMoles, setActiveMoles] = useState<Mole[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      setIsWin(true);
      playLevelUp();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      logActivity({ topic: "Whack-a-Vowel", durationMinutes: 1, score });
      addXp(score * 5);
      return;
    }
    const t = setInterval(() => setTimeLeft(l => l - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, gameOver, score, playLevelUp, logActivity, addXp]);

  // Spawner
  useEffect(() => {
    if (gameOver) return;
    const speed = Math.max(600, 1500 - (score * 50));
    const interval = setInterval(() => {
      const hole = Math.floor(Math.random() * 9);
      
      const isV = Math.random() > 0.4; // 60% chance for vowel
      const letter = isV 
        ? VOWELS[Math.floor(Math.random() * VOWELS.length)]
        : CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];

      setActiveMoles(prev => {
        const filtered = prev.filter(m => m.hole !== hole); // remove old if exists
        return [...filtered, { hole, letter, isVowel: isV }];
      });

      // Auto hide after some time
      setTimeout(() => {
        setActiveMoles(prev => prev.filter(m => m.hole !== hole));
      }, speed * 1.5);
    }, speed);
    return () => clearInterval(interval);
  }, [gameOver, score]);

  const handleWhack = (mole: Mole) => {
    if (gameOver) return;
    setActiveMoles(prev => prev.filter(m => m.hole !== mole.hole));
    
    if (mole.isVowel) {
      playPop();
      setScore(s => s + 1);
    } else {
      playIncorrect();
      setGameOver(true);
      setIsWin(false);
      logActivity({ topic: "Whack-a-Vowel", durationMinutes: 1, score });
      addXp(score * 2); // small pity XP
    }
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-orange-950 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-orange-100 p-8 rounded-2xl shadow-xl border-2 border-orange-500 text-center max-w-sm w-full">
          {isWin ? (
             <Target className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          ) : (
             <Skull className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          
          <h1 className="text-3xl font-bold text-orange-900 mb-2">{isWin ? "Time's Up!" : "Oops! That's a Consonant!"}</h1>
          <p className="text-lg text-orange-700 font-bold mb-6">Score: {score}</p>
          <Button onClick={() => window.location.reload()} className="w-full h-12 rounded-full font-bold text-lg bg-orange-500 hover:bg-orange-600 mb-3">Play Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-12 rounded-full font-bold text-lg border-2 border-orange-300 text-orange-800">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-700 flex flex-col relative cursor-crosshair">
      <header className="flex justify-between items-center p-4 bg-amber-800 text-white shadow-md z-10">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="hover:bg-amber-700 font-bold text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit
        </Button>
        <div className="bg-amber-900 px-4 py-1.5 rounded-full font-bold text-lg border-2 border-amber-600">
          Whack the Vowels: A, E, I, O, U
        </div>
        <div className="flex gap-4 text-lg font-bold">
          <div>⏳ {timeLeft}s</div>
          <div>🎯 {score}</div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 perspective-1000">
        <div className="grid grid-cols-3 gap-3 md:gap-6 bg-amber-900 p-6 rounded-3xl shadow-xl border-b-8 border-amber-950 transform rotate-x-12">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
            const mole = activeMoles.find(m => m.hole === i);
            return (
              <div key={i} className="w-20 h-20 md:w-28 md:h-28 bg-amber-950 rounded-[40%] relative shadow-inner overflow-hidden border-2 border-amber-900/50 flex items-end justify-center">
                {/* Hole Shadow */}
                <div className="absolute inset-2 bg-black/60 rounded-full" />
                
                <AnimatePresence>
                  {mole && (
                    <motion.button
                      initial={{ y: "100%" }}
                      animate={{ y: "10%" }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      onClick={() => handleWhack(mole)}
                      className={`relative z-10 w-16 h-20 md:w-20 md:h-24 rounded-t-full flex flex-col items-center pt-3 border-b-0 border-2 shadow-[0_-3px_10px_rgba(0,0,0,0.5)] ${mole.isVowel ? 'bg-emerald-500 border-emerald-700' : 'bg-red-500 border-red-700'}`}
                    >
                      <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">{mole.letter}</span>
                      <div className="flex gap-2 mt-2">
                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
