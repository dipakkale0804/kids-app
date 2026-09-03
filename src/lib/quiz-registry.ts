import { Quiz } from "@/types/quiz";

export const quizzesRegistry: Record<string, Quiz> = {
  "animal-friends": {
    metadata: { id: "animal-friends", title: "Animal Friends", description: "How well do you know animals?", icon: "🦁", color: "from-yellow-400 to-orange-500", category: "science", ageRange: ["5-6", "7-8"], difficulty: "easy", isPremium: false, xpReward: 100 },
    questions: [
      { id: "q1", question: "Which animal says 'Moo'?", options: [{ id: "o1", text: "Cow 🐄", isCorrect: true }, { id: "o2", text: "Dog 🐶", isCorrect: false }, { id: "o3", text: "Cat 🐱", isCorrect: false }, { id: "o4", text: "Duck 🦆", isCorrect: false }] },
      { id: "q2", question: "What does a rabbit love to eat?", options: [{ id: "o1", text: "Pizza 🍕", isCorrect: false }, { id: "o2", text: "Carrots 🥕", isCorrect: true }, { id: "o3", text: "Ice Cream 🍦", isCorrect: false }, { id: "o4", text: "Cheese 🧀", isCorrect: false }] },
      { id: "q3", question: "Which bird can swim but not fly?", options: [{ id: "o1", text: "Eagle 🦅", isCorrect: false }, { id: "o2", text: "Penguin 🐧", isCorrect: true }, { id: "o3", text: "Parrot 🦜", isCorrect: false }, { id: "o4", text: "Owl 🦉", isCorrect: false }] }
    ]
  },
  "space-explorer": {
    metadata: { id: "space-explorer", title: "Space Explorer", description: "Journey through the stars!", icon: "🚀", color: "from-indigo-500 to-purple-600", category: "science", ageRange: ["7-8"], difficulty: "medium", isPremium: false, xpReward: 150 },
    questions: [
      { id: "q1", question: "What do we live on?", options: [{ id: "o1", text: "Mars", isCorrect: false }, { id: "o2", text: "Earth", isCorrect: true }, { id: "o3", text: "Sun", isCorrect: false }, { id: "o4", text: "Moon", isCorrect: false }] },
      { id: "q2", question: "Which is the hottest?", options: [{ id: "o1", text: "The Moon", isCorrect: false }, { id: "o2", text: "The Sun", isCorrect: true }, { id: "o3", text: "Earth", isCorrect: false }, { id: "o4", text: "A Star", isCorrect: false }] },
    ]
  },
  "color-master": {
    metadata: { id: "color-master", title: "Color Master", description: "Mix and match colors!", icon: "🎨", color: "from-pink-400 to-rose-500", category: "general", ageRange: ["5-6"], difficulty: "easy", isPremium: true, xpReward: 80 },
    questions: [
      { id: "q1", question: "Red + Yellow = ?", options: [{ id: "o1", text: "Green", isCorrect: false }, { id: "o2", text: "Orange", isCorrect: true }, { id: "o3", text: "Purple", isCorrect: false }, { id: "o4", text: "Pink", isCorrect: false }] },
      { id: "q2", question: "Blue + Yellow = ?", options: [{ id: "o1", text: "Green", isCorrect: true }, { id: "o2", text: "Orange", isCorrect: false }, { id: "o3", text: "Red", isCorrect: false }, { id: "o4", text: "Black", isCorrect: false }] },
    ]
  },
  "math-genius-1": {
    metadata: { id: "math-genius-1", title: "Math Genius (Addition)", description: "Simple addition fun!", icon: "➕", color: "from-blue-400 to-cyan-500", category: "math", ageRange: ["5-6", "7-8"], difficulty: "medium", isPremium: true, xpReward: 100 },
    questions: [
      { id: "q1", question: "2 + 2 = ?", options: [{ id: "o1", text: "3", isCorrect: false }, { id: "o2", text: "4", isCorrect: true }, { id: "o3", text: "5", isCorrect: false }, { id: "o4", text: "6", isCorrect: false }] },
      { id: "q2", question: "5 + 3 = ?", options: [{ id: "o1", text: "7", isCorrect: false }, { id: "o2", text: "8", isCorrect: true }, { id: "o3", text: "9", isCorrect: false }, { id: "o4", text: "10", isCorrect: false }] },
    ]
  },
  "math-genius-2": {
    metadata: { id: "math-genius-2", title: "Math Genius (Subtraction)", description: "Simple subtraction!", icon: "➖", color: "from-teal-400 to-emerald-500", category: "math", ageRange: ["7-8"], difficulty: "medium", isPremium: true, xpReward: 120 },
    questions: [
      { id: "q1", question: "5 - 2 = ?", options: [{ id: "o1", text: "2", isCorrect: false }, { id: "o2", text: "3", isCorrect: true }, { id: "o3", text: "4", isCorrect: false }, { id: "o4", text: "1", isCorrect: false }] },
      { id: "q2", question: "10 - 4 = ?", options: [{ id: "o1", text: "6", isCorrect: true }, { id: "o2", text: "5", isCorrect: false }, { id: "o3", text: "7", isCorrect: false }, { id: "o4", text: "8", isCorrect: false }] },
    ]
  },
  "alphabet-fun": {
    metadata: { id: "alphabet-fun", title: "Alphabet Fun", description: "A B C D E F G!", icon: "🔤", color: "from-violet-400 to-purple-500", category: "english", ageRange: ["5-6"], difficulty: "easy", isPremium: true, xpReward: 70 },
    questions: [
      { id: "q1", question: "What comes after A?", options: [{ id: "o1", text: "C", isCorrect: false }, { id: "o2", text: "B", isCorrect: true }, { id: "o3", text: "D", isCorrect: false }, { id: "o4", text: "Z", isCorrect: false }] },
      { id: "q2", question: "What comes before Z?", options: [{ id: "o1", text: "Y", isCorrect: true }, { id: "o2", text: "X", isCorrect: false }, { id: "o3", text: "W", isCorrect: false }, { id: "o4", text: "A", isCorrect: false }] },
    ]
  },
  "spelling-bee": {
    metadata: { id: "spelling-bee", title: "Spelling Bee", description: "Spell the words!", icon: "🐝", color: "from-yellow-300 to-yellow-500", category: "english", ageRange: ["7-8"], difficulty: "hard", isPremium: true, xpReward: 150 },
    questions: [
      { id: "q1", question: "How do you spell 🐱?", options: [{ id: "o1", text: "KAT", isCorrect: false }, { id: "o2", text: "CAT", isCorrect: true }, { id: "o3", text: "CAAT", isCorrect: false }, { id: "o4", text: "KATT", isCorrect: false }] },
      { id: "q2", question: "How do you spell 🐶?", options: [{ id: "o1", text: "DOG", isCorrect: true }, { id: "o2", text: "DAWG", isCorrect: false }, { id: "o3", text: "DOGG", isCorrect: false }, { id: "o4", text: "DAG", isCorrect: false }] },
    ]
  },
  "healthy-habits": {
    metadata: { id: "healthy-habits", title: "Healthy Habits", description: "Learn to be healthy!", icon: "🍎", color: "from-red-400 to-rose-500", category: "general", ageRange: ["5-6", "7-8"], difficulty: "easy", isPremium: true, xpReward: 80 },
    questions: [
      { id: "q1", question: "What should you do before eating?", options: [{ id: "o1", text: "Play games", isCorrect: false }, { id: "o2", text: "Wash hands", isCorrect: true }, { id: "o3", text: "Sleep", isCorrect: false }, { id: "o4", text: "Cry", isCorrect: false }] },
      { id: "q2", question: "How many times should you brush your teeth?", options: [{ id: "o1", text: "Twice a day", isCorrect: true }, { id: "o2", text: "Never", isCorrect: false }, { id: "o3", text: "Once a week", isCorrect: false }, { id: "o4", text: "Only on Sunday", isCorrect: false }] },
    ]
  },
  "shape-sorter": {
    metadata: { id: "shape-sorter", title: "Shape Sorter", description: "Circle, Square, Triangle!", icon: "🔶", color: "from-orange-400 to-red-500", category: "math", ageRange: ["5-6"], difficulty: "easy", isPremium: true, xpReward: 60 },
    questions: [
      { id: "q1", question: "Which shape has 3 sides?", options: [{ id: "o1", text: "Square", isCorrect: false }, { id: "o2", text: "Triangle", isCorrect: true }, { id: "o3", text: "Circle", isCorrect: false }, { id: "o4", text: "Star", isCorrect: false }] },
      { id: "q2", question: "Which shape has no corners?", options: [{ id: "o1", text: "Circle", isCorrect: true }, { id: "o2", text: "Square", isCorrect: false }, { id: "o3", text: "Triangle", isCorrect: false }, { id: "o4", text: "Rectangle", isCorrect: false }] },
    ]
  },
  "dinosaur-world": {
    metadata: { id: "dinosaur-world", title: "Dinosaur World", description: "Roar like a T-Rex!", icon: "🦖", color: "from-lime-500 to-green-600", category: "science", ageRange: ["7-8"], difficulty: "medium", isPremium: true, xpReward: 140 },
    questions: [
      { id: "q1", question: "What did a T-Rex eat?", options: [{ id: "o1", text: "Plants", isCorrect: false }, { id: "o2", text: "Meat", isCorrect: true }, { id: "o3", text: "Pizza", isCorrect: false }, { id: "o4", text: "Ice Cream", isCorrect: false }] },
      { id: "q2", question: "Which dinosaur had three horns?", options: [{ id: "o1", text: "Triceratops", isCorrect: true }, { id: "o2", text: "T-Rex", isCorrect: false }, { id: "o3", text: "Stegosaurus", isCorrect: false }, { id: "o4", text: "Brachiosaurus", isCorrect: false }] },
    ]
  },
};
