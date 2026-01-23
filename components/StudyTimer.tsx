
import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudyItem, StudyLog } from '../types';
import { Play, Pause, RotateCcw, Coffee, Zap, Brain, Target, CheckCircle, Save, MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';

interface StudyTimerProps {
  subjects: Subject[];
  onUpdateItem: (subjectId: string, itemId: string, updates: Partial<StudyItem> & { exercisesDelta?: number }, logEntry?: Omit<StudyLog, 'id'>) => void;
}

const StudyTimer: React.FC<StudyTimerProps> = ({ subjects, onUpdateItem }) => {
  const [method, setMethod] = useState<'pomodoro' | 'three-hour' | 'custom'>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  // Progress tracking inputs
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [customNote, setCustomNote] = useState('');
  
  const timerRef = useRef<any>(null);

  const methods = [
    { id: 'pomodoro', label: 'Pomodoro', duration: 25 * 60, icon: Brain, description: '25 min study / 5 min break' },
    { id: 'three-hour', label: 'Deep Focus', duration: 180 * 60, icon: Zap, description: 'High intensity session' },
    { id: 'custom', label: 'Quick Sprint', duration: 10 * 60, icon: Target, description: 'Short review burst' },
  ];

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedItem = selectedSubject?.items.find(i => i.id === selectedItemId);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerEnd();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerEnd = () => {
    setIsActive(false);
    if (!isBreak) {
      setShowSummary(true);
    } else {
      setIsBreak(false);
      const m = methods.find(met => met.id === method);
      setTimeLeft(m?.duration || 25 * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMethodChange = (newMethod: any) => {
    setMethod(newMethod.id);
    setTimeLeft(newMethod.duration);
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    const m = methods.find(met => met.id === method);
    setTimeLeft(m?.duration || 25 * 60);
  };

  const handleSaveProgress = () => {
    if (!selectedSubjectId || !selectedItemId || !selectedItem) return;
    
    // Fix: Changed exercisesAdded to exercises_added to align with StudyLog type
    onUpdateItem(
      selectedSubjectId, 
      selectedItemId, 
      { exercisesDelta: tasksCompleted },
      { 
        timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }), 
        note: customNote || `Study session for ${selectedItem.type}: ${selectedItem.title} (${method}).`,
        exercises_added: tasksCompleted > 0 ? tasksCompleted : undefined
      }
    );
    
    setShowSummary(false);
    setTasksCompleted(0);
    setCustomNote('');
    resetTimer();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-poppins font-bold text-slate-800 tracking-tight">Study Focus</h1>
        <p className="text-slate-500 font-medium">Select your goal, start the timer, and master your modules.</p>
      </header>

      {!showSummary ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Brain size={20} className="text-emerald-600" /> Session Goal
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                  <select
                    disabled={isActive}
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setSelectedItemId('');
                    }}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50"
                  >
                    <option value="">Select Module</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                
                {selectedSubjectId && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Study Element (Chapter/TD/TP)</label>
                    <select
                      disabled={isActive}
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50"
                    >
                      <option value="">Choose your focus point</option>
                      {selectedSubject?.items.map(i => (
                        <option key={i.id} value={i.id}>{i.type}: {i.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMethodChange(m)}
                  disabled={isActive}
                  className={`flex items-center gap-5 p-6 rounded-[32px] border-2 transition-all text-left group ${
                    method === m.id 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100 scale-[1.02]' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200'
                  } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`p-4 rounded-2xl transition-colors ${method === m.id ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                    <m.icon size={28} />
                  </div>
                  <div>
                    <div className="font-bold text-base leading-tight">{m.label}</div>
                    <div className={`text-xs mt-0.5 font-medium ${method === m.id ? 'text-emerald-100' : 'text-slate-400'}`}>{m.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white p-12 md:p-20 rounded-[64px] border border-slate-100 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -ml-32 -mb-32" />

            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-[1.02]">
              <svg className="w-full h-full -rotate-90 transform">
                <circle cx="50%" cy="50%" r="46%" fill="none" stroke="#f8fafc" strokeWidth="10" />
                <circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  fill="none"
                  stroke={isBreak ? "#34d399" : "#10b981"}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - (timeLeft / (methods.find(met => met.id === method)?.duration || 1) * 100)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <span className="text-7xl md:text-9xl font-poppins font-bold text-slate-900 tracking-tighter tabular-nums drop-shadow-sm">
                  {formatTime(timeLeft)}
                </span>
                <div className="flex items-center gap-2 mt-4 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isBreak ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {isBreak ? 'Refreshing Break' : 'Deep Focus Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 mt-16 z-10">
              <button
                onClick={resetTimer}
                className="p-5 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all shadow-sm active:scale-90"
              >
                <RotateCcw size={28} />
              </button>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`p-10 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 z-20 ${
                  isActive 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-slate-900 text-white shadow-emerald-200'
                }`}
              >
                {isActive ? <Pause size={44} /> : <Play size={44} className="ml-1.5" />}
              </button>
              <button
                disabled={!isActive}
                onClick={handleTimerEnd}
                className="p-5 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all disabled:opacity-30 active:scale-90"
              >
                <Coffee size={28} />
              </button>
            </div>
            
            {selectedItem && (
              <div className="mt-12 flex items-center gap-3 text-emerald-700 bg-emerald-50/80 backdrop-blur-md px-6 py-3 rounded-[24px] border border-emerald-100 z-10 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
                <Target size={18} className="animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-tight">Studying: {selectedSubject?.name} • {selectedItem.title}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-16 rounded-[64px] border border-slate-100 shadow-2xl max-w-3xl mx-auto space-y-10 animate-in zoom-in-95 duration-500 text-center">
          <div>
            <div className="inline-flex p-8 bg-emerald-50 text-emerald-600 rounded-[32px] mb-6 shadow-sm">
              <CheckCircle size={80} />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Session Mastered</h2>
            <p className="text-slate-500 mt-3 font-medium text-lg">Consistent effort builds academic excellence. Update your progress logs below.</p>
          </div>
          
          <div className="space-y-8 text-left">
            <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-6">
              {selectedItem ? (
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                     <label className="text-base font-bold text-slate-800">Tasks / Exercises Completed</label>
                     <p className="text-xs text-slate-400 font-medium">Record how many steps you finished for <span className="text-emerald-600 font-bold">{selectedItem.title}</span>.</p>
                  </div>
                  <div className="flex items-center gap-6 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <button 
                      onClick={() => setTasksCompleted(Math.max(0, tasksCompleted - 1))}
                      className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-600 transition-all hover:bg-white hover:shadow-sm"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-slate-900 w-10 text-center">{tasksCompleted}</span>
                    <button 
                      onClick={() => setTasksCompleted(tasksCompleted + 1)}
                      className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-600 transition-all hover:bg-white hover:shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-center gap-4 text-amber-800">
                  <AlertCircle size={24} className="shrink-0" />
                  <p className="text-sm font-bold">Progress wasn't linked to a specific item. You can still save a general session note.</p>
                </div>
              )}
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
                  <MessageSquare size={16} className="text-emerald-500" />
                  Session Reflection
                </label>
                <textarea 
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Capture key takeaways or details of exercises solved..."
                  className="w-full px-6 py-5 bg-white border border-slate-100 rounded-[28px] text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 h-32 resize-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => { setShowSummary(false); resetTimer(); }}
                className="flex-1 py-5 bg-slate-50 text-slate-500 font-bold rounded-[24px] hover:bg-slate-100 transition-all"
              >
                Discard Result
              </button>
              <button
                onClick={handleSaveProgress}
                className="flex-[2] py-5 bg-emerald-600 text-white font-bold rounded-[24px] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 px-10"
              >
                <Save size={24} />
                Sync Progress to HNS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
