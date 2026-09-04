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
    // If we're already checking 2 cards, or this card is already flipped/matched, ignore
    if (flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;

    playPop();

    // Flip the clicked card immediately
    setCards(prev => prev.map((card, i) => i === index ? { ...card, isFlipped: true } : card));
    
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].content === cards[second].content) {
        // Match! Process immediately without delay
        playCorrect();
        
        setCards(prev => prev.map((card, i) => 
          (i === first || i === second) ? { ...card, isMatched: true } : card
        ));
        setFlippedIndices([]);
        
        setMatches(m => {
          const newMatches = m + 1;
          if (newMatches === deck.length) {
            playLevelUp();
            const baseScore = 500;
            // penalty based on extra moves beyond the minimum
            const penalty = Math.max(0, ((moves + 1) - deck.length) * 10);
            const finalScore = Math.max(100, baseScore - penalty);
            const accuracy = Math.min(1, deck.length / (moves + 1));
            
            setTimeout(() => {
              onComplete(finalScore, accuracy);
            }, 1000);
          }
          return newMatches;
        });
      } else {
        // No match: wait a brief moment so they can see the card, then flip back
        setTimeout(() => {
          playIncorrect();
          setCards(prev => prev.map((card, i) => 
            (i === first || i === second) ? { ...card, isFlipped: false } : card
          ));
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  if (gameState !== "playing") return null;

  return (
    <div className="flex flex-col h-full items-center pb-8">
      <div className="flex justify-between w-full px-4 mb-8 mt-2">
        <div className="bg-primary/10 px-4 py-2 rounded-full text-base md:text-lg font-bold text-primary font-mono border-2 border-primary/20">
          Moves: {moves}
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-full text-base md:text-lg font-extrabold text-yellow-600 dark:text-yellow-400 border-2 border-yellow-400/30">
          Matches: {matches} / {deck.length}
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-2xl px-4 perspective-1000">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={false}
            animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
            className="relative w-full aspect-[3/4] cursor-pointer"
            onClick={() => handleCardClick(index)}
          >
            {/* Front of card (hidden when not flipped) */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 border-2 border-white/20 rounded-2xl shadow-md hover:shadow-lg transition-opacity duration-300 flex items-center justify-center overflow-hidden
                ${(card.isFlipped || card.isMatched) ? "opacity-0 pointer-events-none" : "opacity-100"}
              `}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <span className="text-xl font-black text-white/90">?</span>
              </div>
            </div>
            
            {/* Back of card (visible when flipped) */}
            <div 
              className={`absolute inset-0 bg-white dark:bg-zinc-800 border-2 rounded-2xl shadow-md flex items-center justify-center transition-opacity duration-300
                ${card.isMatched ? "border-emerald-500 shadow-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20" : "border-primary"}
                ${(!card.isFlipped && !card.isMatched) ? "opacity-0 pointer-events-none" : "opacity-100"}
              `}
              style={{ transform: "rotateY(180deg)" }}
            >
              <span className={`text-4xl md:text-5xl drop-shadow-md select-none transition-transform duration-300 ${card.isMatched ? 'scale-110' : ''}`}>
                {card.content}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
