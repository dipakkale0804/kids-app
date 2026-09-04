import { gamesRegistry } from "@/lib/games-registry";
import Link from "next/link";
import { Star, Lock, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function GamesIndex({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const categoryFilter = resolvedSearchParams.category;
  
  let games = Object.values(gamesRegistry).map(g => g.metadata);
  
  if (categoryFilter) {
    games = games.filter(g => g.category === categoryFilter);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="pt-8 pb-4 px-8 max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="z-10 self-start sm:self-auto">
          <div className="bg-white dark:bg-zinc-800 hover:bg-gray-50 border-2 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-full font-black px-5 py-2 transition-all cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
            &larr; Back
          </div>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent flex items-center gap-3 drop-shadow-sm z-10">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl border border-blue-200 dark:border-blue-800/50 shadow-inner">
            <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
          </div>
          Play Zone
        </h1>
        <div className="w-[100px] hidden sm:block z-10" /> {/* Spacer */}
      </header>
      
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {games.map(game => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 md:p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-transparent hover:border-primary/50 relative overflow-hidden h-full flex flex-col cursor-pointer group">
                {game.isPremium && (
                  <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm z-10">
                    <Lock className="w-3 h-3" /> Premium
                  </div>
                )}
                
                <div className={`rounded-xl h-28 mb-4 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300 shadow-inner bg-gradient-to-br ${game.color || "from-primary/20 to-primary/40"} border-2 border-white/20 relative overflow-hidden`}>
                  {/* Decorative blur */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/30 rounded-full blur-xl" />
                  <span className="drop-shadow-xl z-10 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                    {game.icon || "🎮"}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-1">{game.title}</h3>
                <p className="text-muted-foreground font-mono flex-1 mb-4">{game.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary/70 bg-primary/10 px-3 py-1 rounded-full">
                    {game.category}
                  </span>
                  <span className="font-bold flex items-center gap-1 text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                    +{game.xpReward} <Star className="w-4 h-4 fill-yellow-500" />
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
