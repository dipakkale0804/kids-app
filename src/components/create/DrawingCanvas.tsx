"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Pencil, Undo2, Save, Trash2, Square, Circle, Minus, PaintBucket, Download } from "lucide-react";

const COLORS = [
  "#000000", "#7F7F7F", "#880015", "#ED1C24", "#FF7F27", "#FFF200", "#22B14C", "#00A2E8", "#3F48CC", "#A349A4",
  "#FFFFFF", "#C3C3C3", "#B97A57", "#FFAEC9", "#FFC90E", "#EFE4B0", "#B5E61D", "#99D9EA", "#7092BE", "#C8BFE7"
];

type Tool = "pencil" | "eraser" | "rectangle" | "circle" | "line" | "fill";

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<Tool>("pencil");
  
  const [history, setHistory] = useState<ImageData[]>([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  // Initialize Canvas
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      const ctx = canvas.getContext("2d");
      const currentData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        if (currentData && canvas.width > 0 && canvas.height > 0) {
          try { ctx.putImageData(currentData, 0, 0); } catch (e) {}
        } else {
          saveToHistory(canvas);
        }
      }
    };
    
    setTimeout(resizeCanvas, 100);
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const saveToHistory = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => {
      const newHistory = [...prev, data];
      return newHistory.length > 30 ? newHistory.slice(1) : newHistory;
    });
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const previousState = history[history.length - 2];
    ctx.putImageData(previousState, 0, 0);
    setHistory(prev => prev.slice(0, -1));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory(canvas);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // Basic flood fill (BFS)
  const floodFill = (ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) => {
    const canvas = ctx.canvas;
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    
    // Parse target color
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
      } : { r: 0, g: 0, b: 0, a: 255 };
    };
    const fillRgb = hexToRgb(fillColor);
    
    const getPixelIdx = (x: number, y: number) => (y * w + x) * 4;
    
    const startIdx = getPixelIdx(startX, startY);
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];
    const startA = data[startIdx + 3];

    // If clicking on same color, do nothing
    if (startR === fillRgb.r && startG === fillRgb.g && startB === fillRgb.b) return;

    const matchStartColor = (idx: number) => {
      return data[idx] === startR && data[idx+1] === startG && data[idx+2] === startB && data[idx+3] === startA;
    };

    const colorPixel = (idx: number) => {
      data[idx] = fillRgb.r;
      data[idx+1] = fillRgb.g;
      data[idx+2] = fillRgb.b;
      data[idx+3] = fillRgb.a;
    };

    const pixelStack = [[startX, startY]];

    while(pixelStack.length > 0) {
      const pos = pixelStack.pop();
      if (!pos) continue;
      let [x, y] = pos;
      let idx = getPixelIdx(x, y);

      while(y >= 0 && matchStartColor(idx)) {
        y--;
        idx -= w * 4;
      }
      
      idx += w * 4;
      y++;
      
      let reachLeft = false;
      let reachRight = false;

      while(y < h && matchStartColor(idx)) {
        colorPixel(idx);

        if (x > 0) {
          if (matchStartColor(idx - 4)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < w - 1) {
          if (matchStartColor(idx + 4)) {
            if (!reachRight) {
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        y++;
        idx += w * 4;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const startDrawingFn = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    const { x, y } = getCoordinates(e);
    
    if (tool === "fill") {
      floodFill(ctx, Math.floor(x), Math.floor(y), color);
      saveToHistory(canvas);
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    if (tool === "pencil" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const drawFn = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !snapshot) return;
    
    const { x, y } = getCoordinates(e);

    if (tool === "pencil" || tool === "eraser") {
      ctx.lineTo(x, y);
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    } else {
      // Shapes - restore previous snapshot before drawing new size
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (tool === "rectangle") {
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawingFn = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      saveToHistory(canvasRef.current);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `KidsLearn-Paint-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto h-[85vh] bg-slate-200 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 shadow-2xl rounded-sm overflow-hidden select-none">
      
      {/* Top Toolbar (MS Paint Style) */}
      <div className="bg-slate-100 dark:bg-zinc-950 border-b border-slate-300 dark:border-zinc-800 p-2 flex flex-wrap gap-4 items-center shadow-sm">
        
        {/* Tools Section */}
        <div className="flex flex-col gap-1 border-r border-slate-300 dark:border-zinc-800 pr-4">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">Tools</span>
          <div className="flex gap-1">
            <ToolBtn icon={<Pencil size={18}/>} active={tool==="pencil"} onClick={()=>setTool("pencil")} title="Pencil" />
            <ToolBtn icon={<PaintBucket size={18}/>} active={tool==="fill"} onClick={()=>setTool("fill")} title="Fill with color" />
            <ToolBtn icon={<Eraser size={18}/>} active={tool==="eraser"} onClick={()=>setTool("eraser")} title="Eraser" />
          </div>
        </div>

        {/* Shapes Section */}
        <div className="flex flex-col gap-1 border-r border-slate-300 dark:border-zinc-800 pr-4">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">Shapes</span>
          <div className="flex gap-1">
            <ToolBtn icon={<Minus size={18}/>} active={tool==="line"} onClick={()=>setTool("line")} title="Line" />
            <ToolBtn icon={<Square size={18}/>} active={tool==="rectangle"} onClick={()=>setTool("rectangle")} title="Rectangle" />
            <ToolBtn icon={<Circle size={18}/>} active={tool==="circle"} onClick={()=>setTool("circle")} title="Circle" />
          </div>
        </div>

        {/* Size Section */}
        <div className="flex flex-col gap-1 border-r border-slate-300 dark:border-zinc-800 pr-4">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">Size</span>
          <div className="flex flex-col gap-1 w-16 px-1">
            <input 
              type="range" 
              min="1" max="50" 
              value={lineWidth} 
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
            <span className="text-xs text-center">{lineWidth}px</span>
          </div>
        </div>

        {/* Colors Section */}
        <div className="flex flex-col gap-1 border-r border-slate-300 dark:border-zinc-800 pr-4">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">Colors</span>
          <div className="flex gap-2 items-center">
            <div className="w-10 h-10 border-2 border-slate-400 bg-white shadow-inner flex items-center justify-center p-1 rounded-sm">
              <div className="w-full h-full border border-slate-300" style={{ backgroundColor: color }} />
            </div>
            <div className="grid grid-cols-10 gap-1 w-[220px]">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-5 h-5 border border-slate-400 hover:ring-1 ring-blue-500"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 ml-2 cursor-pointer border-0 p-0"
              title="Custom Color"
            />
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col gap-1 ml-auto pr-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">Actions</span>
          <div className="flex gap-1">
            <ToolBtn icon={<Undo2 size={18}/>} onClick={undo} disabled={history.length <= 1} title="Undo" />
            <ToolBtn icon={<Trash2 size={18}/>} onClick={clearCanvas} title="Clear" />
            <ToolBtn icon={<Download size={18}/>} onClick={downloadCanvas} title="Save" />
          </div>
        </div>
      </div>

      {/* Canvas Area Container */}
      <div className="flex-1 bg-slate-300 dark:bg-zinc-800 p-2 overflow-auto relative">
        {/* The actual canvas wrapper with shadow like MS Paint */}
        <div 
          ref={containerRef} 
          className="bg-white shadow-md relative touch-none mx-auto border border-slate-400"
          style={{ width: "100%", maxWidth: "1200px", height: "100%", minHeight: "600px" }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawingFn}
            onMouseMove={drawFn}
            onMouseUp={stopDrawingFn}
            onMouseOut={stopDrawingFn}
            onTouchStart={startDrawingFn}
            onTouchMove={drawFn}
            onTouchEnd={stopDrawingFn}
            className={`absolute inset-0 w-full h-full ${tool === 'fill' ? 'cursor-cell' : 'cursor-crosshair'}`}
          />
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ icon, active, onClick, disabled, title }: any) {
  return (
    <Button 
      variant="ghost" 
      size="icon"
      title={title}
      disabled={disabled}
      className={`h-8 w-8 rounded-sm ${active ? "bg-blue-100 border border-blue-400 text-blue-700" : "hover:bg-slate-200 border border-transparent text-slate-700 dark:text-slate-300"}`}
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}
