
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
        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] animate-pulse">Retrieving Academic Yield Data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-24 animate-in fade-in duration-700">
      {/* Sync Indicator */}
      <div className={`fixed top-8 right-8 z-[200] flex items-center gap-3 bg-emerald-600 px-4 py-2 rounded-xl shadow-lg transition-all duration-300 ${isSyncing ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <RefreshCw size={14} className="text-white animate-spin" />
        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Saving Yield...</span>
      </div>

      {/* Semester Selector */}
      <div className="flex flex-col items-center gap-4">
        <div className="bg-slate-900/60 border border-white/10 p-1.5 rounded-2xl flex gap-2">
          {[1, 2].map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y as 1 | 2)}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                selectedYear === y 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {y === 1 ? 'First Year' : 'Second Year'}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-1.5 rounded-2xl flex gap-2">
          {[1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSemester(s as 1 | 2)}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                selectedSemester === s 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Semester {s}
            </button>
          ))}
        </div>
      </div>

      {/* Yield Hero Card */}
      <section className="glass-card rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
          <Calculator size={320} className="animate-pulse" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="relative w-40 h-40 md:w-56 md:h-56 shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
              <circle
                cx="50%" cy="50%" r="42%" fill="none"
                stroke={results.semesterAvg >= 10 ? '#10b981' : '#ef4444'} 
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * Math.min(20, results.semesterAvg) / 20)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-poppins font-bold text-white flex items-start">
                {results.semesterAvg.toFixed(2)}
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">L{selectedYear} S{selectedSemester} Yield</span>
            </div>
          </div>

          <div className="space-y-6 text-center md:text-left flex-1">
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="px-4 py-1.5 bg-emerald-950/30 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={12} /> Total Coefficient: {results.totalCoefSum}
              </div>
              <div className={`px-4 py-1.5 border rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                results.semesterAvg >= 10 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {results.semesterAvg >= 10 ? <Award size={12} /> : <AlertCircle size={12} />}
                {results.semesterAvg >= 10 ? 'HNS Standard Met' : 'Yield Under Target'}
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white tracking-tight">
              {selectedYear === 1 ? 'First Year' : 'Second Year'} - Semester {selectedSemester} <span className="text-emerald-500 italic">Academic Flux</span>
            </h2>
            
            <p className="text-sm text-slate-500 max-w-lg leading-relaxed font-medium">
              Institutional weighted average monitoring for {selectedYear === 1 ? 'First Year' : 'Second Year'} Semester {selectedSemester}. Final averages are persistent and linked to your student ID.
            </p>
          </div>
        </div>
      </section>

      {/* Units Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {currentStructure.map(unit => (
          <div key={unit.id} className="glass-card rounded-[32px] p-6 md:p-8 flex flex-col h-full border-transparent hover:border-emerald-500/10 transition-all duration-500 group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-600/20 border border-emerald-500/20 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-tight">{unit.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Scientific Module Container</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold font-poppins ${results.unitAverages[unit.id] >= 10 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {results.unitAverages[unit.id].toFixed(2)}
                </div>
                <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Unit Avg / 20</div>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              {unit.subjects.map(sub => (
                <div key={sub.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4 hover:bg-slate-900/60 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-white truncate">{sub.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Coef {sub.coef}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xl font-bold font-poppins transition-colors duration-500 ${results.subjectAverages[sub.id] >= 10 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {results.subjectAverages[sub.id].toFixed(2)}
                      </div>
                      <div className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">Module Avg</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {sub.hasTD && (
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ml-1">TD ({(sub.weights.td * 100).toFixed(0)}%)</label>
                        <input
                          type="number"
                          value={grades[sub.id]?.td ?? ''}
                          onChange={(e) => handleInputChange(sub.id, 'td', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-400 outline-none focus:border-emerald-500 transition-all text-center"
                        />
                      </div>
                    )}
                    {sub.hasTP && (
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ml-1">TP ({(sub.weights.tp * 100).toFixed(0)}%)</label>
                        <input
                          type="number"
                          value={grades[sub.id]?.tp ?? ''}
                          onChange={(e) => handleInputChange(sub.id, 'tp', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-400 outline-none focus:border-emerald-500 transition-all text-center"
                        />
                      </div>
                    )}
                    <div className={`${(sub.hasTD || sub.hasTP) ? 'col-span-1' : 'col-span-3'} space-y-1.5`}>
                      <label className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ml-1">Exam ({(sub.weights.exam * 100).toFixed(0)}%)</label>
                      <input
                        type="number"
                        value={grades[sub.id]?.exam ?? ''}
                        onChange={(e) => handleInputChange(sub.id, 'exam', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-400 outline-none focus:border-emerald-500 transition-all text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <footer className="glass-card p-6 rounded-[24px] border border-emerald-500/10 opacity-60 flex items-center gap-4">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Info size={18} /></div>
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
          Final semester averages are calculated and stored persistently in the HNS student registry. 
          Module-level entries are processed in real-time for yield analysis.
        </p>
      </footer>
    </div>
  );
};

export default GradesCalculator;
