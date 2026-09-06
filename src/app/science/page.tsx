"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, FlaskConical, Droplets, Sparkles, RefreshCcw, 
  Star, CheckCircle, Globe, Lock, Volume2, Orbit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import { PremiumLockModal } from "@/components/ui/PremiumLockModal";
import confetti from "canvas-confetti";

// --- Potion Challenges Data ---
const CHALLENGES = [
  { id: 1, name: "Make a Green Potion!", target: "bg-green-500", req: ["blue", "yellow"], hint: "Blue + Yellow" },
  { id: 2, name: "Make a Purple Potion!", target: "bg-purple-500", req: ["blue", "red"], hint: "Blue + Red" },
  { id: 3, name: "Make an Orange Potion!", target: "bg-orange-500", req: ["red", "yellow"], hint: "Red + Yellow" },
  { id: 4, name: "Rainbow Explosion!", target: "bg-fuchsia-500", req: ["blue", "red", "yellow"], hint: "Mix them all!" },
];

// --- Solar System Data ---
interface Planet {
  name: string;
  emoji: string;
  color: string;
  size: string;
  fact: string;
  isPremium: boolean;
}

const PLANETS: Planet[] = [
  { name: "Sun", emoji: "☀️", color: "from-yellow-400 to-amber-500", size: "w-24 h-24", fact: "The Sun is a giant ball of glowing hot gas that gives us light and warmth!", isPremium: false },
  { name: "Mercury", emoji: "🪨", color: "from-slate-400 to-zinc-500", size: "w-12 h-12", fact: "Mercury is the smallest planet and the closest one to the blazing Sun!", isPremium: false },
  { name: "Venus", emoji: "🟡", color: "from-amber-200 to-yellow-500", size: "w-14 h-14", fact: "Venus is the hottest planet in the whole Solar System!", isPremium: false },
  { name: "Earth", emoji: "🌍", color: "from-blue-400 to-emerald-500", size: "w-16 h-16", fact: "Earth is our beautiful home, full of blue oceans, green trees, and friendly animals!", isPremium: false },
  { name: "Mars", emoji: "🔴", color: "from-red-500 to-orange-600", size: "w-14 h-14", fact: "Mars is called the Red Planet because its ground is covered in rusty red iron dust!", isPremium: false },
  { name: "Jupiter", emoji: "🪐", color: "from-orange-300 to-amber-600", size: "w-20 h-20", fact: "Jupiter is the biggest planet of all! It could fit 1,300 Earths inside it!", isPremium: true },
  { name: "Saturn", emoji: "🪐", color: "from-yellow-200 to-amber-400", size: "w-20 h-20", fact: "Saturn has huge, breathtaking rings made of billions of spinning ice chunks!", isPremium: true },
  { name: "Neptune", emoji: "🔵", color: "from-blue-500 to-indigo-700", size: "w-16 h-16", fact: "Neptune is a chilly deep-blue ice giant with the fastest winds in space!", isPremium: true },
];

