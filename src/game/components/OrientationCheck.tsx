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

  return (
    <>
      {isPortrait && (
        <div className="fixed inset-0 z-[9999] bg-emerald-950 flex flex-col items-center justify-center p-6 text-center bg-jungle select-none">
          <div className="panel-wood p-8 max-w-sm w-full border-4 border-amber-950 shadow-2xl relative">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-amber-950 rounded-2xl border-2 border-amber-800 shadow-inner">
              <svg className="w-12 h-12 text-yellow-400 animate-[rotate-phone_3s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-cartoon text-yellow-400 mb-4 uppercase italic">ROTATE DEVICE</h2>
            <p className="text-amber-100 font-cartoon-flat text-xs leading-relaxed max-w-xs mx-auto">
              HEED THE CALL, CHIEF! Rotate your device to <span className="text-yellow-400 font-bold">LANDSCAPE MODE</span> to deploy defenses and command your army!
            </p>

            <div className="mt-8 flex justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse delay-100" />
              <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse delay-200" />
            </div>
          </div>

          <style jsx global>{`
            @keyframes rotate-phone {
              0%, 100% { transform: rotate(0deg); }
              30%, 70% { transform: rotate(-90deg); }
            }
          `}</style>
        </div>
      )}
      {children}
    </>
  );
}
