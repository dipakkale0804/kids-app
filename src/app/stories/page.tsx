"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ArrowRight, BookHeart, PlayCircle, Star, 
  Lock, Volume2, VolumeX, Sparkles, CheckCircle2, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { PremiumLockModal } from "@/components/ui/PremiumLockModal";
import confetti from "canvas-confetti";
import { speakKidsText, stopKidsSpeech } from "@/lib/speech";

interface StoryPage {
  text: string;
  emoji: string;
  scene: string;
}

interface Story {
  id: number;
  title: string;
  cover: string;
  time: string;
  premium: boolean;
  color: string;
  summary: string;
  pages: StoryPage[];
}

const STORIES: Story[] = [
  {
    id: 1,
    title: "The Sleepy Little Bear",
    cover: "🐻",
    time: "3 min",
    premium: false,
    color: "from-amber-400 to-orange-500",
    summary: "Benny finds the coziest spot in the enchanted forest for his winter nap.",
    pages: [
      {
        text: "Once upon a time in the golden whispering forest, Benny the baby bear was feeling very sleepy.",
        emoji: "🐻 🌲",
        scene: "from-amber-100 to-orange-100 dark:from-zinc-900 dark:to-zinc-800"
      },
      {
        text: "The autumn breeze blew gentle amber leaves into a warm and soft fluffy bed.",
        emoji: "🍂 🍁 🦔",
        scene: "from-orange-100 to-amber-200 dark:from-zinc-900 dark:to-zinc-800"
      },
      {
        text: "Benny curled his paws tight, gave one huge happy yawn, and closed his gentle eyes.",
        emoji: "🥱 💤 ✨",
        scene: "from-blue-100 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800"
      },
      {
        text: "'Goodnight forest, goodnight twinkling stars,' Benny whispered as sweet dreams carried him away.",
        emoji: "🌙 ⭐ 🐻",
        scene: "from-indigo-100 to-purple-200 dark:from-zinc-900 dark:to-zinc-800"
      }
    ]
  },
  {
    id: 2,
    title: "The Cosmic Rocket Ride",
    cover: "🚀",
    time: "4 min",
    premium: false,
    color: "from-indigo-500 to-purple-600",
    summary: "Leo and robot Cosmo zoom into the galaxy to find the dancing rainbow nebula.",
    pages: [
      {
        text: "Three, two, one, blastoff! Leo zoomed high into the velvet night sky in his shiny silver rocket.",
        emoji: "🚀 🌌 ✨",
        scene: "from-indigo-100 to-purple-100 dark:from-zinc-900 dark:to-zinc-800"
      },
      {
        text: "They zoomed past the sparkling rings of Saturn and waved to a friendly green astronaut.",
        emoji: "🪐 👨‍🚀 🛸",
        scene: "from-purple-100 to-pink-100 dark:from-zinc-900 dark:to-zinc-800"
      },
      {
        text: "Comets painted bright neon streaks of light across the quiet cosmic playground.",
        emoji: "☄️ 🌈 🛰️",
        scene: "from-blue-100 to-cyan-100 dark:from-zinc-900 dark:to-zinc-800"
      },
      {
        text: "'We did it!' cheered Leo as their rocket landed safely back home under cozy blankets.",
        emoji: "🏠 🌍 🌟",
        scene: "from-emerald-100 to-teal-100 dark:from-zinc-900 dark:to-zinc-800"
      }
    ]
  },
  {
    id: 3,
    title: "The Enchanted Rainbow River",
    cover: "🦄",
    time: "5 min",
    premium: true,
    color: "from-pink-500 to-rose-600",
    summary: "Sparkle the baby unicorn discovers magical flowers that glow in the dark.",
    pages: [
      {
        text: "Sparkle the unicorn loved playing beside the shimmering waters of the Rainbow River.",
        emoji: "🦄 🌊 🌸",
        scene: "from-pink-100 to-rose-100 dark:from-zinc-900 dark:to-zinc-800"
      }
    ]
  },
  {
    id: 4,
    title: "Dinosaur Birthday Party",
    cover: "🦕",
    time: "5 min",
    premium: true,
    color: "from-emerald-500 to-teal-600",
    summary: "Rex the friendly dinosaur bakes a giant strawberry cake for all his friends.",
    pages: [
      {
        text: "Rex the giant green dinosaur was baking the biggest birthday cake in prehistoric history!",
        emoji: "🦕 🎂 🎉",
        scene: "from-emerald-100 to-teal-100 dark:from-zinc-900 dark:to-zinc-800"
      }
    ]
  }
];

