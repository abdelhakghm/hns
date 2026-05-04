
import React, { useState } from 'react';
import Layout from './components/Layout.tsx';
import GradesCalculator from './components/GradesCalculator.tsx';
import { User } from './types.ts';
import { Loader2 } from 'lucide-react';

const GUEST_USER: User = {
  id: 'guest_scholar',
  name: 'Scholar'
};

const App: React.FC = () => {
  const [user] = useState<User>(GUEST_USER);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    // Simulate initial sequence
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse"></div>
          <Loader2 className="text-emerald-500 animate-spin relative" size={48} />
        </div>
        <p className="mt-8 text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] animate-pulse">Initializing Matrix</p>
      </div>
    );
  }

  return (
    <Layout user={user}>
      <GradesCalculator userId={user.id} />
    </Layout>
  );
};

export default App;
