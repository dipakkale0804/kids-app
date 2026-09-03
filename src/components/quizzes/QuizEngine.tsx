"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Star, Trophy, ArrowRight, RotateCcw, Check, X } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "@/store/useUserStore";
import { useChallengeStore } from "@/store/useChallengeStore";

export function QuizEngine({ quiz }: { quiz: Quiz }) {
  const [gameState, setGameState] = useState<"start" | "playing" | "completed">("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const { addXp, addStars, updateStreak } = useUserStore();
  const { incrementProgress } = useChallengeStore();

  const handleStart = () => {
    setGameState("playing");
    setCurrentIndex(0);
    setScore(0);
  };

  const triggerConfetti = () => {
    const duration = 2 * 1000;
    const end = Date.now() + duration;
    const interval: any = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      confetti({
        particleCount: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleOptionClick = (optionId: string, isCorrect: boolean) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(optionId);
    
    let newScore = score;
    if (isCorrect) {
      setFeedback("correct");
      newScore = score + 1;
      setScore(newScore);
    } else {
      setFeedback("incorrect");
    }

    setTimeout(() => {
      if (currentIndex + 1 < quiz.questions.length) {
        setCurrentIndex(c => c + 1);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        const accuracy = newScore / quiz.questions.length;
        const xpEarned = Math.round(quiz.metadata.xpReward * accuracy);
        const starsEarned = accuracy === 1 ? 3 : accuracy >= 0.5 ? 2 : 1;
        
        let challengeXp = 0;
        challengeXp += incrementProgress("play_quizzes", 1);
        challengeXp += incrementProgress("earn_xp", xpEarned);

        addXp(xpEarned + challengeXp);
        addStars(starsEarned);
        updateStreak();
        
        setGameState("completed");
        triggerConfetti();
      }
    }, 1500);
  };

  const handleRetry = () => {
    setGameState("start");
    setSelectedOption(null);
    setFeedback(null);
  };

  const question = quiz.questions[currentIndex];
  const progress = ((currentIndex) / quiz.questions.length) * 100;
  const accuracy = score / quiz.questions.length;
  const xpEarned = Math.round(quiz.metadata.xpReward * accuracy);

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[80svh] sm:min-h-[600px] flex flex-col bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border-4 border-primary/20 relative">
      <div className="bg-primary/10 p-4 flex justify-between items-center border-b-4 border-primary/20">
        <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
          {quiz.metadata.title}
        </h2>
        <div className="bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-900" /> {quiz.metadata.xpReward} XP Max
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
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl md:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-8 shadow-2xl bg-gradient-to-br ${quiz.metadata.color || "from-purple-200 to-purple-400"} border-4 border-white/20 relative overflow-hidden`}>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/30 rounded-full blur-2xl" />
                <motion.span 
                  animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-6xl md:text-8xl drop-shadow-xl z-10"
                >
                  {quiz.metadata.icon || "🤔"}
                </motion.span>
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold mb-2 md:mb-4 text-foreground">{quiz.metadata.title}</h3>
              <p className="text-xl text-muted-foreground max-w-md mb-8 font-mono">
                {quiz.metadata.description}
              </p>
              <div className="font-bold text-lg mb-8 text-primary">
                {quiz.questions.length} Questions
              </div>
              <Button size="lg" onClick={handleStart} className="text-2xl py-8 px-12 rounded-full font-extrabold shadow-xl">
                Start Quiz! <ArrowRight className="ml-2 w-8 h-8" />
              </Button>
            </motion.div>
          )}

          {gameState === "playing" && question && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col p-8 h-full min-h-[600px]"
            >
              <div className="mb-8">
                <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
                  <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
                  <span>Score: {score}</span>
                </div>
                <Progress value={progress} className="h-3 rounded-full" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center">
                <h3 className="text-3xl md:text-4xl font-extrabold mb-10 text-center text-foreground leading-tight">
                  {question.question}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {question.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isCorrect = opt.isCorrect;
                    
                    let btnStateClass = "bg-white border-4 border-primary/20 hover:border-primary/50 text-foreground";
                    
                    if (selectedOption !== null) {
                      if (isCorrect) {
                        btnStateClass = "bg-success/20 border-4 border-success text-success-foreground";
                      } else if (isSelected && !isCorrect) {
                        btnStateClass = "bg-destructive/20 border-4 border-destructive text-destructive";
                      } else {
                        btnStateClass = "opacity-50 border-4 border-muted";
                      }
                    }

                    return (
                      <Button
                        key={opt.id}
                        variant="outline"
                        className={`h-auto min-h-[5rem] p-6 text-xl md:text-2xl font-bold rounded-2xl transition-all flex justify-between items-center ${btnStateClass}`}
                        onClick={() => handleOptionClick(opt.id, opt.isCorrect)}
                        disabled={selectedOption !== null}
                      >
                        <span className="text-left leading-tight">{opt.text}</span>
                        {selectedOption !== null && isCorrect && <Check className="w-8 h-8 text-success" />}
                        {isSelected && !isCorrect && <X className="w-8 h-8 text-destructive" />}
                      </Button>
                    );
                  })}
                </div>

                {feedback && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`mt-8 text-2xl font-extrabold ${feedback === "correct" ? "text-success" : "text-destructive"}`}
                  >
                    {feedback === "correct" ? "Awesome! Correct! 🌟" : "Oops! Almost! 😅"}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {gameState === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-success/10"
            >
              <Trophy className="w-32 h-32 text-yellow-500 mb-6 drop-shadow-xl" />
              <h3 className="text-5xl font-extrabold text-success mb-2">Quiz Complete!</h3>
              <p className="text-xl text-muted-foreground font-mono mb-8">You answered {score} out of {quiz.questions.length} correctly.</p>
              
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-6 rounded-2xl shadow-lg border-2 border-yellow-400/50 min-w-[200px] mb-10">
                <p className="text-sm text-yellow-700 dark:text-yellow-500 font-bold mb-2 uppercase tracking-wider">XP Earned</p>
                <p className="text-5xl font-extrabold text-yellow-600 dark:text-yellow-400 flex items-center justify-center gap-2">
                  +{xpEarned} <Star className="w-8 h-8 fill-yellow-500" />
                </p>
              </div>

              <div className="flex gap-4">
                <Button size="lg" variant="outline" onClick={handleRetry} className="rounded-full font-bold text-lg px-8 border-2">
                  <RotateCcw className="w-5 h-5 mr-2" /> Try Again
                </Button>
                <Link href="/quizzes">
                  <Button size="lg" className="rounded-full font-bold text-lg px-8 shadow-lg">
                    More Quizzes <ArrowRight className="w-5 h-5 ml-2" />
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
