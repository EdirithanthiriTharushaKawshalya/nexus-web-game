"use client";

export default function GameLoadingScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="relative">
        {/* Spinning Outer Ring */}
        <div className="w-32 h-32 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin" />
        
        {/* Inner Scanning Bar */}
        <div className="absolute inset-4 border-2 border-cyan-500/20 rounded-full overflow-hidden">
          <div className="w-full h-1 bg-cyan-400 absolute top-0 animate-[scan_2s_linear_infinite]" 
               style={{ boxShadow: '0 0 15px #22d3ee' }} />
        </div>
        
        {/* Center Logo/Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-500 rounded-sm rotate-45 animate-pulse shadow-[0_0_10px_#3b82f6]" />
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-black text-white tracking-[0.3em] uppercase italic mb-2">Initializing Sector</h2>
        <p className="text-blue-400 font-mono text-xs animate-pulse uppercase">{message}</p>
      </div>

      <div className="absolute bottom-12 w-64 h-1 bg-slate-900 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 animate-[progress_3s_ease-in-out_infinite]" />
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes progress {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0%); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
