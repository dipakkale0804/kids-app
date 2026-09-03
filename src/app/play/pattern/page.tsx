"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import confetti from "canvas-confetti";

const PATTERNS = [
  { seq: ["🍎", "🍌", "🍎", "?"], options: ["🍌", "🍎", "🍉"], answer: "🍌" },
  { seq: ["🐶", "🐶", "🐱", "🐶", "🐶", "?"], options: ["🐶", "🐱", "🐭"], answer: "🐱" },
  { seq: ["🔴", "🔵", "🟡", "🔴", "🔵", "?"], options: ["🔴", "🔵", "🟡"], answer: "🟡" },
  { seq: ["⭐", "🌙", "⭐", "🌙", "?"], options: ["🌙", "⭐", "☀️"], answer: "⭐" },
  { seq: ["🚗", "🚌", "🚗", "🚌", "🚗", "?"], options: ["🚗", "🚓", "🚌"], answer: "🚌" }
];

export default function PatternPuzzleGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [animating, setAnimating] = useState(false);

  const level = PATTERNS[currentLevel];

  const handlePick = (choice: string) => {
    if (animating) return;
    
    if (choice === level.answer) {
      playPop();
      setAnimating(true);
      
      setTimeout(() => {
        if (currentLevel === PATTERNS.length - 1) {
          setGameOver(true);
          playLevelUp();
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          logActivity({ topic: "Pattern Puzzle", durationMinutes: 1, score: 100 });
          addXp(150);
        } else {
          setCurrentLevel(c => c + 1);
          setAnimating(false);
        }
      }, 1000);
    } else {
      playIncorrect();
    }
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-emerald-100 p-12 rounded-[3rem] shadow-2xl border-4 border-emerald-500 text-center max-w-lg w-full">
          <Star className="w-24 h-24 text-yellow-500 mx-auto mb-6 fill-current" />
          <h1 className="text-4xl font-black text-emerald-900 mb-4">Pattern Master!</h1>
          <p className="text-xl text-emerald-700 font-bold mb-8">You earned 150 XP!</p>
          <Button onClick={() => window.location.reload()} className="w-full h-16 rounded-full font-black text-xl bg-emerald-500 hover:bg-emerald-600 mb-4">Play Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-16 rounded-full font-black text-xl border-emerald-300 text-emerald-800">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      <header className="flex justify-between items-center p-6 bg-white shadow-sm border-b-4 border-emerald-200">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="rounded-full font-bold">
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit
        </Button>
        <div className="text-xl font-black text-emerald-600 bg-emerald-100 px-6 py-2 rounded-full">
          Puzzle {currentLevel + 1}/{PATTERNS.length}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl md:text-5xl font-black text-emerald-800 mb-12 text-center">
          What comes next?
        </h2>

        {/* Pattern Display */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16 bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border-4 border-emerald-100">
          {level.seq.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`w-20 h-20 md:w-32 md:h-32 flex items-center justify-center text-5xl md:text-7xl rounded-3xl shadow-inner ${item === '?' ? (animating ? 'bg-emerald-100 border-4 border-emerald-400' : 'bg-slate-100 border-4 border-dashed border-slate-300') : 'bg-emerald-50'}`}
            >
              {item === '?' && animating ? level.answer : item}
            </motion.div>
          ))}
        </div>

        {/* Choices */}
        <div className="flex gap-6 md:gap-12">
          {level.options.map((opt, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1, y: -10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePick(opt)}
              className="w-24 h-24 md:w-36 md:h-36 bg-white rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.1)] border-4 border-emerald-200 flex items-center justify-center text-5xl md:text-7xl hover:border-emerald-500 hover:shadow-emerald-200"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
