import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Check, Play, Eye, EyeOff } from 'lucide-react';
import { LibraryImage, StudioSettings, RoomType, View } from '../types';
import { saveImage, deleteImage, saveSettings } from '../services/storage';
import { DEFAULT_ROOM_TYPES, MAX_SESSION_LENGTH, MIN_SESSION_LENGTH } from '../constants';

interface SettingsProps {
  settings: StudioSettings;
  library: LibraryImage[];
  onLibraryChange: () => void;
  onSettingsChange: () => void;
  setView: (view: View) => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ settings, library, onLibraryChange, onSettingsChange, setView }) => {
  const [activeTab, setActiveTab] = useState<'BRANDING' | 'LIBRARY' | 'CATEGORIES' | 'SESSION' | 'ADMIN'>('BRANDING');
  const [isUploading, setIsUploading] = useState(false);
  const [newPin, setNewPin] = useState(settings.adminPin);
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  const activePool = library.filter(img => img.isActive !== false);
  const isDiscoveryEnabled = activePool.length >= settings.minRequiredImages;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        saveSettings({ ...settings, logo: base64 });
        onSettingsChange();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsUploading(true);
    for (const file of files) {
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const newImg: LibraryImage = {
            id: crypto.randomUUID(),
            url: base64,
            roomType: DEFAULT_ROOM_TYPES[0],
            styleCategories: [settings.categories[0].id],
            createdAt: Date.now(),
            isActive: true,
          };
          await saveImage(newImg);
          resolve(true);
        };
        reader.readAsDataURL(file);
      });
    }
    setIsUploading(false);
    onLibraryChange();
  };

  const handleDelete = async (id: string) => {
    await deleteImage(id);
    onLibraryChange();
  };

  const updateImgMeta = async (id: string, updates: Partial<LibraryImage>) => {
    const img = library.find(i => i.id === id);
    if (img) {
      await saveImage({ ...img, ...updates });
      onLibraryChange();
    }
  };

  const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium transition-all ${
        activeTab === id ? 'text-stone-900 border-b border-stone-900' : 'text-stone-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="px-6 pb-20">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center">
           <h2 className="serif text-2xl">Studio Settings</h2>
           {isDiscoveryEnabled && (
             <button 
               onClick={() => setView('HOME')}
               className="bg-stone-900 text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-xl"
             >
               <Play size={10} fill="currentColor" /> Discovery Session
             </button>
           )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <TabButton id="BRANDING" label="Branding" />
          <TabButton id="LIBRARY" label="Library" />
          <TabButton id="CATEGORIES" label="Styles" />
          <TabButton id="SESSION" label="Session" />
          <TabButton id="ADMIN" label="Admin" />
        </div>
      </div>

      {activeTab === 'BRANDING' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
          {/* Logo Section */}
          <div className="bg-stone-50 p-8 rounded-2xl flex flex-col items-center text-center">
            {settings.logo ? (
              <div className="relative group">
                <img src={settings.logo} className="w-32 h-32 object-contain bg-white rounded-lg p-2 ios-shadow" />
                <button 
                  onClick={() => saveSettings({...settings, logo: null})}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md text-stone-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-300">
                <ImageIcon size={40} strokeWidth={1} stroke="#c9c4b9" />
              </div>
            )}
            <label className="mt-6 inline-block bg-stone-900 text-white px-6 py-3 rounded-full text-xs font-medium cursor-pointer active:scale-95 transition-all">
              {settings.logo ? 'Change Studio Logo' : 'Upload Studio Logo'}
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
            <p className="mt-4 text-[10px] text-stone-400 uppercase tracking-widest">SVG, PNG Recommended • Min 512px</p>
          </div>
        </div>
      )}

      {activeTab === 'LIBRARY' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
             <div className="flex flex-col">
                <div className="text-xs font-bold text-stone-900">
                   {activePool.length} Images in Pool
                </div>
                <div className="text-[9px] text-stone-300 uppercase tracking-widest mt-0.5">
                   {library.length} Total in Library
                </div>
             </div>
             <label className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-medium cursor-pointer active:scale-95 transition-all">
                <Plus size={14} /> Add Images
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
             </label>
          </div>

          {library.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-stone-100 rounded-3xl">
              <p className="text-stone-400 text-sm">Your image library is empty.</p>
              <p className="text-stone-300 text-[10px] mt-2 uppercase tracking-widest">Add high-quality interiors to begin</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {library.map(img => (
                <div key={img.id} className={`bg-white p-3 rounded-2xl border flex gap-4 ios-shadow transition-all ${img.isActive === false ? 'opacity-50 border-stone-50' : 'border-stone-100'}`}>
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 group">
                    <img src={img.url} className={`w-full h-full object-cover transition-filter ${img.isActive === false ? 'grayscale' : ''}`} />
                    <button 
                       onClick={() => updateImgMeta(img.id, { isActive: img.isActive === false })}
                       className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity ${img.isActive === false ? 'opacity-100' : ''}`}
                    >
                       {img.isActive === false ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                       <select 
                        value={img.roomType} 
                        onChange={(e) => updateImgMeta(img.id, { roomType: e.target.value as RoomType })}
                        className="bg-stone-50 text-[10px] uppercase tracking-wider font-semibold border-none rounded-lg px-2 py-1 outline-none"
                      >
                        {DEFAULT_ROOM_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                      </select>
                      <button 
                        onClick={() => updateImgMeta(img.id, { isActive: img.isActive === false })}
                        className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${img.isActive === false ? 'border-stone-200 text-stone-300' : 'border-stone-900 text-stone-900'}`}
                      >
                        {img.isActive === false ? 'Inactive' : 'Active'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                       {settings.categories.map(cat => (
                         <button 
                           key={cat.id}
                           onClick={() => {
                             const cats = img.styleCategories.includes(cat.id) 
                                ? img.styleCategories.filter(id => id !== cat.id)
                                : [...img.styleCategories, cat.id];
                             if (cats.length > 0) updateImgMeta(img.id, { styleCategories: cats });
                           }}
                           className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-tighter transition-all ${
                             img.styleCategories.includes(cat.id) ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-400'
                           }`}
                         >
                           {cat.name}
                         </button>
                       ))}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(img.id)} className="text-stone-200 hover:text-red-400 p-2 self-start">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'CATEGORIES' && (
        <div className="space-y-4 animate-in fade-in">
           {settings.categories.map(cat => (
             <div key={cat.id} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={cat.name}
                  onChange={(e) => {
                    const newCats = settings.categories.map(c => c.id === cat.id ? {...c, name: e.target.value} : c);
                    saveSettings({...settings, categories: newCats});
                    onSettingsChange();
                  }}
                  className="flex-1 bg-stone-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-stone-200 outline-none"
                />
                <button 
                  onClick={() => {
                    if (settings.categories.length > 3) {
                      const newCats = settings.categories.filter(c => c.id !== cat.id);
                      saveSettings({...settings, categories: newCats});
                      onSettingsChange();
                    }
                  }}
                  className="p-3 text-stone-200"
                >
                  <Trash2 size={18} />
                </button>
             </div>
           ))}
           <button 
             onClick={() => {
               const newCat = { id: crypto.randomUUID(), name: 'New Style' };
               saveSettings({...settings, categories: [...settings.categories, newCat]});
               onSettingsChange();
             }}
             className="w-full py-4 border-2 border-dashed border-stone-100 rounded-xl text-stone-300 text-xs flex items-center justify-center gap-2"
           >
             <Plus size={14} /> Add Category
           </button>
        </div>
      )}

      {activeTab === 'SESSION' && (
        <div className="space-y-12 animate-in fade-in">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400">Min. Pool Size</label>
              <span className="serif text-xl">{settings.minRequiredImages} Images</span>
            </div>
            <input 
              type="range" 
              min={5} 
              max={30} 
              value={settings.minRequiredImages}
              onChange={(e) => {
                saveSettings({...settings, minRequiredImages: parseInt(e.target.value)});
                onSettingsChange();
              }}
              className="w-full accent-stone-900"
            />
            <p className="text-[9px] text-stone-400 uppercase tracking-widest text-center">Active images required to enable discovery</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400">Max Session Cards</label>
              <span className="serif text-xl">{settings.sessionLength} Cards</span>
            </div>
            <input 
              type="range" 
              min={MIN_SESSION_LENGTH} 
              max={MAX_SESSION_LENGTH} 
              value={settings.sessionLength}
              onChange={(e) => {
                saveSettings({...settings, sessionLength: parseInt(e.target.value)});
                onSettingsChange();
              }}
              className="w-full accent-stone-900"
            />
          </div>

          <div className="p-6 bg-stone-50 rounded-2xl">
             <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4">Discovery Logic</h4>
             <ul className="text-xs text-stone-500 space-y-3">
               <li className="flex gap-3">
                 <Check size={14} className="text-stone-900 flex-shrink-0" />
                 <span>Randomly drawn from the <strong>active pool</strong> only</span>
               </li>
               <li className="flex gap-3">
                 <Check size={14} className="text-stone-900 flex-shrink-0" />
                 <span>Ensures variety across room types</span>
               </li>
               <li className="flex gap-3">
                 <Check size={14} className="text-stone-900 flex-shrink-0" />
                 <span>Prevents immediate repetition</span>
               </li>
             </ul>
          </div>
        </div>
      )}

      {activeTab === 'ADMIN' && (
        <div className="space-y-12 animate-in fade-in">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400">Client Name</label>
              <input 
                type="text" 
                value={settings.clientName}
                onChange={(e) => {
                  saveSettings({...settings, clientName: e.target.value});
                  onSettingsChange();
                }}
                placeholder="Enter client name..."
                className="w-full bg-stone-50 border-none rounded-xl px-4 py-4 text-lg serif outline-none focus:ring-1 focus:ring-stone-200"
              />
              <p className="text-[9px] text-stone-400 uppercase tracking-widest">This name appears on the home screen and session summary</p>
            </div>

            <div className="h-[1px] w-full bg-stone-100" />

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400">Security PIN</label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 4) setNewPin(val);
                  }}
                  className="flex-1 bg-stone-50 border-none rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold outline-none focus:ring-1 focus:ring-stone-200"
                />
                <button 
                  disabled={newPin.length !== 4 || newPin === settings.adminPin}
                  onClick={() => {
                    saveSettings({...settings, adminPin: newPin});
                    onSettingsChange();
                    setPinChangeSuccess(true);
                    setTimeout(() => setPinChangeSuccess(false), 2000);
                  }}
                  className={`px-8 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    newPin.length === 4 && newPin !== settings.adminPin
                      ? 'bg-stone-900 text-white active:scale-95'
                      : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                  }`}
                >
                  {pinChangeSuccess ? 'Updated' : 'Update PIN'}
                </button>
              </div>
              <p className="text-[9px] text-stone-400 uppercase tracking-widest">4-digit numeric code required for CMS access</p>
            </div>
          </div>

          <div className="p-6 bg-stone-900 text-white rounded-2xl">
             <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4 opacity-50">Admin Notice</h4>
             <p className="text-xs leading-relaxed opacity-80">
               Changes made here affect the core application configuration. Ensure the client name is correct before starting a discovery session.
             </p>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <div className="serif text-2xl animate-pulse">Processing...</div>
            <p className="text-[10px] uppercase tracking-[0.3em] mt-4 opacity-50">Configuring Library</p>
        </div>
      )}
    </div>
  );
};