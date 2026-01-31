
import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudyItem, StudyLog } from '../types';
import { 
  Play, Pause, RotateCcw, CheckCircle, Zap, 
  Settings, Gauge, Flame, Save, X, ChevronDown, TrendingUp
} from 'lucide-react';

interface StudyTimerProps {
  subjects: Subject[];
  onUpdateItem: (subjectId: string, itemId: string, updates: Partial<StudyItem> & { exercisesDelta?: number }, logEntry?: Omit<StudyLog, 'id'>) => void;
}

const SEGMENTS = 60;

const StudyTimer: React.FC<StudyTimerProps> = ({ subjects, onUpdateItem }) => {
  const [durationValue, setDurationValue] = useState(25);
  const [durationUnit, setDurationUnit] = useState<'min' | 'hour'>('min');
  const [sessionDuration, setSessionDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  
  const [isActive, setIsActive] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [solvedInSession, setSolvedInSession] = useState<number>(0);
  const [sessionNote, setSessionNote] = useState<string>('Deep work session.');
  const [showConfig, setShowConfig] = useState(true);
  
  const timerRef = useRef<any>(null);

  const updateSessionTime = (val: number, unit: 'min' | 'hour') => {
    const seconds = unit === 'hour' ? val * 3600 : val * 60;
    setSessionDuration(seconds);
    if (!isActive) {
      setTimeLeft(seconds);
    }
  };

  const handleDurationChange = (val: number) => {
    setDurationValue(val);
    updateSessionTime(val, durationUnit);
  };

  const handleUnitChange = (unit: 'min' | 'hour') => {
    setDurationUnit(unit);
    updateSessionTime(durationValue, unit);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      setShowConfig(false);
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
    setTimeLeft(sessionDuration);
    setSolvedInSession(0);
    setSessionNote('Deep work session.');
    setShowConfig(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedItem = selectedSubject?.items.find(i => i.id === selectedItemId);

  // Calculate projected progress for preview
  const currentSolved = selectedItem?.exercisesSolved || 0;
  const totalItems = selectedItem?.totalExercises || 1;
  const projectedSolved = Math.min(totalItems, currentSolved + solvedInSession);
  const projectedPercent = Math.round((projectedSolved / totalItems) * 100);

  const progressPercent = (timeLeft / sessionDuration);
  const activeSegments = Math.ceil(progressPercent * SEGMENTS);

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-14rem)] md:min-h-[70vh] flex flex-col items-center justify-center space-y-8 md:space-y-12">
      {!showSummary ? (
        <div className="w-full flex flex-col items-center animate-in fade-in duration-1000">
          
          {/* Header Status */}
          <div className={`mb-8 md:mb-12 transition-all duration-700 text-center ${isActive ? 'opacity-40 scale-95' : 'opacity-100'}`}>
            <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-[0.4em] mb-2 flex items-center justify-center gap-2">
              <Zap size={14} className={isActive ? 'animate-pulse' : ''} />
              {isActive ? 'Deep Work Phase' : 'Liquid Focus Core'}
            </h2>
            {selectedItem && (
              <p className="text-white font-medium text-xs opacity-60">
                Focusing on: {selectedItem.title}
              </p>
            )}
          </div>

          {/* Configuration Trigger */}
          {!isActive && (
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="mb-6 md:mb-8 flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-400 hover:text-emerald-400 transition-all active:scale-95"
            >
              <Settings size={14} />
              {showConfig ? 'Hide Settings' : 'Configure Module'}
            </button>
          )}

          {/* Config Panel (Minimalist) */}
          {!isActive && showConfig && (
            <div className="w-full max-w-md mb-8 md:mb-12 space-y-4 animate-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                {/* Duration Picker */}
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={durationValue}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                    className="flex-1 px-4 py-3.5 bg-slate-900/60 border border-white/10 rounded-2xl text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all"
                    min="1"
                  />
                  <select
                    value={durationUnit}
                    onChange={(e) => handleUnitChange(e.target.value as 'min' | 'hour')}
                    className="w-24 px-2 py-3.5 bg-slate-900/60 border border-white/10 rounded-2xl text-[10px] font-bold text-white outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="min">MIN</option>
                    <option value="hour">HR</option>
                  </select>
                </div>
                
                <select
                  value={selectedSubjectId}
                  onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedItemId(''); }}
                  className="w-full px-6 py-3.5 bg-slate-900/60 border border-white/10 rounded-2xl text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="">Subject Module</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="w-full">
                <select
                  disabled={!selectedSubjectId}
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-6 py-3.5 bg-slate-900/60 border border-white/10 rounded-2xl text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all disabled:opacity-30"
                >
                  <option value="">Study Unit</option>
                  {selectedSubject?.items.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Liquid Timer Core */}
          <div className="relative group/main">
            {/* Immersive glow when active */}
            <div className={`absolute -inset-24 bg-emerald-500/10 blur-[100px] rounded-full transition-opacity duration-1000 pointer-events-none ${isActive ? 'opacity-100' : 'opacity-0'}`} />
            
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
              {/* Outer Ring Segments */}
              <div className="absolute inset-0 rotate-[-90deg]">
                {[...Array(SEGMENTS)].map((_, i) => {
                  const angle = (i / SEGMENTS) * 360;
                  const isLit = i < activeSegments;
                  return (
                    <div 
                      key={i}
                      className="absolute top-1/2 left-1/2 w-full h-1 -translate-y-1/2"
                      style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                    >
                      <div 
                        className={`h-full w-4 md:w-6 ml-auto rounded-full transition-all duration-500 ${
                          isLit 
                            ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] opacity-100' 
                            : 'bg-white/5 opacity-10'
                        }`}
                        style={{ transitionDelay: `${isActive ? i * 5 : 0}ms` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Central Time Readout */}
              <div className={`relative z-10 w-[80%] h-[80%] rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                isActive ? 'scale-105' : 'scale-100'
              }`}>
                <span className={`text-7xl md:text-9xl font-poppins font-bold tracking-tighter tabular-nums leading-none transition-colors duration-1000 ${
                  isActive ? 'text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-slate-700'
                }`}>
                  {formatTime(timeLeft)}
                </span>
                
                {isActive && (
                   <div className="mt-4 flex flex-col items-center gap-1 animate-pulse">
                     <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-[0.3em]">Flux Active</span>
                     <div className="flex gap-0.5">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                        <div className="w-1 h-1 bg-emerald-500/50 rounded-full" />
                        <div className="w-1 h-1 bg-emerald-500/20 rounded-full" />
                     </div>
                   </div>
                )}
              </div>
            </div>

            {/* Float Menu Actions */}
            <div className="flex items-center justify-center gap-8 md:gap-10 mt-12 md:mt-16 relative z-20">
              <button
                onClick={() => { setIsActive(false); setTimeLeft(sessionDuration); }}
                className="p-4 md:p-5 rounded-full bg-slate-900 border border-white/5 text-slate-500 hover:text-white hover:border-white/10 transition-all active:scale-90"
              >
                <RotateCcw size={18} />
              </button>
              
              <button
                onClick={() => setIsActive(!isActive)}
                className={`p-8 md:p-10 rounded-[32px] md:rounded-[40px] transition-all active:scale-95 shadow-2xl ${
                  isActive 
                    ? 'bg-amber-500 text-slate-900 shadow-amber-500/20' 
                    : 'bg-emerald-600 text-white shadow-emerald-600/40 hover:bg-emerald-500'
                }`}
              >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
              </button>

              <button 
                onClick={completeSession}
                className={`p-4 md:p-5 rounded-full bg-slate-900 border border-white/5 text-slate-500 hover:text-red-400 transition-all active:scale-90 ${!isActive && timeLeft === sessionDuration ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          <div className="mt-12 text-[9px] md:text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em] md:tracking-[0.5em] opacity-30">
            Liquid Intelligence focus protocol
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl glass-card p-8 md:p-14 rounded-[32px] md:rounded-[48px] border-emerald-500/20 shadow-2xl animate-in zoom-in-95 duration-700 relative overflow-hidden">
           <div className="relative z-10 space-y-8 md:space-y-10">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="p-4 md:p-5 bg-emerald-600 rounded-[24px] md:rounded-[28px] text-white shadow-xl shadow-emerald-900/40">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Focus Achieved</h2>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Committing data to registry...</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-4">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Units Solved</label>
                    <div className="flex items-center gap-2">
                       <TrendingUp size={10} className="text-emerald-500" />
                       <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">New Progress: {projectedPercent}%</span>
                    </div>
                  </div>
                  <input 
                    type="number" 
                    value={solvedInSession}
                    onChange={(e) => setSolvedInSession(parseInt(e.target.value) || 0)}
                    className="w-full px-6 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-xl font-bold text-emerald-500 outline-none focus:border-emerald-500"
                  />
                  <p className="text-[9px] text-slate-600 font-bold px-4 uppercase tracking-wider">
                    Registry: {selectedItem?.exercisesSolved || 0} → {projectedSolved} / {totalItems}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Observations</label>
                  <textarea 
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    className="w-full h-24 p-6 bg-slate-900/50 border border-white/10 rounded-2xl text-xs text-slate-300 outline-none focus:border-emerald-500 resize-none"
                    placeholder="Brief session recap..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setShowSummary(false); setShowConfig(true); }}
                  className="flex-1 py-4 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-slate-300"
                >
                  Discard
                </button>
                <button 
                  onClick={handleLogProgress}
                  className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest"
                >
                  <Save size={16} />
                  Save To Registry
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
