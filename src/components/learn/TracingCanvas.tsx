"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Volume2, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useUserStore } from "@/store/useUserStore";
import { speakKidsText, stopKidsSpeech } from "@/lib/speech";

interface TracingItem {
  id: string;
  char: string;
  word: string;
  phonics: string;
  emoji: string;
  color: string;
}

const TRACING_ITEMS: TracingItem[] = [
  { id: "A", char: "A", word: "Apple", phonics: "ah", emoji: "🍎", color: "from-red-500 to-rose-600" },
  { id: "B", char: "B", word: "Ball", phonics: "buh", emoji: "⚽", color: "from-blue-500 to-indigo-600" },
  { id: "C", char: "C", word: "Cat", phonics: "kuh", emoji: "🐱", color: "from-amber-500 to-orange-600" },
  { id: "D", char: "D", word: "Dog", phonics: "duh", emoji: "🐶", color: "from-emerald-500 to-teal-600" },
  { id: "1", char: "1", word: "One", phonics: "wun", emoji: "🌟", color: "from-purple-500 to-fuchsia-600" },
  { id: "2", char: "2", word: "Two", phonics: "too", emoji: "🚀", color: "from-pink-500 to-rose-600" },
  { id: "3", char: "3", word: "Three", phonics: "three", emoji: "🦁", color: "from-yellow-500 to-amber-600" },
];

interface TracingCanvasProps {
  initialIndex?: number;
  onExit: () => void;
}

