"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Chrome,
  Activity,
  Zap,
  LockKeyhole
} from "lucide-react";
import Link from "next/link";

const AnimatedGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(10, 30, 59, 0.15) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }}
    />
  </div>
);

const ShieldCharacter = () => (
  <div className="relative w-64 h-64 flex items-center justify-center">
    {/* Background Glow */}
    <div className="absolute w-48 h-48 bg-blue-400/20 rounded-full blur-[60px] animate-pulse" />

    {/* SVG Character */}
    <svg width="200" height="200" viewBox="0 0 200 200" className="relative z-10 drop-shadow-2xl animate-float">
      {/* Main Shield Body */}
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      {/* Outer Shield Plate */}
      <path
        d="M100 20 C60 20 40 40 40 85 C40 130 100 170 100 170 C100 170 160 130 160 85 C160 40 140 20 100 20Z"
        fill="url(#shieldGrad)"
        className="opacity-95"
      />

      {/* Inner Detail */}
      <path
        d="M100 40 C75 40 60 55 60 85 C60 115 100 145 100 145 C100 145 140 115 140 85 C140 55 125 40 100 40Z"
        fill="rgba(255, 255, 255, 0.2)"
      />

      {/* Animated Checkmark or Core */}
      <circle cx="100" cy="90" r="15" fill="white" className="animate-pulse shadow-glow" />
      <path
        d="M90 90 L97 97 L110 83"
        stroke="#1e3a8a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Orbiting Elements - Using simple circles within SVG for compatibility */}
      <circle cx="40" cy="40" r="4" fill="#3b82f6" className="animate-orbit-1" />
      <circle cx="160" cy="150" r="6" fill="#1e3a8a" className="animate-orbit-2" />
    </svg>

    <style jsx>{`
      @keyframes float {
        0% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(2deg); }
        100% { transform: translateY(0px) rotate(0deg); }
      }
      @keyframes orbit-1 {
        0% { transform: translate(0, 0); }
        50% { transform: translate(80px, 60px); }
        100% { transform: translate(0, 0); }
      }
      @keyframes orbit-2 {
        0% { transform: translate(0, 0); }
        50% { transform: translate(-80px, -40px); }
        100% { transform: translate(0, 0); }
      }
      .animate-float { animation: float 6s ease-in-out infinite; }
      .animate-orbit-1 { animation: orbit-1 8s ease-in-out infinite; }
      .animate-orbit-2 { animation: orbit-2 10s ease-in-out infinite; }
    `}</style>
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Logging in with", { email, password, rememberMe });
      await new Promise(resolve => setTimeout(resolve, 1500));
      sessionStorage.removeItem("max_greeted_session");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600/10 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse" />

      <AnimatedGrid />

      {/* Main Container - Light Theme with deep blue accents */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] border border-slate-300 shadow-[0_48px_80px_-16px_rgba(0,0,0,0.12)] relative z-10 transition-all duration-700 animate-slide-up overflow-hidden">

        {/* Left Panel: Deep Blue Professional Panel */}
        <div className="hidden lg:flex flex-col justify-between p-8 bg-[#0a1e3b] relative overflow-hidden border-r border-white/10">
          {/* Subtle decoration */}
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-20 h-20 flex items-center justify-center">
                <img src="/max.png" alt="Max Logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-extrabold text-white tracking-tighter">Group Benefitz</h1>
                <p className="text-[12px] text-blue-300 font-bold uppercase tracking-[0.3em] mt-1">Enterprise Secured</p>
              </div>
            </div>

            <div className="space-y-4 text-center">
              <h2 className="text-4xl font-serif text-white leading-tight">
                Your Future, <br />
                <span className="text-blue-400 font-sans italic">Perfectly Secured.</span>
              </h2>
              <p className="text-blue-100/60 text-base leading-relaxed max-w-sm mx-auto font-medium">
                Comprehensive professional protection tailored for your peace of mind.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex justify-center py-4">
            <ShieldCharacter />
          </div>

          <div className="relative z-10 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1.5">Compliance Ready</span>
                <div className="flex gap-4">
                  <div className="text-xs text-white/50 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> ISO 27001
                  </div>
                  <div className="text-xs text-white/50 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> GDPR
                  </div>
                </div>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0a1e3b] flex items-center justify-center text-[10px] text-white font-bold opacity-80">
                    {i}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#0a1e3b] flex items-center justify-center text-[10px] text-white font-bold shadow-lg">
                  10k+
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Clean White Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h3 className="text-3xl font-serif font-bold text-[#0a1e3b] mb-2">Welcome Back</h3>
            <p className="text-slate-500 font-medium">Securely sign in to your insurance portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl animate-shake font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2 animate-slide-right [animation-delay:200ms]">
              <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300/60 text-slate-900 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all placeholder:text-slate-400 font-medium shadow-sm hover:translate-x-1 duration-300"
                  placeholder="name@company.com"
                />
              </div>
            </div>
 
            <div className="space-y-2 animate-slide-right [animation-delay:300ms]">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <Link href="/forgot" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot?</Link>
              </div>
              <div className="relative group">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300/60 text-slate-900 rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium shadow-sm hover:translate-x-1 duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center ml-1 animate-slide-right [animation-delay:400ms]">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded-lg border-slate-300 bg-slate-50 text-blue-600 focus:ring-blue-600/20 cursor-pointer transition-all"
              />
              <label htmlFor="remember" className="ml-3 text-sm text-slate-600 cursor-pointer select-none font-bold">
                Keep me signed in
              </label>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#0a1e3b] hover:bg-[#112a52] disabled:bg-[#0a1e3b]/70 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group transform active:scale-[0.98] animate-slide-right [animation-delay:500ms]"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in to Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>



            <p className="text-center text-sm text-slate-500 mt-8 font-medium">
              New to Max?{" "}
              <Link href="/signup" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-right { animation: slide-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
