
import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudyItem, StudyLog } from '../types';
import { Play, Pause, RotateCcw, Brain, CheckCircle, Zap } from 'lucide-react';

interface StudyTimerProps {
  subjects: Subject[];
  onUpdateItem: (subjectId: string, itemId: string, updates: Partial<StudyItem> & { exercisesDelta?: number }, logEntry?: Omit<StudyLog, 'id'>) => void;
}

const StudyTimer: React.FC<StudyTimerProps> = ({ subjects, onUpdateItem }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setShowSummary(true);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedItem = selectedSubject?.items.find(i => i.id === selectedItemId);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {!showSummary ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 stagger-item" style={{ animationDelay: '0.1s' }}>
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[28px] animate-float"><Brain size={32} /></div>
                <div>
                  <h2 className="text-3xl font-poppins font-bold text-slate-800 tracking-tight">Focus Node</h2>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Ready for transition</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Target Module</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedItemId(''); }}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select a Module</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                
                {selectedSubjectId && (
                  <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Specific Focus Point</label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Choose Learning Unit</option>
                      {selectedSubject?.items.map(i => <option key={i.id} value={i.id}>{i.type}: {i.title}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-emerald-900 p-12 rounded-[56px] text-white shadow-2xl relative overflow-hidden group animate-shimmer">
              <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-[-15deg]">
                <CheckCircle size={180} />
              </div>
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3"><Zap size={24} className="text-emerald-400" /> Kinetic Focus</h3>
              <p className="text-emerald-100/70 text-sm font-medium leading-relaxed">Study with high intensity for 25 minutes. No distractions. Pure energy conversion.</p>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white p-12 md:p-24 rounded-[72px] border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className={`relative w-80 h-80 md:w-[450px] md:h-[450px] flex items-center justify-center z-10 ${isActive ? 'animate-breath' : ''}`}>
              <svg className="w-full h-full -rotate-90 transform drop-shadow-2xl">
                <circle cx="50%" cy="50%" r="46%" fill="none" stroke="#f8fafc" strokeWidth="16" />
                <circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  fill="none"
                  stroke="url(#timerGradient)"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - (timeLeft / (25 * 60) * 100)}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative">
                   {isActive && (
                      <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20 animate-pulse scale-150"></div>
                   )}
                   <span className="text-8xl md:text-[140px] font-poppins font-bold text-slate-900 tracking-tighter tabular-nums relative z-10 leading-none">{formatTime(timeLeft)}</span>
                </div>
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-8">Thermal Focus State</span>
              </div>
            </div>

            <div className="flex items-center gap-12 mt-20 z-10">
              <button
                onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }}
                className="p-8 rounded-full bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all shadow-inner active:scale-90"
              >
                <RotateCcw size={32} />
              </button>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`p-14 rounded-full shadow-2xl transition-all active:scale-95 ${isActive ? 'bg-amber-100 text-amber-600 energy-pulse' : 'bg-slate-900 text-white shadow-emerald-200'}`}
              >
                {isActive ? <Pause size={64} /> : <Play size={64} className="ml-3" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[72px] border border-slate-100 shadow-2xl max-w-2xl mx-auto text-center space-y-10 animate-in zoom-in-95">
           <div className="p-10 bg-emerald-50 text-emerald-600 rounded-[48px] w-fit mx-auto shadow-sm animate-breath"><CheckCircle size={100} /></div>
           <div className="space-y-4">
             <h2 className="text-5xl font-bold text-slate-900 tracking-tight">Mission Accomplished</h2>
             <p className="text-slate-500 text-lg font-medium">Energy synchronized. Your focus levels were 100% efficient.</p>
           </div>
           <button 
             onClick={() => { setShowSummary(false); setTimeLeft(25 * 60); }}
             className="w-full py-6 bg-slate-900 text-white font-bold rounded-[32px] shadow-2xl hover:bg-black transition-all text-xl"
           >
             Initialize Next Workspace
           </button>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
