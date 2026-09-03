import { GameWrapper } from "@/components/games/GameWrapper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const resolvedParams = await params;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 bg-transparent absolute top-0 left-0 z-10 w-full">
        <Link href="/games">
          <Button variant="ghost" className="rounded-full font-bold bg-white/50 backdrop-blur-sm shadow-sm hover:bg-white/80 dark:bg-black/50">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Games
          </Button>
        </Link>
      </header>
      
      <main className="flex-1 w-full p-4 pt-24 bg-[url('/bg-pattern.svg')] bg-repeat flex flex-col items-center">
        <GameWrapper gameId={resolvedParams.game} />
      </main>
    </div>
  );
}
