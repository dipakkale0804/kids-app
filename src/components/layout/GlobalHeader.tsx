"use client";

import { useUserStore } from "@/store/useUserStore";
import { Progress } from "@/components/ui/progress";
import { Star, Flame, Award, Coins } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { motion } from "framer-motion";

export function GlobalHeader() {
  const { displayName, avatar, xp, level, stars, coins, streak, isPremium, updateStreak } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    updateStreak();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch child_name from Firestore profile
        try {
          const profileDoc = await getDoc(doc(db, "profiles", currentUser.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            if (data.child_name) {
              useUserStore.setState({ displayName: data.child_name });
            }
          }
        } catch (e) {
          console.error("Failed to fetch profile", e);
        }
      }
    });

    return () => unsubscribe();
  }, [updateStreak]);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload(); 
  };

  if (!mounted) return null; 

  const xpForNextLevel = 1000;
  const currentLevelXp = xp % xpForNextLevel;
  const xpProgress = (currentLevelXp / xpForNextLevel) * 100;

  return (
    <header className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-b-[6px] border-primary/20 sticky top-0 z-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex shrink-0">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="text-2xl lg:text-3xl font-black bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-1 sm:gap-2 drop-shadow-sm"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Star className="text-yellow-400 fill-yellow-400 w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />
            </motion.div>
            <span className="hidden sm:block">KidsLearn</span>
          </motion.div>
        </Link>

        {/* User Profile Mini */}
        <Link href="/profile">
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-1 sm:pl-2 sm:pr-5 sm:py-2 rounded-full border-2 border-indigo-100 dark:border-indigo-800/50 shadow-sm cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-md border-[3px] border-indigo-400 shrink-0">
              {avatar}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-indigo-950 dark:text-indigo-100 leading-tight max-w-[100px] truncate">{displayName}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow-inner">
                  LVL {level}
                </span>
                {isPremium && (
                  <span className="text-[10px] font-black bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white px-2 py-0.5 rounded-full shadow-inner flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" /> PRO
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Gamification Stats */}
        <div className="flex items-center gap-1.5 sm:gap-4 flex-1 justify-end shrink-0">
          
          {/* XP Bar */}
          <div className="hidden xl:flex flex-col flex-1 max-w-[220px] gap-1.5 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-2xl border-2 border-gray-100 dark:border-zinc-700/50">
            <div className="flex justify-between text-xs font-black text-gray-500 dark:text-gray-400 px-1">
              <span>XP: {xp}</span>
              <span>Next: {level * xpForNextLevel}</span>
            </div>
            <Progress value={xpProgress} className="h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 shadow-inner" />
          </div>

          <Link href="/rewards">
            <motion.div 
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-b from-yellow-200 to-yellow-400 border-b-2 sm:border-b-4 border-yellow-500 text-yellow-900 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-black cursor-pointer shadow-lg text-xs sm:text-base"
            >
              <Star className="w-4 h-4 sm:w-6 sm:h-6 fill-yellow-100 text-yellow-600 drop-shadow-sm" />
              <span>{stars}</span>
            </motion.div>
          </Link>
          
          <Link href="/rewards">
            <motion.div 
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-b from-orange-200 to-orange-400 border-b-2 sm:border-b-4 border-orange-500 text-orange-950 px-2 sm:px-4 py-1 sm:py-2 rounded-full font-black cursor-pointer shadow-lg text-xs sm:text-base"
            >
              <Flame className="w-4 h-4 sm:w-6 sm:h-6 fill-orange-100 text-orange-600 drop-shadow-sm" />
              <span>{streak}</span>
            </motion.div>
          </Link>

          {/* Parent Zone / Auth Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
            {!user ? (
              <Link href="/auth">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 bg-gradient-to-b from-primary to-indigo-600 text-white border-b-2 sm:border-b-4 border-indigo-800 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-black cursor-pointer shadow-lg text-xs sm:text-sm"
                >
                  Login
                </motion.div>
              </Link>
            ) : (
              <>
                <Link href="/profile">
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden md:flex items-center gap-1.5 bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border-2 border-b-4 border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-full font-black cursor-pointer shadow-sm text-sm"
                  >
                    Dashboard
                  </motion.div>
                </Link>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 text-rose-500 dark:text-rose-400 border-2 border-b-2 sm:border-b-4 border-rose-200 dark:border-rose-800 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full font-black cursor-pointer shadow-sm text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden text-[10px]">Out</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