export default function ScienceLabPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"potions" | "space">("potions");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(PLANETS[3]); // Earth default
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { playPop, playIncorrect, playLevelUp } = useGameSounds();
  const { addXp, logActivity, isPremium } = useUserStore();

  // Potion State
  const [currentLevel, setCurrentLevel] = useState(0);
  const [beakerColor, setBeakerColor] = useState<string>("bg-transparent");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "mixing" | "success" | "sludge">("idle");
  const [fallingDrops, setFallingDrops] = useState<{ id: number; color: string; left: number }[]>([]);
  const [beakerScale, setBeakerScale] = useState(1);

  const challenge = CHALLENGES[currentLevel];

  // Voice narration for planets
  const speakFact = (planet: Planet) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${planet.name}! ${planet.fact}`);
      utterance.rate = 0.88;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handlePlanetSelect = (planet: Planet) => {
    if (planet.isPremium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setSelectedPlanet(planet);
    speakFact(planet);
  };

  const handleAdd = (colorId: string, colorClass: string) => {
    if (status === "success" || status === "sludge") return;

    playPop();
    const dropId = Date.now();
    const leftOffset = colorId === "blue" ? -80 : colorId === "yellow" ? 0 : 80;

    setFallingDrops((prev) => [...prev, { id: dropId, color: colorClass, left: leftOffset }]);

    setTimeout(() => {
      setFallingDrops((prev) => prev.filter((d) => d.id !== dropId));
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
        else setBeakerColor("bg-stone-600");
      } else if (newIngredients.length === 3) {
        const hasBlue = newIngredients.includes("blue");
        const hasYellow = newIngredients.includes("yellow");
        const hasRed = newIngredients.includes("red");

        if (hasBlue && hasYellow && hasRed) setBeakerColor("bg-fuchsia-500");
        else setBeakerColor("bg-stone-700");
      } else {
        setBeakerColor("bg-stone-800");
      }
    }, 400);
  };

  useEffect(() => {
    if (!challenge) return;
    if (ingredients.length === challenge.req.length) {
      setStatus("mixing");
      const isCorrect = challenge.req.every((req) => ingredients.includes(req));

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
    } else if (ingredients.length > challenge.req.length) {
      setStatus("sludge");
      playIncorrect();
    }
  }, [ingredients, challenge, playLevelUp, playIncorrect]);

  const handleNext = () => {
    if (currentLevel < CHALLENGES.length - 1) {
      setCurrentLevel((c) => c + 1);
      setIngredients([]);
      setBeakerColor("bg-transparent");
      setStatus("idle");
    } else {
      logActivity({ topic: "Science Lab: Color Potion Master", durationMinutes: 2, score: 100 });
      addXp(150);
      router.push("/adventure");
    }
  };

  const resetBeaker = () => {
    setIngredients([]);
    setBeakerColor("bg-transparent");
    setStatus("idle");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Starlight Ambience */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl h-full md:h-[88vh] min-h-[640px] bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] shadow-2xl overflow-y-auto overflow-x-hidden relative flex flex-col z-10">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-center p-4 bg-slate-900/80 border-b-2 border-slate-800 z-20 backdrop-blur-md gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="hover:bg-slate-800 font-bold rounded-full text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back Home
          </Button>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-800 rounded-full border border-slate-700 shadow-inner">
            <button
              onClick={() => setActiveTab("potions")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-black text-xs md:text-sm transition-all ${
                activeTab === "potions"
                  ? "bg-emerald-500 text-white shadow-md scale-105"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FlaskConical className="w-4 h-4" /> Color Chemistry
            </button>
            <button
              onClick={() => setActiveTab("space")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-black text-xs md:text-sm transition-all ${
                activeTab === "space"
                  ? "bg-purple-600 text-white shadow-md scale-105"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Orbit className="w-4 h-4" /> Solar Explorer
            </button>
          </div>

          <div className="w-[100px] hidden md:block" />
        </header>

        {/* TAB 1: CHEMICAL COLOR MIXING LAB */}
        {activeTab === "potions" && challenge && (
          <main className="flex-1 flex flex-col md:flex-row items-center justify-between p-6 md:p-12 gap-8 relative z-10">
            {/* Left Column: Mission Description & Droppers */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 max-w-sm">
              <span className="text-emerald-400 text-xs font-black uppercase tracking-widest px-3 py-1 bg-emerald-950/60 border border-emerald-800 rounded-full mb-3">
                Potion Challenge #{currentLevel + 1}
              </span>
              <h2 className="text-3xl font-black mb-2">{challenge.name}</h2>
              <p className="text-slate-400 font-medium mb-6 text-sm">
                Hint: <span className="text-white font-bold">{challenge.hint}</span>
              </p>

              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => handleAdd("blue", "bg-blue-500")}
                  className="flex flex-col items-center p-3.5 bg-blue-600/20 border-2 border-blue-500 hover:bg-blue-600/30 rounded-2xl transition-transform active:scale-95"
                >
                  <Droplets className="w-8 h-8 text-blue-400 mb-1" />
                  <span className="text-xs font-black">Blue Drop</span>
                </button>

                <button
                  onClick={() => handleAdd("red", "bg-red-500")}
                  className="flex flex-col items-center p-3.5 bg-red-600/20 border-2 border-red-500 hover:bg-red-600/30 rounded-2xl transition-transform active:scale-95"
                >
                  <Droplets className="w-8 h-8 text-red-400 mb-1" />
                  <span className="text-xs font-black">Red Drop</span>
                </button>

                <button
                  onClick={() => handleAdd("yellow", "bg-yellow-400")}
                  className="flex flex-col items-center p-3.5 bg-yellow-500/20 border-2 border-yellow-400 hover:bg-yellow-500/30 rounded-2xl transition-transform active:scale-95"
                >
                  <Droplets className="w-8 h-8 text-yellow-400 mb-1" />
                  <span className="text-xs font-black">Yellow Drop</span>
                </button>
              </div>
            </div>

            {/* Right Column: Beaker Simulation */}
            <div className="flex flex-col items-center justify-center flex-1 relative">
              <motion.div
                animate={{ scale: beakerScale }}
                className="relative w-48 h-64 flex flex-col justify-end items-center mb-6"
              >
                {/* Falling Drops Animation */}
                <AnimatePresence>
                  {fallingDrops.map((drop) => (
                    <motion.div
                      key={drop.id}
                      initial={{ y: -80, opacity: 1, scale: 1 }}
                      animate={{ y: 150, opacity: 0, scale: 0.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: "easeIn" }}
                      className={`absolute z-20 w-7 h-7 rounded-full ${drop.color} blur-[1px]`}
                      style={{ left: `calc(50% + ${drop.left}px)`, transform: "translateX(-50%)" }}
                    />
                  ))}
                </AnimatePresence>

                {/* Glass Beaker */}
                <div className="absolute inset-0 border-[10px] border-white/20 rounded-b-[3.5rem] rounded-t-xl overflow-hidden backdrop-blur-sm z-10 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.5)]">
                  <motion.div
                    className={`w-full absolute bottom-0 ${beakerColor} transition-colors duration-700`}
                    initial={{ height: "0%" }}
                    animate={{ height: `${(ingredients.length / challenge.req.length) * 85}%` }}
                  />
                </div>
              </motion.div>

              {/* Status & CTA */}
              {status === "success" ? (
                <Button
                  onClick={handleNext}
                  className="h-12 px-8 text-base font-black rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 animate-bounce"
                >
                  Success! Next Potion <Star className="w-5 h-5 ml-1.5 fill-current" />
                </Button>
              ) : status === "sludge" ? (
                <Button
                  onClick={resetBeaker}
                  variant="outline"
                  className="h-12 px-8 text-base font-bold rounded-full border-2 border-stone-500 text-stone-300 hover:bg-stone-800"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" /> Clean Beaker
                </Button>
              ) : (
                <span className="text-slate-400 font-bold text-sm">
                  Add {challenge.req.length - ingredients.length} more drop(s)...
                </span>
              )}
            </div>
          </main>
        )}

        {/* TAB 2: INTERACTIVE SOLAR SYSTEM EXPLORER */}
        {activeTab === "space" && (
          <main className="flex-1 flex flex-col p-6 md:p-10 relative z-10">
            {/* Active Planet Hero View */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-800/80 border-2 border-slate-700 rounded-3xl p-6 mb-8 gap-6 backdrop-blur-md">
              <div className="flex items-center gap-6">
                <motion.div
                  key={selectedPlanet.name}
                  initial={{ scale: 0.8, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="text-6xl md:text-7xl drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                >
                  {selectedPlanet.emoji}
                </motion.div>
                <div>
                  <h3 className="text-3xl font-black mb-1">{selectedPlanet.name}</h3>
                  <p className="text-slate-300 font-medium text-sm md:text-base max-w-xl">
                    {selectedPlanet.fact}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => speakFact(selectedPlanet)}
                className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-black px-6 shadow-md shrink-0"
              >
                <Volume2 className="w-4 h-4 mr-2" /> Hear Fact
              </Button>
            </div>

            {/* Planets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PLANETS.map((planet) => {
                const isSelected = selectedPlanet.name === planet.name;
                return (
                  <motion.div
                    key={planet.name}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handlePlanetSelect(planet)}
                    className={`relative flex flex-col items-center p-5 rounded-2xl cursor-pointer border-2 transition-all ${
                      isSelected
                        ? "bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-500/20"
                        : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {planet.isPremium && !isPremium && (
                      <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-yellow-400 shadow">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="text-4xl mb-2">{planet.emoji}</span>
                    <span className="font-bold text-sm text-white">{planet.name}</span>
                  </motion.div>
                );
              })}
            </div>
          </main>
        )}
      </div>

      <PremiumLockModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
