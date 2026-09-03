"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gamepad2, Trophy, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";

type Point = { x: number; y: number };

const GRID_SIZE = 20;

export default function RetroArcadeGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [dir, setDir] = useState<Point>({ x: 1, y: 0 });
  const lastDirRef = useRef<Point>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Input
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const currentDir = lastDirRef.current;
      if ((e.key === 'ArrowUp' || e.key === 'w') && currentDir.y !== 1) setDir({ x: 0, y: -1 });
      if ((e.key === 'ArrowDown' || e.key === 's') && currentDir.y !== -1) setDir({ x: 0, y: 1 });
      if ((e.key === 'ArrowLeft' || e.key === 'a') && currentDir.x !== 1) setDir({ x: -1, y: 0 });
      if ((e.key === 'ArrowRight' || e.key === 'd') && currentDir.x !== -1) setDir({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Game Loop
  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      lastDirRef.current = dir;
      setSnake(prev => {
        const head = prev[0];
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          handleDeath();
          return prev;
        }

        // Self collision
        if (prev.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          handleDeath();
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          playPop();
          setScore(s => s + 1);
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          });
        } else {
          newSnake.pop(); // remove tail
        }

        return newSnake;
      });
    };

    const speed = Math.max(80, 200 - (score * 5));
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [dir, food, gameOver, score, playPop]);

  const handleDeath = () => {
    setGameOver(true);
    playIncorrect();
    logActivity({ topic: "Retro Arcade", durationMinutes: 1, score });
    addXp(score * 10);
  };

  const handleMobileControl = (newDir: Point) => {
    if ((newDir.x !== 0 && dir.x === 0) || (newDir.y !== 0 && dir.y === 0)) {
      setDir(newDir);
    }
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-mono">
        <div className="bg-zinc-900 p-12 border-4 border-green-500 text-center max-w-lg w-full text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <Skull className="w-24 h-24 mx-auto mb-6" />
          <h1 className="text-4xl font-black mb-4 uppercase">Game Over</h1>
          <p className="text-2xl mb-8">Score: {score}</p>
          <Button onClick={() => window.location.reload()} className="w-full h-16 bg-green-500 hover:bg-green-600 text-black font-black text-xl mb-4 rounded-none">Insert Coin (Play Again)</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-16 border-green-500 text-green-500 hover:bg-zinc-800 font-black text-xl rounded-none">Back to Arcade</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col font-mono text-green-500">
      <header className="flex justify-between items-center p-6 border-b-2 border-green-900">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="hover:bg-zinc-900 text-green-500 hover:text-green-400">
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit
        </Button>
        <div className="text-2xl font-black flex items-center">
          <Gamepad2 className="w-6 h-6 mr-3" /> SCORE: {score}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Game Board */}
        <div 
          className="bg-zinc-950 border-4 border-green-900 relative"
          style={{ width: '90vw', maxWidth: '400px', height: '90vw', maxHeight: '400px' }}
        >
          {/* Snake */}
          {snake.map((seg, i) => (
            <div 
              key={i} 
              className="absolute bg-green-500 border border-black"
              style={{
                left: `${(seg.x / GRID_SIZE) * 100}%`,
                top: `${(seg.y / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                opacity: i === 0 ? 1 : 0.8
              }}
            />
          ))}
          {/* Food */}
          <div 
            className="absolute bg-red-500"
            style={{
              left: `${(food.x / GRID_SIZE) * 100}%`,
              top: `${(food.y / GRID_SIZE) * 100}%`,
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
            }}
          />
        </div>

        {/* Mobile D-Pad */}
        <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
          <div />
          <Button onClick={() => handleMobileControl({ x: 0, y: -1 })} className="bg-zinc-800 h-16 border border-green-900">UP</Button>
          <div />
          <Button onClick={() => handleMobileControl({ x: -1, y: 0 })} className="bg-zinc-800 h-16 border border-green-900">L</Button>
          <div className="bg-zinc-900 rounded-full" />
          <Button onClick={() => handleMobileControl({ x: 1, y: 0 })} className="bg-zinc-800 h-16 border border-green-900">R</Button>
          <div />
          <Button onClick={() => handleMobileControl({ x: 0, y: 1 })} className="bg-zinc-800 h-16 border border-green-900">DN</Button>
          <div />
        </div>
      </main>
    </div>
  );
}
