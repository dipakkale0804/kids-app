"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";

export default function DinoRunGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [startTime] = useState(Date.now());
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<{ id: number, left: number }[]>([]);
  const [obstacleId, setObstacleId] = useState(0);

  // Jump logic
  const jump = useCallback(() => {
    if (isJumping || gameOver) return;
    setIsJumping(true);
    playPop();
    setTimeout(() => {
      setIsJumping(false);
    }, 500); // Jump duration
  }, [isJumping, gameOver, playPop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") jump();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    let animationId: number;
    let lastSpawn = 0;
    
    const loop = (timestamp: number) => {
      let hit = false;
      
      const speed = 2 + (score * 0.001); // Fix: scales much slower now

      setObstacles(prev => {
        const next = prev.map(obs => {
          const newLeft = obs.left - speed;
          // Collision detection: Character is at left: 10% (w: 50px), Jump height is roughly when isJumping is true
          // If obstacle left is between 5% and 15%, and !isJumping -> hit
          if (newLeft > 5 && newLeft < 15 && !isJumping) {
            hit = true;
          }
          return { ...obs, left: newLeft };
        }).filter(obs => obs.left > -10);

        return next;
      });

      if (hit) {
        handleCrash();
        return;
      }

      setScore(s => s + 1);

      // Spawner logic
      const spawnRate = Math.max(800, 2000 - (score * 0.2)); // Fix: scales much slower now
      if (timestamp - lastSpawn > spawnRate) {
        lastSpawn = timestamp;
        setObstacles(prev => [...prev, { id: obstacleId, left: 100 }]);
        setObstacleId(c => c + 1);
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [gameOver, isJumping, score, obstacleId]);

  const handleCrash = () => {
    setGameOver(true);
    playIncorrect();
    playLevelUp();
    logActivity({
      topic: "Dino Run",
      durationMinutes: Math.max(1, Math.ceil((Date.now() - startTime) / 60000)),
      score
    });
    addXp(Math.floor(score / 10));
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-slate-900 p-12 rounded-[3rem] shadow-[0_0_50px_rgba(239,68,68,0.3)] border-4 border-slate-800 text-center max-w-lg w-full">
          <Skull className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-black text-white mb-4">CAUGHT!</h1>
          <p className="text-xl text-slate-400 font-bold mb-2">Score: {score}</p>
          <Button onClick={() => window.location.reload()} className="w-full h-16 rounded-full font-black text-xl bg-emerald-500 hover:bg-emerald-600 mb-4">Play Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-16 rounded-full font-black text-xl">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 flex flex-col overflow-hidden relative" onClick={jump}>
      <header className="flex justify-between items-center p-6 relative z-50">
        <Button variant="ghost" onClick={(e) => { e.stopPropagation(); router.push('/adventure'); }} className="rounded-full font-bold bg-white/20 hover:bg-white/40">
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit
        </Button>
        <div className="bg-slate-900/80 px-6 py-3 rounded-full shadow-lg text-white font-black text-2xl flex items-center">
          <Trophy className="w-6 h-6 text-yellow-400 mr-2" /> {score}
        </div>
      </header>

      {/* Sun */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-300 rounded-full shadow-[0_0_100px_rgba(253,224,71,0.8)]" />

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-1/3 bg-emerald-500 border-t-8 border-emerald-700">
        <div className="w-full h-4 bg-emerald-400 opacity-50" />
      </div>

      <main className="absolute inset-0 z-10 pointer-events-none">
        {/* Character */}
        <motion.div 
          className="absolute left-[10%] w-16 h-16 bg-blue-600 rounded-lg border-4 border-black flex items-center justify-center shadow-lg"
          animate={{ bottom: isJumping ? '45%' : '33.33%' }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="w-4 h-4 bg-white rounded-full absolute top-2 right-2"><div className="w-2 h-2 bg-black rounded-full absolute right-0 top-1" /></div>
        </motion.div>

        {/* Obstacles */}
        {obstacles.map(obs => (
          <div key={obs.id} className="absolute bottom-[33.33%] w-12 h-12 bg-red-600 rounded-t-lg border-4 border-black shadow-lg" style={{ left: `${obs.left}%` }} />
        ))}
      </main>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 font-bold tracking-widest uppercase">
        Tap screen or press SPACE to jump
      </div>
    </div>
  );
}
