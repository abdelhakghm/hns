
import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudyItem, StudyLog } from '../types';
import { Play, Pause, RotateCcw, Coffee, Zap, Brain, Target, CheckCircle, Save, MessageSquare, AlertCircle } from 'lucide-react';

interface StudyTimerProps {
  subjects: Subject[];
  onUpdateItem: (subjectId: string, itemId: string, updates: Partial<StudyItem> & { exercisesDelta?: number }, logEntry?: Omit<StudyLog, 'id'>) => void;
}

const StudyTimer: React.FC<StudyTimerProps> = ({ subjects, onUpdateItem }) => {
  const [method, setMethod] = useState<'pomodoro' | 'three-hour' | 'custom'>('pomodoro');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  // Log inputs
  const [exercisesAdded, setExercisesAdded] = useState(0);
  const [customNote, setCustomNote] = useState('');
  
  const timerRef = useRef<any>(null);

  const methods = [
    { id: 'pomodoro', label: 'Pomodoro', duration: 25 * 60, icon: Brain, description: '25 min study / 5 min break' },
    { id: 'three-hour', label: 'Deep Focus', duration: 180 * 60, icon: Zap, description: 'Long intensity sessions' },
    { id: 'custom', label: 'Quick Sprint', duration: 10 * 60, icon: Target, description: 'Short review burst' },
  ];

  // Current selection helpers
  const currentSubject = subjects.find(s => s.id === selectedSubject);
  const currentItem = currentSubject?.items.find(i => i.id === selectedItem);

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
    if (!selectedSubject || !selectedItem || !currentItem) return;
    
    // We send an atomic delta instead of a pre-calculated sum
    // to ensure accuracy if the state updated during the session.
    onUpdateItem(
      selectedSubject, 
      selectedItem, 
      { exercisesDelta: exercisesAdded },
      { 
        timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        note: customNote || `Focused study session completed (${method}).`,
        exercisesAdded: exercisesAdded > 0 ? exercisesAdded : undefined
      }
    );
    
    setShowSummary(false);
    setExercisesAdded(0);
    setCustomNote('');
    resetTimer();
  };

  const canSave = selectedSubject && selectedItem && currentItem;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-poppins font-bold text-slate-800">Focus Session</h1>
        <p className="text-slate-500">Select your material and dive deep into your studies.</p>
      </header>

      {!showSummary ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Methods Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Study Technique</h2>
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMethodChange(m)}
                disabled={isActive}
                className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all text-left ${
                  method === m.id 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`p-2 rounded-xl ${method === m.id ? 'bg-emerald-500' : 'bg-slate-100 text-slate-500'}`}>
                  <m.icon size={24} />
                </div>
                <div>
                  <div className="font-bold">{m.label}</div>
                  <div className={`text-xs ${method === m.id ? 'text-emerald-100' : 'text-slate-400'}`}>{m.description}</div>
                </div>
              </button>
            ))}

            <div className="pt-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Target Material</h2>
              <div className="space-y-3">
                <select
                  disabled={isActive}
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedItem('');
                  }}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                
                {selectedSubject && (
                  <select
                    disabled={isActive}
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                  >
                    <option value="">Select Chapter/TD</option>
                    {currentSubject?.items.map(i => (
                      <option key={i.id} value={i.id}>{i.title} ({i.type})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Timer Circle */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center bg-white p-12 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center z-10">
              <svg className="w-full h-full -rotate-90 transform">
                <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke={isBreak ? "#10b981" : "#059669"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - (timeLeft / (methods.find(met => met.id === method)?.duration || 1) * 100)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl md:text-8xl font-poppins font-bold text-slate-800 tracking-tighter">
                  {formatTime(timeLeft)}
                </span>
                <span className={`text-sm font-bold uppercase tracking-widest mt-2 ${isBreak ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {isBreak ? 'Break Time' : 'Focus Session'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-12 z-10">
              <button
                onClick={resetTimer}
                className="p-4 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                title="Reset Timer"
              >
                <RotateCcw size={24} />
              </button>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`p-8 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 z-20 ${
                  isActive 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-emerald-600 text-white shadow-emerald-200'
                }`}
              >
                {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
              </button>
              <button
                disabled={!isActive}
                onClick={handleTimerEnd}
                className="p-4 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all disabled:opacity-30"
                title="Finish Session Early"
              >
                <Coffee size={24} />
              </button>
            </div>
            
            {selectedSubject && (
              <div className="mt-8 flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 z-10 animate-in fade-in slide-in-from-bottom-2">
                <Target size={16} />
                <span className="text-xs font-bold uppercase tracking-tight">Active: {currentSubject?.name} {currentItem ? `> ${currentItem.title}` : ''}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-xl max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
          <div className="text-center">
            <div className="inline-flex p-6 bg-emerald-50 text-emerald-600 rounded-full mb-4">
              <CheckCircle size={64} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Session Complete!</h2>
            <p className="text-slate-500 mt-2">Mastery is built one session at a time. Record your progress below.</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              {canSave ? (
                <div className="flex items-center justify-between">
                  <div>
                     <label className="text-sm font-bold text-slate-600">Exercises Solved During Session</label>
                     <p className="text-[10px] text-slate-400 font-medium">This will be added to your existing progress for <span className="text-emerald-600 font-bold">{currentItem.title}</span>.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setExercisesAdded(Math.max(0, exercisesAdded - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold text-slate-800 w-8 text-center">{exercisesAdded}</span>
                    <button 
                      onClick={() => setExercisesAdded(exercisesAdded + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-700">
                  <AlertCircle size={20} />
                  <p className="text-xs font-medium">No specific material was selected. Progress cannot be recorded to a material unless selected beforehand.</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <MessageSquare size={14} />
                  Session Notes
                </label>
                <textarea 
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="What did you achieve? (e.g., 'Solved exercise 1 to 3 from TD1')"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowSummary(false);
                  resetTimer();
                }}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleSaveProgress}
                disabled={!canSave}
                className="flex-2 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 px-8 disabled:opacity-50 disabled:shadow-none"
              >
                <Save size={20} />
                Update My Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
