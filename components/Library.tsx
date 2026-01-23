
import React, { useState } from 'react';
import { FileResource, User } from '../types';
import { Search, FileText, Download, Tag, FileSearch, Filter } from 'lucide-react';

interface LibraryProps {
  subjects: any[]; 
  files: FileResource[];
  user: User;
}

const Library: React.FC<LibraryProps> = ({ files }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredFiles = files.filter(file => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = file.title.toLowerCase().includes(searchLower) || file.description.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-slate-800">Academic Library</h1>
          <p className="text-slate-500">Access HNS institutional resources and study materials.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           {['All', 'Course', 'TD', 'Exam'].map(cat => (
             <button
               key={cat}
               onClick={() => setSelectedCategory(cat)}
               className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-800'}`}
             >
               {cat}
             </button>
           ))}
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
        <input
          type="text"
          placeholder="Search by module or document title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[32px] focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm font-medium"
        />
      </div>

      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFiles.map((file) => (
            <div key={file.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col h-full">
              <div className="flex items-start justify-between mb-8">
                <div className={`p-4 rounded-2xl ${
                  file.category === 'Exam' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <FileText size={32} />
                </div>
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all"
                >
                  <Download size={22} />
                </a>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{file.category}</span>
                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                   <span className="text-[10px] text-slate-400 font-bold">{file.dateAdded}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">{file.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium">{file.description}</p>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 flex flex-wrap gap-2">
                {file.tags?.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-slate-300 hover:text-emerald-500 transition-colors">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[48px] p-24 text-center border border-dashed border-slate-200">
          <FileSearch size={64} className="mx-auto text-slate-100 mb-6" />
          <h3 className="text-xl font-bold text-slate-800">No resources found</h3>
          <p className="text-slate-400 mt-2 font-medium">Try different keywords or adjust your filters.</p>
        </div>
      )}
    </div>
  );
};

export default Library;
