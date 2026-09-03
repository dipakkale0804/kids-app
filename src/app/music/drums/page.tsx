"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

let audioCtx: AudioContext | null = null;

export default function DrumKitPage() {
  const router = useRouter();

  const getAudioContext = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContext();
    }
    return audioCtx;
  };

  const playKick = () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(3, ctx.currentTime); // LOUDER
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch(e) {}
  };

  const playSnare = () => {
    try {
      const ctx = getAudioContext();
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1000;
      noise.connect(noiseFilter);
      
      const noiseEnvelope = ctx.createGain();
      noiseFilter.connect(noiseEnvelope);
      noiseEnvelope.connect(ctx.destination);
      noiseEnvelope.gain.setValueAtTime(2, ctx.currentTime); // LOUDER
      noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      noise.start(ctx.currentTime);
      
      const osc = ctx.createOscillator();
      const oscEnvelope = ctx.createGain();
      osc.type = 'triangle';
      osc.connect(oscEnvelope);
      oscEnvelope.connect(ctx.destination);
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      oscEnvelope.gain.setValueAtTime(1.5, ctx.currentTime); // LOUDER
      oscEnvelope.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      
      noise.stop(ctx.currentTime + 0.2);
      osc.stop(ctx.currentTime + 0.2);
    } catch(e) {}
  };

  const playHiHat = () => {
    try {
      const ctx = getAudioContext();
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 10000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(2, ctx.currentTime); // LOUDER
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);
      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + 0.1);
    } catch(e) {}
  };

  const playCrash = () => {
    try {
      const ctx = getAudioContext();
      const bufferSize = ctx.sampleRate * 2.0; // Longer decay for crash
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.5));
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "highpass";
      bandpass.frequency.value = 8000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(2.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);
      noise.start(ctx.currentTime);
    } catch(e) {}
  };

  const playTom = () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      <header className="flex justify-between items-center p-6 bg-slate-800 text-white shadow-lg z-10 border-b-4 border-slate-700">
        <Button variant="ghost" onClick={() => router.push('/music')} className="hover:bg-slate-700 font-bold">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Music className="w-8 h-8 text-rose-400" />
          <h1 className="text-2xl font-black tracking-tight text-rose-100">Drum Kit</h1>
        </div>
        <div className="w-20" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        
        {/* Responsive Grid Layout for Drums */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-8 max-w-5xl w-full items-end justify-items-center h-[50vh] min-h-[400px]">
          
          {/* Crash Cymbal */}
          <div className="col-span-1 md:col-span-1 self-start pt-10">
            <motion.button
              whileTap={{ scale: 0.9, rotate: -10 }}
              onPointerDown={(e) => { e.preventDefault(); playCrash(); }}
              className="w-24 h-24 sm:w-32 sm:h-32 bg-amber-400 rounded-full border-[6px] border-amber-600 shadow-xl flex items-center justify-center cursor-pointer"
            >
              <div className="w-12 h-12 bg-amber-300 rounded-full blur-sm absolute" />
              <span className="text-amber-950 font-black text-sm sm:text-lg z-10">Crash</span>
            </motion.button>
          </div>

          {/* Hi-Hat */}
          <div className="col-span-1 md:col-span-1 self-center">
            <motion.button
              whileTap={{ scale: 0.9, y: 10 }}
              onPointerDown={(e) => { e.preventDefault(); playHiHat(); }}
              className="w-28 h-28 sm:w-40 sm:h-40 bg-yellow-400 rounded-full border-[8px] border-yellow-600 shadow-xl flex items-center justify-center cursor-pointer relative"
            >
              <div className="w-16 h-16 bg-yellow-300 rounded-full blur-md absolute" />
              <span className="text-yellow-950 font-black text-base sm:text-xl z-10 drop-shadow-sm">Hi-Hat</span>
            </motion.button>
          </div>
          
          {/* Tom (Top Center) */}
          <div className="col-span-1 md:col-span-1 self-start">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onPointerDown={(e) => { e.preventDefault(); playTom(); }}
              className="w-32 h-32 sm:w-48 sm:h-48 bg-emerald-500 rounded-full border-[10px] border-emerald-700 shadow-2xl flex items-center justify-center cursor-pointer relative"
            >
              <div className="w-16 h-16 bg-emerald-400 rounded-full blur-md absolute" />
              <span className="text-emerald-950 font-black text-lg sm:text-2xl z-10 drop-shadow-sm">Tom</span>
            </motion.button>
          </div>

          {/* Snare */}
          <div className="col-span-1 md:col-span-1 self-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onPointerDown={(e) => { e.preventDefault(); playSnare(); }}
              className="w-36 h-36 sm:w-48 sm:h-48 bg-slate-100 rounded-full border-[10px] border-rose-500 shadow-2xl flex items-center justify-center cursor-pointer relative"
            >
               <div className="w-20 h-20 bg-white rounded-full blur-md absolute" />
              <span className="text-rose-950 font-black text-xl sm:text-3xl z-10 drop-shadow-sm">Snare</span>
            </motion.button>
          </div>

          {/* Kick (Bottom Center) spans full width on mobile, right on desktop */}
          <div className="col-span-3 md:col-span-1 self-end md:self-end">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onPointerDown={(e) => { e.preventDefault(); playKick(); }}
              className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-slate-200 rounded-full border-[16px] border-slate-700 shadow-2xl flex items-center justify-center cursor-pointer relative mx-auto"
            >
               <div className="w-32 h-32 bg-white rounded-full blur-xl absolute opacity-50" />
              <span className="text-slate-900 font-black text-3xl sm:text-5xl z-10 drop-shadow-sm">KICK</span>
            </motion.button>
          </div>

        </div>
        
        <p className="mt-16 text-slate-400 font-bold text-xl sm:text-2xl text-center z-10 bg-slate-900/50 px-6 py-2 rounded-full">Tap the drums to make a beat!</p>
      </main>
    </div>
  );
}
