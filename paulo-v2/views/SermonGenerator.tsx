
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { generateSermonOutline } from '../services/geminiService';
import { Theme as SermonTheme, Sermon } from '../types';
import { 
  Sparkles, RotateCcw, Save, Edit3, Wand2, Bold, Italic, Underline as UnderlineIcon, 
  Maximize, X, Sun, Moon, Palette, Highlighter, 
  Eraser, ChevronDown, Plus, Copy, Trash2, FileText, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

interface SermonPoint {
  id: string;
  title: string;
  content: string;
}

const SermonGenerator: React.FC<{ onSave: (sermon: Sermon) => void, initialSermon?: Sermon | null }> = ({ onSave, initialSermon }) => {
  const [mode, setMode] = useState<'ia' | 'manual'>('ia');
  const [topic, setTopic] = useState('');
  const [theme, setTheme] = useState<SermonTheme>('Doutrina');
  const [reference, setReference] = useState('');
  
  const [manualIntro, setManualIntro] = useState('');
  const [manualConclusion, setManualConclusion] = useState('');
  const [points, setPoints] = useState<SermonPoint[]>([
    { id: '1', title: '', content: '' }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pointToDelete, setPointToDelete] = useState<string | null>(null);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  
  // Estado para controlar a largura total do editor
  const [isFullWidth, setIsFullWidth] = useState(false);

  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingTheme, setReadingTheme] = useState<'light' | 'dark' | 'sepia'>('dark');
  const [fontSize, setFontSize] = useState(24);

  const fontColors = [
    { name: 'Automático', color: 'initial' },
    { name: 'Esmeralda', color: '#10b981' },
    { name: 'Rosa', color: '#f43f5e' },
    { name: 'Azul', color: '#3b82f6' },
    { name: 'Âmbar', color: '#f59e0b' },
  ];

  const highlightColors = [
    { name: 'Amarelo', color: '#fef08a' },
    { name: 'Ciano', color: '#cffafe' },
    { name: 'Lima', color: '#dcfce7' },
    { name: 'Pink', color: '#fce7f3' },
  ];

  useEffect(() => {
    if (initialSermon) {
      if (editorRef.current) editorRef.current.innerHTML = initialSermon.content;
      setTopic(initialSermon.title);
      setTheme(initialSermon.theme);
      setReference(initialSermon.tags?.[1] || '');
      // Ativa o modo largura total automaticamente ao editar
      setIsFullWidth(true);
    }
  }, [initialSermon]);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const outline = await generateSermonOutline(topic, theme, reference);
      if (editorRef.current) editorRef.current.innerHTML = outline?.replace(/\n/g, '<br>') || '';
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const transferToEditor = () => {
    let content = `<h1>${topic || 'Sermão sem Título'}</h1>`;
    if (reference) content += `<p><strong>Texto Base:</strong> ${reference}</p>`;
    content += `<p><strong>Tema:</strong> ${theme}</p>`;
    if (manualIntro) content += `<h2>Introdução</h2><p>${manualIntro}</p>`;
    points.forEach((p, i) => {
      if (p.title || p.content) {
        content += `<h2>Ponto ${i+1}: ${p.title}</h2><p>${p.content}</p>`;
      }
    });
    if (manualConclusion) content += `<h2>Conclusão e Apelo</h2><p>${manualConclusion}</p>`;
    
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
      alert('Estrutura enviada para o editor!');
    }
  };

  const handleSave = () => {
    const contentHtml = editorRef.current?.innerHTML || '';
    if (!contentHtml.trim() || contentHtml === '<br>') return alert('O sermão está vazio!');
    onSave({
      id: initialSermon?.id || Date.now().toString(),
      title: topic || 'Sermão sem título',
      theme,
      content: contentHtml,
      date: new Date().toLocaleDateString('pt-BR'),
      tags: [theme, reference].filter(Boolean) as string[],
    });
  };

  const handleCopy = () => {
    const text = editorRef.current?.innerText || '';
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    alert('Texto copiado!');
  };

  const addPoint = () => setPoints([...points, { id: Date.now().toString(), title: '', content: '' }]);
  
  const removePoint = (id: string) => {
    if (points.length <= 1) return;
    setPointToDelete(id);
  };

  const confirmRemovePoint = () => {
    if (pointToDelete) {
      setPoints(points.filter(p => p.id !== pointToDelete));
      setPointToDelete(null);
    }
  };

  const updatePoint = (id: string, field: 'title' | 'content', value: string) => {
    setPoints(points.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const format = (c: string, v: any = undefined) => {
    document.execCommand(c, false, v);
    setShowColorPicker(false);
    setShowHighlightPicker(false);
  };


  const readingModeUI = isReadingMode && createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col bg-black text-white overflow-hidden animate-in fade-in duration-300">
      {/* Header Responsivo */}
      <div className="p-4 md:px-6 md:py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-white/10 bg-black min-h-[48px] gap-4 md:gap-0">
        
        {/* Topo Mobile / Esquerda Desktop */}
        <div className="flex items-center justify-between w-full md:w-auto gap-8">
          <button onClick={() => { setIsReadingMode(false); }} className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] text-white hover:text-rose-500 transition-colors">
            <X size={14} strokeWidth={4} /> <span className="whitespace-nowrap">FINALIZAR LEITURA</span>
          </button>
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 truncate max-w-[150px] md:max-w-md text-right md:text-left">{topic || 'SERMÃO'}</h2>
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
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-2">{theme}</p>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight" style={{ color: 'inherit' }}>{topic || 'Sem Título'}</h1>
              <div className="hidden md:block flex-1 h-px bg-white/10"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-50 whitespace-nowrap">PREPARADO PARA MINISTRAÇÃO</p>
            </div>
          </div>
          <article className="reading-article font-serif" style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || '' }} />
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Painel de Configurações / Esquerda - Oculto se isFullWidth for true */}
        <div className={`${isFullWidth ? 'hidden' : 'lg:col-span-5'} space-y-6`}>
          <div className="bg-white dark:bg-[#0A0A0A] p-1.5 rounded-full border border-slate-200 dark:border-white/5 flex shadow-sm">
            <button 
              onClick={() => setMode('ia')} 
              className={`flex-1 py-4 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-center ${mode === 'ia' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              <Wand2 size={14} className="shrink-0" /> <span>Inteligência Artificial</span>
            </button>
            <button 
              onClick={() => setMode('manual')} 
              className={`flex-1 py-4 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-center ${mode === 'manual' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              <Edit3 size={14} className="shrink-0" /> <span>Estrutura Manual</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-white/5 p-6 shadow-sm">
            {mode === 'ia' ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-1">
                   <div className="w-1 h-5 bg-emerald-600 rounded-full"></div>
                   <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuração de Geração</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Assunto ou Título</label>
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: A Parábola do Semeador" className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-100 dark:border-white/10 rounded-xl p-5 font-bold text-lg outline-none dark:text-white shadow-inner" />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Texto Áureo / Referência</label>
                  <input type="text" value={reference} onChange={e => setReference(e.target.value)} placeholder="Ex: Mateus 13:1-23" className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-100 dark:border-white/10 rounded-xl p-5 font-bold text-lg outline-none dark:text-white shadow-inner" />
                </div>

                <div className="space-y-2">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Tema Ministerial</label>
                   <div className="relative">
                     <select 
                       value={theme} 
                       onChange={e => setTheme(e.target.value as SermonTheme)} 
                       className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-100 dark:border-white/10 rounded-xl p-5 font-black text-lg outline-none dark:text-white appearance-none cursor-pointer shadow-inner"
                     >
                        <option value="Doutrina" className="bg-white dark:bg-[#121212] dark:text-white">Doutrina</option>
                        <option value="Ofertório" className="bg-white dark:bg-[#121212] dark:text-white">Ofertório</option>
                        <option value="Sexta Profética" className="bg-white dark:bg-[#121212] dark:text-white">Sexta Profética</option>
                        <option value="Celebrando em Família" className="bg-white dark:bg-[#121212] dark:text-white">Celebrando em Família</option>
                        <option value="Círculo de Oração" className="bg-white dark:bg-[#121212] dark:text-white">Círculo de Oração</option>
                        <option value="Geral" className="bg-white dark:bg-[#121212] dark:text-white">Geral</option>
                     </select>
                     <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                   </div>
                </div>

                <button onClick={handleGenerate} disabled={isLoading || !topic} className="w-full bg-emerald-600 text-white font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-600/30 uppercase text-[10px] tracking-[0.2em]">
                  {isLoading ? <RotateCcw className="animate-spin" size={16} /> : <Sparkles size={16} />} 
                  {isLoading ? 'Redigindo...' : 'Gerar Esboço Completo'}
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-1">
                   <div className="w-1 h-5 bg-emerald-600 rounded-full"></div>
                   <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Montagem Manual</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Sermão</label>
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Título..." className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-100 dark:border-white/10 rounded-xl p-5 font-bold text-lg outline-none dark:text-white shadow-inner" />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Texto Base</label>
                  <input type="text" value={reference} onChange={e => setReference(e.target.value)} placeholder="Referência..." className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-100 dark:border-white/10 rounded-xl p-5 font-bold text-lg outline-none dark:text-white shadow-inner" />
                </div>

                <div className="space-y-2">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Tema Ministerial</label>
                   <div className="relative">
                     <select 
                       value={theme} 
                       onChange={e => setTheme(e.target.value as SermonTheme)} 
                       className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-100 dark:border-white/10 rounded-xl p-5 font-black text-lg outline-none dark:text-white appearance-none cursor-pointer shadow-inner"
                     >
                        <option value="Doutrina" className="bg-white dark:bg-[#121212] dark:text-white">Doutrina</option>
                        <option value="Ofertório" className="bg-white dark:bg-[#121212] dark:text-white">Ofertório</option>
                        <option value="Sexta Profética" className="bg-white dark:bg-[#121212] dark:text-white">Sexta Profética</option>
                        <option value="Celebrando em Família" className="bg-white dark:bg-[#121212] dark:text-white">Celebrando em Família</option>
                        <option value="Círculo de Oração" className="bg-white dark:bg-[#121212] dark:text-white">Círculo de Oração</option>
                        <option value="Geral" className="bg-white dark:bg-[#121212] dark:text-white">Geral</option>
                     </select>
                     <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Introdução</label>
                  <textarea value={manualIntro} onChange={e => setManualIntro(e.target.value)} placeholder="Início da ministração..." className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-100 dark:border-white/10 rounded-2xl p-5 font-bold text-base outline-none dark:text-white h-32 resize-none shadow-inner leading-relaxed" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Pontos Chave</h3>
                    <button onClick={addPoint} className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                    {points.map((p, i) => (
                      <div key={p.id} className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.5rem] space-y-3 relative group/item shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Ponto {i + 1}</span>
                          {points.length > 1 && (
                            <button 
                              onClick={() => removePoint(p.id)}
                              className="text-rose-400 hover:text-rose-600 transition-all opacity-0 group-hover/item:opacity-100 p-1"
                              title="Remover Ponto"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <input type="text" placeholder="Título do Ponto" value={p.title} onChange={(e) => updatePoint(p.id, 'title', e.target.value)} className="w-full bg-white dark:bg-[#121212] border border-slate-100 dark:border-white/10 rounded-xl p-4 text-base font-black outline-none dark:text-white shadow-sm" />
                        <textarea placeholder="Explanação e insights..." value={p.content} onChange={(e) => updatePoint(p.id, 'content', e.target.value)} className="w-full bg-white dark:bg-[#121212] border border-slate-100 dark:border-white/10 rounded-xl p-4 text-sm font-medium outline-none dark:text-white h-28 resize-none shadow-sm leading-relaxed" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Conclusão e Apelo</label>
                  <textarea value={manualConclusion} onChange={e => setManualConclusion(e.target.value)} placeholder="Finalização..." className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-100 dark:border-white/10 rounded-2xl p-5 font-bold text-base outline-none dark:text-white h-32 resize-none shadow-inner leading-relaxed" />
                </div>

                <button onClick={transferToEditor} className="w-full bg-emerald-600 text-white font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-600/30 uppercase text-[10px] tracking-[0.2em]">
                  <FileText size={18} /> Disponibilizar no Editor
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editor / Direita - Expande para col-span-12 se isFullWidth for true */}
        <div className={`${isFullWidth ? 'lg:col-span-12' : 'lg:col-span-7'}`}>
          <div className="bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl flex flex-col overflow-hidden relative min-h-[90vh]">
             <div className="p-5 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between bg-white dark:bg-[#0A0A0A] gap-4 sticky top-0 z-10">
                <div className="flex items-center gap-1">
                  
                  {/* Botão de Controle de Largura */}
                  <button 
                    onClick={() => setIsFullWidth(!isFullWidth)} 
                    className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all text-emerald-600"
                    title={isFullWidth ? "Mostrar Configurações" : "Expandir Editor"}
                  >
                    {isFullWidth ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}
                  </button>
                  <div className="w-px h-7 bg-slate-100 dark:bg-white/10 mx-2" />

                  <button onClick={() => format('bold')} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"><Bold size={16}/></button>
                  <button onClick={() => format('italic')} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"><Italic size={16}/></button>
                  <button onClick={() => format('underline')} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"><UnderlineIcon size={16}/></button>
                  <div className="w-px h-7 bg-slate-100 dark:bg-white/10 mx-2" />
                  
                  <div className="relative">
                    <button onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center gap-1 transition-all">
                      <Palette size={16}/> <ChevronDown size={8}/>
                    </button>
                    {showColorPicker && (
                      <div className="absolute top-full left-0 mt-3 p-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 flex gap-2">
                        {fontColors.map(c => (
                          <button key={c.name} onClick={() => format('foreColor', c.color)} className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: c.color === 'initial' ? (document.documentElement.classList.contains('dark') ? 'white' : 'black') : c.color }} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center gap-1 transition-all">
                      <Highlighter size={16}/> <ChevronDown size={8}/>
                    </button>
                    {showHighlightPicker && (
                      <div className="absolute top-full left-0 mt-3 p-3 bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 flex gap-2">
                        {highlightColors.map(c => (
                          <button key={c.name} onClick={() => format('hiliteColor', c.color)} className="w-8 h-8 rounded-xl border border-slate-200 shadow-sm" style={{ backgroundColor: c.color }} />
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={() => format('removeFormat')} className="p-3 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-rose-400 rounded-xl transition-all"><Eraser size={16}/></button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                   <button onClick={() => setIsReadingMode(true)} className="p-3 text-slate-400 hover:text-emerald-600 transition-colors" title="Modo Leitura"><Maximize size={22}/></button>
                </div>
             </div>

             <div className="px-6 md:px-12 pt-10 flex gap-3 md:gap-6">
                <button 
                  onClick={handleCopy} 
                  className="flex-1 py-4.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full font-black text-[10px] uppercase tracking-normal md:tracking-[0.2em] flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-md active:scale-95 text-center"
                >
                  <Copy size={18} className="shrink-0" /> <span className="leading-tight">COPIAR TEXTO</span>
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 py-4.5 bg-emerald-600 text-white rounded-full font-black text-[10px] uppercase tracking-normal md:tracking-[0.2em] flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 shadow-xl shadow-emerald-600/30 transition-all hover:bg-emerald-700 active:scale-95 text-center"
                >
                  <Save size={18} className="shrink-0" /> <span className="leading-tight">SALVAR SERMÃO</span>
                </button>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar bg-white dark:bg-[#0A0A0A] pb-32">
                <div 
                  ref={editorRef} 
                  contentEditable 
                  className="p-12 lg:p-20 outline-none prose prose-2xl dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 font-serif italic leading-relaxed min-h-[75vh] text-center sm:text-left" 
                  data-placeholder="O Espírito Santo está pronto para te inspirar. Comece a redigir seu sermão aqui..."
                />
             </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão de Ponto */}
      {pointToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 mb-6 mx-auto">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight mb-2">Excluir Ponto</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8 leading-relaxed">
              Tem certeza que deseja excluir este ponto do esboço? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setPointToDelete(null)}
                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmRemovePoint}
                className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-500/30 hover:bg-rose-600 active:scale-95 transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {readingModeUI}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        [contentEditable]:empty:before { 
          content: attr(data-placeholder); 
          color: #94a3b8; 
          font-style: italic; 
          font-family: serif;
          font-size: 22px;
          opacity: 0.6;
        }
        .dark [contentEditable]:empty:before { color: #475569; }
        .py-4\\.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
      `}</style>
    </div>
  );
};

export default SermonGenerator;
