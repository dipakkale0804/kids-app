"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, AlertTriangle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";

type Obstacle = {
  id: number;
  lane: number;
  top: number; // percentage down the screen
};

export default function CarRaceGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [startTime] = useState(Date.now());
  const [carLane, setCarLane] = useState(1); // 0 = left, 1 = center, 2 = right
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [obstacleIdCounter, setObstacleIdCounter] = useState(0);

  const moveLeft = useCallback(() => {
    if (gameOver) return;
    setCarLane(prev => Math.max(0, prev - 1));
    playPop();
  }, [gameOver, playPop]);

  const moveRight = useCallback(() => {
    if (gameOver) return;
    setCarLane(prev => Math.min(2, prev + 1));
    playPop();
  }, [gameOver, playPop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") moveLeft();
      if (e.key === "ArrowRight" || e.key === "d") moveRight();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveLeft, moveRight]);

  // Game Loop (Obstacle generation and movement)
  useEffect(() => {
    if (gameOver) return;

    let animationFrameId: number;
    let lastSpawn = 0;

    const gameLoop = (timestamp: number) => {
      let isHit = false;
      
      // Move obstacles down
      setObstacles(prev => {
        const nextObstacles = prev.map(obs => ({
          ...obs,
          top: obs.top + speed
        })).filter(obs => obs.top < 110); // Remove when off screen
        
        // Check collisions (car is at roughly top: 80% to 95%)
        const hit = nextObstacles.find(obs => obs.lane === carLane && obs.top > 75 && obs.top < 95);
        if (hit) {
          isHit = true;
        }

        return nextObstacles;
      });

      if (isHit) {
        handleCrash();
        return;
      }

      // Increase score and speed slightly over time
      setScore(s => s + 1);
      if (score % 500 === 0 && speed < 5) {
        setSpeed(s => s + 0.2); 
      }

      // Spawn new obstacles
      const spawnInterval = Math.max(400, 1000 - (score * 2));
      if (timestamp - lastSpawn > spawnInterval) {
        lastSpawn = timestamp;
        
        setObstacles(prev => {
          // Determine how many blocks to spawn (1 or 2)
          const numBlocks = Math.random() > 0.7 ? 2 : 1;
          
          const lanes = [0, 1, 2];
          const chosenLanes: number[] = [];
          
          for (let i = 0; i < numBlocks; i++) {
            const r = Math.floor(Math.random() * lanes.length);
            chosenLanes.push(lanes[r]);
            lanes.splice(r, 1); // remove to prevent duplicate
          }
          
          const newObs = chosenLanes.map((lane, i) => ({
            id: obstacleIdCounter + i,
            lane,
            top: -10
          }));
          
          setObstacleIdCounter(c => c + numBlocks);
          return [...prev, ...newObs];
        });
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameOver, carLane, speed, score, obstacleIdCounter]);

  const handleCrash = () => {
    setGameOver(true);
    playIncorrect(); // Crash sound
    playLevelUp(); // Game over music/fanfare

    logActivity({
      topic: "Speed Racer",
      durationMinutes: Math.max(1, Math.ceil((Date.now() - startTime) / 60000)),
      score: score
    });
    addXp(Math.floor(score / 10)); // Reward XP based on score
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-slate-900 p-12 rounded-[3rem] shadow-[0_0_50px_rgba(239,68,68,0.3)] border-4 border-slate-800 text-center max-w-lg w-full"
        >
          <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">CRASH!</h1>
          <p className="text-xl text-slate-400 font-bold mb-2">Final Score: {score}</p>
          <p className="text-lg text-emerald-400 font-bold mb-8">You earned {Math.floor(score / 10)} XP!</p>
          
          <div className="flex flex-col gap-4">
            <Button 
              size="lg"
              onClick={() => window.location.reload()}
              className="w-full h-16 rounded-full font-black text-xl shadow-lg bg-red-500 hover:bg-red-600"
            >
              Play Again
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => router.push('/adventure')}
              className="w-full h-16 rounded-full font-black text-xl border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Back to Arcade
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-700 flex flex-col overflow-hidden relative selection:bg-transparent">
      {/* HUD */}
      <header className="flex justify-between items-center p-6 relative z-50 pointer-events-none">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/adventure')}
          className="rounded-full font-bold bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm pointer-events-auto"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit
        </Button>
        
        <div className="bg-slate-900/80 px-6 py-3 rounded-full shadow-lg border-2 border-slate-700 font-black text-2xl text-white flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          {score}
        </div>
      </header>

      {/* The Road */}
      <main className="absolute inset-0 flex justify-center">
        <div className="w-full max-w-md bg-slate-800 h-full relative overflow-hidden border-x-8 border-slate-400">
          {/* Lane dividers */}
          <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-dashed-line opacity-50" style={{ borderLeft: '8px dashed white', height: '200%' }} />
          <div className="absolute top-0 bottom-0 right-1/3 w-2 bg-dashed-line opacity-50" style={{ borderLeft: '8px dashed white', height: '200%' }} />
          
          {/* Obstacles */}
          {obstacles.map(obs => (
            <div 
              key={obs.id}
              className="absolute w-1/3 flex justify-center"
              style={{ 
                left: `${obs.lane * 33.33}%`, 
                top: `${obs.top}%` 
              }}
            >
              <div className="w-16 h-16 bg-red-500 rounded-xl border-4 border-red-700 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
          ))}

          {/* Player Car */}
          <motion.div 
            animate={{ left: `${carLane * 33.33}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute bottom-12 w-1/3 flex justify-center z-20"
          >
            <div className="w-20 h-32 bg-blue-500 rounded-2xl border-4 border-blue-700 shadow-xl flex flex-col items-center justify-between p-2">
              <div className="w-12 h-6 bg-slate-900 rounded-t-lg opacity-80" />
              <Car className="w-10 h-10 text-white opacity-20" />
              <div className="w-12 h-6 bg-slate-900 rounded-b-lg opacity-80" />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Mobile Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between px-8 z-50 md:hidden">
        <Button 
          onClick={moveLeft}
          className="w-24 h-24 rounded-full bg-white/20 active:bg-white/40 backdrop-blur-md border-2 border-white/30"
        >
          <ArrowLeft className="w-10 h-10 text-white" />
        </Button>
        <Button 
          onClick={moveRight}
          className="w-24 h-24 rounded-full bg-white/20 active:bg-white/40 backdrop-blur-md border-2 border-white/30"
        >
          <ArrowLeft className="w-10 h-10 text-white rotate-180" />
        </Button>
      </div>
    </div>
  );
}
