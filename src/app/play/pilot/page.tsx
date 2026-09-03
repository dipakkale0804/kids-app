"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plane, Trophy, CloudLightning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";

export default function SkyPilotGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [startTime] = useState(Date.now());
  const [birdPos, setBirdPos] = useState(50); // percentage 0-100
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState<{ id: number; left: number; gapTop: number }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [obstacleId, setObstacleId] = useState(0);

  const gravity = 0.5;
  const jumpStrength = -6;
  const gapSize = 35; // 35% gap
  const obstacleSpeed = 1.5;

  const jump = useCallback(() => {
    if (gameOver) return;
    setVelocity(jumpStrength);
    playPop();
  }, [gameOver, playPop, jumpStrength]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") jump();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  // Physics Loop
  useEffect(() => {
    if (gameOver) return;

    let frame: number;
    const loop = () => {
      let isHit = false;
      let scoreInc = 0;

      setBirdPos(prev => {
        const newPos = prev + velocity;
        if (newPos > 95 || newPos < 0) {
          isHit = true; // Hit floor or ceiling
        }
        return newPos;
      });
      setVelocity(v => v + gravity);

      setObstacles(prev => {
        const updated = prev.map(obs => {
          const newLeft = obs.left - obstacleSpeed;
          // Bird is at roughly left: 20%, width: 10%
          if (newLeft > 10 && newLeft < 30) {
            // Check vertical collision
            if (birdPos < obs.gapTop || birdPos > obs.gapTop + gapSize) {
              isHit = true;
            } else if (newLeft < 15 && obs.left >= 15) {
              // Passed safely!
              scoreInc++;
            }
          }
          return { ...obs, left: newLeft };
        }).filter(obs => obs.left > -20); // clean up off screen

        return updated;
      });

      if (isHit) {
        handleCrash();
        return; // stop moving
      }
      if (scoreInc > 0) {
        setScore(s => s + scoreInc);
      }

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [gameOver, velocity, birdPos]); // Don't depend on obstacles to avoid loop lag, it uses functional state updates

  // Spawner
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setObstacles(prev => [
        ...prev,
        { id: obstacleId, left: 100, gapTop: Math.random() * 40 + 10 } // Gap top from 10% to 50%
      ]);
      setObstacleId(c => c + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, [gameOver, obstacleId]);

  const handleCrash = () => {
    if (gameOver) return;
    setGameOver(true);
    playIncorrect();
    playLevelUp();
    logActivity({ topic: "Sky Pilot", durationMinutes: 1, score });
    addXp(Math.floor(score * 5));
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl border-4 border-slate-800 text-center max-w-lg w-full text-white">
          <CloudLightning className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-black mb-4">CRASHED!</h1>
          <p className="text-xl text-slate-400 font-bold mb-8">Score: {score}</p>
          <Button onClick={() => window.location.reload()} className="w-full h-16 rounded-full font-black text-xl bg-indigo-500 hover:bg-indigo-600 mb-4">Fly Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-16 rounded-full font-black text-xl text-slate-400 border-slate-700">Back to Arcade</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-300 overflow-hidden relative" onClick={jump}>
      <header className="absolute top-0 w-full flex justify-between p-6 z-20">
        <Button variant="ghost" onClick={(e) => { e.stopPropagation(); router.push('/adventure'); }} className="bg-white/50 hover:bg-white/80 rounded-full font-bold shadow-sm">
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit
        </Button>
        <div className="bg-white/80 px-6 py-2 rounded-full font-black text-2xl flex items-center shadow-lg">
          <Trophy className="w-6 h-6 text-yellow-500 mr-2" /> {score}
        </div>
      </header>

      {/* Sun & Clouds */}
      <div className="absolute top-10 right-20 w-32 h-32 bg-yellow-300 rounded-full shadow-[0_0_100px_rgba(253,224,71,0.8)]" />
      <div className="absolute top-32 left-32 text-6xl opacity-60">☁️</div>
      <div className="absolute top-64 right-1/4 text-8xl opacity-40">☁️</div>

      <main className="absolute inset-0 z-10 pointer-events-none">
        {/* Plane */}
        <motion.div 
          className="absolute left-[20%] w-16 h-12 flex items-center justify-center z-20"
          style={{ top: `${birdPos}%`, rotate: velocity * 3 }}
        >
          <div className="w-16 h-10 bg-red-500 rounded-full rounded-tr-none border-2 border-red-700 relative">
            <div className="absolute top-0 right-4 w-6 h-4 bg-sky-200 rounded-sm border-2 border-slate-400" />
            <div className="absolute -left-2 top-2 w-4 h-6 bg-red-600 rounded-sm" />
            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 w-6 h-6" />
          </div>
        </motion.div>

        {/* Clouds (Pipes) */}
        {obstacles.map(obs => (
          <div key={obs.id}>
            {/* Top Cloud Pillar */}
            <div className="absolute bg-slate-400/50 rounded-b-3xl border-4 border-slate-300 backdrop-blur-sm" 
                 style={{ left: `${obs.left}%`, width: '15%', top: 0, height: `${obs.gapTop}%` }}>
            </div>
            {/* Bottom Cloud Pillar */}
            <div className="absolute bg-slate-400/50 rounded-t-3xl border-4 border-slate-300 backdrop-blur-sm" 
                 style={{ left: `${obs.left}%`, width: '15%', top: `${obs.gapTop + gapSize}%`, bottom: 0 }}>
            </div>
          </div>
        ))}
      </main>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sky-800 font-bold uppercase tracking-widest text-center">
        Tap screen to fly
      </div>
    </div>
  );
}
