import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth, db } from "@/lib/firebase/client";
import { doc, setDoc, getDoc } from "firebase/firestore";

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface ActivityLog {
  id: string;
  topic: string;
  durationMinutes: number;
  score: number;
  timestamp: Date | any; // allow any for firestore timestamp
}

interface UserState {
  displayName: string;
  avatar: string;
  xp: number;
  level: number;
  stars: number;
  coins: number;
  streak: number;
  lastActive: Date | null;
  badges: UserBadge[];
  isPremium: boolean;
  activityLogs: ActivityLog[];
  
  // Actions
  addXp: (amount: number) => void;
  addStars: (amount: number) => void;
  addCoins: (amount: number) => void;
  unlockBadge: (badge: Omit<UserBadge, "unlockedAt">) => void;
  updateStreak: () => void;
  setPremium: (status: boolean) => void;
  resetProgress: () => void;
  syncToDb: () => void;
  fetchFromDb: () => Promise<void>;
  logActivity: (activity: Omit<ActivityLog, "id" | "timestamp">) => void;
  clearOldGames: () => void; // New utility to remove deprecated games
}

const XP_PER_LEVEL = 1000;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      displayName: "Player 1",
      avatar: "🦊",
      xp: 0,
      level: 1,
      stars: 0,
      coins: 0,
      streak: 0,
      lastActive: null,
      badges: [],
      isPremium: false,
      activityLogs: [],

      syncToDb: async () => {
        const state = get();
        const user = auth.currentUser;
        if (user) {
          try {
            await setDoc(doc(db, "profiles", user.uid), {
              xp: state.xp,
              level: state.level,
              stars: state.stars,
              coins: state.coins,
              activityLogs: state.activityLogs
            }, { merge: true });
          } catch (e) {
            console.error("Failed to sync to Firebase", e);
          }
        }
      },

      fetchFromDb: async () => {
        const user = auth.currentUser;
        if (user) {
          try {
            const docRef = doc(db, "profiles", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              // Filter out deprecated games like Speed Racer or Dino Run
              let logs = data.activityLogs || [];
              logs = logs.filter((log: ActivityLog) => 
                !log.topic.toLowerCase().includes("racer") && 
                !log.topic.toLowerCase().includes("dino")
              );
              
              set({
                xp: data.xp || get().xp,
                level: data.level || get().level,
                stars: data.stars || get().stars,
                coins: data.coins || get().coins,
                activityLogs: logs
              });
            }
          } catch (e) {
            console.error("Failed to fetch from Firebase", e);
          }
        }
      },

      clearOldGames: () => {
        set((state) => ({
          activityLogs: state.activityLogs.filter(log => 
            !log.topic.toLowerCase().includes("racer") && 
            !log.topic.toLowerCase().includes("dino")
          )
        }));
        get().syncToDb();
      },

      logActivity: (activity) => {
        set((state) => {
          const newLog = {
            ...activity,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().getTime() // store as timestamp number for easier serialization
          };
          return { activityLogs: [...state.activityLogs, newLog] };
        });
        get().syncToDb();
      },

      addXp: (amount) => {
        set((state) => {
          const newXp = state.xp + amount;
          const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
          return { xp: newXp, level: newLevel };
        });
        get().syncToDb();
      },

      addStars: (amount) => {
        set((state) => ({ stars: state.stars + amount }));
        get().syncToDb();
      },
      
      addCoins: (amount) => {
        set((state) => ({ coins: state.coins + amount }));
        get().syncToDb();
      },

      setPremium: (status) => set({ isPremium: status }),

      unlockBadge: (badge) => set((state) => {
        if (state.badges.find(b => b.id === badge.id)) return state;
        return {
          badges: [...state.badges, { ...badge, unlockedAt: new Date() }]
        };
      }),

      updateStreak: () => {
        set((state) => {
          const now = new Date();
          const last = state.lastActive ? new Date(state.lastActive) : null;
          
          if (!last) return { streak: 1, lastActive: now };

          const isToday = last.toDateString() === now.toDateString();
          if (isToday) return { lastActive: now };

          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          
          const isConsecutive = last.toDateString() === yesterday.toDateString();
          
          return {
            streak: isConsecutive ? state.streak + 1 : 1,
            lastActive: now
          };
        });
        get().syncToDb();
      },

      resetProgress: () => {
        set({
          xp: 0,
          level: 1,
          stars: 0,
          coins: 0,
          streak: 0,
          badges: [],
          activityLogs: []
        });
        get().syncToDb();
      }
    }),
    {
      name: "kids-learning-user-storage",
    }
  )
);
