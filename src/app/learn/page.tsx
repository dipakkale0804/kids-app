"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Volume2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import confetti from "canvas-confetti";

// --- Data ---
const ALPHABET = [
  { letter: "A", word: "Apple", emoji: "🍎", color: "text-red-500", bg: "bg-red-100" },
  { letter: "B", word: "Bear", emoji: "🐻", color: "text-amber-700", bg: "bg-amber-100" },
  { letter: "C", word: "Cat", emoji: "🐱", color: "text-orange-500", bg: "bg-orange-100" },
  { letter: "D", word: "Dog", emoji: "🐶", color: "text-blue-500", bg: "bg-blue-100" },
  { letter: "E", word: "Elephant", emoji: "🐘", color: "text-slate-500", bg: "bg-slate-100" },
  { letter: "F", word: "Frog", emoji: "🐸", color: "text-emerald-500", bg: "bg-emerald-100" },
  { letter: "G", word: "Giraffe", emoji: "🦒", color: "text-yellow-600", bg: "bg-yellow-100" },
  { letter: "H", word: "Horse", emoji: "🐴", color: "text-amber-800", bg: "bg-amber-100" },
  { letter: "I", word: "Ice Cream", emoji: "🍦", color: "text-pink-500", bg: "bg-pink-100" },
  { letter: "J", word: "Jellyfish", emoji: "🪼", color: "text-purple-500", bg: "bg-purple-100" },
  { letter: "K", word: "Kangaroo", emoji: "🦘", color: "text-orange-600", bg: "bg-orange-100" },
  { letter: "L", word: "Lion", emoji: "🦁", color: "text-amber-500", bg: "bg-amber-100" },
  { letter: "M", word: "Monkey", emoji: "🐒", color: "text-yellow-700", bg: "bg-yellow-100" },
  { letter: "N", word: "Nest", emoji: "🪹", color: "text-amber-900", bg: "bg-amber-100" },
  { letter: "O", word: "Owl", emoji: "🦉", color: "text-slate-600", bg: "bg-slate-100" },
  { letter: "P", word: "Penguin", emoji: "🐧", color: "text-slate-800", bg: "bg-slate-200" },
  { letter: "Q", word: "Queen", emoji: "👑", color: "text-yellow-500", bg: "bg-yellow-100" },
  { letter: "R", word: "Rabbit", emoji: "🐰", color: "text-slate-400", bg: "bg-slate-100" },
  { letter: "S", word: "Sun", emoji: "☀️", color: "text-yellow-400", bg: "bg-yellow-100" },
  { letter: "T", word: "Tiger", emoji: "🐯", color: "text-orange-500", bg: "bg-orange-100" },
  { letter: "U", word: "Umbrella", emoji: "☂️", color: "text-indigo-500", bg: "bg-indigo-100" },
  { letter: "V", word: "Volcano", emoji: "🌋", color: "text-red-600", bg: "bg-red-100" },
  { letter: "W", word: "Whale", emoji: "🐳", color: "text-blue-400", bg: "bg-blue-100" },
  { letter: "X", word: "Xylophone", emoji: "🎼", color: "text-fuchsia-500", bg: "bg-fuchsia-100" },
  { letter: "Y", word: "Yak", emoji: "🐂", color: "text-amber-800", bg: "bg-amber-100" },
  { letter: "Z", word: "Zebra", emoji: "🦓", color: "text-slate-900", bg: "bg-slate-200" }
];

const NUMBERS = Array.from({ length: 100 }, (_, i) => {
  const n = i + 1;
  const colors = ["text-red-500", "text-blue-500", "text-emerald-500", "text-yellow-500", "text-purple-500"];
  const bgs = ["bg-red-100", "bg-blue-100", "bg-emerald-100", "bg-yellow-100", "bg-purple-100"];
  return { letter: n.toString(), word: n.toString(), emoji: "🌟", color: colors[i % 5], bg: bgs[i % 5] };
});

