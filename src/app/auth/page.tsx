"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/");
        router.refresh();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update Firebase Auth profile
        await updateProfile(userCredential.user, {
          displayName: parentName
        });

        // Create profile in Firestore
        await setDoc(doc(db, "profiles", userCredential.user.uid), {
          id: userCredential.user.uid,
          parent_name: parentName,
          child_name: childName,
          child_age: parseInt(childAge) || 5,
          xp: 0,
          level: 1,
          stars: 0,
          coins: 0,
          is_premium: false,
          referred_by: localStorage.getItem("referral_code") || null
        });

        setMessage({
          type: "success",
          text: "Account created successfully! You can now log in.",
        });
        
        // Switch to login automatically
        setIsLogin(true);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8">
        <Button variant="ghost" className="rounded-full font-bold">
          &larr; Back Home
        </Button>
      </Link>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 border-4 border-primary/20 shadow-2xl relative overflow-hidden mt-12 mb-12">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Star className="w-10 h-10 fill-yellow-400 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground text-center">
            {isLogin ? "Parent Login" : "Create Account"}
          </h1>
          <p className="text-muted-foreground font-mono text-sm text-center mt-2">
            Secure access to manage subscriptions and settings.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${message.type === "error" ? "bg-destructive/10 text-destructive border-2 border-destructive/20" : "bg-success/10 text-success border-2 border-success/20"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-5 relative z-10">
          
          {!isLogin && (
            <>
              <div>
                <label className="text-sm font-bold text-muted-foreground ml-2 mb-1 block">Parent's Name</label>
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="E.g. Sarah"
                    className="pl-4 h-14 rounded-2xl border-2 font-mono text-lg"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-bold text-muted-foreground ml-2 mb-1 block">Child's Name</label>
                  <Input 
                    type="text" 
                    placeholder="Hero"
                    className="pl-4 h-14 rounded-2xl border-2 font-mono text-lg"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="w-24">
                  <label className="text-sm font-bold text-muted-foreground ml-2 mb-1 block">Age</label>
                  <Input 
                    type="number" 
                    placeholder="5"
                    min="3"
                    max="12"
                    className="pl-4 h-14 rounded-2xl border-2 font-mono text-lg"
                    value={childAge}
                    onChange={e => setChildAge(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-bold text-muted-foreground ml-2 mb-1 block">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                type="email" 
                placeholder="parent@email.com"
                className="pl-12 h-14 rounded-2xl border-2 font-mono text-lg"
                value={email}
                onChange={e => setEmail(e.target.value.trim())}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-muted-foreground ml-2 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="••••••••"
                className="pl-12 h-14 rounded-2xl border-2 font-mono text-lg"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="h-14 rounded-2xl text-lg font-extrabold shadow-lg shadow-primary/30 mt-4" disabled={loading}>
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
          </Button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <p className="text-muted-foreground font-mono text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <Button 
            variant="ghost" 
            className="mt-2 font-bold text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
            }}
          >
            {isLogin ? "Create an account" : "Sign in to existing account"}
          </Button>
        </div>
      </div>
    </div>
  );
}
