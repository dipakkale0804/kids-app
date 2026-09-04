"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical, Droplets, Sparkles, RefreshCcw, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import confetti from "canvas-confetti";

const CHALLENGES = [
  { id: 1, name: "Make a Green Potion!", target: "bg-green-500", req: ["blue", "yellow"], hint: "Blue + Yellow" },
  { id: 2, name: "Make a Purple Potion!", target: "bg-purple-500", req: ["blue", "red"], hint: "Blue + Red" },
  { id: 3, name: "Make an Orange Potion!", target: "bg-orange-500", req: ["red", "yellow"], hint: "Red + Yellow" },
  { id: 4, name: "Rainbow Explosion!", target: "bg-fuchsia-500", req: ["blue", "red", "yellow"], hint: "Mix them all!" },
];

export default function ScienceLabPage() {
  const router = useRouter();
  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { addXp, logActivity } = useUserStore();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [beakerColor, setBeakerColor] = useState<string>("bg-transparent");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "mixing" | "success" | "sludge">("idle");
  const [fallingDrops, setFallingDrops] = useState<{id: number, color: string, left: number}[]>([]);
  const [beakerScale, setBeakerScale] = useState(1);

  const challenge = CHALLENGES[currentLevel];

  const handleAdd = (colorId: string, colorClass: string) => {
    if (status === "success" || status === "sludge") return;
    
    playPop();
    const dropId = Date.now();
    const leftOffset = colorId === "blue" ? -80 : colorId === "yellow" ? 0 : 80;
    
    setFallingDrops(prev => [...prev, { id: dropId, color: colorClass, left: leftOffset }]);

    setTimeout(() => {
      setFallingDrops(prev => prev.filter(d => d.id !== dropId));
      setBeakerScale(1.1);
      setTimeout(() => setBeakerScale(1), 150);

      const newIngredients = [...ingredients, colorId];
      setIngredients(newIngredients);

      // Color Mixing Logic
      if (newIngredients.length === 1) {
        if (colorId === "blue") setBeakerColor("bg-blue-500");
        if (colorId === "red") setBeakerColor("bg-red-500");
        if (colorId === "yellow") setBeakerColor("bg-yellow-400");
      } else if (newIngredients.length === 2) {
        const hasBlue = newIngredients.includes("blue");
        const hasYellow = newIngredients.includes("yellow");
        const hasRed = newIngredients.includes("red");
        
        if (hasBlue && hasYellow) setBeakerColor("bg-green-500");
        else if (hasBlue && hasRed) setBeakerColor("bg-purple-500");
        else if (hasRed && hasYellow) setBeakerColor("bg-orange-500");
        else setBeakerColor("bg-stone-600"); // Duplicate colors makes sludge
      } else if (newIngredients.length === 3) {
        const hasBlue = newIngredients.includes("blue");
        const hasYellow = newIngredients.includes("yellow");
        const hasRed = newIngredients.includes("red");
        
        if (hasBlue && hasYellow && hasRed) setBeakerColor("bg-fuchsia-500");
        else setBeakerColor("bg-stone-700");
      } else {
        setBeakerColor("bg-stone-800");
      }
    }, 400); // Wait for drop to fall
  };

  useEffect(() => {
    if (ingredients.length === challenge?.req.length) {
      setStatus("mixing");
      
      // Check if correct
      const isCorrect = challenge.req.every(req => ingredients.includes(req));
      
      setTimeout(() => {
        if (isCorrect) {
          setStatus("success");
          playLevelUp();
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        } else {
          setStatus("sludge");
          playIncorrect();
        }
      }, 1000);
    } else if (ingredients.length > (challenge?.req.length || 0)) {
       setStatus("sludge");
       playIncorrect();
    }
  }, [ingredients, challenge, playLevelUp, playIncorrect]);

  const handleNext = () => {
    if (currentLevel < CHALLENGES.length - 1) {
      setCurrentLevel(c => c + 1);
      setIngredients([]);
      setBeakerColor("bg-transparent");
      setStatus("idle");
    } else {
      // Game Complete
      logActivity({ topic: "Science Lab", durationMinutes: 2, score: 100 });
      addXp(300);
      router.push('/adventure');
    }
  };

  const resetBeaker = () => {
    setIngredients([]);
    setBeakerColor("bg-transparent");
    setStatus("idle");
  };

  if (!challenge) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <motion.div 
        animate={{ y: [0, -20, 0] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 opacity-10"
      >
        <Sparkles className="w-32 h-32 text-emerald-400" />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 30, 0] }} 
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-20 opacity-10"
      >
        <FlaskConical className="w-48 h-48 text-fuchsia-400" />
      </motion.div>

      {/* Main Game Box */}
      <div className="w-full max-w-5xl h-full md:h-[85vh] min-h-[600px] bg-slate-900 border-4 border-slate-800 rounded-3xl shadow-2xl overflow-y-auto overflow-x-hidden relative flex flex-col z-10">
        
        <header className="flex justify-between items-center p-4 bg-slate-900/50 text-white border-b-2 border-slate-800 z-10 backdrop-blur-md">
          <Button variant="ghost" onClick={() => router.push('/')} className="hover:bg-slate-800 font-bold rounded-full">
            <ArrowLeft className="w-5 h-5 mr-2" /> Exit
          </Button>
          <div className="flex items-center gap-2 bg-slate-800 px-5 py-1.5 rounded-full shadow-inner border-2 border-slate-700">
            <FlaskConical className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-slate-200">Experiment {currentLevel + 1} / {CHALLENGES.length}</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center z-10 w-full relative min-h-max">
          
          {/* Challenge Goal */}
          <motion.div 
            key={currentLevel}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800/80 backdrop-blur-md border-2 border-slate-700 rounded-2xl p-4 mb-4 md:mb-8 w-full max-w-lg text-center shadow-lg relative overflow-hidden flex-shrink-0"
          >
            <div className={`absolute top-0 left-0 w-full h-1 ${challenge.target}`} />
            <h2 className="text-2xl font-bold text-white mb-1">{challenge.name}</h2>
            <p className="text-slate-400 font-medium text-sm">Hint: {challenge.hint}</p>
          </motion.div>

          {/* Experiment Area */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 relative w-full flex-1 pb-8">
          
          {/* Ingredients Rack */}
          <div className="flex md:flex-col gap-4 bg-slate-900/50 p-4 rounded-[1.5rem] border border-slate-800 shadow-inner">
            <motion.button 
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAdd("blue", "bg-blue-500")}
              disabled={status !== "idle"}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-500 border-2 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <Droplets className="w-8 h-8 text-white drop-shadow-sm" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAdd("yellow", "bg-yellow-400")}
              disabled={status !== "idle"}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-yellow-400 border-2 border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.3)] flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <Droplets className="w-8 h-8 text-white drop-shadow-sm" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAdd("red", "bg-red-500")}
              disabled={status !== "idle"}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-500 border-2 border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <Droplets className="w-8 h-8 text-white drop-shadow-sm" />
            </motion.button>
          </div>

          {/* Main Beaker */}
          <div className="relative flex flex-col items-center">
            
            <AnimatePresence>
              {status === "success" && (
                <motion.div 
                  initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: -40 }}
                  className="absolute z-30 bg-emerald-500 text-white px-6 py-3 rounded-full font-black text-xl shadow-2xl border-4 border-emerald-300 flex items-center gap-2"
                >
                  <CheckCircle className="w-6 h-6" /> Success!
                </motion.div>
              )}
              {status === "sludge" && (
                <motion.div 
                  initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: -40 }}
                  className="absolute z-30 bg-stone-600 text-white px-6 py-3 rounded-full font-black text-xl shadow-2xl border-4 border-stone-400 flex items-center gap-2"
                >
                  Yuck! Sludge.
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="relative w-40 h-56 md:w-56 md:h-72 flex items-end justify-center mb-6"
              animate={{ scale: beakerScale }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              
              {/* Falling Drops Layer */}
              <AnimatePresence>
                {fallingDrops.map(drop => (
                  <motion.div
                    key={drop.id}
                    initial={{ y: -200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 0.4, ease: "easeIn" }}
                    className={`absolute z-20 w-8 h-8 rounded-full ${drop.color} blur-[2px]`}
                    style={{ left: `calc(50% + ${drop.left}px)`, transform: 'translateX(-50%)' }}
                  />
                ))}
              </AnimatePresence>

              {/* Glass Beaker Body */}
              <div className="absolute inset-0 border-[12px] border-white/20 rounded-b-[4rem] rounded-t-xl overflow-hidden backdrop-blur-sm z-10 shadow-[inset_0_-20px_50px_rgba(0,0,0,0.5)]">
                
                {/* Liquid Inside */}
                <motion.div 
                  className={`w-full absolute bottom-0 ${beakerColor} transition-colors duration-1000 ease-in-out`}
                  initial={{ height: "0%" }}
                  animate={{ height: `${(ingredients.length / challenge.req.length) * 90}%` }}
                >
                  {/* Bubbles if mixing or success */}
                  {(status === "mixing" || status === "success" || ingredients.length > 0) && (
                    <div className="absolute inset-0 opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] animate-[slideUp_2s_linear_infinite]" />
                  )}
                </motion.div>
              </div>
              
              {/* Beaker Lip */}
              <div className="absolute -top-4 w-[115%] h-8 border-[12px] border-white/20 rounded-full z-20" />
            </motion.div>

            {/* Action Buttons */}
            {status === "success" ? (
              <Button onClick={handleNext} className="w-full h-12 text-lg font-bold rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-bounce">
                Next Potion! <Star className="w-5 h-5 ml-2 fill-current" />
              </Button>
            ) : status === "sludge" ? (
              <Button onClick={resetBeaker} variant="outline" className="w-full h-12 text-lg font-bold rounded-full border-2 border-stone-500 text-stone-300 hover:bg-stone-800 hover:text-white">
                <RefreshCcw className="w-5 h-5 mr-2" /> Clean Beaker
              </Button>
            ) : (
              <div className="h-12 text-slate-500 font-bold flex items-center">
                Add {challenge.req.length - ingredients.length} more drop(s)...
              </div>
            )}
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