const COLORS = [
  { letter: "🔴", word: "Red", emoji: "🍎", color: "text-red-500", bg: "bg-red-100" },
  { letter: "🔵", word: "Blue", emoji: "🌊", color: "text-blue-500", bg: "bg-blue-100" },
  { letter: "🟢", word: "Green", emoji: "🍃", color: "text-emerald-500", bg: "bg-emerald-100" },
  { letter: "🟡", word: "Yellow", emoji: "☀️", color: "text-yellow-500", bg: "bg-yellow-100" },
  { letter: "🟣", word: "Purple", emoji: "🍇", color: "text-purple-500", bg: "bg-purple-100" },
  { letter: "🟠", word: "Orange", emoji: "🍊", color: "text-orange-500", bg: "bg-orange-100" },
  { letter: "🩷", word: "Pink", emoji: "🌸", color: "text-pink-500", bg: "bg-pink-100" },
  { letter: "🟤", word: "Brown", emoji: "🐻", color: "text-amber-800", bg: "bg-amber-100" },
  { letter: "⚫", word: "Black", emoji: "🐈‍⬛", color: "text-slate-900", bg: "bg-slate-200" },
  { letter: "⚪", word: "White", emoji: "☁️", color: "text-slate-400", bg: "bg-slate-50" },
];

const SHAPES = [
  { letter: "⭕", word: "Circle", emoji: "🍩", color: "text-rose-500", bg: "bg-rose-100" },
  { letter: "🟥", word: "Square", emoji: "📦", color: "text-blue-500", bg: "bg-blue-100" },
  { letter: "🔺", word: "Triangle", emoji: "🍕", color: "text-emerald-500", bg: "bg-emerald-100" },
  { letter: "⭐", word: "Star", emoji: "🌟", color: "text-yellow-500", bg: "bg-yellow-100" },
  { letter: "❤️", word: "Heart", emoji: "💌", color: "text-red-500", bg: "bg-red-100" },
  { letter: "♦️", word: "Diamond", emoji: "💎", color: "text-cyan-500", bg: "bg-cyan-100" },
];

const MODULES = [
  { id: "alphabet", title: "Alphabet", desc: "Learn A to Z", emoji: "🔤", color: "bg-indigo-500", data: ALPHABET },
  { id: "numbers", title: "Numbers", desc: "Count 1 to 100", emoji: "🔢", color: "bg-emerald-500", data: NUMBERS },
  { id: "colors", title: "Colors", desc: "Red, Blue, Green", emoji: "🎨", color: "bg-rose-500", data: COLORS },
  { id: "shapes", title: "Shapes", desc: "Circles & Squares", emoji: "⭐", color: "bg-amber-500", data: SHAPES },
];

