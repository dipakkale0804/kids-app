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
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-emerald-100 p-8 rounded-2xl shadow-xl border-2 border-emerald-500 text-center max-w-sm w-full">
          <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4 fill-current" />
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Pattern Master!</h1>
          <p className="text-lg text-emerald-700 font-bold mb-6">You earned 150 XP!</p>
          <Button onClick={() => window.location.reload()} className="w-full h-12 rounded-full font-bold text-lg bg-emerald-500 hover:bg-emerald-600 mb-3">Play Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-12 rounded-full font-bold text-lg border-2 border-emerald-300 text-emerald-800">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      <header className="flex justify-between items-center p-4 bg-white shadow-sm border-b-2 border-emerald-200">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="rounded-full font-bold text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit
        </Button>
        <div className="text-lg font-bold text-emerald-600 bg-emerald-100 px-5 py-1.5 rounded-full">
          Puzzle {currentLevel + 1}/{PATTERNS.length}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl md:text-4xl font-bold text-emerald-800 mb-8 text-center">
          What comes next?
        </h2>

        {/* Pattern Display */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-12 bg-white p-6 md:p-8 rounded-3xl shadow-lg border-2 border-emerald-100">
          {level.seq.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`w-16 h-16 md:w-24 md:h-24 flex items-center justify-center text-4xl md:text-5xl rounded-2xl shadow-inner ${item === '?' ? (animating ? 'bg-emerald-100 border-2 border-emerald-400' : 'bg-slate-100 border-2 border-dashed border-slate-300') : 'bg-emerald-50'}`}
            >
              {item === '?' && animating ? level.answer : item}
            </motion.div>
          ))}
        </div>

        {/* Choices */}
        <div className="flex gap-4 md:gap-8">
          {level.options.map((opt, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePick(opt)}
              className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full shadow-md border-2 border-emerald-200 flex items-center justify-center text-4xl md:text-6xl hover:border-emerald-500 hover:shadow-lg"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
