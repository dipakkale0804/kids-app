"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Clock, Target, BrainCircuit, ShieldCheck, Activity,
  Lock, Settings, TrendingUp, Calendar, AlertTriangle, Star, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { formatDistanceToNow } from "date-fns";

export default function ParentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { displayName, isPremium, activityLogs, level, xp } = useUserStore();
  const [activeTab, setActiveTab] = useState("overview");

  // Dynamic Data Aggregation
  const { weeklyData, accuracyData, totalTime, avgAccuracy, strengths, focuses, recentLogs } = useMemo(() => {
    const logs = activityLogs || [];
    
    // Recent logs for real-time feed
    const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
    const recent = sortedLogs.slice(0, 10);
    
    // Calculate total time
    const totalMin = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
    const totalHours = Math.floor(totalMin / 60);
    const remainingMins = Math.round(totalMin % 60);
    const totalTimeStr = totalHours > 0 ? `${totalHours}h ${remainingMins}m` : `${remainingMins}m`;

    // Calculate average accuracy
    const avgAcc = logs.length > 0 
      ? Math.round(logs.reduce((sum, log) => sum + log.score, 0) / logs.length)
      : 0;

    // Aggregate by Topic
    const topicStats: Record<string, { totalScore: number, count: number }> = {};
    logs.forEach(log => {
      if (!topicStats[log.topic]) topicStats[log.topic] = { totalScore: 0, count: 0 };
      topicStats[log.topic].totalScore += log.score;
      topicStats[log.topic].count += 1;
    });

    const accuracyArr = Object.keys(topicStats).map(topic => ({
      topic,
      score: Math.round(topicStats[topic].totalScore / topicStats[topic].count)
    }));

    // Strengths and Focuses
    const sortedTopics = [...accuracyArr].sort((a, b) => b.score - a.score);
    const strengthStr = sortedTopics.length > 0 ? sortedTopics[0].topic : "various subjects";
    const focusStr = sortedTopics.length > 1 ? sortedTopics[sortedTopics.length - 1].topic : (sortedTopics.length === 1 ? "exploring new games" : "getting started");

    // Aggregate by Day of Week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekMap: Record<string, number> = {
      'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };
    
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const dayName = dayNames[date.getDay()];
      weekMap[dayName] += log.durationMinutes;
    });

    const weekChartData = [
      { name: 'Mon', minutes: Math.round(weekMap['Mon']) },
      { name: 'Tue', minutes: Math.round(weekMap['Tue']) },
      { name: 'Wed', minutes: Math.round(weekMap['Wed']) },
      { name: 'Thu', minutes: Math.round(weekMap['Thu']) },
      { name: 'Fri', minutes: Math.round(weekMap['Fri']) },
      { name: 'Sat', minutes: Math.round(weekMap['Sat']) },
      { name: 'Sun', minutes: Math.round(weekMap['Sun']) },
    ];

    return {
      weeklyData: weekChartData,
      accuracyData: accuracyArr.length > 0 ? accuracyArr : [{ topic: 'No Data Yet', score: 0 }],
      totalTime: totalTimeStr,
      avgAccuracy: avgAcc,
      strengths: strengthStr,
      focuses: focusStr,
      recentLogs: recent
    };
  }, [activityLogs]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth");
      } else {
        // Purge old deleted games from cache
        useUserStore.getState().clearOldGames();
        // Fetch absolute latest real-time data from DB to sync across devices
        await useUserStore.getState().fetchFromDb();
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-zinc-950">
      
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 p-6 flex flex-col gap-2 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 font-black text-2xl mb-8 mt-2">
          <ShieldCheck className="w-8 h-8" />
          Parent Zone
        </div>

        <nav className="flex flex-row lg:flex-col gap-2 flex-1 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all shrink-0 ${activeTab === 'overview' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
          >
            <Activity className="w-5 h-5" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all shrink-0 ${activeTab === 'reports' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
          >
            <TrendingUp className="w-5 h-5" /> Detailed Reports
          </button>
          <button 
            onClick={() => setActiveTab("controls")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all shrink-0 ${activeTab === 'controls' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
          >
            <Lock className="w-5 h-5" /> Screen Time Limits
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all shrink-0 ${activeTab === 'settings' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
          >
            <Settings className="w-5 h-5" /> Account Settings
          </button>
        </nav>

        {!isPremium && (
          <div className="mt-auto bg-gradient-to-br from-amber-200 to-orange-400 p-5 rounded-3xl shadow-lg relative overflow-hidden hidden lg:block">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/30 rounded-full blur-2xl" />
            <h4 className="font-black text-orange-950 mb-1 text-lg drop-shadow-sm">Upgrade to PRO</h4>
            <p className="text-sm text-orange-950/80 font-bold mb-4 leading-tight">Unlock advanced analytics and ad-free games.</p>
            <Button 
              onClick={async () => {
                // 1. Fetch Order ID from backend
                const res = await fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: auth.currentUser?.uid, email: auth.currentUser?.email })
                });
                const order = await res.json();
                
                if (order.id) {
                  // 2. Load Razorpay script
                  const script = document.createElement("script");
                  script.src = "https://checkout.razorpay.com/v1/checkout.js";
                  script.onload = () => {
                    const options = {
                      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key from env
                      amount: order.amount,
                      currency: order.currency,
                      name: "KidsLearn Arcade",
                      description: "Upgrade to PRO (Lifetime Access)",
                      order_id: order.id,
                      handler: async function (response: any) {
                        try {
                          const verifyRes = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              razorpay_order_id: response.razorpay_order_id,
                              razorpay_payment_id: response.razorpay_payment_id,
                              razorpay_signature: response.razorpay_signature,
                              userId: auth.currentUser?.uid
                            })
                          });
                          const result = await verifyRes.json();
                          if (result.success) {
                            alert("Payment successful! Welcome to PRO!");
                            useUserStore.getState().setPremium(true); // Update local state
                          } else {
                            alert("Payment verification failed.");
                          }
                        } catch (e) {
                          alert("Error verifying payment.");
                        }
                      },
                      prefill: {
                        name: displayName,
                        email: auth.currentUser?.email || "",
                      },
                      theme: {
                        color: "#9333ea"
                      }
                    };
                    const rzp = new (window as any).Razorpay(options);
                    rzp.open();
                  };
                  document.body.appendChild(script);
                } else {
                  alert("Failed to create order. Make sure Razorpay keys are in .env.local!");
                }
              }}
              className="w-full bg-orange-900 hover:bg-orange-950 text-white font-black rounded-2xl shadow-xl transition-transform active:scale-95"
            >
              Upgrade Now
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto w-full">
        <div className="max-w-[1400px] mx-auto">
          
          <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {displayName}'s Progress
              </h1>
              <p className="text-slate-500 font-bold flex items-center gap-2 text-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Real-time Analytics
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
              {/* Level Stat */}
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border-2 border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                  <Star className="w-6 h-6 text-amber-500 fill-current" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Level</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{level}</p>
                </div>
              </div>

              {/* XP Stat */}
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border-2 border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-2xl">
                  <Zap className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total XP</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{xp}</p>
                </div>
              </div>

              {/* Time Stat */}
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border-2 border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Learning Time</p>
                  <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-200">{totalTime}</p>
                </div>
              </div>

              {/* Accuracy Stat */}
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border-2 border-slate-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                  <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg Accuracy</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{avgAccuracy}%</p>
                </div>
              </div>
            </div>
          </header>

          {activeTab === "overview" && (
            <div className="flex flex-col gap-8">
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Learning Time Chart */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col h-[400px]"
                >
                  <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl"><Activity className="w-5 h-5 text-indigo-600" /></div>
                    Activity (Min)
                  </h3>
                  <div className="flex-1 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} dx={-10} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', fontWeight: 'bold' }} />
                        <Bar dataKey="minutes" fill="#6366f1" radius={[12, 12, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Accuracy Radar/Bar */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col h-[400px]"
                >
                  <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    <div className="p-2 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-xl"><BrainCircuit className="w-5 h-5 text-fuchsia-600" /></div>
                    Topic Accuracy
                  </h3>
                  <div className="flex-1 flex flex-col justify-center gap-6 overflow-y-auto hide-scrollbar">
                    {accuracyData.map(item => (
                      <div key={item.topic}>
                        <div className="flex justify-between font-bold mb-2">
                          <span className="text-slate-700 dark:text-slate-300">{item.topic}</span>
                          <span className={item.score >= 80 ? "text-emerald-500" : item.score >= 50 ? "text-amber-500" : "text-rose-500"}>{item.score}%</span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden relative shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${item.score >= 80 ? "bg-emerald-500" : item.score >= 50 ? "bg-amber-500" : "bg-rose-500"}`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Insights */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-8"
              >
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2.5rem] border-2 border-emerald-200 dark:border-emerald-900/30 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 text-emerald-500/10"><Star className="w-40 h-40 fill-current" /></div>
                  <h4 className="text-emerald-900 dark:text-emerald-400 font-black text-2xl mb-3 flex items-center gap-3 relative z-10">
                    Strengths
                  </h4>
                  <p className="text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed text-lg relative z-10">
                    {displayName} is excelling in <strong className="font-black text-emerald-950 dark:text-emerald-100">{strengths}</strong>! Their accuracy has been consistently high in this subject. Keep it up!
                  </p>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[2.5rem] border-2 border-amber-200 dark:border-amber-900/30 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 text-amber-500/10"><AlertTriangle className="w-40 h-40 fill-current" /></div>
                  <h4 className="text-amber-900 dark:text-amber-400 font-black text-2xl mb-3 flex items-center gap-3 relative z-10">
                    Focus Areas
                  </h4>
                  <p className="text-amber-800 dark:text-amber-300 font-medium leading-relaxed text-lg relative z-10">
                    We recommend spending a bit more time on <strong className="font-black text-amber-950 dark:text-amber-100">{focuses}</strong>. Try selecting this module more frequently to build confidence.
                  </p>
                </div>
              </motion.div>

            </div>
          )}

          {activeTab === "controls" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border-2 border-slate-100 dark:border-zinc-800 shadow-sm max-w-3xl mx-auto"
            >
              <h3 className="text-3xl font-black mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl"><Lock className="w-8 h-8 text-purple-600" /></div>
                Screen Time Limits
              </h3>
              <p className="text-slate-500 font-medium mb-10 text-lg">Manage how long your child can access the platform each day.</p>

              <div className="space-y-10">
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-6">
                    <label className="font-black text-2xl text-slate-800 dark:text-slate-200">Daily Time Limit</label>
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-2xl font-black text-xl shadow-sm border border-purple-200 dark:border-purple-800">
                      60 Minutes
                    </span>
                  </div>
                  <input type="range" min="15" max="120" step="15" defaultValue="60" className="w-full h-4 bg-slate-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-purple-600" />
                  <div className="flex justify-between text-sm font-bold text-slate-400 mt-4">
                    <span>15m</span>
                    <span>120m</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/50 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <label className="font-black text-2xl text-slate-800 dark:text-slate-200 block">Bedtime Lock</label>
                      <span className="text-slate-500 font-medium">Prevent access during bedtime hours.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-14 h-8 bg-slate-300 dark:bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                    </label>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 block">Start Time</label>
                      <input type="time" defaultValue="20:00" className="w-full bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-700 rounded-2xl px-6 py-4 font-black text-xl text-slate-800 dark:text-slate-200 shadow-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 block">End Time</label>
                      <input type="time" defaultValue="07:00" className="w-full bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-700 rounded-2xl px-6 py-4 font-black text-xl text-slate-800 dark:text-slate-200 shadow-sm" />
                    </div>
                  </div>
                </div>

                <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xl rounded-2xl h-16 shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-transform">
                  Save Changes
                </Button>
              </div>
            </motion.div>
          )}
          
          {(activeTab === "reports" || activeTab === "settings") && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center p-20 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border-4 border-slate-100 dark:border-zinc-800 border-dashed"
            >
              <div className="w-24 h-24 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Settings className="w-12 h-12 text-slate-400 animate-[spin_10s_linear_infinite]" />
              </div>
              <h3 className="text-4xl font-black text-slate-800 dark:text-slate-200 mb-4 tracking-tight">Coming Soon</h3>
              <p className="text-slate-500 font-medium text-lg max-w-lg">This section is currently under construction. Check back soon for advanced reports and settings!</p>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
