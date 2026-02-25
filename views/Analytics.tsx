
import React from 'react';
import { SessionResult, LibraryImage, StyleCategory, StudioSettings } from '../types';

interface AnalyticsProps {
  sessions: SessionResult[];
  library: LibraryImage[];
  categories: StyleCategory[];
  settings: StudioSettings;
}

export const AnalyticsView: React.FC<AnalyticsProps> = ({ sessions, library, categories, settings }) => {
  const totalSessions = sessions.length;
  const avgDecisionTime = totalSessions > 0 
    ? sessions.reduce((acc, s) => acc + s.summary.averageResponseTime, 0) / totalSessions
    : 0;
  
  const avgDecisiveness = totalSessions > 0
    ? sessions.reduce((acc, s) => acc + s.summary.decisiveness, 0) / totalSessions
    : 0;

  return (
    <div className="px-8 pb-32 animate-in fade-in">
      <h2 className="serif text-2xl mb-12">Studio Intelligence</h2>

      <div className="grid grid-cols-2 gap-px bg-stone-100 border border-stone-100 rounded-3xl overflow-hidden mb-12">
        <div className="bg-white p-6 flex flex-col items-center">
           <span className="text-[9px] uppercase tracking-widest text-stone-400 mb-2">Total Sessions</span>
           <span className="serif text-3xl">{totalSessions}</span>
        </div>
        <div className="bg-white p-6 flex flex-col items-center">
           <span className="text-[9px] uppercase tracking-widest text-stone-400 mb-2">Decisiveness</span>
           <span className="serif text-3xl">{(avgDecisiveness * 100).toFixed(0)}%</span>
        </div>
        <div className="bg-white p-6 flex flex-col items-center col-span-2">
           <span className="text-[9px] uppercase tracking-widest text-stone-400 mb-2">Avg. Decision Time</span>
           <span className="serif text-xl">{(avgDecisionTime / 1000).toFixed(1)}s</span>
        </div>
      </div>

      <div className="space-y-12">
        <section className="space-y-4">
           <h3 className="text-[10px] uppercase tracking-widest font-bold">Library Insights</h3>
           <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                 <span className="text-stone-400 uppercase tracking-wider">Total Images</span>
                 <span className="font-semibold">{library.length}</span>
              </div>
              <div className="w-full h-1 bg-stone-50 rounded-full overflow-hidden">
                 <div className="h-full bg-stone-900" style={{ width: `${Math.min(100, (library.length / settings.minRequiredImages) * 100)}%` }} />
              </div>
           </div>
        </section>

        <section className="space-y-6">
           <h3 className="text-[10px] uppercase tracking-widest font-bold">Style Distribution</h3>
           <div className="space-y-4">
              {categories.slice(0, 5).map(cat => {
                const count = library.filter(img => img.styleCategories.includes(cat.id)).length;
                const percentage = library.length > 0 ? (count / library.length) * 100 : 0;
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider">
                       <span>{cat.name}</span>
                       <span className="text-stone-400">{count} images</span>
                    </div>
                    <div className="w-full h-px bg-stone-50">
                       <div className="h-full bg-stone-900" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
           </div>
        </section>

        <section className="bg-stone-50 p-8 rounded-3xl text-center">
           <p className="text-stone-400 text-xs leading-relaxed italic serif mb-4">
             "Data suggests that your current library leans heavily towards Scandinavian and Japandi aesthetics, mirroring global design trends."
           </p>
           <span className="text-[9px] uppercase tracking-widest text-stone-300 font-bold">Automated Observation</span>
        </section>
      </div>
    </div>
  );
};
