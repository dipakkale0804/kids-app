"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Palette as PaletteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import confetti from "canvas-confetti";

const LEVELS = [
  { target: "Purple", colors: ["Red", "Blue"] },
  { target: "Green", colors: ["Yellow", "Blue"] },
  { target: "Orange", colors: ["Red", "Yellow"] },
];

const COLOR_MAP: Record<string, string> = {
  Red: "bg-red-500",
  Blue: "bg-blue-500",
  Yellow: "bg-yellow-400",
  Purple: "bg-purple-500",
  Green: "bg-emerald-500",
  Orange: "bg-orange-500",
};

export default function ColorSplashGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [flashState, setFlashState] = useState<'idle' | 'success' | 'error'>('idle');

  const level = LEVELS[currentLevel];

  const handleColorPick = (color: string) => {
    if (selectedColors.includes(color)) return;
    
    playPop();
    const newSelected = [...selectedColors, color];
    setSelectedColors(newSelected);
    if (newSelected.length === 2) {
      // Check if correct
      const isCorrect = level.colors.every(c => newSelected.includes(c));
      
      if (isCorrect) {
        setFlashState('success');
      } else {
        setFlashState('error');
      }

      setTimeout(() => {
        setFlashState('idle');
        if (isCorrect) {
          if (currentLevel === LEVELS.length - 1) {
            // Win
            setGameOver(true);
            playLevelUp();
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            logActivity({ topic: "Color Splash", durationMinutes: 1, score: 100 });
            addXp(100);
          } else {
            setCurrentLevel(c => c + 1);
            setSelectedColors([]);
            playPop();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
          }
        } else {
          playIncorrect();
          setSelectedColors([]);
        }
      }, 600);
    }
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
          <PaletteIcon className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Master Artist!</h1>
          <Button onClick={() => window.location.reload()} className="w-full h-12 rounded-full font-bold text-lg bg-pink-500 hover:bg-pink-600 mb-3">Play Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-12 rounded-full font-bold text-lg">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      animate={{ 
        backgroundColor: flashState === 'error' ? '#fee2e2' : flashState === 'success' ? '#d1fae5' : '#f1f5f9'
      }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col transition-colors"
    >
      <header className="flex justify-between items-center p-4 bg-white shadow-sm z-10">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="rounded-full font-bold text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit
        </Button>
        <div className="text-lg font-bold text-slate-500">
          Mix: {currentLevel + 1}/{LEVELS.length}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg max-w-xl w-full text-center border-2 border-slate-200">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-6">
            Make <span className={`${COLOR_MAP[level.target].replace('bg-', 'text-')}`}>{level.target}</span>!
          </h2>

          {/* Mixing Canvas */}
          <div className="flex justify-center items-center gap-4 mb-10 h-32">
            <div className={`w-24 h-24 rounded-full shadow-inner border-2 border-slate-100 transition-all duration-500 ${selectedColors[0] ? COLOR_MAP[selectedColors[0]] : 'bg-slate-50'}`} />
            <div className="text-3xl font-bold text-slate-300">+</div>
            <div className={`w-24 h-24 rounded-full shadow-inner border-2 border-slate-100 transition-all duration-500 ${selectedColors[1] ? COLOR_MAP[selectedColors[1]] : 'bg-slate-50'}`} />
          </div>

          {/* Palette */}
          <div className="bg-slate-800 p-4 rounded-2xl shadow-inner inline-flex gap-3">
            {["Red", "Yellow", "Blue"].map(color => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleColorPick(color)}
                className={`w-16 h-16 rounded-full ${COLOR_MAP[color]} shadow-md border-2 border-white/20`}
              />
            ))}
          </div>
        </div>
      </main>
    </motion.div>
  );
}
