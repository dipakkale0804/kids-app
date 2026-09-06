"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Eraser, PaintBucket, Undo2, Trash2, Download, 
  Sparkles, Wand2, Star, Printer, Lock, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { PremiumLockModal } from "@/components/ui/PremiumLockModal";
import confetti from "canvas-confetti";

const COLOR_PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#1e293b",
  "#ffffff", "#94a3b8", "#78350f", "#fbcfe8", "#fde047"
];

interface Stencil {
  id: string;
  name: string;
  emoji: string;
  isPremium: boolean;
  svgPath: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

const STENCILS: Stencil[] = [
  {
    id: "blank",
    name: "Blank Canvas",
    emoji: "📄",
    isPremium: false,
    svgPath: () => {}
  },
  {
    id: "rocket",
    name: "Space Rocket",
    emoji: "🚀",
    isPremium: false,
    svgPath: (ctx, w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 20;
      ctx.save();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#334155";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Rocket Body
      ctx.beginPath();
      ctx.moveTo(cx, cy - 140);
      ctx.bezierCurveTo(cx + 60, cy - 60, cx + 60, cy + 80, cx, cy + 100);
      ctx.bezierCurveTo(cx - 60, cy + 80, cx - 60, cy - 60, cx, cy - 140);
      ctx.stroke();

      // Window
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 28, 0, Math.PI * 2);
      ctx.stroke();

      // Fins
      ctx.beginPath();
      ctx.moveTo(cx - 52, cy + 30);
      ctx.lineTo(cx - 100, cy + 95);
      ctx.lineTo(cx - 40, cy + 90);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 52, cy + 30);
      ctx.lineTo(cx + 100, cy + 95);
      ctx.lineTo(cx + 40, cy + 90);
      ctx.stroke();

      // Flame
      ctx.beginPath();
      ctx.moveTo(cx - 25, cy + 100);
      ctx.lineTo(cx, cy + 150);
      ctx.lineTo(cx + 25, cy + 100);
      ctx.stroke();

      ctx.restore();
    }
  },
  {
    id: "dino",
    name: "Baby T-Rex",
    emoji: "🦖",
    isPremium: false,
    svgPath: (ctx, w, h) => {
      const cx = w / 2 - 20;
      const cy = h / 2;
      ctx.save();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#334155";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Head & Body outline
      ctx.beginPath();
      ctx.arc(cx + 40, cy - 70, 45, 0, Math.PI * 2); // Head
      ctx.stroke();

      // Eye
      ctx.beginPath();
      ctx.arc(cx + 55, cy - 80, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#334155";
      ctx.fill();

      // Body & Tail
      ctx.beginPath();
      ctx.ellipse(cx, cy + 20, 70, 50, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(cx - 65, cy + 10);
      ctx.quadraticCurveTo(cx - 130, cy - 10, cx - 140, cy + 40);
      ctx.quadraticCurveTo(cx - 110, cy + 50, cx - 60, cy + 45);
      ctx.stroke();

      // Feet
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy + 70);
      ctx.lineTo(cx - 20, cy + 115);
      ctx.lineTo(cx - 5, cy + 115);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 20, cy + 70);
      ctx.lineTo(cx + 20, cy + 115);
      ctx.lineTo(cx + 35, cy + 115);
      ctx.stroke();

      ctx.restore();
    }
  },
  {
    id: "unicorn",
    name: "Magic Unicorn",
    emoji: "🦄",
    isPremium: true,
    svgPath: (ctx, w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      ctx.save();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#334155";
      ctx.lineCap = "round";

      // Head
      ctx.beginPath();
      ctx.ellipse(cx, cy - 20, 60, 40, -0.2, 0, Math.PI * 2);
      ctx.stroke();

      // Horn
      ctx.beginPath();
      ctx.moveTo(cx + 30, cy - 50);
      ctx.lineTo(cx + 70, cy - 130);
      ctx.lineTo(cx + 10, cy - 55);
      ctx.closePath();
      ctx.stroke();

      // Mane
      ctx.beginPath();
      ctx.arc(cx - 40, cy - 50, 30, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 50, cy, 30, 0, Math.PI);
      ctx.stroke();

      ctx.restore();
    }
  }
];

