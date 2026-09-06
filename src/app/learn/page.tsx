"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ArrowLeft, ArrowRight, Volume2, VolumeX, Repeat, 
  CheckCircle2, Sparkles, Lock, Star, Edit3, BookOpen, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import confetti from "canvas-confetti";
import { PremiumLockModal } from "@/components/ui/PremiumLockModal";
import { TracingCanvas } from "@/components/learn/TracingCanvas";

// --- Curated Curriculum Data ---
const ALPHABET = [
  { letter: "A", word: "Apple", phonics: "ah", emoji: "🍎", color: "text-red-500", bg: "bg-red-100" },
  { letter: "B", word: "Bear", phonics: "buh", emoji: "🐻", color: "text-amber-700", bg: "bg-amber-100" },
  { letter: "C", word: "Cat", phonics: "kuh", emoji: "🐱", color: "text-orange-500", bg: "bg-orange-100" },
  { letter: "D", word: "Dog", phonics: "duh", emoji: "🐶", color: "text-blue-500", bg: "bg-blue-100" },
  { letter: "E", word: "Elephant", phonics: "eh", emoji: "🐘", color: "text-slate-500", bg: "bg-slate-100" },
  { letter: "F", word: "Frog", phonics: "fuh", emoji: "🐸", color: "text-emerald-500", bg: "bg-emerald-100" },
  { letter: "G", word: "Giraffe", phonics: "juh", emoji: "🦒", color: "text-yellow-600", bg: "bg-yellow-100" },
  { letter: "H", word: "Horse", phonics: "huh", emoji: "🐴", color: "text-amber-800", bg: "bg-amber-100" },
  { letter: "I", word: "Ice Cream", phonics: "eye", emoji: "🍦", color: "text-pink-500", bg: "bg-pink-100" },
  { letter: "J", word: "Jellyfish", phonics: "juh", emoji: "🪼", color: "text-purple-500", bg: "bg-purple-100" },
  { letter: "K", word: "Kangaroo", phonics: "kuh", emoji: "🦘", color: "text-orange-600", bg: "bg-orange-100" },
  { letter: "L", word: "Lion", phonics: "luh", emoji: "🦁", color: "text-amber-500", bg: "bg-amber-100" },
  { letter: "M", word: "Monkey", phonics: "muh", emoji: "🐒", color: "text-yellow-700", bg: "bg-yellow-100" },
  { letter: "N", word: "Nest", phonics: "nuh", emoji: "🪹", color: "text-amber-900", bg: "bg-amber-100" },
  { letter: "O", word: "Owl", phonics: "oh", emoji: "🦉", color: "text-slate-600", bg: "bg-slate-100" },
  { letter: "P", word: "Penguin", phonics: "puh", emoji: "🐧", color: "text-slate-800", bg: "bg-slate-200" },
  { letter: "Q", word: "Queen", phonics: "kwuh", emoji: "👑", color: "text-yellow-500", bg: "bg-yellow-100" },
  { letter: "R", word: "Rabbit", phonics: "ruh", emoji: "🐰", color: "text-slate-400", bg: "bg-slate-100" },
  { letter: "S", word: "Sun", phonics: "suh", emoji: "☀️", color: "text-yellow-400", bg: "bg-yellow-100" },
  { letter: "T", word: "Tiger", phonics: "tuh", emoji: "🐯", color: "text-orange-500", bg: "bg-orange-100" },
  { letter: "U", word: "Umbrella", phonics: "uh", emoji: "☂️", color: "text-indigo-500", bg: "bg-indigo-100" },
  { letter: "V", word: "Volcano", phonics: "vuh", emoji: "🌋", color: "text-red-600", bg: "bg-red-100" },
  { letter: "W", word: "Whale", phonics: "wuh", emoji: "🐳", color: "text-blue-400", bg: "bg-blue-100" },
  { letter: "X", word: "Xylophone", phonics: "zuh", emoji: "🎼", color: "text-fuchsia-500", bg: "bg-fuchsia-100" },
  { letter: "Y", word: "Yak", phonics: "yuh", emoji: "🐂", color: "text-amber-800", bg: "bg-amber-100" },
  { letter: "Z", word: "Zebra", phonics: "zuh", emoji: "🦓", color: "text-slate-900", bg: "bg-slate-200" }
];

