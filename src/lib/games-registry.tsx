import { GameMetadata } from "@/types/game";
import { NumberMatchGame } from "@/components/games/number-match/NumberMatchGame";
import { MemoryMatchGame } from "@/components/games/memory-match/MemoryMatchGame";
import { ReactNode } from "react";

type GameRegistryEntry = {
  metadata: GameMetadata;
  component: (props: any) => ReactNode;
};

export const gamesRegistry: Record<string, GameRegistryEntry> = {
  // --- MATH GAMES (10) ---
  "number-match-1": {
    metadata: { id: "number-match-1", title: "Count to 5 (Fruits)", description: "Count the yummy fruits!", thumbnail: "/games/number-match.png", icon: "🍎", color: "from-red-400 to-orange-400", category: "math", ageRange: ["5-6"], difficulty: "easy", isPremium: false, xpReward: 50 },
    component: (props) => <NumberMatchGame {...props} maxNumber={5} emojis={["🍎", "🍌", "🍉", "🍇"]} />
  },
  "number-match-2": {
    metadata: { id: "number-match-2", title: "Count to 10 (Animals)", description: "Count the cute animals!", thumbnail: "/games/number-match.png", icon: "🐶", color: "from-blue-400 to-indigo-400", category: "math", ageRange: ["5-6", "7-8"], difficulty: "medium", isPremium: false, xpReward: 100 },
    component: (props) => <NumberMatchGame {...props} maxNumber={10} emojis={["🐶", "🐱", "🐰", "🦊"]} />
  },
  "number-match-3": {
    metadata: { id: "number-match-3", title: "Count to 15 (Space)", description: "Count the rockets and stars!", thumbnail: "/games/number-match.png", icon: "🚀", color: "from-purple-500 to-indigo-600", category: "math", ageRange: ["7-8"], difficulty: "hard", isPremium: true, xpReward: 150 },
    component: (props) => <NumberMatchGame {...props} maxNumber={15} emojis={["🚀", "⭐", "🛸", "🌍"]} />
  },
  "number-match-4": {
    metadata: { id: "number-match-4", title: "Count the Toys", description: "How many toys can you see?", thumbnail: "/games/number-match.png", icon: "🧸", color: "from-pink-400 to-rose-400", category: "math", ageRange: ["5-6"], difficulty: "easy", isPremium: true, xpReward: 50 },
    component: (props) => <NumberMatchGame {...props} maxNumber={6} emojis={["🧸", "🚗", "🪁", "⚽"]} />
  },
  "number-match-5": {
    metadata: { id: "number-match-5", title: "Count the Bugs", description: "Count the creepy crawlies!", thumbnail: "/games/number-match.png", icon: "🦋", color: "from-green-400 to-emerald-500", category: "math", ageRange: ["7-8"], difficulty: "medium", isPremium: true, xpReward: 100 },
    component: (props) => <NumberMatchGame {...props} maxNumber={12} emojis={["🦋", "🐛", "🐞", "🐜"]} />
  },
  "number-match-6": {
    metadata: { id: "number-match-6", title: "Monster Counting", description: "Friendly monsters!", thumbnail: "/games/number-match.png", icon: "👾", color: "from-fuchsia-500 to-purple-600", category: "math", ageRange: ["5-6"], difficulty: "medium", isPremium: true, xpReward: 70 },
    component: (props) => <NumberMatchGame {...props} maxNumber={8} emojis={["👾", "👻", "🤖", "👹"]} />
  },
  "number-match-7": {
    metadata: { id: "number-match-7", title: "Under the Sea", description: "Count the fish!", thumbnail: "/games/number-match.png", icon: "🐠", color: "from-cyan-400 to-blue-500", category: "math", ageRange: ["5-6", "7-8"], difficulty: "easy", isPremium: true, xpReward: 80 },
    component: (props) => <NumberMatchGame {...props} maxNumber={7} emojis={["🐠", "🐬", "🐳", "🐙"]} />
  },
  "number-match-8": {
    metadata: { id: "number-match-8", title: "Count the Birds", description: "Birds in the sky!", thumbnail: "/games/number-match.png", icon: "🦅", color: "from-sky-400 to-indigo-400", category: "math", ageRange: ["7-8"], difficulty: "hard", isPremium: true, xpReward: 120 },
    component: (props) => <NumberMatchGame {...props} maxNumber={14} emojis={["🦅", "🦜", "🦚", "🦢"]} />
  },
  "number-match-9": {
    metadata: { id: "number-match-9", title: "Sweet Treats", description: "Count the sweets!", thumbnail: "/games/number-match.png", icon: "🍭", color: "from-pink-300 to-rose-400", category: "math", ageRange: ["5-6"], difficulty: "easy", isPremium: true, xpReward: 60 },
    component: (props) => <NumberMatchGame {...props} maxNumber={6} emojis={["🍦", "🍩", "🍪", "🍬"]} />
  },
  "number-match-10": {
    metadata: { id: "number-match-10", title: "Count to 20 (Master)", description: "The ultimate counting test!", thumbnail: "/games/number-match.png", icon: "👑", color: "from-yellow-400 to-amber-500", category: "math", ageRange: ["7-8"], difficulty: "hard", isPremium: true, xpReward: 200 },
    component: (props) => <NumberMatchGame {...props} maxNumber={20} emojis={["💎", "💰", "👑", "🏆"]} />
  },

  // --- MEMORY GAMES (10) ---
  "memory-match-1": {
    metadata: { id: "memory-match-1", title: "Memory: Pets", description: "Find the matching pets!", thumbnail: "/games/memory-match.png", icon: "🐱", color: "from-orange-400 to-amber-500", category: "memory", ageRange: ["5-6"], difficulty: "easy", isPremium: false, xpReward: 50 },
    component: (props) => <MemoryMatchGame {...props} deck={["🐶", "🐱", "🐭", "🐹", "🐰", "🦊"]} />
  },
  "memory-match-2": {
    metadata: { id: "memory-match-2", title: "Memory: Wild Animals", description: "Find the wild animals!", thumbnail: "/games/memory-match.png", icon: "🦁", color: "from-yellow-500 to-orange-600", category: "memory", ageRange: ["5-6", "7-8"], difficulty: "medium", isPremium: false, xpReward: 100 },
    component: (props) => <MemoryMatchGame {...props} deck={["🦁", "🐯", "🐻", "🐼", "🐨", "🐸", "🐒", "🐘"]} />
  },
  "memory-match-3": {
    metadata: { id: "memory-match-3", title: "Memory: Sea Creatures", description: "Match the ocean friends!", thumbnail: "/games/memory-match.png", icon: "🐙", color: "from-blue-500 to-cyan-500", category: "memory", ageRange: ["7-8"], difficulty: "hard", isPremium: true, xpReward: 150 },
    component: (props) => <MemoryMatchGame {...props} deck={["🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳"]} />
  },
  "memory-match-4": {
    metadata: { id: "memory-match-4", title: "Memory: Food", description: "Match the yummy food!", thumbnail: "/games/memory-match.png", icon: "🍕", color: "from-red-500 to-rose-600", category: "memory", ageRange: ["5-6"], difficulty: "easy", isPremium: true, xpReward: 80 },
    component: (props) => <MemoryMatchGame {...props} deck={["🍕", "🍔", "🍟", "🌭", "🍿", "🍩"]} />
  },
  "memory-match-5": {
    metadata: { id: "memory-match-5", title: "Memory: Vehicles", description: "Match the fast cars!", thumbnail: "/games/memory-match.png", icon: "🚗", color: "from-slate-400 to-zinc-600", category: "memory", ageRange: ["5-6"], difficulty: "easy", isPremium: true, xpReward: 80 },
    component: (props) => <MemoryMatchGame {...props} deck={["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️"]} />
  },
  "memory-match-6": {
    metadata: { id: "memory-match-6", title: "Memory: Weather", description: "Sun, rain, and snow!", thumbnail: "/games/memory-match.png", icon: "🌈", color: "from-sky-300 to-blue-400", category: "memory", ageRange: ["5-6"], difficulty: "easy", isPremium: true, xpReward: 60 },
    component: (props) => <MemoryMatchGame {...props} deck={["☀️", "☁️", "🌧️", "❄️", "🌩️", "🌈"]} />
  },
  "memory-match-7": {
    metadata: { id: "memory-match-7", title: "Memory: Fruits", description: "Healthy snacks!", thumbnail: "/games/memory-match.png", icon: "🍉", color: "from-green-400 to-emerald-500", category: "memory", ageRange: ["5-6", "7-8"], difficulty: "medium", isPremium: true, xpReward: 90 },
    component: (props) => <MemoryMatchGame {...props} deck={["🍎", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🍍"]} />
  },
  "memory-match-8": {
    metadata: { id: "memory-match-8", title: "Memory: Space Explorer", description: "Stars and planets!", thumbnail: "/games/memory-match.png", icon: "🪐", color: "from-indigo-500 to-purple-700", category: "memory", ageRange: ["7-8"], difficulty: "hard", isPremium: true, xpReward: 130 },
    component: (props) => <MemoryMatchGame {...props} deck={["🌎", "🌕", "⭐", "☄️", "🚀", "🛸", "🛰️", "👨‍🚀", "👽", "🪐"]} />
  },
  "memory-match-9": {
    metadata: { id: "memory-match-9", title: "Memory: Halloween", description: "Spooky fun!", thumbnail: "/games/memory-match.png", icon: "🎃", color: "from-orange-500 to-red-600", category: "memory", ageRange: ["5-6", "7-8"], difficulty: "medium", isPremium: true, xpReward: 100 },
    component: (props) => <MemoryMatchGame {...props} deck={["🎃", "👻", "🦇", "🕷️", "🕸️", "🧛", "🧟", "🧙"]} />
  },
  "memory-match-10": {
    metadata: { id: "memory-match-10", title: "Memory: Sports", description: "Time to play!", thumbnail: "/games/memory-match.png", icon: "⚽", color: "from-emerald-500 to-green-600", category: "memory", ageRange: ["7-8"], difficulty: "medium", isPremium: true, xpReward: 110 },
    component: (props) => <MemoryMatchGame {...props} deck={["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱"]} />
  },
};
