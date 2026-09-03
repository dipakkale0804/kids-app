export type AgeGroup = "5-6" | "7-8" | "9-10";
export type Difficulty = "easy" | "medium" | "hard";

export interface GameMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  icon?: string;
  color?: string;
  category: "math" | "english" | "science" | "memory" | "logic";
  ageRange: AgeGroup[];
  difficulty: Difficulty;
  isPremium: boolean;
  xpReward: number;
}

export type GameState = "start" | "playing" | "completed";

export interface GameSession {
  gameId: string;
  score: number;
  accuracy: number;
  xpEarned: number;
  completedAt?: Date;
}
