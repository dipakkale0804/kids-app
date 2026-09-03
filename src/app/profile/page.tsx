"use client";

import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/button";
import { Star, Flame, Trophy, Coins, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { displayName, xp, level, stars, coins, streak, isPremium, resetProgress } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleReset = () => {
    resetProgress();
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 relative">
      <Link href="/" className="absolute top-8 left-8">
        <Button variant="ghost" className="rounded-full font-bold">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back Home
        </Button>
      </Link>

      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-8 border-4 border-primary/20 shadow-xl mt-8">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner border-4 border-primary/30 relative">
            🦊
            {isPremium && (
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white rounded-full p-1.5 shadow-lg border-2 border-white dark:border-zinc-900" title="Premium Member">
                <Star className="w-5 h-5 fill-current" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 justify-center">
            <h1 className="text-4xl font-extrabold text-foreground">{displayName}'s Dashboard</h1>
            {isPremium && (
              <span className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                PRO
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-2 font-mono">Parent Control Center</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl flex flex-col items-center text-blue-700 dark:text-blue-400">
            <Trophy className="w-8 h-8 mb-2" />
            <span className="text-sm font-bold opacity-80">Level</span>
            <span className="text-2xl font-extrabold">{level}</span>
          </div>
          
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-2xl flex flex-col items-center text-yellow-700 dark:text-yellow-500">
            <Star className="w-8 h-8 mb-2 fill-current" />
            <span className="text-sm font-bold opacity-80">Stars</span>
            <span className="text-2xl font-extrabold">{stars}</span>
          </div>

          <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-2xl flex flex-col items-center text-amber-700 dark:text-amber-500">
            <Coins className="w-8 h-8 mb-2 fill-current" />
            <span className="text-sm font-bold opacity-80">Coins</span>
            <span className="text-2xl font-extrabold">{coins}</span>
          </div>

          <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-2xl flex flex-col items-center text-orange-700 dark:text-orange-500">
            <Flame className="w-8 h-8 mb-2 fill-current" />
            <span className="text-sm font-bold opacity-80">Streak</span>
            <span className="text-2xl font-extrabold">{streak}</span>
          </div>
        </div>

        <div className="bg-muted p-6 rounded-2xl border-2 border-border/50">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <AlertTriangle className="text-destructive w-6 h-6" /> 
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Resetting progress will permanently erase all XP, levels, stars, coins, and streaks for {displayName}. This action cannot be undone.
          </p>

          {!showConfirm ? (
            <Button 
              variant="destructive" 
              className="w-full font-bold rounded-xl"
              onClick={() => setShowConfirm(true)}
            >
              Reset All Game Progress
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 font-bold rounded-xl"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 font-bold rounded-xl"
                onClick={handleReset}
              >
                Yes, Delete Progress
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
