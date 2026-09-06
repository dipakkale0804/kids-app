"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Gamepad2, Palette, BookOpen, Map, Gift, ShieldCheck, Trophy, FlaskConical, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  {
    title: "Learn",
    description: "Numbers, Alphabet & More",
    icon: <BookOpen className="w-8 h-8 text-white" />,
    color: "bg-blue-500",
    href: "/learn",
  },
  {
    title: "Play",
    description: "Fun Educational Games",
    icon: <Gamepad2 className="w-8 h-8 text-white" />,
    color: "bg-orange-500",
    href: "/games",
  },
  {
    title: "Create",
    description: "Coloring & Drawing",
    icon: <Palette className="w-8 h-8 text-white" />,
    color: "bg-pink-500",
    href: "/drawing",
  },
  {
    title: "Adventure",
    description: "Unlock New Worlds",
    icon: <Map className="w-8 h-8 text-white" />,
    color: "bg-emerald-500",
    href: "/adventure",
  },
  {
    title: "Science Lab",
    description: "Explore & Experiment",
    icon: <FlaskConical className="w-8 h-8 text-white" />,
    color: "bg-teal-500",
    href: "/science",
  },
  {
    title: "Music",
    description: "Sing & Play",
    icon: <Music className="w-8 h-8 text-white" />,
    color: "bg-rose-500",
    href: "/music",
  },
  {
    title: "Rewards",
    description: "Avatars & Badges",
    icon: <Gift className="w-8 h-8 text-white" />,
    color: "bg-yellow-500",
    href: "/rewards",
  },
  {
    title: "Parent Zone",
    description: "Track Progress & Settings",
    icon: <ShieldCheck className="w-8 h-8 text-white" />,
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
      transition: { type: "spring" as const, stiffness: 300, damping: 24 }
    }
  };

  const floatingAnimation = {
    y: ["-10px", "10px", "-10px"],
    rotate: [-2, 2, -2],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const
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

      <main className="flex flex-col flex-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 items-center text-center z-10">
        
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mb-12 md:mb-16 relative flex flex-col items-center"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl border border-indigo-100 dark:border-indigo-900/50 shadow-md shadow-indigo-500/10 text-indigo-950 dark:text-indigo-100 font-bold mb-6 text-xs md:text-sm relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
            Voted #1 Learning Platform for Kids
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 drop-shadow-sm leading-[1.1]">
            Welcome to your <br />
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 blur-2xl opacity-20 animate-pulse" />
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-cyan-500 drop-shadow-sm">
                Learning World!
              </span>
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-base md:text-xl font-medium text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            Learn, play, and grow with fun games, beautiful puzzles, and interactive quizzes designed just for you!
          </motion.p>
          
          <motion.div variants={itemVariants} className="relative group inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500" />
            <Button 
              onClick={(e) => handleNavigation(e, "/adventure")}
              size="lg" 
              className="relative h-12 sm:h-14 rounded-full text-lg sm:text-xl px-6 sm:px-8 font-bold shadow-xl bg-white dark:bg-zinc-900 text-indigo-950 dark:text-white border border-indigo-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden flex items-center gap-2"
            >
              <span>Start Playing Now</span>
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-500" />
            </Button>
          </motion.div>
          
          {/* Trust Metrics */}
          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center gap-6 md:gap-12 opacity-90">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">10,000+</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Active Learners</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-fuchsia-600 dark:text-fuchsia-400">4.9/5</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Parent Rating</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">5M+</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Puzzles Solved</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Character Marquee Banner */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-3xl mx-auto mb-12 overflow-hidden relative rounded-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-white/60 dark:border-zinc-800/60 p-3 shadow-sm"
        >
          <div className="flex items-center justify-between px-4 sm:px-8 text-2xl sm:text-3xl opacity-80 filter drop-shadow-md">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }}>🦊</motion.div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}>🤖</motion.div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}>🦄</motion.div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}>🦖</motion.div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}>🐙</motion.div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} className="hidden sm:block">🦁</motion.div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.8 }} className="hidden md:block">🐼</motion.div>
          </div>
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
                  className={`group flex flex-col items-center justify-center p-4 md:p-6 rounded-3xl shadow-lg hover:shadow-xl ${shadowColor} transition-all duration-300 h-48 md:h-56 bg-gradient-to-br ${bgGradient} relative overflow-hidden border border-white/20`}
                >
                  
                  {/* Decorative glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                  
                  <motion.div 
                    className="bg-white/20 p-3 md:p-4 rounded-xl mb-3 md:mb-4 shadow-inner backdrop-blur-md relative z-10 border border-white/30"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={iconColor}>
                      {category.icon}
                    </div>
                  </motion.div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 relative z-10 drop-shadow-md">{category.title}</h3>
                  <p className="text-white/80 font-medium text-xs md:text-sm text-center relative z-10 leading-snug px-2">{category.description}</p>
                  
                </a>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trending Games Preview Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="w-full mt-10 mb-16 flex flex-col items-center"
        >
          <motion.h2 variants={itemVariants} className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 text-center">
            Most Popular Right Now 🔥
          </motion.h2>
          <motion.p variants={itemVariants} className="text-base text-slate-600 dark:text-slate-400 mb-8 text-center max-w-2xl">
            Join thousands of kids playing our top-rated educational games today!
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Game 1 */}
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-lg border border-slate-100 dark:border-zinc-800 cursor-pointer group" onClick={(e) => handleNavigation(e, "/games/number-match-3")}>
              <div className="w-full h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-colors" />
                <span className="text-5xl drop-shadow-md filter group-hover:scale-110 transition-transform">🔢</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-500 transition-colors">Math Runner</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Math & Logic • Ages 4-8
              </p>
            </motion.div>

            {/* Game 2 */}
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-lg border border-slate-100 dark:border-zinc-800 cursor-pointer group" onClick={(e) => handleNavigation(e, "/games")}>
              <div className="w-full h-32 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-colors" />
                <span className="text-5xl drop-shadow-md filter group-hover:scale-110 transition-transform">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-rose-500 transition-colors">Space Phonics</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Reading • Ages 3-7
              </p>
            </motion.div>

            {/* Game 3 */}
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-lg border border-slate-100 dark:border-zinc-800 cursor-pointer group" onClick={(e) => handleNavigation(e, "/drawing")}>
              <div className="w-full h-32 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-colors" />
                <span className="text-5xl drop-shadow-md filter group-hover:scale-110 transition-transform">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-500 transition-colors">Magic Coloring</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Creativity • All Ages
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Trust & Testimonials Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="w-full mt-10 mb-10 flex flex-col items-center"
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-10 text-center">
            Loved by parents, <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-orange-500">Adored by kids!</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
            {/* How Improvements are Done */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-lg border border-slate-100 dark:border-zinc-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl -z-10 group-hover:bg-cyan-500/20 transition-colors" />
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">How Kids Improve</h3>
              <ul className="space-y-4 text-slate-600 dark:text-slate-400 font-medium text-sm">
                <li className="flex items-start gap-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl shrink-0 mt-0.5">
                    <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-200 block text-lg mb-1">Adaptive Learning</strong>
                    <span className="text-sm md:text-base">Games automatically adjust difficulty based on your child&apos;s progress, ensuring they are always challenged but never frustrated.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl shrink-0 mt-0.5">
                    <Gift className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-200 block text-lg mb-1">Positive Reinforcement</strong>
                    <span className="text-sm md:text-base">Earning avatars, trophies, and rewards keeps children motivated to practice their skills daily.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl shrink-0 mt-0.5">
                    <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-200 block text-lg mb-1">Parent Dashboard</strong>
                    <span className="text-sm md:text-base">Parents receive detailed weekly insights into their child&apos;s strengths, accuracy, and areas for growth.</span>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Parent Feedback */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-lg border border-slate-100 dark:border-zinc-800 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-2xl -z-10 group-hover:bg-fuchsia-500/20 transition-colors" />
              <div className="relative">
                <span className="absolute -top-6 -left-4 text-6xl text-fuchsia-500/20 font-serif leading-none">&quot;</span>
                <p className="text-lg md:text-xl font-medium text-slate-700 dark:text-slate-300 italic mb-6 relative z-10 leading-relaxed">
                  My 5-year-old daughter used to struggle with her numbers, but after just two weeks on this platform, she is counting to 100 and solving basic math puzzles completely on her own!
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    SJ
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Sarah Jenkins</h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Parent of two • Premium Subscriber</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Final CTA Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full mt-8 mb-4 relative overflow-hidden rounded-[2rem] p-8 md:p-12 text-center shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-orange-500 opacity-90" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-sm">
              {isAuthenticated ? "Keep the fun going!" : "Ready to start your adventure?"}
            </h2>
            <p className="text-base md:text-lg font-medium text-white/90 mb-8 max-w-xl mx-auto">
              {isAuthenticated 
                ? "Jump back in and discover new games, puzzles, and rewards."
                : "Join 10,000+ kids who are already learning, playing, and exploring!"}
            </p>
            <Button 
              onClick={(e) => handleNavigation(e, isAuthenticated ? "/adventure" : "/auth")}
              size="lg" 
              className="h-12 rounded-full text-base px-8 font-bold shadow-md bg-white text-indigo-600 hover:bg-slate-50 hover:scale-105 transition-all"
            >
              {isAuthenticated ? "Continue Playing" : "Create Free Account"}
            </Button>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
