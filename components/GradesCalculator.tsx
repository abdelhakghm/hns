
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Loader2,
  LayoutDashboard
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
  const averageRef = useRef<HTMLElement>(null);

  const scrollToAverage = () => {
    averageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
          const semesterKey = `L${selectedYear}-S${selectedSemester}`;
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full animate-pulse" />
          <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-emerald-500">Initializing System</p>
          <p className="text-xs text-slate-500">Loading Academic Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 lg:space-y-24 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Top Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Selectors Column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[32px] shadow-2xl space-y-8 h-full">
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Navigation</p>
                 <h2 className="text-xl font-bold tracking-tight">Year Select</h2>
              </div>
              
              <div className="space-y-3">
                 {[1, 2].map((y) => (
                   <button
                     key={y}
                     onClick={() => setSelectedYear(y as 1 | 2)}
                     className={`w-full group relative flex items-center justify-between p-5 rounded-2xl transition-all border ${
                       selectedYear === y 
                         ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                         : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                        <GraduationCap size={16} className={selectedYear === y ? 'opacity-100' : 'opacity-20'} />
                        <span className="text-sm font-medium">{y === 1 ? 'First Year' : 'Second Year'}</span>
                     </div>
                     {selectedYear === y && (
                        <div className="flex gap-1">
                           {[...Array(3)].map((_, i) => (
                              <div key={i} className="w-1 h-1 bg-emerald-500 rounded-full" />
                           ))}
                        </div>
                     )}
                   </button>
                 ))}
              </div>

              <div className="h-px bg-white/5" />

              <div className="space-y-3">
                 {[1, 2].map((s) => (
                   <button
                     key={s}
                     onClick={() => setSelectedSemester(s as 1 | 2)}
                     className={`w-full group relative flex items-center justify-between p-5 rounded-2xl transition-all border ${
                       selectedSemester === s 
                         ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                         : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                        <RefreshCw size={16} className={selectedSemester === s ? 'opacity-100' : 'opacity-20'} />
                        <span className="text-sm font-medium">Semester {s}</span>
                     </div>
                     {selectedSemester === s && (
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                     )}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Global Aggregate Display */}
        <div className="lg:col-span-9 bg-[#0A0A0A] border border-white/5 rounded-[40px] p-8 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-inner">
           <div className="flex-1 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 mb-6">
                 <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Yearly Average</span>
                 </div>
              </div>
              
              <div className="relative">
                 <h1 className={`text-[100px] md:text-[140px] font-bold leading-none tracking-tighter ${yearlyStats.yearly >= 10 ? 'text-white' : 'text-slate-800'}`}>
                    {yearlyStats.yearly.toFixed(3)}
                 </h1>
                 <div className="absolute -bottom-2 right-0 flex flex-col items-end">
                    <span className="text-xl md:text-2xl font-semibold text-emerald-500/50">/ 20</span>
                 </div>
              </div>
           </div>

           <div className="w-full md:w-auto flex flex-col gap-4">
              {[
                { label: 'Semester 1', val: yearlyStats.s1 },
                { label: 'Semester 2', val: yearlyStats.s2 }
              ].map((phase, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl min-w-[220px] group">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-500">{phase.label}</span>
                   </div>
                   <div className="text-3xl font-bold text-white tracking-tight">
                      {phase.val.toFixed(2)}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Main Result Section */}
      <section ref={averageRef} className="relative group">
        <div className="relative bg-[#070707] border border-white/5 rounded-[48px] p-8 md:p-20 overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20">
             {/* The Instrument */}
             <div className="relative w-64 h-64 md:w-[400px] md:h-[400px] flex items-center justify-center shrink-0">
                <div className="absolute inset-0 border border-white/5 rounded-full" />
                
                <svg className="w-full h-full -rotate-90 relative z-10 p-4">
                  <circle cx="50%" cy="50%" r="46%" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                  <circle
                    cx="50%" cy="50%" r="46%" fill="none"
                    stroke={results.semesterAvg >= 10 ? '#10b981' : '#ef4444'} 
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray="290"
                    strokeDashoffset={290 - (290 * Math.min(20, results.semesterAvg) / 20)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Term Mean</p>
                   <span className={`text-7xl md:text-[120px] font-bold leading-none tracking-tighter ${results.semesterAvg >= 10 ? 'text-white' : 'text-slate-800'}`}>
                      {results.semesterAvg.toFixed(2)}
                   </span>
                </div>
             </div>

             <div className="flex-1 space-y-10">
                <div className="space-y-4">
                   <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white/90">Semester Result</h3>
                   <p className="text-slate-500 leading-relaxed text-sm max-w-md">
                      Calculated weighted average for the current term based on official institutional criteria.
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Weight</span>
                      <p className="text-3xl font-bold text-white">{results.totalCoefSum}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                      <AnimatePresence mode="wait">
                        <motion.p 
                          key={results.semesterAvg >= 10 ? 'passed' : 'failed'}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className={`text-3xl font-bold tracking-tight ${results.semesterAvg >= 10 ? 'text-emerald-500' : 'text-red-500'}`}
                        >
                          {results.semesterAvg >= 10 ? 'Admitted' : 'Not Admitted'}
                        </motion.p>
                      </AnimatePresence>
                   </div>
                </div>

                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-5">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${results.semesterAvg >= 10 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                      <Info size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] text-slate-400 leading-tight">
                         {results.semesterAvg >= 10 
                           ? `Threshold cleared for ${selectedYear === 1 ? 'First Year' : 'Second Year'} - Semester ${selectedSemester}.` 
                           : `Average is below the required threshold for ${selectedYear === 1 ? 'First Year' : 'Second Year'}.`}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Module List */}
      <div className="space-y-20">
        {currentStructure.map((unit, uIdx) => (
          <div key={unit.id} className="space-y-8">
            <div className="flex items-end justify-between border-b border-white/[0.08] pb-4">
               <div className="flex gap-3 items-center">
                  <span className="text-3xl font-bold text-white/10 italic">0{uIdx + 1}</span>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-white">{unit.name}</h3>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Unit Average</p>
                  <p className={`text-3xl font-bold tracking-tight ${results.unitAverages[unit.id] >= 10 ? 'text-emerald-500' : 'text-slate-800'}`}>
                    {results.unitAverages[unit.id].toFixed(2)}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unit.subjects.map(sub => (
                <div key={sub.id} className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-6 hover:border-emerald-500/20 transition-all group/sub">
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                       <h4 className="text-base font-semibold text-white group-hover/sub:text-emerald-400 transition-colors">{sub.name}</h4>
                       <span className="text-[10px] text-slate-500 font-medium tracking-wide">Weight: {sub.coef}</span>
                    </div>
                    <div className={`text-3xl font-bold tracking-tight ${results.subjectAverages[sub.id] >= 10 ? 'text-emerald-500' : 'text-slate-900 group-hover/sub:text-slate-700'}`}>
                      {results.subjectAverages[sub.id].toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {sub.hasTD && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center block">TD</label>
                        <input
                          type="number"
                          value={grades[sub.id]?.td ?? ''}
                          onChange={(e) => handleInputChange(sub.id, 'td', e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 text-lg font-bold text-white text-center focus:border-emerald-500/50 outline-none"
                          placeholder="-"
                        />
                      </div>
                    )}
                    {sub.hasTP && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center block">TP</label>
                        <input
                          type="number"
                          value={grades[sub.id]?.tp ?? ''}
                          onChange={(e) => handleInputChange(sub.id, 'tp', e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 text-lg font-bold text-white text-center focus:border-emerald-500/50 outline-none"
                          placeholder="-"
                        />
                      </div>
                    )}
                    <div className={`${(sub.hasTD || sub.hasTP) ? 'col-span-1' : 'col-span-3'} space-y-1.5`}>
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center block">Exam</label>
                      <input
                        type="number"
                        value={grades[sub.id]?.exam ?? ''}
                        onChange={(e) => handleInputChange(sub.id, 'exam', e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 text-lg font-bold text-emerald-500 text-center focus:border-emerald-500/50 outline-none"
                        placeholder="-"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Jump */}
      <motion.button
        onClick={scrollToAverage}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-12 right-12 w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg z-[200] group"
      >
         <Calculator size={22} className="group-hover:rotate-12 transition-transform" />
      </motion.button>
    </div>
  );
};

export default GradesCalculator;
