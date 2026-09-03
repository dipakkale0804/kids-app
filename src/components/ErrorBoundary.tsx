"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-lg w-full text-center relative z-10"
          >
            <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-rose-500/30">
              <AlertTriangle className="w-12 h-12 text-rose-400" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Oops! Something Broke.</h1>
            <p className="text-slate-300 font-medium text-lg mb-8">
              Looks like our gears got jammed. Don't worry, you can easily go back to the menu or try again!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-white hover:bg-slate-200 text-slate-900 font-black rounded-2xl h-14 px-6 shadow-xl transition-transform active:scale-95"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Link href="/">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl h-14 px-6 shadow-xl shadow-purple-500/20 transition-transform active:scale-95 w-full sm:w-auto"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Hub
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
