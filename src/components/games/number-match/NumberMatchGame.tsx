"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState } from "@/types/game";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";

interface NumberMatchProps {
  onComplete: (score: number, accuracy: number) => void;
  gameState: GameState;
  emojis?: string[];
  maxNumber?: number;
}

const LEVEL_COUNT = 5;

// Utility to shuffle an array
function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

const DEFAULT_EMOJIS = ["🍎", "🐶", "🎈", "⭐️", "🚗", "🧸"];

export function NumberMatchGame({ 
  onComplete, 
  gameState, 
  emojis = DEFAULT_EMOJIS,
  maxNumber = 10
}: NumberMatchProps) {
  const [level, setLevel] = useState(0);
  const [targetNumber, setTargetNumber] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const { playPop, playCorrect, playIncorrect, playLevelUp } = useGameSounds();

  const generateLevel = () => {
    const target = Math.floor(Math.random() * (maxNumber - 1)) + 2; 
    setTargetNumber(target);

    // Generate wrong options
    const wrongOptions = new Set<number>();
    while (wrongOptions.size < 3) {
      const wrong = Math.floor(Math.random() * (maxNumber + 2)) + 1;
      if (wrong !== target) {
        wrongOptions.add(wrong);
      }
    }

    setOptions(shuffle([target, ...Array.from(wrongOptions)]));
    setFeedback(null);
  };

  useEffect(() => {
    if (gameState === "playing") {
      setLevel(0);
      setScore(0);
      setAttempts(0);
      generateLevel();
    }
  }, [gameState]);

  const handleOptionClick = (option: number) => {
    if (feedback !== null) return; // Prevent clicking while feedback is showing
    
    playPop();
    setAttempts(a => a + 1);

    if (option === targetNumber) {
      setFeedback("correct");
      setScore(s => s + 100);
      playCorrect();
      
      setTimeout(() => {
        if (level + 1 >= LEVEL_COUNT) {
          playLevelUp();
          // Game over
          const accuracy = (level + 1) / (attempts + 1);
          onComplete(score + 100, accuracy > 1 ? 1 : accuracy);
        } else {
          setLevel(l => l + 1);
          generateLevel();
        }
      }, 1000);
    } else {
      setFeedback("incorrect");
      playIncorrect();
      setScore(s => Math.max(0, s - 20));
      setTimeout(() => {
        setFeedback(null);
      }, 800);
    }
  };

  // Helper to render cute objects based on the target number
    const renderObjects = (count: number) => {
      const emoji = emojis[level % emojis.length];
      
      // Scale down emoji size if there are many of them to prevent overflow
      const emojiSizeClass = count > 10 
        ? "text-3xl md:text-4xl" 
        : count > 6 
          ? "text-4xl md:text-5xl" 
          : "text-5xl md:text-6xl";
      
      return (
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 max-w-sm mx-auto px-4">
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180, y: -20 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", bounce: 0.5 }}
              whileHover={{ scale: 1.2, rotate: 10 }}
              className={`${emojiSizeClass} drop-shadow-xl cursor-pointer`}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      );
    };
  
    if (gameState !== "playing") return null;
  
    return (
      <div className="flex flex-col h-full justify-between pb-4 sm:pb-8">
        <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-8 px-2 sm:px-4 gap-2">
          <div className="bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base md:text-lg font-bold text-primary font-mono border-2 border-primary/20">
            Level {level + 1} / {LEVEL_COUNT}
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base md:text-lg font-extrabold text-yellow-600 dark:text-yellow-400 border-2 border-yellow-400/30">
            Score: {score}
          </div>
        </div>
  
        <div className="flex-1 flex flex-col items-center justify-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-10 text-foreground text-center drop-shadow-sm px-2">
            How many do you see?
          </h3>
          
          <div className="min-h-[200px] sm:min-h-[240px] flex items-center justify-center mb-10 sm:mb-16">
            {renderObjects(targetNumber)}
          </div>
  
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-lg px-2 sm:px-4">
            {options.map((opt, i) => {
              const isCorrect = feedback === "correct" && opt === targetNumber;
              const isWrong = feedback === "incorrect" && opt !== targetNumber;
              const isFailedTarget = feedback === "incorrect" && opt === targetNumber;
  
              let buttonColors = "from-blue-400 to-indigo-500 border-indigo-700 shadow-indigo-300/50";
              if (isCorrect) buttonColors = "from-green-400 to-emerald-500 border-emerald-700 shadow-emerald-300/50";
              if (isFailedTarget) buttonColors = "from-red-400 to-rose-500 border-rose-700 shadow-rose-300/50";
              if (isWrong) buttonColors = "from-gray-300 to-gray-400 border-gray-500 opacity-50";
  
              return (
                <motion.div
                  key={`${level}-${i}`}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                >
                  <button
                    className={`w-full h-16 sm:h-20 text-3xl sm:text-4xl font-bold rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all bg-gradient-to-b text-white shadow-lg flex items-center justify-center ${buttonColors}`}
                    onClick={() => handleOptionClick(opt)}
                    disabled={feedback !== null}
                  >
                    {opt}
                  </button>
                </motion.div>
              );
            })}
          </div>
      </div>
    </div>
  );
}
