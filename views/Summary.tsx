import React, { useRef, useState } from 'react';
import { Download, RefreshCw, Clock, Loader2 } from 'lucide-react';
import { SessionResult, LibraryImage, View } from '../types';
import { IMPRINT_BRAND_LOGO } from '../constants';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface SummaryProps {
  session: SessionResult;
  library: LibraryImage[];
  studioLogo: string | null;
  setView: (view: View) => void;
}

export const Summary: React.FC<SummaryProps> = ({ session, library, studioLogo, setView }) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const displayLogo = studioLogo || IMPRINT_BRAND_LOGO;

  // Extract liked images
  const likedImageIds = session.decisions
    .filter(d => d.direction === 'right')
    .map(d => d.imageId);
  
  const preferredImages = library.filter(img => likedImageIds.includes(img.id));

  // Determine hesitation vs confidence
  const avgMs = Math.round(session.summary.averageResponseTime);
  const isConfident = avgMs < 1500;
  const timingLabel = isConfident ? "Intuitive Selection" : "Deliberate Consideration";

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || isGenerating) return;
    
    setIsGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f4f1ea'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
      
      const fileName = `Imprint_DNA_${session.clientName || 'Export'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="px-8 pb-32 pt-40 animate-in fade-in slide-in-from-bottom-6 duration-1000 tracking-wide">
      {/* Hidden PDF Template Container */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <div 
          ref={pdfRef}
          style={{ width: '800px', padding: '60px', backgroundColor: '#f4f1ea', color: '#3d3935' }}
          className="flex flex-col items-center"
        >
          {/* PDF Header */}
          <div className="w-full flex justify-between items-start mb-16">
            <div>
              <img src={displayLogo} alt="Logo" className="h-16 w-auto object-contain" />
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#a39e93]">Aesthetic DNA Artifact</div>
              <div className="text-[10px] text-[#a39e93] mt-1 font-bold tracking-widest">
                {new Date(session.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="w-full text-center mb-12">
            <h1 className="serif text-5xl leading-tight mb-4">
              {session.clientName ? `${session.clientName}'s` : 'Visual'} Aesthetic DNA
            </h1>
            <div className="h-px w-24 bg-[#3d3935] mx-auto opacity-20" />
          </div>

          {/* Narrative Section */}
          <div className="w-full max-w-2xl text-center mb-16">
            <p className="serif text-xl italic text-[#7d776d] leading-relaxed">
              "{session.summary.narrative}"
            </p>
          </div>

          {/* Styles Grid */}
          <div className="w-full grid grid-cols-2 gap-8 mb-20">
             <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#c9c4b9]">Dominant Profiles</h3>
                <div className="space-y-3">
                   {session.summary.primaryStyles.map(style => (
                     <div key={style} className="bg-[#ede8df] p-6 rounded-xl flex justify-between items-center">
                        <span className="serif text-xl">{style}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3d3935]" />
                     </div>
                   ))}
                </div>
             </div>
             <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#c9c4b9]">Supporting Nuances</h3>
                <div className="space-y-3">
                   {session.summary.secondaryStyles.map(style => (
                     <div key={style} className="border border-[#dfd9ce] p-6 rounded-xl flex justify-between items-center opacity-60">
                        <span className="serif text-lg text-[#7d776d]">{style}</span>
                        <div className="w-1 h-1 rounded-full bg-[#a39e93]" />
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Preferences Grid */}
          <div className="w-full space-y-8">
            <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#c9c4b9] text-center">Curated Visual Selections</h3>
            <div className="grid grid-cols-3 gap-4">
              {preferredImages.slice(0, 9).map((img) => (
                <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-[#ede8df]">
                  <img src={img.url} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-24 pt-8 border-t border-[#dfd9ce] w-full text-center">
             <p className="text-[8px] uppercase tracking-[0.6em] text-[#c9c4b9] font-bold flex items-center justify-center gap-2">
               Authenticated by <img src={IMPRINT_BRAND_LOGO} alt="IMPRINT" className="h-4 w-auto" />
             </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-16">
        <img src={displayLogo} alt="Logo" className="h-20 w-auto object-contain" />
      </div>

      <div className="text-center mb-8 space-y-2">
        <h1 className="serif text-3xl md:text-4xl leading-snug tracking-tight">
          {session.clientName ? `${session.clientName}'s` : 'Your'} Aesthetic<br />Summary
        </h1>
        {session.clientName && (
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#a39e93]">
            Tailored Result
          </p>
        )}
      </div>

      <div className="flex flex-col items-center mb-16">
        <div className="flex items-center gap-2 text-[#7d776d] mb-2">
          <Clock size={12} strokeWidth={1.5} />
          <span className="text-[10px] uppercase tracking-widest font-bold">{timingLabel}</span>
        </div>
        <div className="serif text-2xl text-[#3d3935]">{avgMs}<span className="text-[10px] ml-1 text-[#a39e93] font-sans font-bold uppercase">ms</span></div>
      </div>

      <div className="space-y-16">
        <section className="text-center px-4">
          <p className="text-[#7d776d] text-lg leading-relaxed italic serif max-w-sm mx-auto">
            "{session.summary.narrative}"
          </p>
        </section>

        <section className="space-y-8">
          <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#c9c4b9] text-center">
            Dominant Styles
          </div>
          <div className="flex flex-col gap-3">
             {session.summary.primaryStyles.map(style => (
               <div key={style} className="bg-[#efeadf] py-6 px-8 rounded-2xl flex justify-between items-center group active:scale-[0.99] transition-all">
                  <span className="serif text-xl">{style}</span>
                  <div className="w-2 h-2 rounded-full bg-[#3d3935]"></div>
               </div>
             ))}
             {session.summary.secondaryStyles.map(style => (
               <div key={style} className="bg-[#faf8f2] border border-[#dfd9ce] py-5 px-8 rounded-2xl flex justify-between items-center opacity-60">
                  <span className="serif text-lg text-[#7d776d]">{style}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ede8df]"></div>
               </div>
             ))}
          </div>
        </section>

        {/* Gallery of Preferences */}
        {preferredImages.length > 0 && (
          <section className="space-y-8">
            <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#c9c4b9] text-center">
              Visual DNA
            </div>
            <div className="grid grid-cols-3 gap-3">
              {preferredImages.slice(0, 9).map((img, idx) => (
                <div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-[#ede8df] ios-shadow animate-in fade-in zoom-in-95" style={{ animationDelay: `${idx * 150}ms` }}>
                  <img src={img.url} className="w-full h-full object-cover" alt="Preference" />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4 pt-12">
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className={`w-full bg-[#3d3935] text-[#f4f1ea] py-5 rounded-full flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all shadow-xl ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isGenerating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} strokeWidth={1.5} />
            )}
            {isGenerating ? 'Generating DNA...' : 'Export PDF Artifact'}
          </button>
          <button 
            onClick={() => setView('HOME')}
            className="w-full bg-[#faf8f2] border border-[#dfd9ce] text-[#a39e93] py-5 rounded-full flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
          >
            <RefreshCw size={16} strokeWidth={1.5} /> New Discovery
          </button>
        </section>
      </div>
    </div>
  );
};