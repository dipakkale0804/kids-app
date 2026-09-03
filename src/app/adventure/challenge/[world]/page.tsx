"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Swords, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import confetti from "canvas-confetti";

// A small mock database of questions for the challenge
const QUESTIONS = [
  { text: "Find the letter A", answer: "A", options: ["B", "A", "C", "D"], color: "text-rose-500" },
  { text: "Which number is 5?", answer: "5", options: ["3", "8", "5", "1"], color: "text-blue-500" },
  { text: "Find the color Red", answer: "🔴", options: ["🔵", "🔴", "🟢", "🟡"], color: "text-red-500" },
  { text: "Find the Apple", answer: "🍎", options: ["🍌", "🍎", "🍇", "🍉"], color: "text-emerald-500" },
  { text: "Which one is a Star?", answer: "⭐", options: ["⭕", "🟥", "⭐", "🔺"], color: "text-amber-500" },
];

export default function BossChallenge({ params }: { params: Promise<{ world: string }> }) {
  const router = useRouter();
  const { playPop, playCorrect, playIncorrect, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();
  
  const resolvedParams = use(params);
  const world = resolvedParams.world.charAt(0).toUpperCase() + resolvedParams.world.slice(1);

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Shuffle options for current question
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    // Shuffle options on load
    const shuffled = [...QUESTIONS[currentQ].options].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  }, [currentQ]);

  const handleAnswer = (answer: string) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedAnswer(answer);

    const isCorrect = answer === QUESTIONS[currentQ].answer;

    if (isCorrect) {
      playCorrect();
      setScore(s => s + 1);
    } else {
      playIncorrect();
    }

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(c => c + 1);
        setSelectedAnswer(null);
        setIsAnimating(false);
      } else {
        // Game Over - Boss Defeated!
        playLevelUp();
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
        
        const finalScore = isCorrect ? score + 1 : score;
        const accuracy = (finalScore / QUESTIONS.length) * 100;
        
        logActivity({
          topic: `${world} Boss`,
          durationMinutes: Math.max(1, Math.ceil((Date.now() - startTime) / 60000)),
          score: Math.round(accuracy)
        });
        
        addXp(200); // Massive XP for beating a boss

        setTimeout(() => {
          router.push('/adventure');
        }, 4000);
      }
    }, 1500);
  };

  if (currentQ >= QUESTIONS.length) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-red-500 text-white p-12 rounded-full shadow-[0_0_100px_rgba(239,68,68,0.5)] mb-8"
        >
          <Swords className="w-24 h-24" />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">BOSS DEFEATED!</h1>
        <p className="text-2xl text-red-200 font-bold mb-8">You earned 200 XP!</p>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 md:p-8">
      <header className="flex justify-between items-center w-full max-w-4xl mx-auto mb-10 mt-4 relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/adventure')}
          className="rounded-full font-bold text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Flee
        </Button>
        <div className="flex items-center gap-3 bg-red-500/20 px-6 py-2 rounded-full border-2 border-red-500/50">
          <Swords className="w-5 h-5 text-red-400" />
          <span className="font-black text-red-400 text-lg">{world} Boss</span>
        </div>
        <div className="font-bold text-white bg-slate-800 px-6 py-2 rounded-full border-2 border-slate-700">
          Question {currentQ + 1} / {QUESTIONS.length}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full relative z-10">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 w-full rounded-[3rem] p-8 md:p-12 shadow-2xl border-4 border-slate-700 text-center relative overflow-hidden"
        >
          {/* Subtle Boss Background Effect */}
          <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay animate-pulse" />

          <h2 className="text-3xl md:text-5xl font-black text-white mb-12 drop-shadow-md relative z-10">
            {q.text}
          </h2>

          <div className="grid grid-cols-2 gap-4 md:gap-6 relative z-10">
            {options.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === q.answer;
              
              let btnClass = "bg-slate-700 hover:bg-slate-600 border-slate-600 text-white";
              let Icon = null;

              if (selectedAnswer) {
                if (isCorrect) {
                  btnClass = "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-105 z-20";
                  Icon = CheckCircle2;
                } else if (isSelected && !isCorrect) {
                  btnClass = "bg-red-500 border-red-400 text-white opacity-50 scale-95";
                  Icon = XCircle;
                } else {
                  btnClass = "bg-slate-800 border-slate-700 text-slate-500 opacity-30";
                }
              }

              return (
                <motion.button
                  key={i}
                  whileHover={!selectedAnswer ? { scale: 1.05 } : {}}
                  whileTap={!selectedAnswer ? { scale: 0.95 } : {}}
                  onClick={() => handleAnswer(opt)}
                  disabled={selectedAnswer !== null}
                  className={`relative p-8 md:p-12 rounded-3xl border-4 font-black text-6xl md:text-8xl transition-all duration-300 flex items-center justify-center ${btnClass} ${q.color}`}
                >
                  {opt}
                  {Icon && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4"
                    >
                      <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
