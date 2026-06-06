"use client";
 
import { useEffect, useState } from "react";

const LOADER_TIPS = [
  "Tip: Giants have high health and make great shields!",
  "Tip: Upgrade your Archer Towers for more damage and range!",
  "Tip: Goblins run fast and carry loot sacks!",
  "Tip: Cannons deal huge splashy physical damage!",
  "Tip: Wizard Towers fire magic lightning arcs at invaders!"
];

export default function GameLoadingScreen({ message }: { message: string }) {
  const [tip, setTip] = useState("");

  useEffect(() => {
    // Select a random Clash-themed tip
    const randomTip = LOADER_TIPS[Math.floor(Math.random() * LOADER_TIPS.length)];
    setTip(randomTip);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950 flex flex-col items-center justify-center p-4 bg-jungle select-none">
      <div className="panel-wood p-8 max-w-sm w-full text-center relative border-4 border-amber-950 shadow-2xl animate-bounce-slow">
        {/* Animated Elixir Drop Spindle */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="w-full h-full border-4 border-amber-800/40 border-t-pink-500 rounded-full animate-spin" />
          <div className="absolute inset-4 bg-amber-950 rounded-full flex items-center justify-center border-2 border-amber-800 shadow-inner">
            <span className="text-3xl animate-pulse">🧪</span>
          </div>
        </div>

        <h2 className="text-2xl font-cartoon text-yellow-400 mb-2 uppercase italic">BREWING ARMY...</h2>
        <p className="text-yellow-100/70 font-cartoon-flat text-[10px] tracking-widest uppercase mb-6">{message}</p>

        {/* Elixir Progress Bar */}
        <div className="w-full h-5 bg-amber-950 border-3 border-amber-800 rounded-full overflow-hidden p-0.5 relative shadow-inner mb-6">
          <div className="h-full bg-gradient-to-r from-pink-500 via-pink-400 to-fuchsia-500 rounded-full animate-[loading-fill_3s_ease-in-out_infinite]" />
        </div>

        <p className="text-[11px] font-cartoon-flat text-amber-200 leading-relaxed max-w-xs mx-auto">
          {tip}
        </p>
      </div>

      <style jsx>{`
        @keyframes loading-fill {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
}
