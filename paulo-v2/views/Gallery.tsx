
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Theme as SermonTheme, Sermon } from '../types';
import { 
  Search, 
  Calendar, 
  ChevronRight, 
  Trash2, 
  Maximize, 
  Sun, 
  Moon,
  ChevronLeft,
  X,
  Edit2
} from 'lucide-react';

interface GalleryProps {
  theme: SermonTheme;
  sermons: Sermon[];
  onDelete: (id: string) => void;
  onEdit: (sermon: Sermon) => void;
}

const Gallery: React.FC<GalleryProps> = ({ theme, sermons, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [readingTheme, setReadingTheme] = useState<'light' | 'dark' | 'sepia'>('dark');
  
  const filteredSermons = sermons
    .filter(s => (theme === 'Geral' || s.theme === theme))
    .filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const getThemeStyles = (themeName: string) => {
    switch (themeName) {
      case 'Ofertório':
        return { 
          bg: 'bg-rose-500', 
          text: 'text-rose-500', 
          border: 'hover:border-rose-500/30', 
          lightBg: 'bg-rose-500/5' 
        };
      case 'Doutrina':
        return { 
          bg: 'bg-blue-500', 
          text: 'text-blue-500', 
          border: 'hover:border-blue-500/30', 
          lightBg: 'bg-blue-500/5' 
        };
      case 'Sexta Profética':
        return { 
          bg: 'bg-amber-500', 
          text: 'text-amber-500', 
          border: 'hover:border-amber-500/30', 
          lightBg: 'bg-amber-500/5' 
        };
      case 'Celebrando em Família':
        return { 
          bg: 'bg-emerald-500', 
          text: 'text-emerald-500', 
          border: 'hover:border-emerald-500/30', 
          lightBg: 'bg-emerald-500/5' 
        };
      case 'Círculo de Oração':
        return { 
          bg: 'bg-indigo-500', 
          text: 'text-indigo-500', 
          border: 'hover:border-indigo-500/30', 
          lightBg: 'bg-indigo-500/5' 
        };
      case 'Geral':
      default:
        return { 
          bg: 'bg-sky-500', 
          text: 'text-sky-500', 
          border: 'hover:border-sky-500/30', 
          lightBg: 'bg-sky-500/5' 
        };
    }
  };


  return (
    <div className="space-y-10">
      <div className="max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute left-7 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Pesquisar por tema ou título..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-white dark:bg-[#0A0A0A] border border-slate-100 dark:border-white/5 rounded-full pl-16 pr-8 py-5 outline-none font-bold text-lg shadow-sm focus:shadow-xl transition-all" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
        {filteredSermons.map((sermon) => {
          const styles = getThemeStyles(sermon.theme);
          return (
            <div 
              key={sermon.id} 
              onClick={() => setSelectedSermon(sermon)} 
              className={`group bg-white dark:bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 transition-all hover:-translate-y-2 flex flex-col min-h-[320px] shadow-sm relative overflow-hidden ${styles.border}`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 ${styles.bg}`}></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.25em] text-white shadow-md ${styles.bg}`}>
                  {sermon.theme}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(sermon); }} 
                    className="p-2 rounded-lg transition-all text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                    title="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onDelete(sermon.id); 
                    }} 
                    className="p-2 rounded-lg transition-all text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-black mb-5 dark:text-white uppercase line-clamp-3 leading-tight tracking-tight relative z-10">
                {sermon.title}
              </h3>

              <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase mt-auto mb-8 relative z-10">
                <Calendar size={16} className={styles.text} /> 
                {sermon.date}
              </div>

              <div className={`flex items-center justify-between font-black text-[10px] pt-6 border-t dark:border-white/5 transition-all group-hover:pl-1 ${styles.text}`}>
                <span className="tracking-[0.3em] uppercase">ACESSAR ESBOÇO</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${styles.lightBg} group-hover:scale-110`}>
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RENDERIZAÇÃO DO MODO LEITURA (PORTAL) - RECOLOCADO NO JSX PARA CORREÇÃO DO BUG */}
      {isReadingMode && selectedSermon && createPortal(
        <div className="fixed inset-0 z-[99999] flex flex-col bg-black text-white overflow-hidden animate-in fade-in duration-300">
          {/* Header Responsivo */}
          <div className="p-4 md:px-6 md:py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-white/10 bg-black min-h-[48px] gap-4 md:gap-0">
            
            {/* Topo Mobile / Esquerda Desktop */}
            <div className="flex items-center justify-between w-full md:w-auto gap-8">
              <button onClick={() => { setIsReadingMode(false); }} className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] text-white hover:text-rose-500 transition-colors">
                <X size={14} strokeWidth={4} /> <span className="whitespace-nowrap">FINALIZAR LEITURA</span>
              </button>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 truncate max-w-[150px] md:max-w-md text-right md:text-left">{selectedSermon.title}</h2>
            </div>

            {/* Controles Mobile / Direita Desktop */}
            <div className="flex items-center justify-between md:gap-6 md:justify-end">
               
               {/* Configurações */}
               <div className="flex items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-2">
                     <button onClick={() => setFontSize(Math.max(16, fontSize - 2))} className="text-[10px] font-black opacity-40 hover:opacity-100 p-2">T</button>
                     <span className="text-[10px] font-black opacity-20 min-w-[20px] text-center">{fontSize}</span>
                     <button onClick={() => setFontSize(Math.min(48, fontSize + 2))} className="text-[14px] font-black opacity-40 hover:opacity-100 p-2">T</button>
                  </div>
                  
                  <div className="w-px h-4 bg-white/10 mx-1 md:mx-2"></div>
                  
                  <div className="flex items-center gap-3">
                    <button onClick={() => setReadingTheme('light')} className={`transition-all p-1 ${readingTheme === 'light' ? 'text-emerald-500' : 'text-white opacity-40'}`}><Sun size={14}/></button>
                    <button onClick={() => setReadingTheme('sepia')} className={`w-3.5 h-3.5 rounded-sm bg-[#433422] border ${readingTheme === 'sepia' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'opacity-40'}`} />
                    <button onClick={() => setReadingTheme('dark')} className={`transition-all p-1 ${readingTheme === 'dark' ? 'text-emerald-500' : 'text-white opacity-40'}`}><Moon size={14}/></button>
                  </div>
               </div>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto no-scrollbar pt-6 pb-24 px-6 md:px-10 transition-colors duration-500 ${readingTheme === 'sepia' ? 'bg-[#F4EADA] text-[#433422]' : readingTheme === 'light' ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 border-b border-white/5 pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-2">{selectedSermon.theme}</p>
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight" style={{ color: 'inherit' }}>{selectedSermon.title}</h1>
                  <div className="hidden md:block flex-1 h-px bg-white/10"></div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-50 whitespace-nowrap">PREPARADO PARA MINISTRAÇÃO</p>
                </div>
              </div>
              <article className="reading-article font-serif" style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: selectedSermon.content }} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL PADRÃO (VISÍVEL APENAS QUANDO O MODO LEITURA NÃO ESTÁ ATIVO) */}
      {selectedSermon && !isReadingMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#050505] w-full max-w-7xl max-h-[92vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border dark:border-white/5">
            {/* Cabeçalho do Modal reestruturado para Mobile */}
            <div className="p-6 border-b dark:border-white/5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6 w-full lg:w-auto">
                <button onClick={() => setSelectedSermon(null)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex-1 lg:flex-none">
                  <h2 className="text-xl md:text-2xl font-black dark:text-white uppercase tracking-tighter leading-none line-clamp-1">{selectedSermon.title}</h2>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2">{selectedSermon.theme} • {selectedSermon.date}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => setIsReadingMode(true)} 
                  className="px-4 lg:px-8 py-3 bg-emerald-600 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex-1 lg:flex-none text-center whitespace-nowrap cursor-pointer z-50"
                >
                  FOCO TOTAL
                </button>
                <button onClick={() => onEdit(selectedSermon)} className="px-4 lg:px-8 py-3 bg-slate-100 dark:bg-white/5 dark:text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex-1 lg:flex-none text-center">EDITAR</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 lg:p-20 bg-white dark:bg-[#050505]">
              <article className="reading-article prose prose-2xl dark:prose-invert max-w-none text-slate-800 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: selectedSermon.content }} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .reading-article h1 { font-size: 1.3em; font-weight: 900; margin-bottom: 0.6em; border-bottom: 4px solid currentColor; padding-bottom: 0.2em; text-transform: uppercase; margin-top: 0; }
        .reading-article h2 { font-size: 1.1em; font-weight: 800; color: #10b981; text-transform: uppercase; margin-top: 1.4em; margin-bottom: 0.4em; }
        .reading-article p { margin-bottom: 0.8em; }
        .reading-article strong { font-weight: 900; }
      `}</style>
    </div>
  );
};

export default Gallery;
