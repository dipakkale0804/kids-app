"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameMetadata, GameState, GameSession } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Star, Trophy, ArrowRight, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { useUserStore } from "@/store/useUserStore";
import { useChallengeStore } from "@/store/useChallengeStore";
import { useGameSounds } from "@/hooks/useGameSounds";

interface GameEngineProps {
  metadata: GameMetadata;
  children: (props: {
    onComplete: (score: number, accuracy: number) => void;
    gameState: GameState;
  }) => React.ReactNode;
}

export function GameEngine({ metadata, children }: GameEngineProps) {
  const [gameState, setGameState] = useState<GameState>("start");
  const [session, setSession] = useState<Partial<GameSession>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const { addXp, addStars, updateStreak, logActivity } = useUserStore();
  const { incrementProgress } = useChallengeStore();
  const { playPop, playLevelUp } = useGameSounds();

  const handleStart = () => {
    playPop();
    setStartTime(Date.now());
    setGameState("playing");
  }

  const handleComplete = (score: number, accuracy: number) => {
    const xpEarned = Math.round(metadata.xpReward * accuracy);
    const starsEarned = accuracy > 0.8 ? 3 : accuracy > 0.5 ? 2 : 1;
    
    setSession({
      gameId: metadata.id,
      score,
      accuracy,
      xpEarned,
      completedAt: new Date(),
    });
    setGameState("completed");
    
    // Play celebratory sound
    playLevelUp();
    
    // Track Activity - Ensure at least 1 minute is recorded for quick tests
    const durationMinutes = startTime ? Math.max(1, Math.ceil((Date.now() - startTime) / 60000)) : 1;
    logActivity({
      topic: metadata.title,
      durationMinutes,
      score: accuracy * 100
    });

    // Track Challenges
    let challengeXp = 0;
    challengeXp += incrementProgress("play_games", 1);
    challengeXp += incrementProgress("earn_xp", xpEarned);

    // Update global state
    addXp(xpEarned + challengeXp);
    addStars(starsEarned);
    updateStreak();

    // Trigger confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleRetry = () => {
    playPop();
    setGameState("start");
    setSession({});
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[80svh] sm:min-h-[500px] flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden border-2 border-primary/20 relative">
      {/* Game Header */}
      <div className="bg-primary/10 p-4 flex justify-between items-center border-b-2 border-primary/20">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          {metadata.title}
        </h2>
        <div className="flex gap-2">
          <div className="bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-900" /> {metadata.xpReward} XP
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col">
        <AnimatePresence mode="wait">
          {gameState === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-primary/5"
            >
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-xl bg-gradient-to-br ${metadata.color || "from-primary/20 to-primary/40"} border-2 border-white/20 relative overflow-hidden`}>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/30 rounded-full blur-2xl" />
                <motion.span 
                  animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-5xl md:text-6xl drop-shadow-lg z-10"
                >
                  {metadata.icon || "🎮"}
                </motion.span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-foreground">{metadata.title}</h3>
              <p className="text-lg text-muted-foreground max-w-md mb-8 font-mono">
                {metadata.description}
              </p>
              <Button 
                size="lg" 
                onClick={handleStart}
                className="text-xl py-6 px-10 rounded-full font-bold shadow-lg shadow-primary/30"
              >
                Play Now! <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </motion.div>
          )}

          {gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col p-6 h-full min-h-[600px]"
            >
              {children({ onComplete: handleComplete, gameState })}
            </motion.div>
          )}

          {gameState === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-success/10"
            >
              <Trophy className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-lg" />
              <h3 className="text-4xl font-bold text-success mb-4">Awesome Job!</h3>
              
              <div className="flex gap-4 mb-8">
                <div className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-md border border-primary/20 min-w-[120px]">
                  <p className="text-xs text-muted-foreground font-bold mb-2 uppercase tracking-wider">Score</p>
                  <p className="text-3xl font-bold text-foreground">{session.score}</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-5 rounded-2xl shadow-md border border-yellow-400/50 min-w-[120px]">
                  <p className="text-xs text-yellow-700 dark:text-yellow-500 font-bold mb-2 uppercase tracking-wider">XP Earned</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center justify-center gap-2">
                    +{session.xpEarned} <Star className="w-5 h-5 fill-yellow-500" />
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button size="lg" variant="outline" onClick={handleRetry} className="rounded-full font-bold text-lg px-8 border-2">
                  <RotateCcw className="w-5 h-5 mr-2" /> Play Again
                </Button>
                <Link href="/games">
                  <Button size="lg" className="rounded-full font-bold text-lg px-8 shadow-lg">
                    More Games <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
