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

  const level = LEVELS[currentLevel];

  const handleColorPick = (color: string) => {
    if (selectedColors.includes(color)) return;
    
    playPop();
    const newSelected = [...selectedColors, color];
    setSelectedColors(newSelected);

    if (newSelected.length === 2) {
      // Check if correct
      const isCorrect = level.colors.every(c => newSelected.includes(c));
      
      setTimeout(() => {
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
          }
        } else {
          playIncorrect();
          setSelectedColors([]);
        }
      }, 500);
    }
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-lg w-full">
          <PaletteIcon className="w-24 h-24 text-pink-500 mx-auto mb-6" />
          <h1 className="text-4xl font-black text-slate-800 mb-4">Master Artist!</h1>
          <Button onClick={() => window.location.reload()} className="w-full h-16 rounded-full font-black text-xl bg-pink-500 hover:bg-pink-600 mb-4">Play Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-16 rounded-full font-black text-xl">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="flex justify-between items-center p-6 bg-white shadow-sm">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="rounded-full font-bold">
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit
        </Button>
        <div className="text-xl font-black text-slate-500">
          Mix: {currentLevel + 1}/{LEVELS.length}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-2xl w-full text-center border-4 border-slate-200">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-8">
            Make <span className={`${COLOR_MAP[level.target].replace('bg-', 'text-')}`}>{level.target}</span>!
          </h2>

          {/* Mixing Canvas */}
          <div className="flex justify-center items-center gap-4 mb-12 h-40">
            <div className={`w-32 h-32 rounded-full shadow-inner border-4 border-slate-100 transition-all duration-500 ${selectedColors[0] ? COLOR_MAP[selectedColors[0]] : 'bg-slate-50'}`} />
            <div className="text-4xl font-black text-slate-300">+</div>
            <div className={`w-32 h-32 rounded-full shadow-inner border-4 border-slate-100 transition-all duration-500 ${selectedColors[1] ? COLOR_MAP[selectedColors[1]] : 'bg-slate-50'}`} />
          </div>

          {/* Palette */}
          <div className="bg-slate-800 p-6 rounded-[2.5rem] shadow-inner inline-flex gap-4">
            {["Red", "Yellow", "Blue"].map(color => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleColorPick(color)}
                className={`w-20 h-20 rounded-full ${COLOR_MAP[color]} shadow-lg border-4 border-white/20`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
