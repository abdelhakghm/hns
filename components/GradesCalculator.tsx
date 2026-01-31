
import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  GraduationCap, 
  BookOpen, 
  Award, 
  AlertCircle,
  Zap,
  Info
} from 'lucide-react';

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

const GradesCalculator: React.FC = () => {
  const [grades, setGrades] = useState<Record<string, GradeInput>>({});

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

  const results = useMemo(() => {
    let totalWeightedSum = 0;
    let totalCoefSum = 0;
    const unitAverages: Record<string, number> = {};
    const subjectAverages: Record<string, number> = {};

    SEMESTER_1_STRUCTURE.forEach(unit => {
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

      const unitAvg = unitWeightedSum / unitCoefSum;
      unitAverages[unit.id] = unitAvg;

      totalWeightedSum += unitWeightedSum;
      totalCoefSum += unitCoefSum;
    });

    const semesterAvg = totalWeightedSum / totalCoefSum;

    return { subjectAverages, unitAverages, semesterAvg };
  }, [grades]);

  return (
    <div className="space-y-8 md:space-y-12 pb-24 animate-in fade-in duration-700">
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
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">S1 Global Yield</span>
            </div>
          </div>

          <div className="space-y-6 text-center md:text-left flex-1">
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="px-4 py-1.5 bg-emerald-950/30 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={12} /> Total Coefficient: 30
              </div>
              <div className={`px-4 py-1.5 border rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                results.semesterAvg >= 10 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {results.semesterAvg >= 10 ? <Award size={12} /> : <AlertCircle size={12} />}
                {results.semesterAvg >= 10 ? 'HNS Standard Met' : 'Yield Under Target'}
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white tracking-tight">
              Semester 1 <span className="text-emerald-500 italic">Academic Flux</span>
            </h2>
            
            <p className="text-sm text-slate-500 max-w-lg leading-relaxed font-medium">
              Calculate your institutional weighted average for Semester 1. Ensure all TD, TP, and Exam grades are strictly between 0 and 20.
            </p>
          </div>
        </div>
      </section>

      {/* Units Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {SEMESTER_1_STRUCTURE.map(unit => (
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
                          placeholder="00.00"
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
                          placeholder="00.00"
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
                        placeholder="00.00"
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
          Semester average calculation protocol based on the HNS Higher School of Renewable Energies curriculum standards. 
          Total coefficient sum applied: 30.
        </p>
      </footer>
    </div>
  );
};

export default GradesCalculator;
