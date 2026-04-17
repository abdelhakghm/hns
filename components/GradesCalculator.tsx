
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  GraduationCap, 
  BookOpen, 
  Award, 
  AlertCircle,
  Zap,
  Info,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { db } from '../services/dbService.ts';

interface GradeInput {
  td?: number;
  tp?: number;
  exam?: number;
}

interface SubjectConfig {
  id: string;
  name: string;
  coef: number;
  hasTD: boolean;
  hasTP: boolean;
  weights: {
    td: number;
    tp: number;
    exam: number;
  };
}

interface UnitConfig {
  id: string;
  name: string;
  subjects: SubjectConfig[];
}

const L1_S1_STRUCTURE: UnitConfig[] = [
  {
    id: 'l1s1_u1',
    name: 'Unit 1: Unité Fondamentale 1',
    subjects: [
      { id: 'l1s1_analysis1', name: 'Mathematical Analysis 1', coef: 6, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
      { id: 'l1s1_stats', name: 'Statistics', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
      { id: 'l1s1_algebra1', name: 'Algebra 1', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
    ]
  },
  {
    id: 'l1s1_u2',
    name: 'Unit 2: Unité Fondamentale 2',
    subjects: [
      { id: 'l1s1_chem1', name: 'Chemistry 1', coef: 5, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
      { id: 'l1s1_phys1', name: 'Physics 1', coef: 5, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
    ]
  },
  {
    id: 'l1s1_u3',
    name: 'Unit 3: Unité Méthodologie',
    subjects: [
      { id: 'l1s1_cs1', name: 'Computer Science 1', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
      { id: 'l1s1_cad1', name: 'Computer Aided Design 1', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
    ]
  },
  {
    id: 'l1s1_u4',
    name: 'Unit 4: Unité Transversale',
    subjects: [
      { id: 'l1s1_eng1', name: 'English 1', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
      { id: 'l1s1_fr1', name: 'French 1', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
      { id: 'l1s1_econ1', name: 'Economics 1', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
      { id: 'l1s1_igh1', name: 'IGH 1', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
    ]
  }
];

const L1_S2_STRUCTURE: UnitConfig[] = [
  {
    id: 'l1s2_u1',
    name: 'Unit 1: Unité Fondamentale 1',
    subjects: [
      { id: 'l1s2_analysis2', name: 'Mathematical Analysis 2', coef: 5, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
      { id: 'l1s2_proba', name: 'Probabilities', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
      { id: 'l1s2_algebra2', name: 'Algebra 2', coef: 4, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
    ]
  },
  {
    id: 'l1s2_u2',
    name: 'Unit 2: Unité Fondamentale 2',
    subjects: [
      { id: 'l1s2_chem2', name: 'Chemistry 2', coef: 5, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
      { id: 'l1s2_phys2', name: 'Physics 2', coef: 5, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
    ]
  },
  {
    id: 'l1s2_u3',
    name: 'Unit 3: Unité Méthodologie',
    subjects: [
      { id: 'l1s2_cs2', name: 'Computer Science 2', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
      { id: 'l1s2_cad2', name: 'Computer Aided Design 2', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
    ]
  },
  {
    id: 'l1s2_u4',
    name: 'Unit 4: Unité Transversale',
    subjects: [
      { id: 'l1s2_eng2', name: 'English 2', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
      { id: 'l1s2_fr2', name: 'French 2', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
      { id: 'l1s2_econ2', name: 'Economics 2', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
      { id: 'l1s2_igh2', name: 'IGH 2', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
    ]
  }
];

const SEMESTER_1_STRUCTURE: UnitConfig[] = [
  {
    id: 'unit1',
    name: 'Unit 1: Fundamental Sciences I',
    subjects: [
      { id: 'analysis3', name: 'Analysis 3', coef: 4, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
      { id: 'num_analysis1', name: 'Numerical Analysis 1', coef: 2, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
    ]
  },
  {
    id: 'unit2',
    name: 'Unit 2: Physics & Chemistry I',
    subjects: [
      { id: 'physics3', name: 'Physics 3', coef: 4, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
      { id: 'chemistry', name: 'Chemistry', coef: 3, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
    ]
  },
  {
    id: 'unit3',
    name: 'Unit 3: Applied Mechanics I',
    subjects: [
      { id: 'rational_mech1', name: 'Rational Mechanics 1', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
      { id: 'gen_electricity', name: 'General Electricity', coef: 3, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
      { id: 'fluid_mechanics', name: 'Fluid Mechanics', coef: 3, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
    ]
  },
  {
    id: 'unit4',
    name: 'Unit 4: Computer Science I',
    subjects: [
      { id: 'computer_science3', name: 'Computer Science 3', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
    ]
  },
  {
    id: 'unit5',
    name: 'Unit 5: Engineering Tools I',
    subjects: [
      { id: 'engineering1', name: 'Engineering 1', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
    ]
  },
  {
    id: 'unit6',
    name: 'Unit 6: Communication & Languages I',
    subjects: [
      { id: 'english3', name: 'English 3', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
      { id: 'expressive_tech1', name: 'Expressive Techniques 1', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
    ]
  }
];

const SEMESTER_2_STRUCTURE: UnitConfig[] = [
  {
    id: 's2_unit1',
    name: 'Unit 1: Unité Fondamentale',
    subjects: [
      { id: 'analysis4', name: 'Mathematical Analysis 4', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
      { id: 'num_analysis2', name: 'Numerical Analysis 2', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
      { id: 'physics4', name: 'Physics 4', coef: 4, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
      { id: 'chemistry4', name: 'Chemistry 4', coef: 3, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
      { id: 'rational_mech2', name: 'Rational Mechanics 2', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
      { id: 'gen_electricity2', name: 'General Electricity 2', coef: 3, hasTD: true, hasTP: true, weights: { td: 0.25, tp: 0.25, exam: 0.5 } },
      { id: 'rom', name: 'Resistance of Materials', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
    ]
  },
  {
    id: 's2_unit2',
    name: 'Unit 2: Unité Méthodologie',
    subjects: [
      { id: 'computer_science4', name: 'Computer Science 4', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
    ]
  },
  {
    id: 's2_unit3',
    name: 'Unit 3: Unité Discovery',
    subjects: [
      { id: 'engineering2', name: 'Engineering 2', coef: 3, hasTD: true, hasTP: false, weights: { td: 0.5, tp: 0, exam: 0.5 } },
    ]
  },
  {
    id: 's2_unit4',
    name: 'Unit 4: Unité Transversale',
    subjects: [
      { id: 'english4', name: 'English 4', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
      { id: 'expressive_tech2', name: 'Expressive Techniques 2', coef: 1, hasTD: false, hasTP: false, weights: { td: 0, tp: 0, exam: 1.0 } },
    ]
  }
];

interface GradesCalculatorProps {
  userId: string;
}

const GradesCalculator: React.FC<GradesCalculatorProps> = ({ userId }) => {
  const [selectedYear, setSelectedYear] = useState<1 | 2>(2);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [grades, setGrades] = useState<Record<string, GradeInput>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const semesterDebounceRef = useRef<any>(null);

  const currentStructure = useMemo(() => {
    if (selectedYear === 1) {
      return selectedSemester === 1 ? L1_S1_STRUCTURE : L1_S2_STRUCTURE;
    }
    return selectedSemester === 1 ? SEMESTER_1_STRUCTURE : SEMESTER_2_STRUCTURE;
  }, [selectedYear, selectedSemester]);

  const yearlyStats = useMemo(() => {
    const calculateSemesterAvg = (structure: UnitConfig[]) => {
      let totalWeightedSum = 0;
      let totalCoefSum = 0;
      structure.forEach(unit => {
        unit.subjects.forEach(sub => {
          const input = grades[sub.id] || {};
          const td = input.td || 0;
          const tp = input.tp || 0;
          const exam = input.exam || 0;
          const subAvg = (td * sub.weights.td) + (tp * sub.weights.tp) + (exam * sub.weights.exam);
          totalWeightedSum += subAvg * sub.coef;
          totalCoefSum += sub.coef;
        });
      });
      return totalWeightedSum / (totalCoefSum || 1);
    };

    const s1 = calculateSemesterAvg(selectedYear === 1 ? L1_S1_STRUCTURE : SEMESTER_1_STRUCTURE);
    const s2 = calculateSemesterAvg(selectedYear === 1 ? L1_S2_STRUCTURE : SEMESTER_2_STRUCTURE);
    
    return {
      s1,
      s2,
      yearly: (s1 + s2) / 2
    };
  }, [grades, selectedYear]);

  const results = useMemo(() => {
    let totalWeightedSum = 0;
    let totalCoefSum = 0;
    const unitAverages: Record<string, number> = {};
    const subjectAverages: Record<string, number> = {};

    currentStructure.forEach(unit => {
      let unitWeightedSum = 0;
      let unitCoefSum = 0;

      unit.subjects.forEach(sub => {
        const input = grades[sub.id] || {};
        const td = input.td || 0;
        const tp = input.tp || 0;
        const exam = input.exam || 0;

        const subAvg = (td * sub.weights.td) + (tp * sub.weights.tp) + (exam * sub.weights.exam);
        subjectAverages[sub.id] = subAvg;

        unitWeightedSum += subAvg * sub.coef;
        unitCoefSum += sub.coef;
      });

      const unitAvg = unitWeightedSum / (unitCoefSum || 1);
      unitAverages[unit.id] = unitAvg;

      totalWeightedSum += unitWeightedSum;
      totalCoefSum += unitCoefSum;
    });

    const semesterAvg = totalWeightedSum / (totalCoefSum || 1);

    return { subjectAverages, unitAverages, semesterAvg, totalCoefSum };
  }, [grades, currentStructure]);

  // Handle Semester Average Persistence ONLY
  useEffect(() => {
    if (isInitialLoading) return;

    if (semesterDebounceRef.current) clearTimeout(semesterDebounceRef.current);
    
    semesterDebounceRef.current = setTimeout(async () => {
      if (!isNaN(results.semesterAvg) && results.semesterAvg > 0) {
        setIsSyncing(true);
        try {
          const semesterKey = `L${selectedYear} S${selectedSemester}`;
          await db.saveSemesterAverage(userId, semesterKey, results.semesterAvg);
        } catch (e) {
          console.error("Failed to persist semester average:", e);
        } finally {
          setIsSyncing(false);
        }
      }
    }, 1500);

    return () => clearTimeout(semesterDebounceRef.current);
  }, [results.semesterAvg, userId, isInitialLoading, selectedSemester]);

  const handleInputChange = (subjectId: string, type: keyof GradeInput, value: string) => {
    const numValue = value === '' ? undefined : Math.max(0, Math.min(20, parseFloat(value) || 0));
    
    setGrades(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [type]: numValue
      }
    }));
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse"></div>
          <Loader2 className="text-emerald-500 animate-spin relative" size={48} />
        </div>
        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] animate-pulse">Retrieving Academic Average Data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-24 animate-in fade-in duration-1000">
      {/* Sync Indicator */}
      <div className={`fixed top-8 right-8 z-[200] flex items-center gap-3 bg-slate-900 border border-emerald-500/30 px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 ${isSyncing ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Committing Flux...</span>
      </div>

      {/* Command Deck (Year/Semester & Aggregates) */}
      <div className="w-full max-w-6xl mx-auto px-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Year/Semester Selectors */}
          <div className="lg:col-span-4 flex flex-col gap-4">
             <div className="bg-slate-950/40 border border-white/5 p-1.5 rounded-[32px] backdrop-blur-xl flex gap-1.5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                {[1, 2].map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y as 1 | 2)}
                    className={`flex-1 flex flex-col items-center py-4 rounded-2xl transition-all relative z-10 ${
                      selectedYear === y 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_4px_20px_rgba(37,99,235,0.15)]' 
                        : 'text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <GraduationCap size={12} className={`mb-1.5 ${selectedYear === y ? 'opacity-100' : 'opacity-30'}`} />
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em]">L {y}</span>
                  </button>
                ))}
             </div>

             <div className="bg-slate-950/40 border border-white/5 p-1.5 rounded-[32px] backdrop-blur-xl flex gap-1.5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                {[1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSemester(s as 1 | 2)}
                    className={`flex-1 flex flex-col items-center py-4 rounded-2xl transition-all relative z-10 ${
                      selectedSemester === s 
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.15)]' 
                        : 'text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <RefreshCw size={12} className={`mb-1.5 ${selectedSemester === s ? 'animate-spin-slow' : 'opacity-30'}`} />
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em]">S {s}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Integrated Aggregate Display */}
          <div className="lg:col-span-8 bg-slate-950/40 border border-white/5 rounded-[32px] md:rounded-[40px] backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row shadow-2xl">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
             
             <div className="flex-1 p-6 md:p-8 flex flex-col items-center md:items-start justify-center border-b md:border-b-0 md:border-r border-white/5 relative z-10">
                <div className="flex items-center gap-3 mb-3 md:mb-4 opacity-40">
                   <TrendingUp size={14} className="text-emerald-500" />
                   <span className="text-[9px] font-sans font-bold uppercase tracking-[0.5em] text-white">Integrated Average</span>
                </div>
                <div className={`text-5xl md:text-7xl font-serif italic tracking-tighter tabular-nums ${yearlyStats.yearly >= 10 ? 'text-emerald-400' : 'text-slate-500'}`}>
                   {yearlyStats.yearly.toFixed(3)}
                </div>
             </div>

             <div className="p-6 md:p-8 flex items-center justify-around md:flex-col md:justify-center gap-6 md:gap-8 relative z-10 bg-white/[0.02]">
                <div className="flex flex-col items-center md:items-end gap-1">
                   <span className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full" /> P1 PHASE
                   </span>
                   <p className="text-xl md:text-2xl font-serif italic text-white/80">{yearlyStats.s1.toFixed(2)}</p>
                </div>
                <div className="h-8 w-px bg-white/5 md:hidden" />
                <div className="flex flex-col items-center md:items-end gap-1">
                   <span className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500/40 rounded-full" /> P2 PHASE
                   </span>
                   <p className="text-xl md:text-2xl font-serif italic text-white/80">{yearlyStats.s2.toFixed(2)}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Average Dashboard */}
      <section className="relative mx-4">
        {/* Immersive technical background */}
        <div className={`absolute -inset-12 blur-[120px] transition-all duration-1000 opacity-20 pointer-events-none ${results.semesterAvg >= 10 ? 'bg-emerald-500/30' : 'bg-red-500/30'}`} />
        
        <div className="relative glass-card rounded-[48px] md:rounded-[64px] p-6 md:p-16 border-white/5 overflow-hidden flex flex-col items-center justify-center shadow-2xl min-h-[400px] md:min-h-[700px]">
          {/* Micro-grid background */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          {/* Hardware Frame Elements */}
          <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 opacity-20 group">
             <div className="w-1.5 h-1.5 bg-white rounded-full group-hover:bg-emerald-500 transition-colors" />
             <span className="text-[8px] font-sans font-bold text-white uppercase tracking-[0.4em]">Node.02 // Status</span>
          </div>

          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex flex-col items-end gap-1 opacity-20">
             <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-1 h-3 rounded-full ${i < Math.floor(results.semesterAvg / 5) ? 'bg-emerald-500' : 'bg-white/20'}`} />
                ))}
             </div>
             <span className="text-[8px] font-sans font-bold text-white uppercase tracking-[0.4em]">Flux Capacity</span>
          </div>
          
          {/* Central Elegant Medallion (The Average) */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[520px] md:h-[520px] shrink-0 flex items-center justify-center scale-90 sm:scale-100">
            {/* Structural concentric rings */}
            <div className="absolute inset-0 rounded-full border border-white/5" />
            <div className="absolute inset-8 rounded-full border border-white/5" />
            <div className="absolute inset-16 rounded-full border border-white/5 shadow-inner" />
            
            {/* Spinning orbital markers */}
            <div className={`absolute inset-0 rounded-full border-t-2 border-l border-emerald-500/10 transition-all duration-1000 animate-[spin_40s_linear_infinite]`} />
            <div className={`absolute inset-12 rounded-full border-b-2 border-r border-white/5 transition-all duration-1000 animate-[spin_25s_linear_infinite_reverse]`} />
            
            {/* Advanced Radial Gauge with Ticks */}
            <div className="absolute inset-4 rounded-full">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-white/10" 
                  style={{ transform: `rotate(${i * 30}deg)` }}
                >
                  <div className="h-2 w-px bg-white/20 absolute top-0" />
                </div>
              ))}
            </div>
            
            <svg className="w-full h-full -rotate-90 relative z-20">
              <circle cx="50%" cy="50%" r="44%" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="1" />
              <circle
                cx="50%" cy="50%" r="44%" fill="none"
                stroke={results.semesterAvg >= 10 ? 'url(#emeraldLux)' : 'url(#redLux)'} 
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * Math.min(20, results.semesterAvg) / 20)}
                className="transition-all duration-1500 ease-out"
                style={{ strokeDasharray: '276 276' }}
              />
              <defs>
                <linearGradient id="emeraldLux" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="redLux" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content Area */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
              <div className="mb-2 md:mb-4 flex flex-col items-center">
                 <div className="p-1.5 md:p-2 bg-white/5 rounded-full mb-2 md:mb-3 border border-white/10">
                    <TrendingUp size={10} className={results.semesterAvg >= 10 ? 'text-emerald-400' : 'text-slate-500'} />
                 </div>
                 <span className="text-[8px] md:text-[10px] font-sans font-bold text-white/30 uppercase tracking-[0.8em] whitespace-nowrap">Average Score</span>
              </div>
              
              <div className="relative">
                <span className={`text-7xl sm:text-8xl md:text-[200px] font-serif italic font-light tracking-tighter tabular-nums leading-[0.8] ${results.semesterAvg >= 10 ? 'text-white' : 'text-slate-600'}`}>
                  {results.semesterAvg.toFixed(2)}
                </span>
                {/* Floating metric label */}
                <div className="absolute -top-3 md:-top-4 -right-6 md:-right-8 opacity-40">
                   <span className="text-[8px] md:text-[10px] font-sans font-bold uppercase tracking-widest text-white">GEN.VAL</span>
                </div>
              </div>

              <div className={`mt-8 md:mt-12 flex flex-col items-center gap-2 md:gap-3 transition-all duration-1000 ${
                results.semesterAvg >= 10 ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="h-px w-4 md:w-6 bg-current opacity-20" />
                  <div className="flex items-center gap-2 md:gap-3">
                    {results.semesterAvg >= 10 ? <Award size={14} className="animate-pulse" /> : <AlertCircle size={14} />}
                    <span className="text-[9px] md:text-[11px] font-sans font-bold uppercase tracking-[0.4em] md:tracking-[0.5em] whitespace-nowrap">
                      {results.semesterAvg >= 10 ? 'Elite Performance' : 'Standard Baseline'}
                    </span>
                  </div>
                  <div className="h-px w-4 md:w-6 bg-current opacity-20" />
                </div>
                
                {/* Minimalist health bar */}
                <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ${results.semesterAvg >= 10 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                    style={{ width: `${(results.semesterAvg / 20) * 100}%` }}
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Precision Coordinates decoration */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-[0.15] hidden md:block">
             <p className="text-[9px] font-mono font-bold text-white tracking-[1.2em] uppercase">Calculated Matrix S1:L2 // Institutional Core</p>
          </div>
        </div>
      </section>

      {/* Sub-System Modules (Units) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 px-4">
        {currentStructure.map(unit => (
          <div key={unit.id} className="relative group/unit">
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl opacity-0 group-hover/unit:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative glass-card rounded-[32px] md:rounded-[40px] p-6 md:p-8 border-white/5 hover:border-emerald-500/20 transition-all duration-500">
              
              <div className="flex items-center justify-between mb-8 md:mb-12">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-950 border border-white/5 rounded-[18px] md:rounded-[22px] flex items-center justify-center text-emerald-500 group-hover/unit:text-white group-hover/unit:bg-emerald-600 transition-all shadow-xl">
                    <Zap size={20} md:size={24} />
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    <h3 className="text-base md:text-lg font-serif italic font-bold text-white tracking-tight leading-tight">{unit.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-500/40 rounded-full animate-pulse" />
                      <p className="text-[8px] md:text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest">Active Segment</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="flex items-center justify-end gap-1.5 mb-0.5 md:mb-1 opacity-50">
                      <Zap size={8} md:size={10} />
                      <p className="text-[7px] md:text-[8px] font-sans font-bold text-slate-500 uppercase tracking-widest">PWR</p>
                   </div>
                   <div className={`text-2xl md:text-3xl font-serif italic font-light tracking-tighter ${results.unitAverages[unit.id] >= 10 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {results.unitAverages[unit.id].toFixed(2)}
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {unit.subjects.map(sub => (
                  <div key={sub.id} className="bg-slate-950/60 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 transition-all hover:bg-slate-950 hover:border-emerald-500/30">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="space-y-0.5 md:space-y-1 pr-4">
                        <h4 className="text-xs md:text-sm font-bold text-white tracking-tight leading-snug">{sub.name}</h4>
                        <div className="flex gap-3 md:gap-4">
                          <span className="text-[8px] md:text-[9px] font-mono font-bold text-emerald-500/60 uppercase tracking-widest underline decoration-dotted">C.{sub.coef}</span>
                          <span className="text-[8px] md:text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest">#{sub.id.split('_').pop()}</span>
                        </div>
                      </div>
                      <div className={`text-xl md:text-2xl font-mono font-bold transition-all duration-500 ${results.subjectAverages[sub.id] >= 10 ? 'text-emerald-500 translate-x-0' : 'text-slate-700'}`}>
                        {results.subjectAverages[sub.id].toFixed(2)}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                      {sub.hasTD && (
                        <div className="space-y-1.5 md:space-y-2">
                          <div className="flex items-center justify-center gap-1 md:gap-1.5 opacity-40">
                             <TrendingUp size={8} />
                             <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-[0.15em]">TD</label>
                          </div>
                          <input
                            type="number"
                            value={grades[sub.id]?.td ?? ''}
                            onChange={(e) => handleInputChange(sub.id, 'td', e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-lg md:rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-base md:text-lg font-mono font-bold text-emerald-400 outline-none focus:border-emerald-500/40 focus:bg-emerald-500/5 transition-all text-center placeholder:opacity-10 appearance-none"
                            placeholder="0"
                          />
                        </div>
                      )}
                      {sub.hasTP && (
                        <div className="space-y-1.5 md:space-y-2">
                          <div className="flex items-center justify-center gap-1 md:gap-1.5 opacity-40">
                             <Calculator size={8} />
                             <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-[0.15em]">TP</label>
                          </div>
                          <input
                            type="number"
                            value={grades[sub.id]?.tp ?? ''}
                            onChange={(e) => handleInputChange(sub.id, 'tp', e.target.value)}
                            className="w-full bg-slate-900 border border-white/5 rounded-lg md:rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-base md:text-lg font-mono font-bold text-emerald-400 outline-none focus:border-emerald-500/40 focus:bg-emerald-500/5 transition-all text-center placeholder:opacity-10 appearance-none"
                            placeholder="0"
                          />
                        </div>
                      )}
                      <div className={`${(sub.hasTD || sub.hasTP) ? 'col-span-1' : 'col-span-3'} space-y-1.5 md:space-y-2`}>
                        <div className="flex items-center justify-center gap-1 md:gap-1.5 opacity-40">
                           <Zap size={8} />
                           <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-[0.15em]">EXAM</label>
                        </div>
                        <input
                          type="number"
                          value={grades[sub.id]?.exam ?? ''}
                          onChange={(e) => handleInputChange(sub.id, 'exam', e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 rounded-lg md:rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-base md:text-lg font-mono font-bold text-emerald-400 outline-none focus:border-emerald-500/40 focus:bg-emerald-500/5 transition-all text-center placeholder:opacity-10 appearance-none"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-12 text-center opacity-20">
         <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.8em]">Average Synchronization Protocol v2.5</p>
      </div>
    </div>
  );
};

export default GradesCalculator;
