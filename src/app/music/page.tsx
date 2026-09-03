"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Music, Play, Disc3, Mic2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SONGS = [
  { id: "piano", title: "Magic Piano", type: "Instrument", icon: "🎹", premium: false, color: "bg-purple-100 border-purple-300 text-purple-900", route: "/music/piano" },
  { id: "drums", title: "Drum Kit", type: "Instrument", icon: "🥁", premium: false, color: "bg-rose-100 border-rose-300 text-rose-900", route: "/music/drums" },
  { id: "old-macdonald", title: "Old MacDonald", type: "Sing Along", icon: "🚜", premium: true, color: "bg-orange-100 border-orange-300 text-orange-900", route: "#" },
  { id: "alphabet", title: "Alphabet Song", type: "Sing Along", icon: "🔤", premium: true, color: "bg-blue-100 border-blue-300 text-blue-900", route: "#" },
];

export default function MusicPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex justify-between items-center p-6 bg-rose-600 text-white shadow-lg">
        <Button variant="ghost" onClick={() => router.push('/')} className="hover:bg-rose-700 font-bold">
          <ArrowLeft className="w-5 h-5 mr-2" /> Home
        </Button>
        <div className="flex items-center gap-2">
          <Music className="w-8 h-8" />
          <h1 className="text-2xl font-black tracking-tight">Music Room</h1>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </header>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">Sing & Play!</h2>
          <p className="text-xl text-slate-600 font-medium">Make some noise or sing your favorite songs!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SONGS.map((song) => (
            <Link key={song.id} href={song.route} className={song.premium ? "pointer-events-none opacity-80" : ""}>
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative flex flex-col items-center p-8 rounded-3xl border-4 shadow-xl ${song.color} cursor-pointer group h-full`}
              >
                {song.premium && (
                  <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 p-3 rounded-full shadow-lg border-2 border-yellow-200">
                    <Lock className="w-5 h-5" />
                  </div>
                )}
                
                <div className="text-8xl mb-6 drop-shadow-md group-hover:rotate-12 transition-transform">
                  {song.icon}
                </div>
                
                <h3 className="text-2xl font-black mb-2 text-center leading-tight">{song.title}</h3>
                
                <div className="flex items-center gap-2 text-sm font-bold opacity-80 mb-6">
                  {song.type === "Sing Along" ? <Mic2 className="w-4 h-4" /> : <Disc3 className="w-4 h-4" />}
                  <span>{song.type}</span>
                </div>
                
                <Button className="w-full rounded-full font-bold text-lg h-12 bg-white/50 hover:bg-white/80 border-2 border-current text-inherit mt-auto shadow-sm pointer-events-none">
                  <Play className="w-5 h-5 mr-2" /> {song.premium ? "Locked" : "Play Now"}
                </Button>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
