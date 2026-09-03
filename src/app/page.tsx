"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Gamepad2, Palette, BookOpen, Map, Gift, ShieldCheck, Trophy, FlaskConical, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  {
    title: "Learn",
    description: "Numbers, Alphabet & More",
    icon: <BookOpen className="w-12 h-12 text-white" />,
    color: "bg-blue-500",
    href: "/learn",
  },
  {
    title: "Play",
    description: "Fun Educational Games",
    icon: <Gamepad2 className="w-12 h-12 text-white" />,
    color: "bg-orange-500",
    href: "/games",
  },
  {
    title: "Create",
    description: "Coloring & Drawing",
    icon: <Palette className="w-12 h-12 text-white" />,
    color: "bg-pink-500",
    href: "/drawing",
  },
  {
    title: "Adventure",
    description: "Unlock New Worlds",
    icon: <Map className="w-12 h-12 text-white" />,
    color: "bg-emerald-500",
    href: "/adventure",
  },
  {
    title: "Science Lab",
    description: "Explore & Experiment",
    icon: <FlaskConical className="w-12 h-12 text-white" />,
    color: "bg-teal-500",
    href: "/science",
  },
  {
    title: "Music",
    description: "Sing & Play",
    icon: <Music className="w-12 h-12 text-white" />,
    color: "bg-rose-500",
    href: "/music",
  },
  {
    title: "Rewards",
    description: "Avatars & Badges",
    icon: <Gift className="w-12 h-12 text-white" />,
    color: "bg-yellow-500",
    href: "/rewards",
  },
  {
    title: "Parent Zone",
    description: "Track Progress & Settings",
    icon: <ShieldCheck className="w-12 h-12 text-white" />,
    color: "bg-purple-500",
    href: "/parent",
  },
];

import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (isAuthenticated === false) {
      router.push("/auth");
    } else {
      router.push(href);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const floatingAnimation = {
    y: ["-10px", "10px", "-10px"],
    rotate: [-2, 2, -2],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-slate-50 dark:bg-zinc-950 min-h-screen overflow-x-hidden relative selection:bg-indigo-500/30">
      
      {/* Advanced Animated Background Grid & Glows */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/30 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-fuchsia-500/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full" 
        />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block z-0">
        <motion.div animate={floatingAnimation} className="absolute top-[15%] left-[10%] text-6xl drop-shadow-2xl opacity-80">🚀</motion.div>
        <motion.div animate={{...floatingAnimation, transition: { duration: 7, repeat: Infinity }}} className="absolute top-[30%] right-[12%] text-6xl drop-shadow-2xl opacity-80">🎨</motion.div>
        <motion.div animate={{...floatingAnimation, transition: { duration: 5, repeat: Infinity }}} className="absolute bottom-[25%] left-[15%] text-6xl drop-shadow-2xl opacity-80">🧩</motion.div>
        <motion.div animate={{...floatingAnimation, transition: { duration: 8, repeat: Infinity }}} className="absolute bottom-[20%] right-[15%] text-6xl drop-shadow-2xl opacity-80">⭐</motion.div>
      </div>

      <main className="flex flex-col flex-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20 items-center text-center z-10">
        
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mb-16 md:mb-24 relative flex flex-col items-center"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl border-2 border-indigo-100 dark:border-indigo-900/50 shadow-xl shadow-indigo-500/10 text-indigo-950 dark:text-indigo-100 font-black mb-8 text-sm md:text-base relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
            Voted #1 Learning Platform for Kids
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-6 drop-shadow-sm leading-[1.1]">
            Welcome to your <br />
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 blur-2xl opacity-30 animate-pulse" />
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-cyan-500 drop-shadow-sm">
                Learning World!
              </span>
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-2xl font-bold text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Learn, play, and grow with thousands of fun games, beautiful puzzles, and interactive quizzes designed just for you!
          </motion.p>
          
          <motion.div variants={itemVariants} className="relative group inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-500" />
            <Button 
              onClick={(e) => handleNavigation(e, "/adventure")}
              size="lg" 
              className="relative h-16 sm:h-20 rounded-full text-xl sm:text-2xl px-8 sm:px-12 font-black shadow-2xl bg-white dark:bg-zinc-900 text-indigo-950 dark:text-white border-2 border-indigo-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden flex items-center gap-3"
            >
              <span>Start Playing Now</span>
              <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-fuchsia-500" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Categories Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full mb-12 px-2"
        >
          {CATEGORIES.map((category, index) => {
            // Assign specific modern gradients to categories
            let bgGradient = "";
            let iconColor = "";
            let shadowColor = "";
            
            if (category.title === "Learn") {
              bgGradient = "from-cyan-400 to-blue-600";
              iconColor = "text-cyan-100";
              shadowColor = "shadow-blue-500/20";
            } else if (category.title === "Play") {
              bgGradient = "from-orange-400 to-rose-500";
              iconColor = "text-orange-100";
              shadowColor = "shadow-rose-500/20";
            } else if (category.title === "Create") {
              bgGradient = "from-pink-400 to-fuchsia-600";
              iconColor = "text-pink-100";
              shadowColor = "shadow-fuchsia-500/20";
            } else if (category.title === "Adventure") {
              bgGradient = "from-emerald-400 to-teal-600";
              iconColor = "text-emerald-100";
              shadowColor = "shadow-emerald-500/20";
            } else if (category.title === "Science Lab") {
              bgGradient = "from-teal-400 to-emerald-500";
              iconColor = "text-teal-100";
              shadowColor = "shadow-teal-500/20";
            } else if (category.title === "Music") {
              bgGradient = "from-rose-400 to-pink-500";
              iconColor = "text-rose-100";
              shadowColor = "shadow-rose-500/20";
            } else if (category.title === "Rewards") {
              bgGradient = "from-yellow-400 to-orange-500";
              iconColor = "text-yellow-100";
              shadowColor = "shadow-yellow-500/20";
            } else {
              bgGradient = "from-indigo-400 to-purple-600";
              iconColor = "text-indigo-100";
              shadowColor = "shadow-purple-500/20";
            }

            return (
              <motion.div
                key={category.title}
                variants={itemVariants}
                whileHover={{ y: -12, scale: 1.02 }}
                className="h-full"
              >
                <a 
                  href={category.href} 
                  onClick={(e) => handleNavigation(e, category.href)}
                  className={`group flex flex-col items-center justify-center p-6 md:p-8 rounded-[2rem] shadow-xl hover:shadow-2xl ${shadowColor} transition-all duration-300 h-64 md:h-72 bg-gradient-to-br ${bgGradient} relative overflow-hidden border border-white/20`}
                >
                  
                  {/* Decorative glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  
                  <motion.div 
                    className="bg-white/20 p-4 md:p-5 rounded-2xl mb-4 md:mb-6 shadow-inner backdrop-blur-md relative z-10 border border-white/30"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={iconColor}>
                      {category.icon}
                    </div>
                  </motion.div>
                  
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2 relative z-10 drop-shadow-md">{category.title}</h3>
                  <p className="text-white/80 font-bold text-sm md:text-base text-center relative z-10 leading-snug px-2">{category.description}</p>
                  
                </a>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
