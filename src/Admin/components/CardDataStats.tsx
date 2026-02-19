import React, { ReactNode } from "react";

interface CardDataStatsProps {
  title: string;
  total: string;
  levelUp?: boolean;
  levelDown?: boolean;
  children: ReactNode;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  levelUp,
  levelDown,
  children,
}) => {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white bg-white/70 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1">
      {/* Decorative gradient background */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-slate-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-center justify-between">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-500 group-hover:scale-110 ${levelUp ? 'bg-green-50 text-green-600 shadow-green-100' : levelDown ? 'bg-rose-50 text-rose-600 shadow-rose-100' : 'bg-amber-50 text-amber-600 shadow-amber-100'}`}>
          {children}
        </div>

        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors duration-300 ${levelUp ? 'bg-green-100 text-green-700' : levelDown ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
          {levelUp ? '+' : levelDown ? '-' : ''}12%
          {levelUp && (
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
            </svg>
          )}
          {levelDown && (
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      <div className="relative mt-8 space-y-1">
        <h4 className="text-4xl font-black tracking-tight text-slate-900">
          {total}
        </h4>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
          {title}
        </p>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 group-hover:w-full ${levelUp ? 'bg-green-500' : levelDown ? 'bg-rose-500' : 'bg-amber-500'} w-12`} />
    </div>
  );
};

export default CardDataStats;
