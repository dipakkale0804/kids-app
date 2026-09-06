"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakKidsText, stopKidsSpeech } from "@/lib/speech";

const ANIMALS = [
  { id: 'cow', name: 'Cow', icon: '🐄', sound: 'Moo moo!', color: 'bg-emerald-400' },
  { id: 'pig', name: 'Pig', icon: '🐖', sound: 'Oink oink!', color: 'bg-pink-400' },
  { id: 'duck', name: 'Duck', icon: '🦆', sound: 'Quack quack!', color: 'bg-amber-400' },
  { id: 'sheep', name: 'Sheep', icon: '🐑', sound: 'Baa baa!', color: 'bg-blue-400' },
  { id: 'horse', name: 'Horse', icon: '🐎', sound: 'Neigh neigh!', color: 'bg-orange-500' },
  { id: 'rooster', name: 'Rooster', icon: '🐓', sound: 'Cock-a-doodle-doo!', color: 'bg-red-500' },
];

export default function OldMacDonaldPage() {
  const router = useRouter();
  const [activeAnimal, setActiveAnimal] = useState<typeof ANIMALS[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      stopKidsSpeech();
    };
  }, []);

  const speak = (text: string, onEndCallback?: () => void) => {
    speakKidsText({
      text,
      rate: 0.78,
      pitch: 1.0,
      onEnd: () => {
        setIsPlaying(false);
        if (onEndCallback) onEndCallback();
      },
    });
  };

  const playAnimal = (animal: typeof ANIMALS[0]) => {
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    setActiveAnimal(animal);
    setIsPlaying(true);
    speak(`${animal.name} says... ${animal.sound}`);
    
    // Stop playing animation after speech
    animTimeoutRef.current = setTimeout(() => setIsPlaying(false), 3000);
  };

  const playFullSong = () => {
    if (!activeAnimal) return;
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    setIsPlaying(true);
    speak(`Old MacDonald had a farm, E I E I O! And on that farm he had a ${activeAnimal.name}, E I E I O! With a ${activeAnimal.sound} here, and a ${activeAnimal.sound} there!`);
    animTimeoutRef.current = setTimeout(() => setIsPlaying(false), 6000);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col relative overflow-hidden">
      {/* Farm Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 w-full h-1/3 bg-green-200 rounded-t-[100%]" />
        <div className="absolute top-20 right-20 text-6xl opacity-50">☀️</div>
        <div className="absolute top-32 left-32 text-6xl opacity-30 animate-pulse">☁️</div>
        <div className="absolute top-40 right-1/3 text-6xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}>☁️</div>
      </div>

      <header className="flex justify-between items-center p-6 bg-orange-500 text-white shadow-lg z-10 border-b-4 border-orange-600">
        <Button
          variant="ghost"
          onClick={() => {
            if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
            stopKidsSpeech();
            router.push('/music');
          }}
          className="hover:bg-orange-600 font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Mic2 className="w-8 h-8 text-yellow-300" />
          <h1 className="text-2xl font-black tracking-tight text-white">Old MacDonald</h1>
        </div>
        <div className="w-20" />
      </header>

      <main className="flex-1 flex flex-col items-center p-6 z-10 max-w-5xl mx-auto w-full">
        
        {/* Karaoke / Lyric Display */}
        <div className="w-full bg-white/80 backdrop-blur-sm border-4 border-orange-200 rounded-3xl p-8 mb-8 min-h-[160px] shadow-xl flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {!activeAnimal ? (
              <motion.h2 
                key="default"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-black text-orange-600"
              >
                Choose an animal for the farm! 🚜
              </motion.h2>
            ) : (
              <motion.div 
                key={activeAnimal.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <div className="text-6xl mb-4">{activeAnimal.icon}</div>
                <h3 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2">
                  And on that farm he had a <span className="text-orange-600 underline decoration-wavy decoration-orange-400">{activeAnimal.name}</span>!
                </h3>
                <p className="text-xl md:text-3xl font-black text-emerald-600">
                  With a "{activeAnimal.sound}" here!
                </p>
                <Button 
                  onClick={playFullSong}
                  disabled={isPlaying}
                  className="mt-6 rounded-full bg-orange-500 hover:bg-orange-600 text-lg font-bold h-12 px-8 shadow-lg shadow-orange-500/30"
                >
                  <Music className="w-5 h-5 mr-2" /> Sing Verse
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Animal Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {ANIMALS.map((animal) => (
            <motion.button
              key={animal.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playAnimal(animal)}
              className={`relative overflow-hidden rounded-3xl border-4 shadow-xl flex flex-col items-center justify-center p-6 cursor-pointer outline-none ${animal.color} ${activeAnimal?.id === animal.id ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.8)]' : 'border-transparent'}`}
            >
              {activeAnimal?.id === animal.id && isPlaying && (
                <motion.div 
                  className="absolute inset-0 bg-white opacity-20"
                  animate={{ opacity: [0.1, 0.4, 0.1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                />
              )}
              
              <motion.div 
                className="text-7xl md:text-8xl drop-shadow-md mb-4"
                animate={activeAnimal?.id === animal.id && isPlaying ? { rotate: [0, -10, 10, -10, 0], y: [0, -10, 0] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                {animal.icon}
              </motion.div>
              
              <div className="bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm w-full">
                <span className="font-black text-slate-800 text-xl">{animal.name}</span>
              </div>
            </motion.button>
          ))}
        </div>

      </main>
    </div>
  );
}
