"use client";

import { useEffect, useState } from "react";

export default function OrientationCheck({ children }: { children: React.ReactNode }) {
  const [isPortrait, setIsOrientationPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // If width < height and width < 768 (mobile/tablet), show warning
      setIsOrientationPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  if (isPortrait) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 mb-8 text-blue-500 animate-bounce">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase italic">Rotate Device</h2>
        <p className="text-slate-400 font-light leading-relaxed max-w-xs">
          NEXUS Tactical Interface requires <span className="text-blue-400 font-bold uppercase">Landscape Mode</span> for optimal combat efficiency.
        </p>
        <div className="mt-8 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-75" />
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-150" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
