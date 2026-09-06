import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth, db } from "@/lib/firebase/client";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

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
  premiumExpiresAt: string | null;
  plan: "monthly" | "yearly" | null;
  activityLogs: ActivityLog[];
  
  // Actions
  addXp: (amount: number) => void;
  addStars: (amount: number) => void;
  addCoins: (amount: number) => void;
  unlockBadge: (badge: Omit<UserBadge, "unlockedAt">) => void;
  updateStreak: () => void;
  setPremium: (status: boolean, expiresAt?: string | null, plan?: "monthly" | "yearly" | null) => void;
  resetProgress: () => void;
  syncToDb: () => void;
  fetchFromDb: () => Promise<void>;
  subscribeToDb: () => (() => void) | undefined;
  logActivity: (activity: Omit<ActivityLog, "id" | "timestamp">) => void;
  clearOldGames: () => void; // New utility to remove deprecated games
  resetUser: () => void; // Clear state on logout
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
      premiumExpiresAt: null,
      plan: null,
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
              activityLogs: state.activityLogs,
              is_premium: state.isPremium,
              premiumExpiresAt: state.premiumExpiresAt,
              plan: state.plan,
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
              
              const hasPremiumFlag = data.is_premium === true || data.isPremium === true;
              let finalExpiresAt = data.premiumExpiresAt || null;
              const plan = data.plan || "monthly";

              // Self-heal: If premium was active previously without premiumExpiresAt, grant full validity (30d/365d)
              if (hasPremiumFlag && !finalExpiresAt) {
                const baseDate = data.premiumActivatedAt ? new Date(data.premiumActivatedAt) : new Date();
                const days = plan === "yearly" ? 365 : 30;
                finalExpiresAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
                setDoc(docRef, { premiumExpiresAt: finalExpiresAt, plan }, { merge: true }).catch(console.error);
              }

              const expiresAtDate = finalExpiresAt ? new Date(finalExpiresAt) : null;
              const isExpired = expiresAtDate ? expiresAtDate.getTime() <= Date.now() : false;
              const isPremiumActive = hasPremiumFlag && !isExpired;

              // If expired, automatically update Firestore
              if (hasPremiumFlag && isExpired && data.is_premium !== false) {
                setDoc(docRef, { is_premium: false, isPremium: false, subscriptionStatus: "expired" }, { merge: true }).catch(console.error);
              }

              set({
                xp: data.xp || get().xp,
                level: data.level || get().level,
                stars: data.stars || get().stars,
                coins: data.coins || get().coins,
                activityLogs: logs,
                isPremium: isPremiumActive,
                premiumExpiresAt: finalExpiresAt,
                plan: plan,
              });
            }
          } catch (e) {
            console.error("Failed to fetch from Firebase", e);
          }
        }
      },

      subscribeToDb: () => {
        const user = auth.currentUser;
        if (!user) return undefined;

        try {
          const docRef = doc(db, "profiles", user.uid);
          return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              let logs = data.activityLogs || [];
              logs = logs.filter((log: ActivityLog) => 
                !log.topic.toLowerCase().includes("racer") && 
                !log.topic.toLowerCase().includes("dino")
              );
              
              const hasPremiumFlag = data.is_premium === true || data.isPremium === true;
              let finalExpiresAt = data.premiumExpiresAt || null;
              const plan = data.plan || "monthly";

              if (hasPremiumFlag && !finalExpiresAt) {
                const baseDate = data.premiumActivatedAt ? new Date(data.premiumActivatedAt) : new Date();
                const days = plan === "yearly" ? 365 : 30;
                finalExpiresAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
                setDoc(docRef, { premiumExpiresAt: finalExpiresAt, plan }, { merge: true }).catch(console.error);
              }

              const expiresAtDate = finalExpiresAt ? new Date(finalExpiresAt) : null;
              const isExpired = expiresAtDate ? expiresAtDate.getTime() <= Date.now() : false;
              const isPremiumActive = hasPremiumFlag && !isExpired;

              if (hasPremiumFlag && isExpired && data.is_premium !== false) {
                setDoc(docRef, { is_premium: false, isPremium: false, subscriptionStatus: "expired" }, { merge: true }).catch(console.error);
              }

              set({
                xp: data.xp || get().xp,
                level: data.level || get().level,
                stars: data.stars || get().stars,
                coins: data.coins || get().coins,
                activityLogs: logs,
                isPremium: isPremiumActive,
                premiumExpiresAt: finalExpiresAt,
                plan: plan,
              });
            }
          }, (err) => {
            console.error("Realtime subscription error:", err);
          });
        } catch (err) {
          console.error("Failed to setup snapshot listener:", err);
          return undefined;
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

      setPremium: (status, expiresAt = null, plan = null) => {
        set({ 
          isPremium: status,
          premiumExpiresAt: expiresAt,
          plan: plan
        });
        get().syncToDb();
      },

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
      },

      resetUser: () => {
        set({
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
          premiumExpiresAt: null,
          plan: null,
          activityLogs: []
        });
      }
    }),
    {
      name: "kids-learning-user-storage",
    }
  )
);
