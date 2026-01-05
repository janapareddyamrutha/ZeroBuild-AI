
import React, { useState, useEffect } from 'react';
import { UserRole, Language } from './types';
import { TRANSLATIONS } from './constants';
import AuthPage from './components/AuthPage';
import ClientDashboard from './components/ClientDashboard';
import DeveloperDashboard from './components/DeveloperDashboard';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [user, setUser] = useState<{ role: UserRole; email: string } | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [showChat, setShowChat] = useState(false);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${user?.role === UserRole.DEVELOPER ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {!user ? (
        <AuthPage onLogin={(role, email) => setUser({ role, email })} />
      ) : (
        <div className="flex flex-col min-h-screen">
          <nav className={`sticky top-0 z-50 px-6 py-4 flex justify-between items-center ${user.role === UserRole.DEVELOPER ? 'dark-glass' : 'glass shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">Z</div>
              <h1 className="text-xl font-bold tracking-tight">ZeroBuild AI</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className={`text-sm rounded-md px-2 py-1 outline-none ${user.role === UserRole.DEVELOPER ? 'bg-slate-800 text-white' : 'bg-white border'}`}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="te">తెలుగు</option>
              </select>

              <button 
                onClick={() => setShowChat(true)}
                className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                title={TRANSLATIONS[lang].chatbot}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              </button>

              <div className="flex items-center gap-2 border-l pl-4 ml-2">
                <div className="hidden sm:block text-right">
                  <p className="text-xs opacity-60 font-medium uppercase tracking-wider">{user.role}</p>
                  <p className="text-sm font-semibold">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  {TRANSLATIONS[lang].logout}
                </button>
              </div>
            </div>
          </nav>

          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            {user.role === UserRole.CLIENT ? (
              <ClientDashboard lang={lang} />
            ) : (
              <DeveloperDashboard lang={lang} />
            )}
          </main>

          {showChat && <ChatBot lang={lang} onClose={() => setShowChat(false)} />}
        </div>
      )}
    </div>
  );
};

export default App;
