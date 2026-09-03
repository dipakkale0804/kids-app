import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  xpReward: number;
  type: "play_games" | "play_quizzes" | "earn_xp";
}

interface ChallengeState {
  currentDate: string | null;
  challenges: (Challenge & { progress: number; completed: boolean })[];
  
  // Actions
  initializeDaily: () => void;
  incrementProgress: (type: Challenge["type"], amount: number) => number; // Returns total newly earned XP
}

const AVAILABLE_CHALLENGES: Challenge[] = [
  { id: "c1", title: "Game Master", description: "Play 2 educational games.", targetCount: 2, xpReward: 100, type: "play_games" },
  { id: "c2", title: "Quiz Whiz", description: "Complete 1 quiz.", targetCount: 1, xpReward: 150, type: "play_quizzes" },
  { id: "c3", title: "XP Hunter", description: "Earn 200 XP from any activity.", targetCount: 200, xpReward: 50, type: "earn_xp" },
  { id: "c4", title: "Dedicated Learner", description: "Play 3 educational games.", targetCount: 3, xpReward: 150, type: "play_games" },
  { id: "c5", title: "Trivia Star", description: "Complete 2 quizzes.", targetCount: 2, xpReward: 200, type: "play_quizzes" },
];

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      currentDate: null,
      challenges: [],

      initializeDaily: () => set((state) => {
        const today = new Date().toDateString();
        
        if (state.currentDate === today && state.challenges.length > 0) {
          return state; // Already initialized today
        }

        // Pick 3 random challenges
        const shuffled = [...AVAILABLE_CHALLENGES].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(c => ({ ...c, progress: 0, completed: false }));

        return {
          currentDate: today,
          challenges: selected,
        };
      }),

      incrementProgress: (type, amount) => {
        let totalXpEarned = 0;
        
        set((state) => {
          const newChallenges = state.challenges.map(c => {
            if (c.type === type && !c.completed) {
              const newProgress = Math.min(c.progress + amount, c.targetCount);
              const isCompleted = newProgress >= c.targetCount;
              
              if (isCompleted) {
                totalXpEarned += c.xpReward;
              }
              
              return { ...c, progress: newProgress, completed: isCompleted };
            }
            return c;
          });
          
          return { challenges: newChallenges };
        });
        
        return totalXpEarned;
      }
    }),
    {
      name: "kids-learning-challenges",
    }
  )
);
