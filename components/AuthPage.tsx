
import React, { useState } from 'react';
import { UserRole } from '../types';
import { CLIENT_CREDENTIALS, ADMIN_CREDENTIALS } from '../constants';
import { storageService } from '../services/storageService';

interface AuthPageProps {
  onLogin: (role: UserRole, email: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedPortal === UserRole.CLIENT) {
      if (isSignup) {
        storageService.saveAccount({ email, password, role: UserRole.CLIENT });
        onLogin(UserRole.CLIENT, email);
      } else {
        const accounts = storageService.getAccounts();
        const found = accounts.find(a => a.email === email && a.password === password) || 
                      (email === CLIENT_CREDENTIALS.email && password === CLIENT_CREDENTIALS.password);
        if (found) {
          onLogin(UserRole.CLIENT, email);
        } else {
          setError('Invalid client credentials. Please sign up if you don\'t have an account.');
        }
      }
    } else if (selectedPortal === UserRole.DEVELOPER) {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        onLogin(UserRole.DEVELOPER, email);
      } else {
        setError('Invalid developer credentials');
      }
    }
  };

  if (!selectedPortal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-slate-100 group cursor-pointer" onClick={() => setSelectedPortal(UserRole.CLIENT)}>
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Client Portal</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">Plan your dream space, visualize interiors, and get real-time budget estimates for your next building project.</p>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Click to enter client access</div>
            <button className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Get Started</button>
          </div>

          <div className="bg-slate-900 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-slate-800 group cursor-pointer" onClick={() => setSelectedPortal(UserRole.DEVELOPER)}>
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Developer Portal</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">Manage projects, review client designs, and track budgets across your entire construction portfolio.</p>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/5 mb-6">
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black mb-1 italic">Developer Credentials:</p>
              <p className="text-sm text-white font-mono">{ADMIN_CREDENTIALS.email}</p>
              <p className="text-sm text-white font-mono">{ADMIN_CREDENTIALS.password}</p>
            </div>
            <button className="w-full py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg">Access Console</button>
          </div>
        </div>
      </div>
    );
  }

  const isDev = selectedPortal === UserRole.DEVELOPER;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${isDev ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <button onClick={() => { setSelectedPortal(null); setIsSignup(false); }} className={`mb-8 flex items-center gap-2 font-medium ${isDev ? 'text-slate-400' : 'text-slate-600'}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to portal selection
      </button>

      <div className={`${isDev ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-10 rounded-3xl shadow-2xl w-full max-w-md border`}>
        <h2 className={`text-2xl font-bold mb-8 ${isDev ? 'text-white' : 'text-slate-900'}`}>
          {isDev ? 'Developer Access' : isSignup ? 'Create Account' : 'Client Login'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDev ? 'text-slate-400' : 'text-slate-500'}`}>Email Address</label>
            <input 
              type="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${isDev ? 'bg-slate-800 border-slate-700 text-white focus:ring-emerald-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-600'}`}
              placeholder={isDev ? ADMIN_CREDENTIALS.email : CLIENT_CREDENTIALS.email}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDev ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
            <input 
              type="password" required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${isDev ? 'bg-slate-800 border-slate-700 text-white focus:ring-emerald-500' : 'bg-slate-50 border-slate-200 focus:ring-indigo-600'}`}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg ${isDev ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/40' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'}`}>
            {isDev ? 'Login' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center">
          {isDev ? (
             <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1 italic">Use Credentials:</p>
                <code className="text-xs text-emerald-400">{ADMIN_CREDENTIALS.email} / {ADMIN_CREDENTIALS.password}</code>
             </div>
          ) : (
            <>
              <button 
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                {isSignup ? 'Already have an account? Login' : 'Don\'t have an account? Sign Up'}
              </button>
              <p className="mt-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Demo Client: {CLIENT_CREDENTIALS.email} / {CLIENT_CREDENTIALS.password}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
