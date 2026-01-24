
import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudyItem, StudyLog } from '../types';
import { Play, Pause, RotateCcw, Brain, CheckCircle, Zap } from 'lucide-react';

interface StudyTimerProps {
  subjects: Subject[];
  onUpdateItem: (subjectId: string, itemId: string, updates: Partial<StudyItem> & { exercisesDelta?: number }, logEntry?: Omit<StudyLog, 'id'>) => void;
}

const POMODORO_TIME = 25 * 60;

const StudyTimer: React.FC<StudyTimerProps> = ({ subjects, onUpdateItem }) => {
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
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

  // Calculate percentage for the SVG circle
  const progress = (timeLeft / POMODORO_TIME) * 100;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-24 px-4 md:px-0">
      {!showSummary ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Left Column: Configuration */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8 order-2 lg:order-1">
            <div className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[56px] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-8 md:space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-3 md:p-4 bg-emerald-50 text-emerald-600 rounded-[20px] md:rounded-[28px] animate-float">
                  <Brain size={28} className="md:w-[32px] md:h-[32px]" />
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-poppins font-bold text-slate-800 tracking-tight leading-tight">Focus Node</h2>
                  <p className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Ready for transition</p>
                </div>
              </div>
              
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-2 md:space-y-3">
                  <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Target Module</label>
                  <div className="relative">
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedItemId(''); }}
                      className="w-full px-6 md:px-8 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-[20px] md:rounded-[28px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none cursor-pointer text-slate-700"
                    >
                      <option value="">Select a Module</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                      <Zap size={14} />
                    </div>
                  </div>
                </div>
                
                {selectedSubjectId && (
                  <div className="space-y-2 md:space-y-3 animate-in slide-in-from-top-4 duration-500">
                    <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4">Specific Focus Point</label>
                    <div className="relative">
                      <select
                        value={selectedItemId}
                        onChange={(e) => setSelectedItemId(e.target.value)}
                        className="w-full px-6 md:px-8 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-[20px] md:rounded-[28px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none cursor-pointer text-slate-700"
                      >
                        <option value="">Choose Learning Unit</option>
                        {selectedSubject?.items.map(i => <option key={i.id} value={i.id}>{i.type}: {i.title}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-emerald-900 p-8 md:p-12 rounded-[40px] md:rounded-[56px] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 animate-shimmer opacity-30"></div>
              <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-[-15deg]">
                <CheckCircle size={160} className="md:w-[180px] md:h-[180px]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 flex items-center gap-3">
                  <Zap size={20} className="text-emerald-400 md:w-[24px] md:h-[24px]" /> Kinetic Focus
                </h3>
                <p className="text-emerald-100/70 text-xs md:text-sm font-medium leading-relaxed">
                  Study with high intensity for 25 minutes. No distractions. Pure energy conversion.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Timer Interface */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white p-8 md:p-12 rounded-[50px] md:rounded-[72px] border border-slate-100 shadow-2xl relative overflow-hidden order-1 lg:order-2">
            
            {/* Visual Background Element */}
            <div className={`absolute inset-0 bg-emerald-50/30 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`relative w-[280px] h-[280px] md:w-[450px] md:h-[450px] flex items-center justify-center z-10 ${isActive ? 'animate-breath' : ''}`}>
              <svg className="w-full h-full -rotate-90 transform drop-shadow-xl" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="url(#timerGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    transition: isActive ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'stroke-dashoffset'
                  }}
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="relative">
                   {isActive && (
                      <div className="absolute inset-0 bg-emerald-400 blur-[40px] opacity-20 animate-pulse scale-150 rounded-full"></div>
                   )}
                   <span className="text-6xl md:text-[120px] font-poppins font-bold text-slate-900 tracking-tighter tabular-nums relative z-10 leading-none">
                     {formatTime(timeLeft)}
                   </span>
                </div>
                <div className={`flex items-center gap-2 mt-4 md:mt-8 px-4 py-1.5 rounded-full transition-all duration-700 ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-[10px] md:text-[12px] font-bold uppercase tracking-[0.3em]">
                    {isActive ? 'Energy Flow Active' : 'Neutral State'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8 md:gap-12 mt-12 md:mt-20 z-10">
              <button
                onClick={() => { setIsActive(false); setTimeLeft(POMODORO_TIME); }}
                className="p-5 md:p-8 rounded-full bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all shadow-inner active:scale-90"
                aria-label="Reset Timer"
              >
                <RotateCcw size={24} className="md:w-[32px] md:h-[32px]" />
              </button>
              
              <button
                onClick={() => setIsActive(!isActive)}
                className={`p-10 md:p-14 rounded-full shadow-2xl transition-all active:scale-90 ${isActive ? 'bg-amber-100 text-amber-600 energy-pulse' : 'bg-slate-900 text-white hover:bg-black shadow-emerald-200'}`}
                aria-label={isActive ? "Pause Timer" : "Start Timer"}
              >
                {isActive ? <Pause size={48} className="md:w-[64px] md:h-[64px]" /> : <Play size={48} className="ml-2 md:w-[64px] md:h-[64px] md:ml-3" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Summary Screen */
        <div className="bg-white p-12 md:p-20 rounded-[50px] md:rounded-[72px] border border-slate-100 shadow-2xl max-w-2xl mx-auto text-center space-y-8 md:space-y-10 animate-in zoom-in-95 duration-700">
           <div className="p-8 md:p-10 bg-emerald-50 text-emerald-600 rounded-[36px] md:rounded-[48px] w-fit mx-auto shadow-sm animate-breath">
             <CheckCircle size={80} className="md:w-[100px] md:h-[100px]" />
           </div>
           <div className="space-y-4">
             <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Mission Accomplished</h2>
             <p className="text-slate-500 text-sm md:text-lg font-medium max-w-sm mx-auto leading-relaxed">
               Energy synchronized. Your focus levels were 100% efficient. Take a short 5-minute break.
             </p>
           </div>
           <button 
             onClick={() => { setShowSummary(false); setTimeLeft(POMODORO_TIME); }}
             className="w-full py-5 md:py-6 bg-slate-900 text-white font-bold rounded-[24px] md:rounded-[32px] shadow-2xl hover:bg-black transition-all text-lg md:text-xl active:scale-[0.98]"
           >
             Initialize Next Workspace
           </button>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
