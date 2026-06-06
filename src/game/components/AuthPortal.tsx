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
    <div className="flex flex-col items-center justify-center h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-emerald-950 text-white p-4 relative bg-jungle">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-md landscape:max-w-3xl lg:max-w-md lg:landscape:max-w-md flex flex-col landscape:flex-row lg:flex-col lg:landscape:flex-col items-center justify-center gap-4 landscape:gap-8 lg:gap-4 animate-in fade-in zoom-in duration-500">
        <div className="text-center landscape:text-left lg:text-center lg:landscape:text-center mb-2 landscape:mb-0 lg:mb-10">
          <h1 className="text-4xl md:text-6xl font-cartoon text-yellow-400 tracking-tight leading-none mb-1 md:mb-2 animate-bounce-slow">
            NEXUS
          </h1>
          <div className="h-1 md:h-1.5 w-16 md:w-20 bg-yellow-500 mx-auto landscape:mx-0 lg:mx-auto lg:landscape:mx-auto rounded-full shadow-[0_0_15px_#eab308]" />
          <p className="mt-3 md:mt-6 text-yellow-100/70 font-cartoon text-[10px] md:text-xs tracking-wider">VILLAGE ENTRY GATE</p>
        </div>

        <div className="panel-wood p-5 landscape:p-4 lg:p-8 lg:landscape:p-8 md:p-8 shadow-2xl border-4 border-amber-950 w-full landscape:flex-1 lg:flex-none lg:landscape:flex-none max-h-[90dvh] lg:max-h-none lg:landscape:max-h-none overflow-y-auto lg:overflow-y-visible lg:landscape:overflow-y-visible scrollbar-thin">
          {/* Easy Google Login */}
          <button
            onClick={loginWithGoogle}
            className="w-full btn-cartoon btn-gold py-3 landscape:py-2.5 lg:py-4 lg:landscape:py-4 md:py-4 rounded-xl md:rounded-2xl text-xs landscape:text-[10px] lg:text-sm md:text-sm transition-all flex items-center justify-center gap-3 shadow-xl mb-4 landscape:mb-2.5 lg:mb-6 lg:landscape:mb-6 md:mb-6 font-cartoon text-amber-950"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 fill-amber-950" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.68-2.33 1.09-3.71 1.09-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.87 14.15c-.22-.68-.35-1.4-.35-2.15s.13-1.47.35-2.15V7.01H2.18C1.39 8.52 1 10.21 1 12s.39 3.48 1.18 4.99l3.69-2.84z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.01l3.69 2.84c.86-2.59 3.28-4.51 6.13-4.51z"/>
            </svg>
            QUICK ACCESS WITH GOOGLE
          </button>

          <div className="flex items-center gap-4 mb-4 landscape:mb-2.5 lg:mb-6 lg:landscape:mb-6 md:mb-6">
            <div className="h-[2px] flex-1 bg-amber-900" />
            <span className="text-[9px] md:text-[10px] font-cartoon-flat text-amber-300 tracking-wider">OR ENTER CAMP DETAILS</span>
            <div className="h-[2px] flex-1 bg-amber-900" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 landscape:space-y-2 lg:space-y-3.5 lg:landscape:space-y-3.5">
            {isSignup && (
              <div>
                <label className="block text-[10px] landscape:text-[9px] lg:text-[11px] lg:landscape:text-[11px] md:text-[11px] font-cartoon-flat text-amber-300 tracking-wider mb-1 landscape:mb-0.5 lg:mb-1.5 lg:landscape:mb-1.5 md:mb-1.5 ml-2">CHIEF NAME</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-amber-950/80 border-2 border-amber-800 rounded-xl p-3 landscape:p-2 lg:p-4 lg:landscape:p-4 md:p-4 text-xs landscape:text-[11px] lg:text-sm lg:landscape:text-sm md:text-sm focus:border-yellow-400 focus:outline-none transition-all text-amber-100 placeholder:text-amber-700 font-bold"
                  placeholder="e.g. Chief Barbarian"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] landscape:text-[9px] lg:text-[11px] lg:landscape:text-[11px] md:text-[11px] font-cartoon-flat text-amber-300 tracking-wider mb-1 landscape:mb-0.5 lg:mb-1.5 lg:landscape:mb-1.5 md:mb-1.5 ml-2">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-amber-950/80 border-2 border-amber-800 rounded-xl p-3 landscape:p-2 lg:p-4 lg:landscape:p-4 md:p-4 text-xs landscape:text-[11px] lg:text-sm lg:landscape:text-sm md:text-sm focus:border-yellow-400 focus:outline-none transition-all text-amber-100 placeholder:text-amber-700 font-bold"
                placeholder="chief@clash.com"
              />
            </div>
            <div>
              <label className="block text-[10px] landscape:text-[9px] lg:text-[11px] lg:landscape:text-[11px] md:text-[11px] font-cartoon-flat text-amber-300 tracking-wider mb-1 landscape:mb-0.5 lg:mb-1.5 lg:landscape:mb-1.5 md:mb-1.5 ml-2">SECURITY KEY</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-amber-950/80 border-2 border-amber-800 rounded-xl p-3 landscape:p-2 lg:p-4 lg:landscape:p-4 md:p-4 text-xs landscape:text-[11px] lg:text-sm lg:landscape:text-sm md:text-sm focus:border-yellow-400 focus:outline-none transition-all text-amber-100 placeholder:text-amber-700 font-bold"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <div className="p-2.5 bg-red-950/80 border-2 border-red-800 rounded-xl text-red-300 text-[10px] font-cartoon-sm uppercase tracking-wider leading-relaxed">
                ⚠️ Error: {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={localLoading}
              className="w-full btn-cartoon btn-green py-3.5 landscape:py-2.5 lg:py-4.5 lg:landscape:py-4.5 md:py-4.5 rounded-xl text-sm landscape:text-xs lg:text-base lg:landscape:text-base md:text-base transition-all font-cartoon uppercase tracking-wider"
            >
              {localLoading ? "CONSTRUCTING PROFILE..." : isSignup ? "CREATE CHIEF PROFILE" : "ENTER VILLAGE"}
            </button>
          </form>

          <div className="mt-4 landscape:mt-2.5 lg:mt-6 lg:landscape:mt-6 md:mt-6 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-[10px] md:text-[11px] font-cartoon-flat text-amber-300 hover:text-yellow-400 transition-colors uppercase tracking-wider cursor-pointer"
            >
              {isSignup ? "Have a village? Sign in" : "New Chief? Set up camp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
