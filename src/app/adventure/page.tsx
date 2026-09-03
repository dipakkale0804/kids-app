"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Car, PersonStanding, Target, Music, Zap, Fish, Plane, Ghost, Palette, Gamepad2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { PremiumLockModal } from "@/components/ui/PremiumLockModal";
import { useRouter } from "next/navigation";

const ARCADE_GAMES = [
  { id: "whack", name: "Whack-a-Vowel", desc: "Whack the correct letters!", icon: <Target className="w-10 h-10" />, color: "bg-amber-500", isPremium: false, ready: true },
  { id: "balloon", name: "Alphabet Pop", desc: "Pop the target letter!", icon: <Zap className="w-10 h-10" />, color: "bg-cyan-500", isPremium: false, ready: true },
  { id: "fishing", name: "Math Fishing", desc: "Catch the right numbers", icon: <Fish className="w-10 h-10" />, color: "bg-blue-500", isPremium: false, ready: true },
  { id: "simon", name: "Memory Master", desc: "Remember the pattern", icon: <Music className="w-10 h-10" />, color: "bg-fuchsia-500", isPremium: true, ready: true },
  { id: "paint", name: "Color Splash", desc: "Mix primary colors", icon: <Palette className="w-10 h-10" />, color: "bg-pink-500", isPremium: true, ready: true },
  { id: "ghost", name: "Number Hunt", desc: "Catch even/odd ghosts", icon: <Ghost className="w-10 h-10" />, color: "bg-slate-800", isPremium: true, ready: true },
  { id: "pattern", name: "Pattern Puzzle", desc: "Finish the sequence", icon: <Gamepad2 className="w-10 h-10" />, color: "bg-emerald-500", isPremium: true, ready: true },
  { id: "counting", name: "Apple Catch", desc: "Count falling apples", icon: <Car className="w-10 h-10" />, color: "bg-red-500", isPremium: true, ready: true },
];

export default function ArcadeZone() {
  const { isPremium } = useUserStore();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const router = useRouter();

  const handleGameClick = (game: typeof ARCADE_GAMES[0]) => {
    if (game.isPremium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    
    if (game.ready) {
      if (game.id === "balloon") {
        router.push("/play/balloon-pop");
      } else {
        router.push(`/play/${game.id}`);
      }
    } else {
      alert(`${game.name} is currently in development! Check back soon.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 md:p-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <header className="flex justify-between items-center w-full max-w-6xl mx-auto mb-12 mt-4 relative z-10">
        <Link href="/">
          <Button variant="ghost" className="rounded-full font-bold h-12 px-6 bg-slate-800 text-white border-2 border-slate-700 shadow-sm hover:bg-slate-700">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back Home
          </Button>
        </Link>
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 drop-shadow-lg uppercase italic tracking-wider">
          Action Arcade
        </h1>
        <div className="w-[140px]" /> {/* Spacer */}
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ARCADE_GAMES.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, type: "spring", bounce: 0.5 }}
              whileHover={{ y: -10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGameClick(game)}
              className={`cursor-pointer rounded-[2rem] p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden group ${game.color}`}
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              
              {/* Premium Lock Overlay */}
              {game.isPremium && !isPremium && (
                <div className="absolute top-4 right-4 bg-slate-900/80 p-2 rounded-full backdrop-blur-sm z-20">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
              )}

              {/* Icon Container */}
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 text-white shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-300">
                {game.icon}
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md relative z-10">{game.name}</h3>
              <p className="font-bold text-white/80 relative z-10">{game.desc}</p>
              
              {!game.ready && (
                <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white/70 text-xs py-1 font-bold uppercase tracking-widest backdrop-blur-sm">
                  Coming Soon
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {showPremiumModal && (
          <PremiumLockModal onClose={() => setShowPremiumModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