export default function StoriesPage() {
  const router = useRouter();
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { isPremium, addXp, addStars } = useUserStore();
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentPage = activeStory?.pages[pageIndex];

  // Stop speech when component unmounts or story exits
  const stopSpeech = () => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    stopKidsSpeech();
    setIsPlaying(false);
    setHighlightedWordIndex(-1);
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Karaoke Read-Aloud engine
  const readCurrentPage = () => {
    if (!currentPage) return;
    stopSpeech();

    speakKidsText({
      text: currentPage.text,
      rate: 0.76, // soothing, clear story narration pacing
      pitch: 1.0,
      onBoundary: (event) => {
        if (event.name === "word") {
          const charIndex = event.charIndex;
          const textUpToChar = currentPage.text.substring(0, charIndex);
          const wordIdx = textUpToChar.split(" ").length - 1;
          setHighlightedWordIndex(wordIdx);
        }
      },
      onEnd: () => {
        setIsPlaying(false);
        setHighlightedWordIndex(-1);

        // Auto-advance if not on last page
        if (activeStory && pageIndex < activeStory.pages.length - 1) {
          advanceTimeoutRef.current = setTimeout(() => {
            setPageIndex((p) => p + 1);
          }, 800);
        } else if (activeStory && pageIndex === activeStory.pages.length - 1) {
          // Story complete!
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          addXp(60);
          addStars(3);
        }
      },
    });

    setIsPlaying(true);
  };

  // When changing pages, trigger reading if playing was active
  useEffect(() => {
    setHighlightedWordIndex(-1);
    if (activeStory) {
      readCurrentPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, activeStory]);

  const handleStorySelect = (story: Story) => {
    if (story.premium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setPageIndex(0);
    setActiveStory(story);
  };

  const handleExitStory = () => {
    stopSpeech();
    setActiveStory(null);
  };

  const handleNextPage = () => {
    stopSpeech();
    if (activeStory && pageIndex < activeStory.pages.length - 1) {
      setPageIndex(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    stopSpeech();
    if (pageIndex > 0) {
      setPageIndex(p => p - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
      {/* Top Header */}
      <header className="flex justify-between items-center p-4 md:p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-purple-100 dark:border-zinc-800 sticky top-0 z-30">
        <Button
          variant="ghost"
          onClick={() => {
            stopSpeech();
            if (activeStory) {
              handleExitStory();
            } else {
              router.push("/");
            }
          }}
          className="rounded-full font-bold px-5 bg-white dark:bg-zinc-800 border border-slate-200 shadow-sm hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {activeStory ? "All Stories" : "Home"}
        </Button>

        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
          <BookHeart className="w-7 h-7" />
          <h1 className="text-xl md:text-2xl font-black tracking-tight">Magical Story Time</h1>
        </div>

        <div className="w-[110px] hidden sm:block" />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 max-w-6xl mx-auto w-full">
        {/* VIEW 1: Interactive Karaoke Story Reader */}
        {activeStory && currentPage && (
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
            {/* Story Card Stage */}
            <AnimatePresence mode="wait">
              <motion.div
                key={pageIndex}
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -15 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`w-full rounded-[3rem] p-8 md:p-14 shadow-2xl border-4 border-purple-300/40 bg-gradient-to-b ${currentPage.scene} flex flex-col items-center text-center relative overflow-hidden`}
              >
                {/* Visual Scene Emojis */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className="text-7xl md:text-8xl mb-8 select-none drop-shadow-xl"
                >
                  {currentPage.emoji}
                </motion.div>

                {/* Karaoke Highlighted Story Sentence */}
                <div className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 leading-relaxed mb-6 max-w-2xl">
                  {currentPage.text.split(" ").map((word, i) => {
                    const isHighlighted = highlightedWordIndex === i;
                    return (
                      <span
                        key={i}
                        className={`inline-block px-1.5 py-0.5 rounded-xl transition-all duration-150 ${
                          isHighlighted
                            ? "bg-yellow-300 text-purple-950 font-black scale-110 shadow-md ring-2 ring-yellow-400"
                            : ""
                        }`}
                      >
                        {word}{" "}
                      </span>
                    );
                  })}
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-2 mt-4">
                  {activeStory.pages.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 rounded-full transition-all ${
                        i === pageIndex
                          ? "w-8 bg-purple-600 shadow"
                          : "w-2.5 bg-purple-200 dark:bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Audio & Navigation Controls */}
            <div className="flex items-center justify-between w-full mt-6 px-4 gap-4">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={pageIndex === 0}
                className="rounded-full font-bold px-6 h-12 border-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              <Button
                onClick={readCurrentPage}
                className="rounded-full font-black px-6 h-12 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25"
              >
                {isPlaying ? <VolumeX className="w-5 h-5 mr-2" /> : <Volume2 className="w-5 h-5 mr-2" />}
                {isPlaying ? "Replay Page" : "Read to Me"}
              </Button>

              <Button
                onClick={handleNextPage}
                disabled={pageIndex === activeStory.pages.length - 1}
                className="rounded-full font-bold px-6 h-12 bg-purple-600 hover:bg-purple-700 text-white shadow"
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* VIEW 2: Storybook Library Grid */}
        {!activeStory && (
          <div className="w-full">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-black text-xs uppercase tracking-widest mb-3 border border-teal-200">
                <Sparkles className="w-3.5 h-3.5" /> Bedtime & Read-Along
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
                Choose a Magical Story
              </h2>
              <p className="text-slate-500 font-bold text-base md:text-lg">
                Karaoke-style highlighted words teach independent reading!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-4">
              {STORIES.map((story, idx) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, type: "spring", stiffness: 350, damping: 25 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStorySelect(story)}
                  className={`relative flex flex-col p-6 rounded-[2.5rem] shadow-xl cursor-pointer group bg-gradient-to-br ${story.color} text-white border-4 border-white/20`}
                >
                  {story.premium && !isPremium && (
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/20">
                      <Lock className="w-4 h-4 text-yellow-400" />
                    </div>
                  )}
                  {story.premium && isPremium && (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                      PRO
                    </div>
                  )}

                  <div className="text-7xl mb-4 text-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 drop-shadow-md">
                    {story.cover}
                  </div>

                  <h3 className="text-2xl font-black mb-1.5 leading-tight">{story.title}</h3>
                  <p className="text-xs font-bold text-white/80 mb-4 line-clamp-2">{story.summary}</p>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/20">
                    <span className="flex items-center gap-1 text-xs font-black">
                      <Star className="w-3.5 h-3.5 fill-current" /> {story.time} Read
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                      <PlayCircle className="w-3.5 h-3.5" /> Read
                    </span>
                  </div>
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
