"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, ShieldCheck, X, Loader2 } from "lucide-react";
import { Button } from "./button";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";

interface PremiumLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function PremiumLockModal({ isOpen, onClose, title = "Premium Game" }: PremiumLockModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const { isPremium, setPremium } = useUserStore();
  const router = useRouter();

  if (isPremium) return null;

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      // 1. Load Razorpay Script
      const res = await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      const { auth } = await import("@/lib/firebase/client");
      const user = auth.currentUser;
      if (!user) {
        alert("Please login first");
        router.push("/auth");
        return;
      }
      const token = await user.getIdToken();

      // 2. Create Order
      const orderRes = await fetch("/api/razorpay/order", { 
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ plan: selectedPlan })
      });
      
      let data;
      const responseText = await orderRes.text();
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server Error (${orderRes.status}): ${responseText || "Backend crashed."}`);
      }
      
      if (!orderRes.ok) throw new Error(data.error || "Failed to create order");

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: data.order.amount,
        currency: data.order.currency,
        name: "KidsLearn Premium",
        description: `Unlock all Premium Games (${selectedPlan} plan)`,
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            // Verify signature on backend
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok && verifyData.success) {
              setPremium(true);
              onClose();
              router.refresh();
              alert("Payment successful! Premium features unlocked.");
            } else {
              throw new Error(verifyData.error || "Verification failed");
            }
          } catch (err: any) {
            alert("Payment verification failed: " + err.message);
          }
        },
        prefill: {
          name: "Parent User",
          email: "parent@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#8b5cf6",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + response.error.description);
      });
      
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert("Payment Error: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-xl max-h-[95vh] overflow-y-auto rounded-[2rem] shadow-2xl relative border-4 border-purple-500/30"
          >
            <div className="sticky top-4 right-4 z-10 flex justify-end px-4 pt-4 -mb-10">
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-black/5 hover:bg-black/10">
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="bg-gradient-to-b from-purple-500/20 to-transparent p-6 md:p-8 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 shadow-inner border-4 border-purple-200 dark:border-purple-800">
                <Lock className="w-10 h-10 text-purple-500" />
              </div>
              
              <h2 className="text-3xl font-extrabold text-foreground mb-2">
                Unlock Premium
              </h2>
              <p className="text-muted-foreground font-mono mb-6 text-sm md:text-base">
                Ask a parent to unlock all premium games, puzzles, and quizzes!
              </p>

              <div className="bg-white dark:bg-zinc-800 w-full rounded-2xl p-4 text-left mb-6 shadow-sm border border-purple-100 dark:border-purple-900">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Star className="w-5 h-5 fill-current" /> Everything You Get:
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs md:text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500 shrink-0" /> 50+ Premium Games</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500 shrink-0" /> Weekly Content</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500 shrink-0" /> Ad-Free Experience</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500 shrink-0" /> Track Progress</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mb-6">
                <div 
                  onClick={() => setSelectedPlan("monthly")}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                    selectedPlan === "monthly" 
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md" 
                    : "border-border/50 hover:border-purple-300"
                  }`}
                >
                  <h4 className="font-bold text-lg mb-1">Monthly</h4>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400">₹199<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                </div>
                
                <div 
                  onClick={() => setSelectedPlan("yearly")}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative overflow-hidden ${
                    selectedPlan === "yearly" 
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md" 
                    : "border-border/50 hover:border-purple-300"
                  }`}
                >
                  <div className="absolute top-0 inset-x-0 bg-purple-500 text-white text-[10px] font-bold py-0.5 text-center uppercase tracking-wider">
                    Best Value (Save 58%)
                  </div>
                  <h4 className="font-bold text-lg mb-1 mt-3">Yearly</h4>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400">₹999<span className="text-sm font-normal text-muted-foreground">/yr</span></div>
                </div>
              </div>

              <Button 
                size="lg" 
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full rounded-2xl h-16 text-xl font-extrabold shadow-xl shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 text-white transition-all hover:scale-[1.02]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `Subscribe - ₹${selectedPlan === "monthly" ? "199" : "999"}`}
              </Button>
              <p className="text-xs text-muted-foreground mt-4 font-mono">
                Secure payment powered by Razorpay
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
