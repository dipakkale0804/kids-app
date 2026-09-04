"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

let audioCtx: AudioContext | null = null;

const INSTRUMENTS = [
  { id: 'SPLASH', label: 'SPLASH', type: 'cymbal', x: 16, y: 35, size: 16, z: 15 },
  { id: 'CRASH1', label: 'CRASH', type: 'cymbal', x: 28, y: 25, size: 26, z: 12 },
  { id: 'TOM1', label: 'TOM', type: 'drum', x: 36, y: 42, size: 16, z: 7 },
  { id: 'CRASH2', label: 'CRASH', type: 'cymbal', x: 18, y: 62, size: 26, z: 12 },
  { id: 'TOM2', label: 'TOM', type: 'drum', x: 49, y: 28, size: 20, z: 8 }, 
  { id: 'SNARE', label: 'SNARE', type: 'drum', x: 48, y: 62, size: 30, z: 10 },
  { id: 'RIDE', label: 'RIDE', type: 'cymbal', x: 60, y: 26, size: 16, z: 15 },
  { id: 'TOM3', label: 'TOM3', type: 'drum', x: 62, y: 45, size: 16, z: 7 },
  { id: 'CLOSED_HH', label: 'CLOSED HH', type: 'cymbal', x: 75, y: 30, size: 28, z: 12 },
  { id: 'OPEN_HH', label: 'OPEN HH', type: 'cymbal', x: 88, y: 58, size: 22, z: 15 },
  { id: 'KICK1', label: 'KICK', type: 'drum', x: 36, y: 78, size: 24, z: 5 },
  { id: 'KICK2', label: 'KICK', type: 'drum', x: 62, y: 78, size: 24, z: 5 },
  { id: 'FLOOR', label: 'FLOOR', type: 'drum', x: 82, y: 85, size: 18, z: 8 }
];

export default function DrumKitPage() {
  const router = useRouter();

  const getAudioContext = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContext();
    }
    return audioCtx;
  };

  const playAudio = (id: string) => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;
      
      if (id.includes('KICK')) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
        gain.gain.setValueAtTime(3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
        osc.start(t); osc.stop(t + 0.5);
      } 
      else if (id.includes('SNARE')) {
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass'; noiseFilter.frequency.value = 1000;
        const noiseEnvelope = ctx.createGain();
        noise.connect(noiseFilter); noiseFilter.connect(noiseEnvelope); noiseEnvelope.connect(ctx.destination);
        noiseEnvelope.gain.setValueAtTime(2, t);
        noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        noise.start(t); noise.stop(t + 0.2);
        
        const osc = ctx.createOscillator();
        const oscEnvelope = ctx.createGain();
        osc.type = 'triangle';
        osc.connect(oscEnvelope); oscEnvelope.connect(ctx.destination);
        osc.frequency.setValueAtTime(250, t);
        oscEnvelope.gain.setValueAtTime(1.5, t);
        oscEnvelope.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t); osc.stop(t + 0.2);
      }
      else if (id.includes('TOM') || id.includes('FLOOR')) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.connect(gain); gain.connect(ctx.destination);
        let freq = 200;
        if (id === 'TOM3') freq = 150;
        if (id === 'FLOOR') freq = 100;
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq/4, t + 0.3);
        gain.gain.setValueAtTime(2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t); osc.stop(t + 0.3);
      }
      else if (id.includes('CRASH') || id.includes('SPLASH')) {
        const bufferSize = ctx.sampleRate * 2.0; 
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.5));
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "highpass";
        bandpass.frequency.value = id.includes('SPLASH') ? 10000 : 8000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(id.includes('SPLASH') ? 1.5 : 2.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
        noise.connect(bandpass); bandpass.connect(gain); gain.connect(ctx.destination);
        noise.start(t);
      }
      else if (id.includes('HH') || id.includes('RIDE')) {
        const bufferSize = ctx.sampleRate * (id.includes('OPEN') ? 0.5 : 0.1);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = 10000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + (id.includes('OPEN') ? 0.5 : 0.1));
        noise.connect(bandpass); bandpass.connect(gain); gain.connect(ctx.destination);
        noise.start(t);
      }
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

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-black">
        
        <div 
          className="relative w-full max-w-5xl aspect-[2/1] min-h-[400px] md:min-h-[500px] mx-auto rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden border-8 border-[#222]"
          style={{
            backgroundImage: `radial-gradient(#2a2a2a 15%, transparent 16%), radial-gradient(#2a2a2a 15%, transparent 16%)`,
            backgroundColor: '#111',
            backgroundSize: `40px 40px`,
            backgroundPosition: `0 0, 20px 20px`
          }}
        >
          {INSTRUMENTS.map((inst) => (
            <div
              key={inst.id}
              className="absolute flex items-center justify-center outline-none touch-none"
              style={{
                left: `${inst.x}%`,
                top: `${inst.y}%`,
                width: `${inst.size}%`,
                height: `0`,
                paddingBottom: `${inst.size}%`, // maintains 1:1 aspect ratio relative to width
                transform: 'translate(-50%, -50%)',
                zIndex: inst.z
              }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onPointerDown={(e) => { e.preventDefault(); playAudio(inst.id); }}
                className="absolute inset-0 w-full h-full cursor-pointer outline-none block"
              >
                {inst.type === 'drum' ? (
                  <div className="w-full h-full rounded-full bg-[#d4a373] p-[4%] shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
                    <div className="w-full h-full rounded-full bg-[#f4f4f5] shadow-[inset_0_-15px_25px_rgba(0,0,0,0.3)] flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-2 sm:border-4 border-dashed border-slate-300 opacity-60 m-[4%]" />
                      <span className="text-slate-800 font-bold text-[8px] sm:text-xs md:text-sm lg:text-xl z-10 tracking-widest">{inst.label}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-[radial-gradient(circle,_#fcd34d_0%,_#d97706_80%,_#b45309_100%)] shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5),_0_20px_30px_rgba(0,0,0,0.8)] flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,transparent,transparent_4%,rgba(0,0,0,0.15)_5%,transparent_6%)]" />
                    <div className="absolute w-[15%] h-[15%] bg-[radial-gradient(circle,_#fef08a_0%,_#d97706_100%)] rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.5)]" />
                    <span className="absolute bottom-[20%] w-full text-center text-amber-950 font-bold text-[7px] sm:text-[10px] md:text-sm lg:text-lg z-10">{inst.label}</span>
                  </div>
                )}
              </motion.button>
            </div>
          ))}
        </div>
        
      </main>
    </div>
  );
}
