
import React, { useMemo } from 'react';
import { StudySession, Subject } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Clock, 
  Flame, 
  BookOpen, 
  Timer, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Activity
} from 'lucide-react';

interface AnalyticsDashboardProps {
  sessions: StudySession[];
  subjects: Subject[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ sessions, subjects }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todaySessions = sessions.filter(s => new Date(s.created_at).getTime() >= today.getTime());
    const weekSessions = sessions.filter(s => new Date(s.created_at).getTime() >= startOfWeek.getTime());
    const monthSessions = sessions.filter(s => new Date(s.created_at).getTime() >= startOfMonth.getTime());

    const totalSecondsToday = todaySessions.reduce((acc, s) => acc + s.duration_seconds, 0);
    const totalSecondsWeek = weekSessions.reduce((acc, s) => acc + s.duration_seconds, 0);
    const totalSecondsMonth = monthSessions.reduce((acc, s) => acc + s.duration_seconds, 0);

    // Streak calculation
    const sessionDates = Array.from(new Set(sessions.map(s => {
      const d = new Date(s.created_at);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }))).sort((a: number, b: number) => b - a);

    let streak = 0;
    let current = today.getTime();
    
    // Check if there's a session today or yesterday to continue streak
    const hasSessionToday = sessionDates.includes(today.getTime());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const hasSessionYesterday = sessionDates.includes(yesterday.getTime());

    if (hasSessionToday || hasSessionYesterday) {
      let checkDate = hasSessionToday ? today : yesterday;
      while (sessionDates.includes(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Most studied subject
    const subjectTimeMap: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.subject_id) {
        subjectTimeMap[s.subject_id] = (subjectTimeMap[s.subject_id] || 0) + s.duration_seconds;
      }
    });

    let mostStudiedSubjectId = '';
    let maxTime = 0;
    Object.entries(subjectTimeMap).forEach(([id, time]) => {
      if (time > maxTime) {
        maxTime = time;
        mostStudiedSubjectId = id;
      }
    });

    const mostStudiedSubject = subjects.find(s => s.id === mostStudiedSubjectId)?.name || 'N/A';

    // Average session duration
    const avgSessionSeconds = sessions.length > 0 
      ? sessions.reduce((acc, s) => acc + s.duration_seconds, 0) / sessions.length 
      : 0;

    // Weekly chart data
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d;
    });

    const chartData = last7Days.map(date => {
      const dayStart = date.getTime();
      const dayEnd = dayStart + 86400000;
      const daySessions = sessions.filter(s => {
        const t = new Date(s.created_at).getTime();
        return t >= dayStart && t < dayEnd;
      });
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: Math.round(daySessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60),
        fullDate: date.toLocaleDateString()
      };
    });

    return {
      today: totalSecondsToday,
      week: totalSecondsWeek,
      month: totalSecondsMonth,
      streak,
      mostStudiedSubject,
      avgSessionSeconds,
      chartData
    };
  }, [sessions, subjects]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
            <Activity size={14} />
            Performance Analytics
          </h2>
          <h1 className="text-3xl font-poppins font-bold text-white tracking-tight">Productivity Core</h1>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-900/40 border border-white/5 px-8 py-4 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Flame size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Streak</p>
              <p className="text-xl font-mono font-bold text-white">{stats.streak} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Today', value: formatDuration(stats.today), icon: Clock, color: 'text-emerald-400' },
          { label: 'This Week', value: formatDuration(stats.week), icon: Calendar, color: 'text-blue-400' },
          { label: 'Most Studied', value: stats.mostStudiedSubject, icon: BookOpen, color: 'text-amber-400' },
          { label: 'Avg Session', value: formatDuration(stats.avgSessionSeconds), icon: Timer, color: 'text-purple-400' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-[28px] border-white/5 hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <ChevronRight size={14} className="text-slate-700" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8 rounded-[32px] border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Weekly Activity</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Study minutes per day</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full">
              <TrendingUp size={12} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Sync</span>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar 
                  dataKey="minutes" 
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === stats.chartData.length - 1 ? '#10b981' : 'rgba(16, 185, 129, 0.2)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[32px] border-white/5 flex flex-col">
          <h3 className="text-lg font-bold text-white tracking-tight mb-6">Monthly Yield</h3>
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray={439.8}
                  strokeDashoffset={439.8 - (439.8 * Math.min(100, (stats.month / (100 * 3600)) * 100)) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-mono font-bold text-white">{formatDuration(stats.month)}</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Effort</span>
              </div>
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sessions</span>
                <span className="text-sm font-bold text-white">{sessions.length}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</span>
                <span className="text-sm font-bold text-emerald-400">High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
