"use client";

import { useState } from "react";
import { useAuth } from "@/game/hooks/useAuth";

export default function AuthPortal() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const { loginWithGoogle, signupWithEmail, loginWithEmail, authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    if (isSignup) {
      await signupWithEmail(email, password, name);
    } else {
      await loginWithEmail(email, password);
    }
    setLocalLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-800 tracking-tighter italic leading-none mb-2">
            NEXUS
          </h1>
          <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full shadow-[0_0_15px_#3b82f6]" />
          <p className="mt-6 text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Sector Authorization Portal</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-xl border-2 border-slate-700 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          {/* Easy Google Login */}
          <button
            onClick={loginWithGoogle}
            className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm transition-all hover:bg-blue-50 active:scale-95 flex items-center justify-center gap-3 shadow-xl mb-8 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.68-2.33 1.09-3.71 1.09-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.87 14.15c-.22-.68-.35-1.4-.35-2.15s.13-1.47.35-2.15V7.01H2.18C1.39 8.52 1 10.21 1 12s.39 3.48 1.18 4.99l3.69-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.01l3.69 2.84c.86-2.59 3.28-4.51 6.13-4.51z" fill="#EA4335"/>
            </svg>
            QUICK ACCESS WITH GOOGLE
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-slate-700" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">OR USE TERMINAL</span>
            <div className="h-[1px] flex-1 bg-slate-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Commander Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="e.g. Maverick"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm focus:border-blue-500 focus:outline-none transition-all"
                placeholder="commander@nexus.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Security Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm focus:border-blue-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Error: {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={localLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-blue-900/40 disabled:opacity-50"
            >
              {localLoading ? "PROCESSING..." : isSignup ? "CREATE COMMAND PROFILE" : "AUTHORIZE ACCESS"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-[0.2em] transition-colors"
            >
              {isSignup ? "Already have a profile? Login" : "New Commander? Sign Up Here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