const ANIMALS = [
  { letter: "🐶", word: "Puppy Dog", phonics: "Woof Woof!", emoji: "🐕", color: "text-amber-700", bg: "bg-amber-100" },
  { letter: "🐱", word: "Kitty Cat", phonics: "Meow Meow!", emoji: "🐈", color: "text-orange-500", bg: "bg-orange-100" },
  { letter: "🐮", word: "Friendly Cow", phonics: "Moo Moo!", emoji: "🐄", color: "text-slate-800", bg: "bg-slate-100" },
  { letter: "🦁", word: "Mighty Lion", phonics: "Roaaar!", emoji: "👑", color: "text-yellow-600", bg: "bg-yellow-100" },
  { letter: "🦆", word: "Yellow Duck", phonics: "Quack Quack!", emoji: "🌊", color: "text-yellow-500", bg: "bg-yellow-100" },
  { letter: "🐸", word: "Jumping Frog", phonics: "Ribbit Ribbit!", emoji: "🍃", color: "text-emerald-500", bg: "bg-emerald-100" },
  { letter: "🐘", word: "Big Elephant", phonics: "Pawoo!", emoji: "🥜", color: "text-slate-500", bg: "bg-slate-100" },
];

const COLORS = [
  { letter: "🔴", word: "Red", phonics: "Like an Apple", emoji: "🍎", color: "text-red-500", bg: "bg-red-100" },
  { letter: "🔵", word: "Blue", phonics: "Like the Ocean", emoji: "🌊", color: "text-blue-500", bg: "bg-blue-100" },
  { letter: "🟢", word: "Green", phonics: "Like Green Grass", emoji: "🍃", color: "text-emerald-500", bg: "bg-emerald-100" },
  { letter: "🟡", word: "Yellow", phonics: "Like the Warm Sun", emoji: "☀️", color: "text-yellow-500", bg: "bg-yellow-100" },
  { letter: "🟣", word: "Purple", phonics: "Like Sweet Grapes", emoji: "🍇", color: "text-purple-500", bg: "bg-purple-100" },
  { letter: "🟠", word: "Orange", phonics: "Like a Juicy Orange", emoji: "🍊", color: "text-orange-500", bg: "bg-orange-100" },
  { letter: "🩷", word: "Pink", phonics: "Like pretty flowers", emoji: "🌸", color: "text-pink-500", bg: "bg-pink-100" },
];

const SHAPES = [
  { letter: "⭕", word: "Circle", phonics: "Round and round", emoji: "🍩", color: "text-rose-500", bg: "bg-rose-100" },
  { letter: "🟥", word: "Square", phonics: "Four equal sides", emoji: "📦", color: "text-blue-500", bg: "bg-blue-100" },
  { letter: "🔺", word: "Triangle", phonics: "Three sharp points", emoji: "🍕", color: "text-emerald-500", bg: "bg-emerald-100" },
  { letter: "⭐", word: "Star", phonics: "Twinkles in the sky", emoji: "🌟", color: "text-yellow-500", bg: "bg-yellow-100" },
  { letter: "❤️", word: "Heart", phonics: "Full of love", emoji: "💌", color: "text-red-500", bg: "bg-red-100" },
  { letter: "💎", word: "Diamond", phonics: "Sparkly jewel", emoji: "✨", color: "text-cyan-500", bg: "bg-cyan-100" },
];

const SIGHT_WORDS = [
  { letter: "THE", word: "The", phonics: "The dog runs", emoji: "🐕", color: "text-indigo-600", bg: "bg-indigo-100" },
  { letter: "AND", word: "And", phonics: "You and me", emoji: "🤝", color: "text-pink-600", bg: "bg-pink-100" },
  { letter: "YOU", word: "You", phonics: "You are smart", emoji: "🌟", color: "text-amber-600", bg: "bg-amber-100" },
  { letter: "CAN", word: "Can", phonics: "I can read", emoji: "📖", color: "text-emerald-600", bg: "bg-emerald-100" },
  { letter: "SEE", word: "See", phonics: "I see a star", emoji: "👀", color: "text-blue-600", bg: "bg-blue-100" },
  { letter: "BIG", word: "Big", phonics: "A big balloon", emoji: "🎈", color: "text-rose-600", bg: "bg-rose-100" },
];

