"use client";

import { quizzesRegistry } from "@/lib/quiz-registry";
import { QuizEngine } from "@/components/quizzes/QuizEngine";
import { notFound, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useState, useEffect } from "react";
import { PremiumLockModal } from "@/components/ui/PremiumLockModal";

export function QuizWrapper({ quizId }: { quizId: string }) {
  const quiz = quizzesRegistry[quizId];
  const { isPremium } = useUserStore();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (quiz?.metadata.isPremium && !isPremium) {
      setShowPremiumModal(true);
    }
  }, [quiz, isPremium]);

  if (!quiz) {
    notFound();
  }

  const isRestricted = quiz.metadata.isPremium && !isPremium;

  return (
    <>
      <div className={`w-full ${isRestricted ? "pointer-events-none blur-sm opacity-50" : ""}`}>
        <QuizEngine quiz={quiz} />
      </div>
      
      <PremiumLockModal 
        isOpen={showPremiumModal} 
        onClose={() => {
          setShowPremiumModal(false);
          router.push("/quizzes"); // Go back if they close without paying
        }} 
        title={quiz.metadata.title} 
      />
    </>
  );
}
