
import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudyItem, StudyLog } from '../types';
import { 
  Play, Pause, RotateCcw, CheckCircle, Zap, 
  Settings, Gauge, Flame, Save, X, ChevronDown, TrendingUp,
  Timer, Clock, Activity, Coffee, Brain, Bell, BellOff, Volume2, VolumeX
} from 'lucide-react';

interface StudyTimerProps {
  subjects: Subject[];
  onUpdateItem: (subjectId: string, itemId: string, updates: Partial<StudyItem> & { exercisesDelta?: number }, logEntry?: Omit<StudyLog, 'id'>) => void;
  onLogSession: (subjectId: string | null, durationSeconds: number) => void;
}

const SEGMENTS = 80;
const PRESETS = [
  { label: 'SPRINT', mins: 25, icon: Zap },
  { label: 'DEEP', mins: 50, icon: Brain },
  { label: 'ENDURANCE', mins: 90, icon: Flame },
];

const StudyTimer: React.FC<StudyTimerProps> = ({ subjects, onUpdateItem, onLogSession }) => {
  const [durationValue, setDurationValue] = useState(25);
  const [sessionDuration, setSessionDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [overtime, setOvertime] = useState(0);
  
  const [isActive, setIsActive] = useState(false);
  const [isFlowMode, setIsFlowMode] = useState(false); // When timeLeft reaches 0, switch to overtime
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [solvedInSession, setSolvedInSession] = useState<number>(0);
  const [sessionNote, setSessionNote] = useState<string>('Deep work session.');
  const [showConfig, setShowConfig] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const timerRef = useRef<any>(null);

  const updateSessionTime = (mins: number) => {
    const seconds = mins * 60;
    setSessionDuration(seconds);
    setDurationValue(mins);
    if (!isActive) {
      setTimeLeft(seconds);
      setOvertime(0);
      setIsFlowMode(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (timeLeft > 0) {
          setTimeLeft(prev => prev - 1);
        } else {
          setIsFlowMode(true);
          setOvertime(prev => prev + 1);
        }
      }, 1000);
      setShowConfig(false);
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
    const durationSpent = (sessionDuration - timeLeft) + overtime;
    if (durationSpent > 0) {
      onLogSession(selectedSubjectId || null, durationSpent);
    }

    if (selectedSubjectId && selectedItemId) {
      onUpdateItem(selectedSubjectId, selectedItemId, { exercisesDelta: solvedInSession }, {
        timestamp: new Date().toISOString(),
        note: sessionNote + (overtime > 0 ? ` [Flow Mode: +${Math.floor(overtime/60)}m]` : ''),
        exercises_added: solvedInSession
      });
    }
    setShowSummary(false);
    setTimeLeft(sessionDuration);
    setOvertime(0);
    setIsFlowMode(false);
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

  const currentSolved = selectedItem?.exercisesSolved || 0;
  const totalItems = selectedItem?.totalExercises || 1;
  const projectedSolved = Math.min(totalItems, currentSolved + solvedInSession);
  const projectedPercent = Math.round((projectedSolved / totalItems) * 100);

  const progressPercent = (timeLeft / sessionDuration);
  const activeSegments = Math.ceil(progressPercent * SEGMENTS);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {!showSummary ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: INSTRUMENT PANEL (Controls & Config) */}
          <div className="lg:col-span-4 order-2 lg:order-1 space-y-8">
            <div className="glass-card p-8 rounded-[32px] border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
                     <Gauge size={16} />
                   </div>
                   <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Manual Controls</h3>
                 </div>
                 <div className="flex gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-slate-800'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${isFlowMode ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]' : 'bg-slate-800'}`} />
                 </div>
              </div>

              {!isActive && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                  {/* Presets Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {PRESETS.map((preset) => {
                      const Icon = preset.icon;
                      const isSelected = durationValue === preset.mins;
                      return (
                        <button
                          key={preset.label}
                          onClick={() => updateSessionTime(preset.mins)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            isSelected 
                              ? 'bg-emerald-600/10 border-emerald-500/40 text-emerald-400' 
                              : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={16} className={isSelected ? 'text-emerald-400' : 'text-slate-600'} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{preset.label}</span>
                          </div>
                          <span className="font-mono text-xs">{preset.mins}M</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Manual Override */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1 text-center block">Manual Chrono Offset</label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        value={durationValue}
                        onChange={(e) => updateSessionTime(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-emerald-500/50"
                      />
                      <button onClick={() => updateSessionTime(Math.max(1, durationValue - 5))} className="px-4 bg-slate-900 border border-white/10 rounded-xl text-slate-500 hover:text-white">-5</button>
                      <button onClick={() => updateSessionTime(durationValue + 5)} className="px-4 bg-slate-900 border border-white/10 rounded-xl text-slate-500 hover:text-white">+5</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Context Selector */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Registry Target</span>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => { setSelectedSubjectId(e.target.value); setSelectedItemId(''); }}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-[10px] font-bold text-white outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Module</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <select
                  disabled={!selectedSubjectId}
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-[10px] font-bold text-emerald-500 outline-none focus:border-emerald-500 disabled:opacity-30"
                >
                  <option value="">Select Unit</option>
                  {selectedSubject?.items.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                </select>
              </div>

              {/* Utility Toggles */}
              <div className="flex gap-2 pt-4 border-t border-white/5">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`flex-1 py-3 border rounded-xl flex items-center justify-center gap-2 transition-all ${soundEnabled ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-white/5 text-slate-600'}`}
                >
                  {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span className="text-[9px] font-bold uppercase tracking-widest">Audio</span>
                </button>
                <button className="flex-1 py-3 border border-white/5 rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:text-slate-400">
                  <Bell size={14} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Alerts</span>
                </button>
              </div>
            </div>
          </div>

          {/* CENTER: THE INSTRUMENT (Timer Display) */}
          <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col items-center justify-center py-6 md:py-12 lg:py-0">
            <div className="relative scale-90 md:scale-100">
              {/* Dynamic Glow Background */}
              <div className={`absolute -inset-16 md:inset-[-6rem] rounded-full blur-[80px] md:blur-[120px] transition-all duration-1000 pointer-events-none opacity-40 ${isFlowMode ? 'bg-amber-500/20' : isActive ? 'bg-emerald-500/20' : 'bg-slate-500/5'}`} />

              {/* Timer Core Structure */}
              <div className="relative w-72 h-72 md:w-[480px] md:h-[480px] flex items-center justify-center glass-card rounded-full border-white/5 p-4 md:p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                
                {/* Hardware Dial (Dashed Borders) */}
                <div className="absolute inset-4 rounded-full border border-dashed border-white/10 animate-[spin_120s_linear_infinite]" />
                <div className="absolute inset-8 rounded-full border border-white/5" />
                
                {/* Segmented Progress Ring */}
                <div className="absolute inset-0 rotate-[-90deg]">
                  {[...Array(SEGMENTS)].map((_, i) => {
                    const angle = (i / SEGMENTS) * 360;
                    const isLit = isFlowMode ? true : i < activeSegments;
                    return (
                      <div 
                        key={i}
                        className="absolute top-1/2 left-1/2 w-full h-[1px] -translate-y-1/2 px-1 md:px-2"
                        style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                      >
                        <div 
                          className={`h-full w-1.5 md:w-3 ml-auto transition-all duration-300 ${isFlowMode ? 'animate-pulse' : ''} ${
                            isLit 
                              ? isFlowMode ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-emerald-400 shadow-[0_0_10px_#10b981]' 
                              : 'bg-white/5'
                          }`}
                          style={{ borderRadius: '1px' }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col items-center justify-center text-center space-y-3 md:space-y-6">
                  <div className="flex items-center gap-3 px-4 py-1.5 md:px-6 md:py-2 bg-slate-950/80 rounded-full border border-white/10">
                    <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isFlowMode ? 'bg-amber-500 animate-pulse' : isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'}`} />
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-400 tracking-[0.3em] md:tracking-[0.4em] uppercase">
                      {isFlowMode ? 'Flow State active' : isActive ? 'Node Link Stable' : 'Unit Standby'}
                    </span>
                  </div>

                  {/* Main Time Readout */}
                  <div className="relative group">
                    <h1 className={`font-mono text-7xl md:text-[140px] font-light leading-none tracking-tighter transition-all duration-700 tabular-nums ${
                      isFlowMode ? 'text-amber-400' : isActive ? 'text-white' : 'text-slate-800'
                    }`}>
                      {isFlowMode ? formatTime(overtime) : formatTime(timeLeft)}
                    </h1>
                    {isFlowMode && (
                      <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 text-amber-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                        <TrendingUp size={10} className="md:size-3" /> Overtime Flux
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Circle */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 md:translate-y-1/2 flex items-center gap-4 md:gap-6">
                <button
                  onClick={() => { setIsActive(false); setTimeLeft(sessionDuration); setOvertime(0); setIsFlowMode(false); }}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-90"
                >
                  <RotateCcw size={18} className="md:size-5" />
                </button>
                
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-4 ${
                    isFlowMode 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20' 
                    : isActive 
                      ? 'bg-slate-900 text-emerald-500 border-white/10 shadow-emerald-500/5' 
                      : 'bg-emerald-600 text-white border-emerald-500/50 hover:bg-emerald-500 shadow-emerald-600/30'
                  }`}
                >
                  {isActive ? <Pause size={28} className="md:size-9" fill="currentColor" /> : <Play size={28} className="md:size-9 ml-1 md:ml-2" fill="currentColor" />}
                </button>

                <button 
                  onClick={completeSession}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all active:scale-90 ${!isActive && timeLeft === sessionDuration && overtime === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                  <X size={18} className="md:size-5" />
                </button>
              </div>
            </div>

            <div className="mt-20 md:mt-24 text-center">
               <p className="text-[8px] md:text-[9px] font-bold text-slate-800 uppercase tracking-[0.4em] md:tracking-[0.6em]">Hardware Level: Chronos MK-II</p>
            </div>
          </div>
        </div>
      ) : (
        /* SUMMARY MODAL - Hardware Style */
        <div className="w-full max-w-2xl mx-auto glass-card p-10 md:p-16 rounded-[48px] border-emerald-500/20 shadow-3xl animate-in zoom-in duration-500 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/40" />
           
           <div className="relative z-10 space-y-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-600 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-emerald-900/40">
                    <CheckCircle size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-poppins font-bold text-white tracking-tight">Focus Terminated</h2>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.3em] mt-1 italic">Registry Committing Enabled</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Active Time</p>
                   <p className="font-mono text-2xl text-white">+{Math.floor((sessionDuration - timeLeft + overtime) / 60)}m</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Load Completed</label>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Impact: {projectedPercent}%</span>
                  </div>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xs uppercase">Solved</div>
                    <input 
                      type="number" 
                      value={solvedInSession}
                      onChange={(e) => setSolvedInSession(parseInt(e.target.value) || 0)}
                      className="w-full pl-24 pr-6 py-5 bg-slate-950 border border-white/10 rounded-2xl text-2xl font-bold text-emerald-500 outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="px-4 py-3 bg-slate-900/50 rounded-2xl border border-white/5 space-y-2">
                     <p className="text-[9px] font-bold text-slate-600 uppercase">Registry Status</p>
                     <p className="text-xs font-medium text-slate-400">Current: {currentSolved} → Projected: {projectedSolved} / {totalItems}</p>
                     <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500/40" style={{ width: `${Math.round((currentSolved/totalItems)*100)}%` }} />
                        <div className="h-full bg-emerald-500 absolute top-0 left-0" style={{ width: `${projectedPercent}%` }} />
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-4">Post-Session Observations</label>
                  <textarea 
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    className="w-full h-40 p-6 bg-slate-950 border border-white/10 rounded-2xl text-[11px] text-slate-400 outline-none focus:border-emerald-500/50 resize-none font-medium leading-relaxed"
                    placeholder="Brief architectural overview of focused cognitive work..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => { setShowSummary(false); setShowConfig(true); }}
                  className="flex-1 py-5 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-slate-300 border border-white/5 rounded-2xl hover:bg-white/5"
                >
                  Discard Flush
                </button>
                <button 
                  onClick={handleLogProgress}
                  className="flex-[2] py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest"
                >
                  <Save size={18} />
                  Write To Registry
                </button>
              </div>
           </div>
           
           <div className="absolute bottom-0 right-0 p-12 opacity-[0.02] pointer-events-none">
              <Zap size={240} />
           </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
