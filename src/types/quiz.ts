import { AgeGroup, Difficulty } from "./game";

export interface QuizQuestion {
  id: string;
  question: string;
  imageUrl?: string;
  options: {
    id: string;
    text: string;
    imageUrl?: string;
    isCorrect: boolean;
  }[];
}

export interface QuizMetadata {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  category: "math" | "english" | "science" | "general";
  ageRange: AgeGroup[];
  difficulty: Difficulty;
  isPremium: boolean;
  xpReward: number;
}

export interface Quiz {
  metadata: QuizMetadata;
  questions: QuizQuestion[];
}
