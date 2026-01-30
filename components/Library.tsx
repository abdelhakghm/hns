
import React, { useState } from 'react';
import { FileResource, User } from '../types';
import { 
  Search, FileText, Download, Tag, FileSearch, Filter, 
  Layers, Book, Bookmark, GraduationCap, Clock, ExternalLink,
  ChevronRight, Sparkles
} from 'lucide-react';

interface LibraryProps {
  subjects: any[]; 
  files: FileResource[];
  user: User;
}

const Library: React.FC<LibraryProps> = ({ files }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Course', 'TD', 'Exam', 'Correction'];

  const filteredFiles = files.filter(file => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = file.title.toLowerCase().includes(searchLower) || 
                         file.description.toLowerCase().includes(searchLower) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchLower));
    const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Course': return <Book size={18} />;
      case 'TD': return <Layers size={18} />;
      case 'Exam': return <GraduationCap size={18} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-24 animate-in fade-in duration-1000">
      
      {/* HUD Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/20 border border-emerald-500/30 rounded-xl">
              <Layers className="text-emerald-500" size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-poppins font-bold text-white tracking-tight">Academic Registry</h1>
              <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.4em] mt-1">Institutional Resource Node</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Access the centralized HNS repository. High-yield educational assets synchronized for the Higher School of Renewable Energies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-1.5 bg-slate-900/40 border border-white/5 rounded-[24px] backdrop-blur-sm">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-[18px] text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                selectedCategory === cat 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Advanced Search Interface */}
      <section className="relative group">
        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-[40px] opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
        <div className="relative glass-card rounded-[32px] md:rounded-[40px] p-2 flex items-center gap-4 transition-all focus-within:border-emerald-500/40 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="pl-6 text-slate-500">
            <Search size={22} className="group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by module title, tags, or content descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent py-5 outline-none font-medium text-white text-sm md:text-base placeholder:text-slate-600"
          />
          <div className="hidden md:flex items-center gap-2 pr-4">
            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest bg-slate-800/50 px-2 py-1 rounded">CMD + K</span>
            <div className="p-3 bg-slate-900 text-slate-500 rounded-2xl border border-white/5">
              <Filter size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* Registry Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {filteredFiles.map((file, idx) => (
            <div 
              key={file.id} 
              className="glass-card rounded-[40px] p-8 border-transparent hover:border-emerald-500/20 transition-all duration-500 group/card flex flex-col h-full hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-8">
                <div className={`p-5 rounded-[24px] transition-all duration-500 group-hover/card:scale-110 ${
                  file.category === 'Exam' 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}>
                  {getCategoryIcon(file.category)}
                </div>
                
                <div className="flex gap-2">
                   <button className="p-3 bg-slate-900/50 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all border border-white/5">
                     <Bookmark size={18} />
                   </button>
                   <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 transition-all active:scale-90"
                  >
                    <Download size={18} />
                  </a>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                   <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                     file.category === 'Exam' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                   }`}>
                     {file.category}
                   </span>
                   <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                   <div className="flex items-center gap-1.5 text-slate-500">
                     <Clock size={10} />
                     <span className="text-[9px] font-bold uppercase tracking-widest">{file.dateAdded}</span>
                   </div>
                </div>

                <h3 className="text-xl font-poppins font-bold text-white leading-tight group-hover/card:text-emerald-400 transition-colors">
                  {file.title}
                </h3>
                
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">
                  {file.description || "No tactical description provided for this academic asset."}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {(file.tags?.length ? file.tags : ['Resource', 'Academic']).slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] font-bold text-slate-600 hover:text-emerald-500 transition-colors cursor-default">
                      #{tag.toUpperCase()}
                    </span>
                  ))}
                </div>
                <div className="text-emerald-500/40 group-hover/card:text-emerald-500 transition-colors translate-x-4 opacity-0 group-hover/card:translate-x-0 group-hover/card:opacity-100 duration-500">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-[48px] p-24 text-center border-dashed border-white/10 opacity-60">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl animate-pulse"></div>
            <div className="relative bg-slate-900 border border-white/5 p-6 rounded-3xl flex items-center justify-center text-slate-700">
              <FileSearch size={40} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-400">Zero Registry Matches</h3>
          <p className="text-xs text-slate-600 mt-2 max-w-xs mx-auto">
            The neural search could not locate assets matching your current query parameters.
          </p>
          <button 
            onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
            className="mt-8 px-6 py-2.5 bg-white/5 hover:bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Quick Statistics / Footer Info */}
      <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 hover:opacity-100 transition-opacity duration-700">
        <div className="glass-card p-6 rounded-[24px] border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Sparkles size={18} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Assets</p>
            <p className="text-lg font-bold text-white">{files.length}</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-[24px] border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Layers size={18} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categories</p>
            <p className="text-lg font-bold text-white">{categories.length - 1}</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-[24px] border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><ExternalLink size={18} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Repository</p>
            <p className="text-lg font-bold text-white">Live Sync</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Library;
