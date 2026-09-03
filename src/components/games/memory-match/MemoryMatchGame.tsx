"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameState } from "@/types/game";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";

interface MemoryMatchProps {
  onComplete: (score: number, accuracy: number) => void;
  gameState: GameState;
  deck?: string[];
}

type Card = {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const DEFAULT_EMOJIS = ["🦊", "🐼", "🐸", "🦁", "🐰", "🦄"];

export function MemoryMatchGame({ onComplete, gameState, deck = DEFAULT_EMOJIS }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const { playPop, playCorrect, playIncorrect, playLevelUp } = useGameSounds();

  const initializeGame = () => {
    const gameDeck = [...deck, ...deck]
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: index,
        content,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(gameDeck);
    setFlippedIndices([]);
    setMatches(0);
    setMoves(0);
  };

  useEffect(() => {
    if (gameState === "playing") {
      initializeGame();
    }
  }, [gameState]);

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 || 
      cards[index].isFlipped || 
      cards[index].isMatched
    ) return;

    playPop();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].content === cards[second].content) {
        // Match!
        setTimeout(() => {
          playCorrect();
          setCards(prev => {
            const matched = [...prev];
            matched[first].isMatched = true;
            matched[second].isMatched = true;
            return matched;
          });
          setFlippedIndices([]);
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches === deck.length) {
              playLevelUp();
              const baseScore = 500;
              const penalty = Math.max(0, (moves - deck.length) * 10);
              const finalScore = Math.max(100, baseScore - penalty);
              
              const accuracy = Math.min(1, deck.length / (moves + 1));
              
              setTimeout(() => {
                onComplete(finalScore, accuracy);
              }, 1000);
            }
            return newMatches;
          });
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          playIncorrect();
          setCards(prev => {
            const unflipped = [...prev];
            unflipped[first].isFlipped = false;
            unflipped[second].isFlipped = false;
            return unflipped;
          });
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  if (gameState !== "playing") return null;

  return (
    <div className="flex flex-col h-full items-center pb-8">
      <div className="flex justify-between w-full px-4 mb-12 mt-4">
        <div className="bg-primary/10 px-4 py-2 rounded-full text-xl font-bold text-primary font-mono border-2 border-primary/20">
          Moves: {moves}
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-full text-xl font-extrabold text-yellow-600 dark:text-yellow-400 border-2 border-yellow-400/30">
          Matches: {matches} / {deck.length}
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-2xl px-4 perspective-1000">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={false}
            animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
            className="relative w-full aspect-[3/4] cursor-pointer preserve-3d"
            onClick={() => handleCardClick(index)}
          >
            {/* Front of card (hidden when not flipped) */}
            <div 
              className={`absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-400 to-purple-600 border-4 border-white/20 rounded-[2rem] shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center overflow-hidden
                ${(card.isFlipped || card.isMatched) ? "opacity-0" : "opacity-100"}
              `}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                <span className="text-3xl font-black text-white/90">?</span>
              </div>
            </div>
            
            {/* Back of card (visible when flipped) */}
            <div 
              className={`absolute inset-0 backface-hidden bg-white dark:bg-zinc-800 border-4 rounded-[2rem] shadow-xl flex items-center justify-center rotate-y-180
                ${card.isMatched ? "border-emerald-500 shadow-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20" : "border-primary"}
                ${(!card.isFlipped && !card.isMatched) ? "opacity-0" : "opacity-100"}
              `}
              style={{ transform: "rotateY(180deg)" }}
            >
              <span className={`text-6xl md:text-7xl drop-shadow-md select-none transition-transform duration-300 ${card.isMatched ? 'scale-110' : ''}`}>
                {card.content}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