export function TracingCanvas({ initialIndex = 0, onExit }: TracingCanvasProps) {
  const [index, setIndex] = useState(initialIndex);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tracedPoints, setTracedPoints] = useState<number>(0);
  const [completed, setCompleted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const { playPop, playLevelUp, playCelebration } = useGameSounds();
  const { addXp, addStars, logActivity } = useUserStore();

  const currentItem = TRACING_ITEMS[index % TRACING_ITEMS.length];

  // Speech pronunciation with toddler-friendly pacing
  const speakChar = useCallback(() => {
    const isNumber = !isNaN(Number(currentItem.char));
    const speechText = isNumber 
      ? `${currentItem.word}!` 
      : `${currentItem.char} for ${currentItem.word}!`;

    speakKidsText({
      text: speechText,
      rate: 0.74,
      pitch: 1.0,
    });
  }, [currentItem]);

  // Redraw template guide on canvas
  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background guide letter in soft dotted format
    ctx.save();
    ctx.font = "bold 260px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Faint fill
    ctx.fillStyle = "rgba(139, 92, 246, 0.08)";
    ctx.fillText(currentItem.char, canvas.width / 2, canvas.height / 2 + 15);

    // Dotted stroke guide
    ctx.setLineDash([12, 12]);
    ctx.lineWidth = 14;
    ctx.strokeStyle = "rgba(147, 51, 234, 0.35)";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeText(currentItem.char, canvas.width / 2, canvas.height / 2 + 15);
    ctx.restore();
  }, [currentItem]);

  useEffect(() => {
    setCompleted(false);
    setTracedPoints(0);
    drawGuide();
    const timer = setTimeout(() => {
      speakChar();
    }, 150);

    return () => {
      clearTimeout(timer);
      stopKidsSpeech();
    };
  }, [index, drawGuide, speakChar]);

  // Tracing drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (completed) return;
    setIsDrawing(true);
    playPop();
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctxRef.current) {
      ctxRef.current.beginPath();
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== "mousedown" && e.type !== "touchstart") return;
    const ctx = ctxRef.current;
    if (!ctx || !canvasRef.current) return;

    const { x, y } = getCoordinates(e);

    // Glowing Neon Brush Effect
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#a855f7";
    ctx.shadowColor = "#ec4899";
    ctx.shadowBlur = 16;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    const newPoints = tracedPoints + 1;
    setTracedPoints(newPoints);

    // When enough smooth strokes have been traced, trigger completion
    if (newPoints > 42 && !completed) {
      triggerSuccess();
    }
  };

  const triggerSuccess = () => {
    setCompleted(true);
    setIsDrawing(false);
    playCelebration();
    playLevelUp();

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#ec4899", "#a855f7", "#3b82f6", "#eab308", "#10b981"],
    });

    addXp(50);
    addStars(3);
    logActivity({
      topic: `Tracing: ${currentItem.char} (${currentItem.word})`,
      durationMinutes: 1,
      score: 100,
    });

    speakKidsText({
      text: `Super job! You traced the letter ${currentItem.char}!`,
      rate: 0.76,
      pitch: 1.0,
    });
  };

  const handleExit = () => {
    stopKidsSpeech();
    onExit();
  };

  const handleNext = () => {
    playPop();
    setIndex((prev) => (prev + 1) % TRACING_ITEMS.length);
  };

  const handlePrevious = () => {
    playPop();
    setIndex((prev) => (prev - 1 + TRACING_ITEMS.length) % TRACING_ITEMS.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center px-4 py-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between w-full mb-6">
        <Button
          variant="ghost"
          onClick={handleExit}
          className="rounded-full font-bold px-4 bg-white/70 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 shadow-sm hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Exit Tracing
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={speakChar}
            className="rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-200"
            title="Hear Pronunciation"
          >
            <Volume2 className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              drawGuide();
              setTracedPoints(0);
              setCompleted(false);
            }}
            className="rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 hover:bg-slate-200"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Hero Badge Header */}
      <motion.div
        key={currentItem.id}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex items-center gap-4 mb-5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-6 py-2.5 rounded-full border-2 border-purple-200 dark:border-purple-800 shadow-md"
      >
        <span className="text-3xl">{currentItem.emoji}</span>
        <div>
          <span className="text-2xl font-black text-slate-800 dark:text-white mr-2">
            {currentItem.char}
          </span>
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
            is for {currentItem.word}
          </span>
        </div>
      </motion.div>

      {/* Main Interactive Tracing Stage */}
      <div className="relative rounded-[2.5rem] p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-4 border-purple-400/30 shadow-2xl flex flex-col items-center">
        {/* Animated Background Glow */}
        <div
          className={`absolute inset-0 opacity-20 dark:opacity-10 bg-gradient-to-br ${currentItem.color} blur-3xl rounded-[2.5rem]`}
        />

        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="relative z-10 touch-none cursor-crosshair rounded-3xl bg-slate-50/90 dark:bg-zinc-950/90 shadow-inner border-2 border-dashed border-purple-200 dark:border-purple-900"
        />

        {/* Start Guide Pulse Marker */}
        {!completed && tracedPoints < 5 && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute top-16 left-28 pointer-events-none z-20 flex items-center gap-1.5 bg-purple-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" /> Start here!
          </motion.div>
        )}

        {/* Success Modal Overlay */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-[2.5rem] p-6 text-center shadow-2xl"
            >
              {/* 3 Bouncing Golden Stars */}
              <div className="flex gap-2 mb-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1.2, rotate: 0 }}
                    transition={{ delay: i * 0.15, type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                  </motion.div>
                ))}
              </div>

              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                Outstanding!
              </h3>
              <p className="text-slate-600 dark:text-slate-300 font-bold mb-6">
                You traced <span className="text-purple-600 font-black">{currentItem.char}</span> like a superstar! 🌟
              </p>

              <div className="flex items-center gap-3 w-full max-w-xs">
                <Button
                  onClick={() => {
                    drawGuide();
                    setTracedPoints(0);
                    setCompleted(false);
                  }}
                  variant="outline"
                  className="flex-1 rounded-2xl h-12 font-bold border-2"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Again
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 rounded-2xl h-12 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25"
                >
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between w-full max-w-md mt-6 px-4">
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="rounded-full font-bold px-6 h-12 border-2"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Previous
        </Button>
        <span className="font-bold text-slate-400 text-sm">
          {index + 1} of {TRACING_ITEMS.length}
        </span>
        <Button
          onClick={handleNext}
          className="rounded-full font-bold px-6 h-12 bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20"
        >
          Next <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
