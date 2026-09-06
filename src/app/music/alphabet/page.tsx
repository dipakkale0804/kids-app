"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic2, Play, SquareSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakKidsText, stopKidsSpeech } from "@/lib/speech";

const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

const COLORS = [
  "bg-red-400", "bg-orange-400", "bg-amber-400", "bg-yellow-400", 
  "bg-lime-400", "bg-green-400", "bg-emerald-400", "bg-teal-400", 
  "bg-cyan-400", "bg-sky-400", "bg-blue-400", "bg-indigo-400", 
  "bg-violet-400", "bg-purple-400", "bg-fuchsia-400", "bg-pink-400",
  "bg-rose-400", "bg-red-500", "bg-orange-500", "bg-amber-500",
  "bg-lime-500", "bg-emerald-500", "bg-sky-500", "bg-violet-500",
  "bg-fuchsia-500", "bg-rose-500"
];

export default function AlphabetSongPage() {
  const router = useRouter();
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const songTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (songTimeoutRef.current) clearTimeout(songTimeoutRef.current);
      stopKidsSpeech();
    };
  }, []);

  const speak = (text: string, rate: number = 0.8) => {
    speakKidsText({
      text,
      rate,
      pitch: 1.0,
    });
  };

  const playLetter = (letter: string) => {
    if (isPlayingSong) return; // Don't interrupt song
    setActiveLetter(letter);
    speak(letter);
    setTimeout(() => setActiveLetter(null), 800);
  };

  const playSong = () => {
    if (isPlayingSong) return;
    setIsPlayingSong(true);
    
    // We will iterate through letters with a timeout
    let index = 0;
    
    const nextLetter = () => {
      if (index >= LETTERS.length) {
        setIsPlayingSong(false);
        setActiveLetter(null);
        speak("Now I know my ABCs, next time won't you sing with me!", 1.0);
        return;
      }
      
      const letter = LETTERS[index];
      setActiveLetter(letter);
      speak(letter, 1.2); // Sing a bit faster in sequence
      
      // Some letters have longer pauses in the real song (LMNOP)
      // but for simplicity, we'll just do a standard delay.
      let delay = 600;
      if (letter === 'G' || letter === 'P' || letter === 'S' || letter === 'V' || letter === 'Z') {
        delay = 1000; // Small pause at ends of musical phrases
      } else if (['L', 'M', 'N', 'O'].includes(letter)) {
        delay = 400; // Faster for LMNOP
      }

      songTimeoutRef.current = setTimeout(() => {
        index++;
        nextLetter();
      }, delay);
    };
    
    nextLetter();
  };

  const stopSong = () => {
    setIsPlayingSong(false);
    setActiveLetter(null);
    if (songTimeoutRef.current) clearTimeout(songTimeoutRef.current);
    stopKidsSpeech();
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col relative overflow-hidden">
      
      <header className="flex justify-between items-center p-6 bg-blue-600 text-white shadow-lg z-10 border-b-4 border-blue-700">
        <Button
          variant="ghost"
          onClick={() => {
            stopSong();
            router.push('/music');
          }}
          className="hover:bg-blue-700 font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Mic2 className="w-8 h-8 text-yellow-300" />
          <h1 className="text-2xl font-black tracking-tight text-white">Alphabet Song</h1>
        </div>
        <div className="w-20" />
      </header>

      <main className="flex-1 flex flex-col items-center p-6 z-10 max-w-6xl mx-auto w-full relative">
        
        {/* Controls */}
        <div className="w-full bg-white/80 backdrop-blur-sm border-4 border-blue-200 rounded-3xl p-6 mb-8 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-blue-800">The ABC Song!</h2>
            <p className="text-blue-600 font-bold">Tap a letter to hear its sound, or sing the whole song.</p>
          </div>
          
          <div className="flex gap-4">
            {!isPlayingSong ? (
              <Button 
                onClick={playSong}
                className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-lg font-bold h-14 px-8 shadow-lg shadow-emerald-500/30"
              >
                <Play className="w-6 h-6 mr-2 fill-current" /> Sing Song
              </Button>
            ) : (
              <Button 
                onClick={stopSong}
                variant="destructive"
                className="rounded-full text-lg font-bold h-14 px-8 shadow-lg"
              >
                <SquareSquare className="w-6 h-6 mr-2" /> Stop Singing
              </Button>
            )}
          </div>
        </div>

        {/* Alphabet Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 sm:gap-4 lg:gap-6 w-full">
          {LETTERS.map((letter, index) => {
            const isActive = activeLetter === letter;
            const colorClass = COLORS[index % COLORS.length];
            
            return (
              <motion.button
                key={letter}
                whileHover={!isPlayingSong ? { scale: 1.1, rotate: Math.random() * 10 - 5 } : {}}
                whileTap={!isPlayingSong ? { scale: 0.9 } : {}}
                onClick={() => playLetter(letter)}
                animate={isActive ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5 }}
                className={`
                  aspect-square rounded-2xl flex items-center justify-center font-black 
                  text-3xl sm:text-4xl lg:text-5xl text-white shadow-lg border-b-8
                  ${isActive ? 'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-yellow-400/50 z-20 shadow-2xl' : colorClass + ' border-black/20'}
                `}
                style={isActive ? { transformOrigin: 'center' } : {}}
              >
                {letter}
              </motion.button>
            );
          })}
        </div>

      </main>
    </div>
  );
}
