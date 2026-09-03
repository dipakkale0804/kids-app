"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

const NOTES = [
  { note: "C", freq: 261.63, color: "bg-red-500", key: "A" },
  { note: "D", freq: 293.66, color: "bg-orange-500", key: "S" },
  { note: "E", freq: 329.63, color: "bg-yellow-400", key: "D" },
  { note: "F", freq: 349.23, color: "bg-green-500", key: "F" },
  { note: "G", freq: 392.00, color: "bg-teal-500", key: "G" },
  { note: "A", freq: 440.00, color: "bg-blue-500", key: "H" },
  { note: "B", freq: 493.88, color: "bg-indigo-500", key: "J" },
  { note: "C", freq: 523.25, color: "bg-purple-500", key: "K" },
  { note: "D", freq: 587.33, color: "bg-pink-500", key: "L" },
  { note: "E", freq: 659.25, color: "bg-rose-500", key: ";" },
];

let audioCtx: AudioContext | null = null;
export default function MagicPianoPage() {
  const router = useRouter();

  const playNote = (freq: number) => {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContext();
      }
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Triangle wave sounds a bit more "full" and louder than pure sine
      osc.type = "triangle"; 
      osc.frequency.value = freq;
      
      // Envelope
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1.5, audioCtx.currentTime + 0.02); // Louder attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5); // decay
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
      console.log("Audio not supported", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      <header className="flex justify-between items-center p-6 bg-slate-800 text-white shadow-lg z-10 border-b-4 border-slate-700">
        <Button variant="ghost" onClick={() => router.push('/music')} className="hover:bg-slate-700 font-bold">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Music className="w-8 h-8 text-purple-400" />
          <h1 className="text-2xl font-black tracking-tight text-purple-100">Magic Piano</h1>
        </div>
        <div className="w-20" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="bg-slate-800 p-4 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-b-[16px] border-slate-950 w-full max-w-6xl">
          <div className="flex justify-center h-[50vh] min-h-[300px]">
            {NOTES.map((n, i) => (
              <motion.button
                key={i}
                whileTap={{ y: 15, scale: 0.98 }}
                onPointerDown={(e) => { e.preventDefault(); playNote(n.freq); }}
                className={`flex-1 min-w-[30px] sm:min-w-[40px] md:min-w-[60px] max-w-[80px] rounded-b-xl sm:rounded-b-2xl shadow-[0_15px_0_rgba(0,0,0,0.4)] relative overflow-hidden group border-x-2 border-b-2 border-black/40 ${n.color}`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-50 pointer-events-none" />
                <span className="absolute bottom-8 w-full text-center font-black text-white text-3xl md:text-5xl drop-shadow-md pointer-events-none">
                  {n.note}
                </span>
                <span className="absolute bottom-3 w-full text-center font-bold text-white/50 text-[10px] md:text-sm pointer-events-none">
                  {n.key}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
        <p className="mt-12 text-slate-400 font-bold text-xl text-center">Tap the keys to play music!</p>
      </main>
    </div>
  );
}
