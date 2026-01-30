
import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudyItem, StudyLog } from '../types';
import { 
  Play, Pause, RotateCcw, Brain, CheckCircle, Zap, 
  Settings2, Activity, Gauge, Flame, Battery, Save, X
} from 'lucide-react';

interface StudyTimerProps {
  subjects: Subject[];
  onUpdateItem: (subjectId: string, itemId: string, updates: Partial<StudyItem> & { exercisesDelta?: number }, logEntry?: Omit<StudyLog, 'id'>) => void;
}

const POMODORO_TIME = 25 * 60;
const SEGMENTS = 40;

const StudyTimer: React.FC<StudyTimerProps> = ({ subjects, onUpdateItem }) => {
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [solvedInSession, setSolvedInSession] = useState<number>(0);
  const [sessionNote, setSessionNote] = useState<string>('Deep work session.');
  
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      completeSession();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const completeSession = () => {
    setIsActive(false);
    setShowSummary(true);
  };

  const handleLogProgress = () => {
    if (selectedSubjectId && selectedItemId) {
      onUpdateItem(selectedSubjectId, selectedItemId, { exercisesDelta: solvedInSession }, {
        timestamp: new Date().toISOString(),
        note: sessionNote,
        exercises_added: solvedInSession
      });
    }
    setShowSummary(false);
    setTimeLeft(POMODORO_TIME);
    setSolvedInSession(0);
    setSessionNote('Deep work session.');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedItem = selectedSubject?.items.find(i => i.id === selectedItemId);

  const progressPercent = (timeLeft / POMODORO_TIME);
  const activeSegments = Math.ceil(progressPercent * SEGMENTS);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      {!showSummary ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="glass-card rounded-[40px] p-8 border-emerald-500/10 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.05] -rotate-12">
                <Settings2 size={120} />
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-emerald-600/20 text-emerald-500 rounded-2xl border border-emerald-500/20">
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight leading-none">Reactor Config</h2>
                  <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-2">Focus Engine v4.1</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Module Cluster</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedItemId(''); }}
                    className="w-full px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Module</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                
                {selectedSubjectId && (
                  <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Specific Point</label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Choose Unit</option>
                      {selectedSubject?.items.map(i => <option key={i.id} value={i.id}>{i.type}: {i.title}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Load Status</span>
                    <span className="text-[10px] font-bold text-emerald-400">{isActive ? 'CRITICAL SYNC' : 'STANDBY'}</span>
                 </div>
                 <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isActive ? 'bg-emerald-500 w-full animate-pulse' : 'bg-slate-700 w-1/3'}`} 
                    />
                 </div>
              </div>
            </div>

            <div className="glass-card rounded-[40px] p-8 bg-emerald-950/20 border-emerald-500/10 flex items-center gap-6 group">
               <div className="p-4 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                 <Gauge size={28} />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-white">Efficiency Mode</h4>
                 <p className="text-[10px] text-slate-500 font-medium mt-1">Pomodoro protocol active.</p>
               </div>
            </div>
            
            {isActive && (
               <button 
                 onClick={completeSession}
                 className="w-full py-4 bg-white/5 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
               >
                 End Session Early
               </button>
            )}
          </div>

          <div className="lg:col-span-8 glass-card rounded-[56px] p-12 border-white/5 flex flex-col items-center justify-center relative overflow-hidden group/main order-1 lg:order-2">
            <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${isActive ? 'opacity-20' : 'opacity-0'}`}>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-radial-gradient from-emerald-500/20 to-transparent animate-pulse" />
            </div>

            <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full rotate-[-90deg]">
                   {[...Array(SEGMENTS)].map((_, i) => {
                     const angle = (i / SEGMENTS) * 360;
                     const isLit = i < activeSegments;
                     return (
                       <div 
                         key={i}
                         className="absolute top-1/2 left-1/2 w-full h-4 -translate-y-1/2"
                         style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                       >
                         <div 
                           className={`h-full w-1.5 ml-auto rounded-full transition-all duration-500 ${
                             isLit 
                               ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] opacity-100' 
                               : 'bg-white/5 opacity-20'
                           }`}
                           style={{ transitionDelay: `${i * 10}ms` }}
                         />
                       </div>
                     );
                   })}
                </div>
              </div>

              <div className={`relative z-10 w-[70%] h-[70%] rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                isActive ? 'bg-emerald-600/5 shadow-[inset_0_0_50px_rgba(16,185,129,0.1)]' : 'bg-transparent'
              }`}>
                <div className="absolute top-1/4 flex items-center gap-2">
                   <Battery size={14} className={isActive ? 'text-emerald-500 animate-pulse' : 'text-slate-700'} />
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Resource Drain</span>
                </div>

                <div className="relative">
                  <span className={`text-8xl md:text-9xl font-poppins font-bold tracking-tighter tabular-nums leading-none ${
                    isActive ? 'text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'text-slate-600'
                  }`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <div className="mt-8 flex items-center gap-3">
                   <div className={`h-1 w-12 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                   <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{isActive ? 'DEEP WORK' : 'IDLE'}</span>
                   <div className={`h-1 w-12 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12 mt-16 z-20">
              <button
                onClick={() => { setIsActive(false); setTimeLeft(POMODORO_TIME); }}
                className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
                title="Reset Core"
              >
                <RotateCcw size={22} />
              </button>
              
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative group p-12 rounded-[40px] transition-all active:scale-95 ${
                  isActive 
                    ? 'bg-amber-500 text-slate-900 shadow-[0_0_30px_rgba(245,158,11,0.4)]' 
                    : 'bg-emerald-600 text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:bg-emerald-500'
                }`}
              >
                <div className="absolute inset-0 bg-white/20 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                {isActive ? <Pause size={48} className="relative z-10" /> : <Play size={48} className="ml-2 relative z-10" />}
              </button>

              <div className="p-6 text-slate-800 opacity-20">
                 <Flame size={22} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto glass-card p-12 md:p-16 rounded-[64px] border-emerald-500/20 shadow-2xl animate-in zoom-in-95 duration-700 relative overflow-hidden">
           <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
           <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-6">
                <div className="p-6 bg-emerald-600 rounded-[32px] text-white shadow-xl">
                  <CheckCircle size={48} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Session Impact Report</h2>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Stabilizing Academic Grid...</p>
                </div>
              </div>

              <div className="space-y-6 bg-slate-900/50 p-8 rounded-[32px] border border-white/5">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Exercises Successfully Logged</label>
                  <input 
                    type="number" 
                    value={solvedInSession}
                    onChange={(e) => setSolvedInSession(parseInt(e.target.value) || 0)}
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-2xl font-bold text-emerald-500 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Session Observations</label>
                  <textarea 
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    className="w-full h-24 p-6 bg-black/40 border border-white/10 rounded-2xl text-sm text-slate-300 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowSummary(false)}
                  className="flex-1 py-5 bg-white/5 text-slate-500 font-bold rounded-[24px] hover:bg-white/10 transition-all"
                >
                  Discard Log
                </button>
                <button 
                  onClick={handleLogProgress}
                  className="flex-[2] py-5 bg-emerald-600 text-white font-bold rounded-[24px] shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
                >
                  <Save size={20} />
                  Synchronize to Cloud
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
