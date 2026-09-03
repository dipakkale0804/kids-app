"use client";

import { useUserStore } from "@/store/useUserStore";
import { useChallengeStore } from "@/store/useChallengeStore";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Flame, Trophy, Coins, Target, CheckCircle2, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function RewardsPage() {
  const user = useUserStore();
  const { challenges, initializeDaily } = useChallengeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeDaily();
  }, [initializeDaily]);

  if (!mounted) return null;

  const xpForNextLevel = 1000;
  const currentLevelXp = user.xp % xpForNextLevel;
  const xpProgress = (currentLevelXp / xpForNextLevel) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 bg-transparent w-full flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" className="rounded-full font-bold">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back Home
          </Button>
        </Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8">
        
        {/* Top Profile Summary */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border-4 border-primary/20 shadow-xl flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          
          <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center text-7xl shadow-inner border-4 border-primary/30 shrink-0 relative z-10">
            {user.avatar}
          </div>
          
          <div className="flex-1 relative z-10 w-full">
            <h1 className="text-4xl font-extrabold text-foreground mb-2">{user.displayName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
              <span className="bg-primary text-primary-foreground font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                Level {user.level}
              </span>
              <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" /> {user.stars} Stars
              </span>
              <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-500 font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                <Flame className="w-5 h-5 fill-orange-500 text-orange-500" /> {user.streak} Day Streak
              </span>
            </div>

            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
                <span>{user.xp} XP total</span>
                <span>{levelUpXp(user.level, user.xp)} XP to Level {user.level + 1}</span>
              </div>
              <Progress value={xpProgress} className="h-4 rounded-full" />
            </div>
          </div>
        </div>

        {/* Two Column Layout for Challenges and Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Daily Challenges */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border-4 border-blue-500/20 shadow-lg">
            <h2 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
              <Target className="w-7 h-7" /> Daily Challenges
            </h2>
            
            <div className="flex flex-col gap-4">
              {challenges.map((challenge, i) => (
                <div key={challenge.id} className="bg-muted/50 rounded-2xl p-4 border-2 border-border/50 relative overflow-hidden">
                  {challenge.completed && (
                    <div className="absolute inset-0 bg-success/10 flex items-center justify-end px-6">
                      <CheckCircle2 className="w-16 h-16 text-success opacity-20" />
                    </div>
                  )}
                  
                  <div className="relative z-10 flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{challenge.title}</h3>
                      <p className="text-muted-foreground text-sm font-mono">{challenge.description}</p>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shrink-0">
                      +{challenge.xpReward} XP
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-4 flex items-center gap-4">
                    <Progress 
                      value={(challenge.progress / challenge.targetCount) * 100} 
                      className={`h-2 flex-1 ${challenge.completed ? '[&>div]:bg-success' : '[&>div]:bg-blue-500'}`} 
                    />
                    <span className="text-sm font-bold text-muted-foreground w-12 text-right">
                      {challenge.progress} / {challenge.targetCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border-4 border-purple-500/20 shadow-lg">
            <h2 className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mb-6 flex items-center gap-2">
              <Trophy className="w-7 h-7" /> Badges
            </h2>
            
            {user.badges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-70">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg text-foreground">No badges yet!</h3>
                <p className="text-muted-foreground font-mono">Keep playing games and quizzes to earn badges.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {user.badges.map(badge => (
                  <motion.div 
                    key={badge.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 flex flex-col items-center text-center border-2 border-purple-200 dark:border-purple-800"
                  >
                    <div className="text-5xl mb-2 drop-shadow-md">{badge.icon}</div>
                    <h4 className="font-bold text-sm text-foreground leading-tight mb-1">{badge.name}</h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

function levelUpXp(level: number, currentXp: number) {
  const nextLevelTotal = level * 1000;
  return nextLevelTotal - currentXp;
}