const ADDITION_MATH = [
  { letter: "1 + 1", word: "= 2", phonics: "One plus one is two", emoji: "🍎🍎", color: "text-purple-600", bg: "bg-purple-100" },
  { letter: "2 + 1", word: "= 3", phonics: "Two plus one is three", emoji: "⭐⭐⭐", color: "text-blue-600", bg: "bg-blue-100" },
  { letter: "2 + 2", word: "= 4", phonics: "Two plus two is four", emoji: "🚗🚗🚗🚗", color: "text-emerald-600", bg: "bg-emerald-100" },
  { letter: "3 + 2", word: "= 5", phonics: "Three plus two is five", emoji: "🎈🎈🎈🎈🎈", color: "text-orange-600", bg: "bg-orange-100" },
  { letter: "5 + 5", word: "= 10", phonics: "Five plus five is ten!", emoji: "🎉🎉🎉🎉🎉", color: "text-pink-600", bg: "bg-pink-100" },
];

const TELLING_TIME = [
  { letter: "🕐 1:00", word: "One O'Clock", phonics: "Time for story time!", emoji: "📖", color: "text-blue-600", bg: "bg-blue-100" },
  { letter: "🕒 3:00", word: "Three O'Clock", phonics: "Afternoon snack time!", emoji: "🍪", color: "text-amber-600", bg: "bg-amber-100" },
  { letter: "🕕 6:00", word: "Six O'Clock", phonics: "Dinner time with family!", emoji: "🍲", color: "text-emerald-600", bg: "bg-emerald-100" },
  { letter: "🕗 8:00", word: "Eight O'Clock", phonics: "Bedtime story time!", emoji: "🌙", color: "text-purple-600", bg: "bg-purple-100" },
];

const NUMBERS_20 = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  const colors = ["text-red-500", "text-blue-500", "text-emerald-500", "text-yellow-500", "text-purple-500"];
  const bgs = ["bg-red-100", "bg-blue-100", "bg-emerald-100", "bg-yellow-100", "bg-purple-100"];
  return { letter: n.toString(), word: `Number ${n}`, phonics: n.toString(), emoji: "🌟", color: colors[i % 5], bg: bgs[i % 5] };
});

// Age-Tier Stage Definitions
type AgeStage = "toddler" | "preschool" | "elementary";

interface ModuleConfig {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  color: string;
  isTracing?: boolean;
  data: any[];
  isPremium: boolean;
}

const STAGE_CONFIGS: Record<AgeStage, { label: string; ageSpan: string; modules: ModuleConfig[] }> = {
  toddler: {
    label: "🧸 Toddlers",
    ageSpan: "Ages 2–3",
    modules: [
      { id: "animals", title: "Animal Sounds", desc: "Moo, Roar & Quack!", emoji: "🦁", color: "from-amber-400 to-orange-500", data: ANIMALS, isPremium: false },
      { id: "colors", title: "First Colors", desc: "Red, Blue & Green", emoji: "🎨", color: "from-rose-400 to-pink-500", data: COLORS, isPremium: false },
      { id: "shapes", title: "Basic Shapes", desc: "Circles & Stars", emoji: "⭐", color: "from-yellow-400 to-amber-500", data: SHAPES, isPremium: true },
    ],
  },
  preschool: {
    label: "🎒 Preschool & Phonics",
    ageSpan: "Ages 4–5",
    modules: [
      { id: "alphabet", title: "Phonics A-Z", desc: "Letter Sounds & Words", emoji: "🔤", color: "from-indigo-500 to-purple-600", data: ALPHABET, isPremium: false },
      { id: "tracing", title: "Tracing Studio", desc: "Draw Letters with Finger", emoji: "✍️", color: "from-purple-500 to-pink-500", isTracing: true, data: [], isPremium: false },
      { id: "numbers-20", title: "Count 1 to 20", desc: "Visual Numbers & Stars", emoji: "🔢", color: "from-emerald-400 to-teal-600", data: NUMBERS_20, isPremium: true },
      { id: "sight-words", title: "Sight Words", desc: "Early Reading Booster", emoji: "📖", color: "from-sky-400 to-blue-600", data: SIGHT_WORDS, isPremium: true },
    ],
  },
  elementary: {
    label: "🚀 Junior Geniuses",
    ageSpan: "Ages 6–8",
    modules: [
      { id: "addition", title: "Visual Math Addition", desc: "Add Apples & Stars", emoji: "➕", color: "from-fuchsia-500 to-purple-600", data: ADDITION_MATH, isPremium: false },
      { id: "clock", title: "Telling Time", desc: "Learn to Read the Clock", emoji: "⏰", color: "from-cyan-500 to-blue-600", data: TELLING_TIME, isPremium: true },
      { id: "shapes-advanced", title: "Geometry & Shapes", desc: "Polygons & Angles", emoji: "📐", color: "from-emerald-500 to-green-600", data: SHAPES, isPremium: true },
    ],
  },
};