type DrawingTool = "brush" | "glow" | "rainbow" | "eraser";

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<DrawingTool>("rainbow");
  const [color, setColor] = useState("#a855f7");
  const [brushSize, setBrushSize] = useState(14);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedStencil, setSelectedStencil] = useState<string>("rocket");
  const [rainbowHue, setRainbowHue] = useState(0);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { displayName, isPremium } = useUserStore();

  const activeStencilObj = STENCILS.find(s => s.id === selectedStencil) || STENCILS[0];

  // Initialize Canvas
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw chosen stencil
    if (activeStencilObj.svgPath) {
      activeStencilObj.svgPath(ctx, canvas.width, canvas.height);
    }

    // Save initial state to history
    saveState();
  };

  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStencil]);

  const saveState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-20), imgData]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const prev = history[history.length - 2];
    ctx.putImageData(prev, 0, 0);
    setHistory(old => old.slice(0, -1));
  };

  const clearCanvas = () => {
    setupCanvas();
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
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

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;

    if (tool === "eraser") {
      ctx.strokeStyle = "#ffffff";
      ctx.shadowBlur = 0;
    } else if (tool === "glow") {
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
    } else if (tool === "rainbow") {
      const nextHue = (rainbowHue + 4) % 360;
      setRainbowHue(nextHue);
      const rainbowColor = `hsl(${nextHue}, 90%, 55%)`;
      ctx.strokeStyle = rainbowColor;
      ctx.shadowColor = rainbowColor;
      ctx.shadowBlur = 12;
    } else {
      ctx.strokeStyle = color;
      ctx.shadowBlur = 0;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const downloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    // Create a high-res certificate canvas
    const certCanvas = document.createElement("canvas");
    certCanvas.width = 1200;
    certCanvas.height = 900;
    const certCtx = certCanvas.getContext("2d");
    if (!certCtx) return;

    // Background gradient border
    certCtx.fillStyle = "#8b5cf6";
    certCtx.fillRect(0, 0, 1200, 900);

    // Inner Parchment
    certCtx.fillStyle = "#faf5ff";
    certCtx.fillRect(30, 30, 1140, 840);

    // Gold Ribbon Title
    certCtx.fillStyle = "#7c3aed";
    certCtx.font = "bold 44px sans-serif";
    certCtx.textAlign = "center";
    certCtx.fillText("🌟 OFFICIAL MASTERPIECE AWARD 🌟", 600, 100);

    certCtx.font = "bold 26px sans-serif";
    certCtx.fillStyle = "#64748b";
    certCtx.fillText(`Created with pride by Master Artist: ${displayName || "Young Creator"}`, 600, 145);

    // Embed Drawing with border
    certCtx.drawImage(canvas, 100, 180, 1000, 600);
    certCtx.strokeStyle = "#c084fc";
    certCtx.lineWidth = 10;
    certCtx.strokeRect(100, 180, 1000, 600);

    // Footer
    certCtx.font = "bold 22px sans-serif";
    certCtx.fillStyle = "#9333ea";
    certCtx.fillText("Certified for Family Refrigerator Display! 🎨", 600, 830);

    const link = document.createElement("a");
    link.download = `${displayName || "Kids"}_Masterpiece_Certificate.png`;
    link.href = certCanvas.toDataURL("image/png");
    link.click();
  };

  const handleStencilSelect = (stencil: Stencil) => {
    if (stencil.isPremium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setSelectedStencil(stencil.id);
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto h-[calc(100vh-120px)] bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border-4 border-purple-200 dark:border-purple-900/60 overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-4 bg-purple-50/70 dark:bg-zinc-800/70 border-b border-purple-100 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-4">
        {/* Stencil Picker */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 mr-1 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" /> Stencils:
          </span>
          {STENCILS.map(s => {
            const isSelected = selectedStencil === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleStencilSelect(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-md scale-105"
                    : "bg-white dark:bg-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-purple-100"
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.name}</span>
                {s.isPremium && !isPremium && <Lock className="w-3 h-3 text-yellow-500 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={undo}
            disabled={history.length <= 1}
            className="rounded-full font-bold border-2"
            title="Undo"
          >
            <Undo2 className="w-4 h-4 mr-1" /> Undo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={clearCanvas}
            className="rounded-full font-bold border-2 text-rose-600 hover:text-rose-700"
            title="Clear"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Clear
          </Button>
          <Button
            size="sm"
            onClick={downloadCertificate}
            className="rounded-full font-black bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
            title="Print Masterpiece"
          >
            <Printer className="w-4 h-4 mr-1" /> Print for Fridge
          </Button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side Tool Controls */}
        <div className="p-3 md:p-4 bg-slate-50 dark:bg-zinc-800/50 border-r border-slate-200 dark:border-zinc-700 flex md:flex-col items-center justify-between md:justify-start gap-3 shrink-0 overflow-x-auto">
          {/* Tool Modes */}
          <div className="flex md:flex-col gap-2">
            <button
              onClick={() => setTool("rainbow")}
              className={`p-3 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                tool === "rainbow"
                  ? "bg-gradient-to-br from-pink-500 to-yellow-400 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              }`}
              title="Magic Rainbow Brush"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <button
              onClick={() => setTool("glow")}
              className={`p-3 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                tool === "glow"
                  ? "bg-purple-600 text-white shadow-lg scale-105 ring-2 ring-purple-400"
                  : "bg-white dark:bg-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              }`}
              title="Neon Glow Wand"
            >
              <Wand2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setTool("brush")}
              className={`p-3 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                tool === "brush"
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              }`}
              title="Solid Color Pen"
            >
              <PaintBucket className="w-5 h-5" />
            </button>

            <button
              onClick={() => setTool("eraser")}
              className={`p-3 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                tool === "eraser"
                  ? "bg-rose-500 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              }`}
              title="Eraser"
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>

          {/* Brush Size Slider */}
          <div className="flex md:flex-col items-center gap-1.5 mt-2">
            <span className="text-[10px] font-black uppercase text-slate-400">Size</span>
            <input
              type="range"
              min="4"
              max="45"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="accent-purple-600 w-24 md:w-20 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{brushSize}px</span>
          </div>

          {/* Color Palette */}
          <div className="grid grid-cols-5 md:grid-cols-2 gap-1.5 mt-2">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  if (tool === "eraser") setTool("glow");
                }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? "scale-125 border-slate-900 shadow-md" : "border-white hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Main Canvas Workspace */}
        <div ref={containerRef} className="flex-1 w-full h-full relative bg-slate-100 dark:bg-zinc-950 touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="w-full h-full cursor-crosshair"
          />
        </div>
      </div>

      <PremiumLockModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
