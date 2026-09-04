"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";

const COLORS = [
  { id: 0, color: "bg-red-500", glow: "shadow-[0_0_50px_rgba(239,68,68,1)]" },
  { id: 1, color: "bg-blue-500", glow: "shadow-[0_0_50px_rgba(59,130,246,1)]" },
  { id: 2, color: "bg-emerald-500", glow: "shadow-[0_0_50px_rgba(16,185,129,1)]" },
  { id: 3, color: "bg-yellow-400", glow: "shadow-[0_0_50px_rgba(250,204,21,1)]" },
];

export default function SimonSaysGame() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [flashError, setFlashError] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState(false);

  const startGame = () => {
    setSequence([Math.floor(Math.random() * 4)]);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setPlayerStep(0);
  };

  useEffect(() => {
    if (sequence.length === 0 || gameOver) return;
    
    let isMounted = true;
    const playSequence = async () => {
      setIsPlayingSeq(true);
      await new Promise(r => setTimeout(r, 1000));
      for (let i = 0; i < sequence.length; i++) {
        if (!isMounted) return;
        setActiveColor(sequence[i]);
        playPop(); // Synthesize tone?
        await new Promise(r => setTimeout(r, 500));
        setActiveColor(null);
        await new Promise(r => setTimeout(r, 200));
      }
      setIsPlayingSeq(false);
    };
    playSequence();
    
    return () => { isMounted = false; };
  }, [sequence, gameOver, playPop]);

  const handleColorClick = (id: number) => {
    if (isPlayingSeq || gameOver || !gameStarted) return;
    
    setActiveColor(id);
    playPop();
    setTimeout(() => setActiveColor(null), 200);

    if (id === sequence[playerStep]) {
      if (playerStep === sequence.length - 1) {
        // Round passed
        setScore(sequence.length);
        setPlayerStep(0);
        setFlashSuccess(true);
        playLevelUp();
        setTimeout(() => {
          setFlashSuccess(false);
          setSequence(prev => [...prev, Math.floor(Math.random() * 4)]);
        }, 1000);
      } else {
        setPlayerStep(prev => prev + 1);
      }
    } else {
      // Failed
      playIncorrect();
      setFlashError(true);
      setTimeout(() => setGameOver(true), 500); // Small delay to show error flash
      logActivity({ topic: "Simon Says", durationMinutes: 2, score: score * 10 });
      addXp(score * 5);
    }
  };

  return (
    <motion.div 
      animate={{ 
        backgroundColor: flashError ? '#ef4444' : flashSuccess ? '#10b981' : '#020617' 
      }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      <header className="absolute top-0 w-full flex justify-between items-center p-4 text-white z-20">
        <Button variant="ghost" onClick={() => router.push('/adventure')} className="rounded-full font-bold hover:bg-white/10 text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit
        </Button>
        <div className="text-xl font-bold bg-white/10 px-5 py-2 rounded-full">
          Level: {score}
        </div>
      </header>

      {gameOver ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-slate-900 p-8 rounded-2xl shadow-xl border-2 border-slate-800 text-center z-10 max-w-sm w-full">
          <h1 className="text-3xl font-bold text-white mb-2">Game Over!</h1>
          <p className="text-slate-400 font-bold mb-6">You reached Level {score}</p>
          <Button onClick={startGame} className="w-full h-12 rounded-full font-bold text-lg bg-indigo-500 hover:bg-indigo-600 mb-3">Try Again</Button>
          <Button variant="outline" onClick={() => router.push('/adventure')} className="w-full h-12 rounded-full font-bold text-lg text-slate-300 border-slate-700">Back to Arcade</Button>
        </motion.div>
      ) : (
        <div className="relative">
          <div className="w-[260px] h-[260px] md:w-[340px] md:h-[340px] bg-slate-900 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden grid grid-cols-2 grid-rows-2 gap-1.5 p-1.5">
            {COLORS.map(c => (
              <motion.div
                key={c.id}
                whileTap={!isPlayingSeq && gameStarted ? { scale: 0.95 } : {}}
                onClick={() => handleColorClick(c.id)}
                className={`${c.color} ${activeColor === c.id ? `brightness-150 ${c.glow}` : 'brightness-75'} 
                  transition-all duration-100 cursor-pointer
                  ${c.id === 0 ? 'rounded-tl-full' : c.id === 1 ? 'rounded-tr-full' : c.id === 2 ? 'rounded-bl-full' : 'rounded-br-full'}
                `}
              />
            ))}
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-slate-950 rounded-full border-4 border-slate-800 flex items-center justify-center">
            {!gameStarted ? (
              <Button onClick={startGame} size="icon" className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white">
                <Play className="w-6 h-6 ml-1" />
              </Button>
            ) : (
              <span className="text-xl font-bold text-slate-500 uppercase tracking-widest">
                {isPlayingSeq ? 'Watch' : 'Play'}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