// --- Sub-component: Generic Flashcard Learner with Phonics ---
function FlashcardLearner({ moduleData, topicName, onExit }: { moduleData: any[]; topicName: string; onExit: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [startTime] = useState(Date.now());
  const { playPop, playLevelUp } = useGameSounds();
  const { logActivity, addXp, addStars } = useUserStore();
  const current = moduleData[currentIndex];

  const playPronunciation = (forcePlay = false) => {
    if (isMuted && !forcePlay) {
      window.speechSynthesis.cancel();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance();

      if (topicName.includes("Phonics") || topicName.includes("Alphabet")) {
        msg.text = `${current.letter}. ${current.phonics || current.letter} as in ${current.word}!`;
      } else if (topicName.includes("Animal")) {
        msg.text = `${current.word}! ${current.phonics}`;
      } else {
        msg.text = `${current.word}. ${current.phonics || ""}`;
      }

      msg.rate = 0.85;
      msg.pitch = 1.25;
      window.speechSynthesis.speak(msg);
    } catch (e) {}
  };

  useEffect(() => {
    playPronunciation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isMuted]);

  const handleNext = () => {
    playPop();
    if (currentIndex < moduleData.length - 1) {
      setCurrentIndex((c) => c + 1);
    } else {
      // Completed!
      playLevelUp();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

      const durationMinutes = Math.max(1, Math.ceil((Date.now() - startTime) / 60000));
      logActivity({ topic: topicName, durationMinutes, score: 100 });
      addXp(60);
      addStars(3);

      setTimeout(onExit, 2600);
    }
  };

  const handlePrevious = () => {
    playPop();
    if (currentIndex > 0) setCurrentIndex((c) => c - 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="flex justify-between w-full mb-8 items-center">
        <Button variant="ghost" onClick={onExit} className="font-bold rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-slate-200">
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit Lesson
        </Button>
        <div className="font-black text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-5 py-2 rounded-full shadow-sm border border-purple-200 dark:border-purple-800">
          {currentIndex + 1} / {moduleData.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-4 border-purple-100 dark:border-purple-950/60 flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className={`absolute inset-0 opacity-20 dark:opacity-10 ${current.bg} blur-3xl rounded-full scale-150 -translate-y-1/2`} />

          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="absolute top-0 right-0 flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-500 shadow-sm transition-transform active:scale-95"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <button
                onClick={() => { playPop(); playPronunciation(true); }}
                className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-500 shadow-sm transition-transform active:scale-95"
                title="Repeat"
              >
                <Repeat className="w-6 h-6" />
              </button>
            </div>

            <motion.div
              whileHover={{ scale: 1.08, rotate: [-2, 2, -2, 0] }}
              whileTap={{ scale: 0.96 }}
              className={`text-[5.5rem] md:text-[7.5rem] font-black leading-none drop-shadow-md ${current.color} mb-4 select-none cursor-pointer`}
              onClick={() => { playPop(); playPronunciation(true); }}
            >
              {current.letter}
            </motion.div>

            <div className="flex items-center gap-4 mt-2 bg-slate-50 dark:bg-zinc-800 px-8 py-3.5 rounded-full border border-slate-200 dark:border-zinc-700 shadow-md">
              <span className="text-4xl md:text-5xl">{current.emoji}</span>
              <span className={`text-2xl md:text-3xl font-black ${current.color}`}>{current.word}</span>
            </div>

            {current.phonics && (
              <p className="mt-4 text-slate-400 dark:text-slate-500 font-bold text-sm">
                Sound: &ldquo;<span className="text-purple-600 font-black">{current.phonics}</span>&rdquo;
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-4 mt-8 w-full max-w-xl justify-between px-4">
        <Button
          size="lg"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="h-14 px-6 rounded-full font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-40"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleNext}
          className="h-14 flex-1 rounded-full font-black text-xl shadow-xl shadow-purple-500/25 bg-purple-600 hover:bg-purple-700 text-white group"
        >
          {currentIndex === moduleData.length - 1 ? (
            <>Finish Lesson <CheckCircle2 className="w-6 h-6 ml-2" /></>
          ) : (
            <>Next <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1.5 transition-transform" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

// --- Main Page Component ---
function LearnPageContent() {
  const searchParams = useSearchParams();
  const defaultModule = searchParams.get("module");

  const [currentStage, setCurrentStage] = useState<AgeStage>("preschool");
  const [activeModuleId, setActiveModuleId] = useState<string | null>(defaultModule);
  const [isTracingActive, setIsTracingActive] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { isPremium } = useUserStore();

  const stageConfig = STAGE_CONFIGS[currentStage];
  const activeModule = Object.values(STAGE_CONFIGS)
    .flatMap((s) => s.modules)
    .find((m) => m.id === activeModuleId);

  const handleModuleClick = (mod: ModuleConfig) => {
    if (mod.isPremium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }

    if (mod.isTracing) {
      setIsTracingActive(true);
    } else {
      setActiveModuleId(mod.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col p-4 md:p-8">
      {/* Top App Header */}
      {!activeModuleId && !isTracingActive && (
        <header className="flex flex-col sm:flex-row justify-between items-center w-full max-w-6xl mx-auto mb-10 mt-2 gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              className="rounded-full font-bold h-12 px-6 bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 shadow-sm hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back Home
            </Button>
          </Link>

          {/* Age Group Selector Tabs */}
          <div className="flex items-center p-1.5 bg-white dark:bg-zinc-900 rounded-full border-2 border-slate-200 dark:border-zinc-800 shadow-md">
            {(Object.keys(STAGE_CONFIGS) as AgeStage[]).map((stageKey) => {
              const stage = STAGE_CONFIGS[stageKey];
              const isSelected = currentStage === stageKey;
              return (
                <button
                  key={stageKey}
                  type="button"
                  onClick={() => setCurrentStage(stageKey)}
                  className={`px-4 md:px-6 py-2.5 rounded-full font-black text-sm md:text-base transition-all flex items-center gap-2 ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                      : "text-slate-600 dark:text-slate-400 hover:text-purple-600"
                  }`}
                >
                  {stage.label}
                </button>
              );
            })}
          </div>

          <div className="w-[120px] hidden sm:block" />
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
        {/* Mode 1: Interactive Finger/Cursor Tracing Studio */}
        {isTracingActive && (
          <TracingCanvas onExit={() => setIsTracingActive(false)} />
        )}

        {/* Mode 2: Flashcard Interactive Learner */}
        {!isTracingActive && activeModule && (
          <FlashcardLearner
            moduleData={activeModule.data}
            topicName={activeModule.title}
            onExit={() => setActiveModuleId(null)}
          />
        )}

        {/* Mode 3: Age-Categorized Module Hub */}
        {!isTracingActive && !activeModule && (
          <div className="w-full">
            {/* Stage Hero Title */}
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-black text-xs uppercase tracking-widest mb-3 border border-purple-200">
                <Sparkles className="w-3.5 h-3.5" /> {stageConfig.ageSpan} Learning Path
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
                {stageConfig.label}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-lg">
                Pick a skill to start building your genius mind!
              </p>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4">
              {stageConfig.modules.map((mod, index) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, type: "spring", stiffness: 350, damping: 25 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModuleClick(mod)}
                  className={`cursor-pointer rounded-[2rem] p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden group bg-gradient-to-br ${mod.color} text-white border-4 border-white/20`}
                >
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                  {/* Icon Display */}
                  <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl mb-4 shadow-inner group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                    {mod.emoji}
                  </div>

                  <h3 className="text-2xl font-black mb-1 drop-shadow-sm">{mod.title}</h3>
                  <p className="font-bold text-white/90 text-sm mb-4">{mod.desc}</p>

                  <div className="mt-auto inline-flex items-center gap-1 bg-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                    {mod.isTracing ? <><Edit3 className="w-3.5 h-3.5" /> Interactive Tracing</> : <><BookOpen className="w-3.5 h-3.5" /> Start Lesson</>}
                  </div>

                  {/* PRO Padlock */}
                  {mod.isPremium && !isPremium && (
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-full p-2.5 shadow-lg border border-white/20">
                      <Lock className="w-4 h-4 text-yellow-400" />
                    </div>
                  )}
                  {mod.isPremium && isPremium && (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
                      PRO
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <PremiumLockModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
        />
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
