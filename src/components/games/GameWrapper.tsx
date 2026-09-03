"use client";

import { gamesRegistry } from "@/lib/games-registry";
import { GameEngine } from "@/components/games/GameEngine";
import { notFound, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useState, useEffect } from "react";
import { PremiumLockModal } from "@/components/ui/PremiumLockModal";

export function GameWrapper({ gameId }: { gameId: string }) {
  const gameEntry = gamesRegistry[gameId];
  const { isPremium } = useUserStore();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (gameEntry?.metadata.isPremium && !isPremium) {
      setShowPremiumModal(true);
    }
  }, [gameEntry, isPremium]);

  if (!gameEntry) {
    notFound();
  }

  // If it's restricted, we render the background but overlay the modal.
  const isRestricted = gameEntry.metadata.isPremium && !isPremium;

  const GameComponent = gameEntry.component;

  return (
    <>
      <div className={`w-full ${isRestricted ? "pointer-events-none blur-sm opacity-50" : ""}`}>
        <GameEngine metadata={gameEntry.metadata}>
          {(engineProps) => <GameComponent {...engineProps} />}
        </GameEngine>
      </div>
      
      <PremiumLockModal 
        isOpen={showPremiumModal} 
        onClose={() => {
          setShowPremiumModal(false);
          router.push("/games"); // Go back if they close without paying
        }} 
        title={gameEntry.metadata.title} 
      />
    </>
  );
}
