"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookHeart, PlayCircle, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORIES = [
  { id: 1, title: "The Sleepy Bear", cover: "🐻", time: "5 min", premium: false, color: "bg-amber-100 border-amber-300 text-amber-900" },
  { id: 2, title: "Space Adventure", cover: "🚀", time: "8 min", premium: false, color: "bg-indigo-100 border-indigo-300 text-indigo-900" },
  { id: 3, title: "The Magic Forest", cover: "🌲", time: "10 min", premium: true, color: "bg-emerald-100 border-emerald-300 text-emerald-900" },
  { id: 4, title: "Dinosaur Friends", cover: "🦕", time: "7 min", premium: true, color: "bg-rose-100 border-rose-300 text-rose-900" },
];

export default function StoriesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex justify-between items-center p-6 bg-teal-600 text-white shadow-lg">
        <Button variant="ghost" onClick={() => router.push('/')} className="hover:bg-teal-700 font-bold">
          <ArrowLeft className="w-5 h-5 mr-2" /> Home
        </Button>
        <div className="flex items-center gap-2">
          <BookHeart className="w-8 h-8" />
          <h1 className="text-2xl font-black tracking-tight">Story Time</h1>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </header>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">Read & Listen</h2>
          <p className="text-xl text-slate-600 font-medium">Pick a magical story to start reading!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STORIES.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative flex flex-col items-center p-8 rounded-3xl border-4 shadow-xl ${story.color} cursor-pointer group`}
            >
              {story.premium && (
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 p-3 rounded-full shadow-lg border-2 border-yellow-200">
                  <Lock className="w-5 h-5" />
                </div>
              )}
              
              <div className="text-8xl mb-6 drop-shadow-md group-hover:scale-110 transition-transform">
                {story.cover}
              </div>
              
              <h3 className="text-2xl font-black mb-2 text-center leading-tight">{story.title}</h3>
              
              <div className="flex items-center gap-2 text-sm font-bold opacity-80 mb-6">
                <Star className="w-4 h-4 fill-current" />
                <span>{story.time} Read</span>
              </div>
              
              <Button className="w-full rounded-full font-bold text-lg h-12 bg-white/50 hover:bg-white/80 border-2 border-current text-inherit mt-auto shadow-sm">
                <PlayCircle className="w-5 h-5 mr-2" /> Read Now
              </Button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
