
import React, { useState } from 'react';
import { FileResource, User } from '../types';
import { Search, Filter, FileText, Download, Folder, ChevronRight, FileSearch, Tag, File } from 'lucide-react';

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
    const matchesSearch = 
      file.title.toLowerCase().includes(searchLower) || 
      file.description.toLowerCase().includes(searchLower) ||
      file.tags.some(t => t.toLowerCase().includes(searchLower));
      
    const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-poppins font-bold text-slate-800">Academic Repository</h1>
        <p className="text-slate-500">Access and download centralized academic resources from all school modules.</p>
      </header>

      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
          <input
            type="text"
            placeholder="Search by title, description, or tags (e.g. 'Thermodynamics', '2024')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 font-medium"
          />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="flex-1 space-y-3 w-full">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Resource Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right hidden lg:block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Resources</span>
            <span className="text-2xl font-bold text-slate-800">{filteredFiles.length}</span>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFiles.map((file) => (
            <div key={file.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${
                  file.category === 'Exam' ? 'bg-orange-50 text-orange-600' :
                  file.category === 'Correction' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  <FileText size={32} />
                </div>
                <button className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm">
                  <Download size={22} />
                </button>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{file.category}</span>
                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                   <span className="text-[10px] text-slate-400 font-medium">{file.dateAdded}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">{file.title}</h3>
                {file.fileName && (
                  <div className="flex items-center gap-1.5 py-1 px-2 bg-slate-50 w-fit rounded-lg border border-slate-100">
                    <File size={10} className="text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-bold truncate max-w-[150px]">{file.fileName}</span>
                  </div>
                )}
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 font-medium opacity-80 mt-2">{file.description}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex flex-wrap gap-2">
                {file.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer">
                    <Tag size={10} />
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-slate-50 rounded-full text-slate-300">
              <FileSearch size={64} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Resource not found</h3>
          <p className="text-slate-500 mt-3 max-w-sm mx-auto font-medium leading-relaxed">We couldn't find any documents matching your criteria. Try different keywords or check other categories.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="mt-8 text-emerald-600 font-bold hover:underline underline-offset-4"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;
