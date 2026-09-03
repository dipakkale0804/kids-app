import { quizzesRegistry } from "@/lib/quiz-registry";
import Link from "next/link";
import { Star, Lock, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuizzesIndex() {
  const quizzes = Object.values(quizzesRegistry).map(q => q.metadata);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="pt-8 pb-4 px-8 max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="z-10 self-start sm:self-auto">
          <div className="bg-white dark:bg-zinc-800 hover:bg-gray-50 border-2 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-full font-black px-5 py-2 transition-all cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
            &larr; Back
          </div>
        </Link>
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-br from-purple-500 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-3 drop-shadow-sm z-10">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-2xl border-2 border-purple-200 dark:border-purple-800/50 shadow-inner">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />
          </div>
          Quiz Zone
        </h1>
        <div className="w-[100px] hidden sm:block z-10" /> {/* Spacer */}
      </header>
      
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {quizzes.map(quiz => (
            <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-4 border-transparent hover:border-primary/50 relative overflow-hidden h-full flex flex-col cursor-pointer group">
                {quiz.isPremium && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md z-10">
                    <Lock className="w-3 h-3" /> Premium
                  </div>
                )}
                
                <div className={`rounded-2xl h-44 mb-6 flex items-center justify-center text-7xl group-hover:scale-105 transition-transform duration-300 shadow-inner bg-gradient-to-br ${quiz.color || "from-purple-200 to-purple-400"} border-4 border-white/20 relative overflow-hidden`}>
                  {/* Decorative blur */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/30 rounded-full blur-xl" />
                  <span className="drop-shadow-xl z-10 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                    {quiz.icon || "🤔"}
                  </span>
                </div>
                
                <h3 className="text-2xl font-extrabold text-foreground mb-2">{quiz.title}</h3>
                <p className="text-muted-foreground font-mono flex-1 mb-4">{quiz.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    {quiz.category}
                  </span>
                  <span className="font-bold flex items-center gap-1 text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                    Max {quiz.xpReward} <Star className="w-4 h-4 fill-yellow-500" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
