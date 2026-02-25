import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { View, LibraryImage, StudioSettings } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeProps {
  library: LibraryImage[];
  settings: StudioSettings;
  setView: (view: View) => void;
}

export const Home: React.FC<HomeProps> = ({ library, settings, setView }) => {
  const [showPinModal, setShowPinModal] = useState(false);
  (window as any).openAdminPin = () => setShowPinModal(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const activePool = library.filter(img => img.isActive !== false);
  const poolSize = activePool.length;
  const minRequired = settings.minRequiredImages;

  const isEnabled = poolSize >= minRequired;
  const progress = Math.min(100, (poolSize / minRequired) * 100);
  const remaining = Math.max(0, minRequired - poolSize);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === settings.adminPin) {
      setView('SETTINGS');
      setShowPinModal(false);
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-12 pb-24 text-center animate-in fade-in duration-1000 ease-out relative">


      <div className="max-w-md w-full">
        <p className="text-[#7d776d] text-xl font-light leading-relaxed mb-16 tracking-tight italic serif">
          Explore your vision through instinctive visual selection.
        </p>

        {/* Personalization Section */}
        <div className="w-full mb-20 space-y-4">
          <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#c9c4b9]">
            Created for
          </label>
          <div className="relative">
            <input
              type="text"
              value={settings.clientName}
              readOnly
              placeholder="Client name..."
              className="w-full bg-transparent border-b border-[#dfd9ce] py-4 text-center serif text-3xl outline-none transition-all duration-500 placeholder:opacity-20 placeholder:italic cursor-default"
            />
          </div>
        </div>

        <div className="w-full space-y-16">
          <button
            disabled={!isEnabled}
            onClick={() => setView('DISCOVERY')}
            className={`w-full py-6 px-10 rounded-full text-[11px] font-bold tracking-[0.3em] uppercase transition-all duration-700 ${isEnabled
              ? 'bg-[#3d3935] text-[#f4f1ea] active:scale-[0.98] shadow-2xl hover:bg-[#2a2724]'
              : 'bg-[#ede8df] text-[#c9c4b9] cursor-not-allowed'
              }`}
          >
            Begin Discovery
          </button>

          {/* Readiness Progress Bar */}
          <div className="space-y-4 opacity-80">
            <div className="flex justify-between items-end text-[9px] uppercase tracking-[0.4em] font-bold text-[#c9c4b9]">
              <span>Pool Readiness</span>
              <span className={isEnabled ? 'text-[#3d3935]' : ''}>
                {poolSize} / {minRequired}
              </span>
            </div>
            <div className="h-[1px] w-full bg-[#ede8df] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3d3935] transition-all duration-[1500ms] ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {isEnabled ? (
              <p className="text-[10px] text-[#3d3935] font-bold uppercase tracking-[0.2em] opacity-30">
                Ready for exploration
              </p>
            ) : (
              <p className="text-[10px] text-[#7d776d] italic font-light">
                Add {remaining} more images in Studio to unlock discovery.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#f4f1ea]/95 backdrop-blur-md px-6"
          >
            <button
              onClick={() => {
                setShowPinModal(false);
                setPin('');
                setError(false);
              }}
              className="absolute top-14 right-12 p-2 text-[#a39e93] hover:text-[#3d3935]"
            >
              <X size={24} strokeWidth={1.2} />
            </button>

            <div className="max-w-xs w-full text-center space-y-12">
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#c9c4b9]">Admin Access</h3>
                <p className="serif text-2xl italic text-[#3d3935]">Enter Security PIN</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-8">
                <div className="flex justify-center gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-12 h-16 border-b-2 flex items-center justify-center transition-all duration-300 ${error ? 'border-red-400 animate-shake' : pin.length > i ? 'border-[#3d3935]' : 'border-[#dfd9ce]'
                        }`}
                    >
                      {pin.length > i && (
                        <div className="w-2 h-2 bg-[#3d3935] rounded-full" />
                      )}
                    </div>
                  ))}
                </div>

                <input
                  type="tel"
                  autoFocus
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 4) {
                      setPin(val);
                      if (val.length === 4 && val === settings.adminPin) {
                        setTimeout(() => {
                          setView('SETTINGS');
                          setShowPinModal(false);
                          setPin('');
                        }, 300);
                      } else if (val.length === 4) {
                        setError(true);
                        setTimeout(() => {
                          setPin('');
                          setError(false);
                        }, 500);
                      }
                    }
                  }}
                  className="absolute opacity-0 pointer-events-none"
                />

                <p className={`text-[9px] uppercase tracking-widest font-bold transition-opacity duration-300 ${error ? 'text-red-400 opacity-100' : 'opacity-0'}`}>
                  Invalid PIN
                </p>
              </form>

              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'delete'].map((num, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (num === 'delete') {
                        setPin(prev => prev.slice(0, -1));
                      } else if (typeof num === 'number') {
                        if (pin.length < 4) {
                          const newPin = pin + num;
                          setPin(newPin);
                          if (newPin.length === 4) {
                            if (newPin === settings.adminPin) {
                              setTimeout(() => {
                                setView('SETTINGS');
                                setShowPinModal(false);
                                setPin('');
                              }, 300);
                            } else {
                              setError(true);
                              setTimeout(() => {
                                setPin('');
                                setError(false);
                              }, 500);
                            }
                          }
                        }
                      }
                    }}
                    className={`h-16 flex items-center justify-center text-xl serif italic active:bg-[#ede8df] rounded-full transition-colors ${num === '' ? 'pointer-events-none' : ''}`}
                  >
                    {num === 'delete' ? <X size={18} strokeWidth={1.2} /> : num}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};