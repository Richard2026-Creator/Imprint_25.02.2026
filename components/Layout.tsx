import React from 'react';
import { Settings, BarChart2 } from 'lucide-react';
import { View } from '../types';
import { IMPRINT_BRAND_LOGO } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
  logo: string | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, logo }) => {
  const displayLogo = logo || IMPRINT_BRAND_LOGO;

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f1ea] text-[#3d3935]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f4f1ea]/80 backdrop-blur-md px-12 pt-14 pb-6 flex justify-between items-center">
        <div
          className="cursor-pointer transition-all duration-500 hover:opacity-70 active:scale-95"
          onClick={() => setView('HOME')}
        >
          <img
            src={displayLogo}
            alt="Branding"
            className="h-10 w-auto object-contain max-w-[200px]"
          />
        </div>

        <div className="flex items-center">
          <button
            onClick={() => (window as any).openAdminPin?.()}
            className="transition-all duration-300 hover:opacity-70 active:scale-95 text-[#a39e93]"
          >
            <Settings size={22} strokeWidth={1} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-40">
        {children}
      </main>

      {/* Persistent Navigation for Studio */}
      {(currentView === 'SETTINGS' || currentView === 'ANALYTICS') && (
        <footer className="fixed bottom-0 left-0 right-0 bg-[#f4f1ea]/90 backdrop-blur-md border-t border-[#dfd9ce] px-12 py-8 flex justify-around items-center z-50 safe-area-bottom">
          <button
            onClick={() => setView('SETTINGS')}
            className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${currentView === 'SETTINGS' ? 'text-[#3d3935]' : 'text-[#c9c4b9]'}`}
          >
            <Settings size={22} strokeWidth={1.2} />
            <span className="text-[8px] uppercase tracking-[0.3em] font-bold">Studio</span>
          </button>
          <button
            onClick={() => setView('ANALYTICS')}
            className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${currentView === 'ANALYTICS' ? 'text-[#3d3935]' : 'text-[#c9c4b9]'}`}
          >
            <BarChart2 size={22} strokeWidth={1.2} />
            <span className="text-[8px] uppercase tracking-[0.3em] font-bold">Analytics</span>
          </button>
        </footer>
      )}
    </div>
  );
};