// --- Sub-component: Generic Flashcard Learner ---
function FlashcardLearner({ moduleData, topicName, onExit }: { moduleData: any[], topicName: string, onExit: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const { playPop, playLevelUp } = useGameSounds();
  const { logActivity, addXp } = useUserStore();
  const current = moduleData[currentIndex];

  const handleNext = () => {
    playPop();
    if (currentIndex < moduleData.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      // Completed!
      playLevelUp();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      const durationMinutes = Math.max(1, Math.ceil((Date.now() - startTime) / 60000));
      logActivity({ topic: topicName, durationMinutes, score: 100 });
      addXp(50); // Reward for completing

      setTimeout(onExit, 3000);
    }
  };

  const handlePrevious = () => {
    playPop();
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  const playPronunciation = () => {
    playPop();
    try {
      const msg = new SpeechSynthesisUtterance();
      msg.text = topicName === "Numbers" ? current.word : `${current.letter}. ${current.word}.`;
      msg.voice = window.speechSynthesis.getVoices().find(v => v.lang.includes('en') && v.name.includes('Female')) || null;
      msg.rate = 0.8;
      msg.pitch = 1.2;
      window.speechSynthesis.speak(msg);
    } catch (e) { }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="flex justify-between w-full mb-8">
        <Button variant="ghost" onClick={onExit} className="font-bold text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit Lesson
        </Button>
        <div className="font-bold text-slate-400 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-sm border-2 border-slate-100">
          {currentIndex + 1} / {moduleData.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border-4 border-slate-100 dark:border-zinc-800 flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className={`absolute inset-0 opacity-20 dark:opacity-10 ${current.bg} blur-3xl rounded-full scale-150 -translate-y-1/2`} />

          <div className="relative z-10 flex flex-col items-center w-full">
            <button
              onClick={playPronunciation}
              className="absolute top-0 right-0 p-4 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-slate-500 transition-colors shadow-sm"
            >
              <Volume2 className="w-8 h-8" />
            </button>

            <motion.div
              whileHover={{ scale: 1.1, rotate: [-2, 2, -2, 0] }}
              className={`text-[8rem] md:text-[12rem] font-black leading-none drop-shadow-xl ${current.color} mb-4 select-none cursor-pointer`}
              onClick={playPronunciation}
            >
              {current.letter}
            </motion.div>

            <div className="flex items-center gap-6 mt-4 bg-slate-50 dark:bg-zinc-800 px-8 py-4 rounded-full border-2 border-slate-100 dark:border-zinc-700 shadow-inner">
              <span className="text-6xl md:text-7xl drop-shadow-md">{current.emoji}</span>
              <span className={`text-4xl md:text-5xl font-extrabold ${current.color}`}>{current.word}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-6 mt-12 w-full max-w-2xl justify-between px-4">
        <Button
          size="lg"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="h-16 w-16 md:w-32 rounded-full font-black text-lg bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-50"
        >
          <ArrowLeft className="w-8 h-8 md:mr-2" />
          <span className="hidden md:inline">Back</span>
        </Button>
        <Button
          size="lg"
          onClick={handleNext}
          className="h-16 flex-1 rounded-full font-black text-xl md:text-2xl shadow-xl shadow-indigo-500/20 bg-indigo-500 hover:bg-indigo-600 group"
        >
          {currentIndex === moduleData.length - 1 ? (
            <>Finish <CheckCircle2 className="w-8 h-8 ml-2" /></>
          ) : (
            <>Next <ArrowRight className="w-8 h-8 ml-2 group-hover:translate-x-1 transition-transform" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// --- Main Page Component ---
function LearnPageContent() {
  const searchParams = useSearchParams();
  const defaultModule = searchParams.get('module');
  const [activeModule, setActiveModule] = useState<string | null>(defaultModule);

  const activeModuleData = MODULES.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col p-4 md:p-8">
      {!activeModule && (
        <header className="flex justify-between items-center w-full max-w-6xl mx-auto mb-10 mt-4">
          <Link href="/">
            <Button variant="ghost" className="rounded-full font-bold h-12 px-6 bg-white dark:bg-zinc-900 border-2 border-slate-200 shadow-sm hover:scale-105">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back Home
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white drop-shadow-sm">
            Learning Center
          </h1>
          <div className="w-[140px]" /> {/* Spacer for centering */}
        </header>
      )}

      <main className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
        {activeModule && activeModuleData && (
          <FlashcardLearner
            moduleData={activeModuleData.data}
            topicName={activeModuleData.title}
            onExit={() => setActiveModule(null)}
          />
        )}

        {!activeModule && (
          <div className="w-full">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black mb-4">What do you want to learn today?</h2>
              <p className="text-xl text-slate-500 font-medium">Pick a topic to start your lesson!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
              {MODULES.map((mod, index) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveModule(mod.id)}
                  className={`cursor-pointer rounded-[2.5rem] p-8 shadow-xl flex flex-col items-center text-center relative overflow-hidden group ${mod.color} text-white`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                  <div className="text-7xl mb-6 drop-shadow-xl group-hover:scale-110 transition-transform duration-300">
                    {mod.emoji}
                  </div>

                  <h3 className="text-3xl font-black mb-2 drop-shadow-sm relative z-10">{mod.title}</h3>
                  <p className="font-bold text-white/80 relative z-10">{mod.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-zinc-950" />}>
      <LearnPageContent />
    </Suspense>
  );
}
