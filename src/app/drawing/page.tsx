import { DrawingCanvas } from "@/components/create/DrawingCanvas";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Palette } from "lucide-react";

export default function DrawingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 bg-[url('/bg-pattern.svg')] bg-repeat">
      <header className="p-4 flex items-center justify-between sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b-2 border-indigo-100 dark:border-zinc-800">
        <Link href="/">
          <Button variant="ghost" className="rounded-full font-bold bg-white/50 hover:bg-white shadow-sm border border-slate-200">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back Home
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-black text-indigo-900 dark:text-indigo-100 flex items-center gap-2 drop-shadow-sm">
          <Palette className="w-6 h-6 md:w-8 md:h-8 text-fuchsia-500" /> Drawing Zone
        </h1>
        <div className="w-[100px] hidden md:block" /> {/* Spacer */}
      </header>
      
      <main className="flex-1 w-full p-2 md:p-4 flex flex-col items-center overflow-hidden">
        <DrawingCanvas />
      </main>
    </div>
  );
}
