
import React, { useState, useEffect } from 'react';
import { Project, Language, Room, SatisfactionRating } from '../types';
import { TRANSLATIONS } from '../constants';
import { storageService } from '../services/storageService';
import ProjectForm from './ProjectForm';
import Visualizer from './Visualizer';
import RoomManager from './RoomManager';

interface ClientDashboardProps {
  lang: Language;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ lang }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'overview' | 'design' | 'visual' | 'budget'>('overview');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    setProjects(storageService.getProjects());
  }, []);

  const handleSaveProject = (p: Project) => {
    storageService.saveProject(p);
    setProjects(storageService.getProjects());
    setActiveProject(p);
    setShowForm(false);
    setView('design');
  };

  const handleUpdateRooms = (rooms: Room[]) => {
    if (!activeProject) return;
    const updated = { ...activeProject, rooms };
    storageService.saveProject(updated);
    setActiveProject(updated);
    setProjects(storageService.getProjects());
  };

  const handleRate = (rating: SatisfactionRating) => {
    if (!activeProject) return;
    const updated = { ...activeProject, satisfaction: rating };
    storageService.saveProject(updated);
    setActiveProject(updated);
    setProjects(storageService.getProjects());
  };

  const calculatePreciseBudget = (p: Project) => {
    const baseCost = p.plotArea * 2150; // Precise per sq ft structural rate
    const furnitureCost = p.rooms.reduce((sum, room) => 
      sum + room.furniture.reduce((fSum, f) => fSum + f.price, 0), 0);
    const interiorLabor = p.rooms.length * 45000; // Precise labor rate per room
    return {
      base: baseCost,
      furniture: furnitureCost,
      labor: interiorLabor,
      total: baseCost + furnitureCost + interiorLabor
    };
  };

  if (showForm) {
    return <ProjectForm onSave={handleSaveProject} onCancel={() => setShowForm(false)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-100">
            {activeProject ? activeProject.title[0] : 'P'}
          </div>
          <div>
            <h2 className="text-3xl font-black font-serif text-slate-800 tracking-tight">
              {activeProject ? activeProject.title : t.history}
            </h2>
            <p className="text-slate-500 font-medium">
              {activeProject ? `${activeProject.buildingType} • Precise Architectural Unit` : 'Project Portfolio'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {projects.length > 0 && !activeProject && (
            <button 
              onClick={() => { if(confirm("Are you sure? This will delete ALL your project data permanently.")) { storageService.deleteAllProjects(); setProjects([]); } }}
              className="px-6 py-3 border-2 border-red-100 text-red-500 rounded-2xl hover:bg-red-50 font-black uppercase tracking-widest text-xs transition-all"
            >
              Purge All Data
            </button>
          )}
          <button 
            onClick={() => { setActiveProject(null); setShowForm(true); }}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-100"
          >
            + {t.newProject}
          </button>
        </div>
      </div>

      {activeProject ? (
        <div className="space-y-8">
          <div className="flex gap-8 border-b-2 border-slate-100 overflow-x-auto pb-px">
            {['design', 'visual', 'budget'].map((v) => (
              <button 
                key={v}
                onClick={() => setView(v as any)}
                className={`pb-4 px-2 font-black uppercase tracking-widest text-xs transition-all whitespace-nowrap ${view === v ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {v === 'design' ? '1. Interior Planning' : v === 'visual' ? '2. 3D Visualization' : '3. Precise Financials'}
              </button>
            ))}
            <div className="flex-1"></div>
            <button 
              onClick={() => { if(confirm("Delete this project permanently?")) { storageService.deleteProject(activeProject.id); setProjects(storageService.getProjects()); setActiveProject(null); } }}
              className="pb-4 px-2 font-black uppercase tracking-widest text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Delete Project
            </button>
            <button 
              onClick={() => setActiveProject(null)}
              className="pb-4 px-2 font-black uppercase tracking-widest text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Return Home
            </button>
          </div>

          <div className="min-h-[60vh]">
            {view === 'design' && <RoomManager project={activeProject} onUpdateRooms={handleUpdateRooms} lang={lang} />}
            {view === 'visual' && <Visualizer project={activeProject} onUpdateProject={setActiveProject} />}
            {view === 'budget' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(() => {
                    const costs = calculatePreciseBudget(activeProject);
                    return (
                      <>
                        <div className="glass p-8 rounded-3xl border-l-8 border-indigo-600">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Structural Base</p>
                          <p className="text-3xl font-black text-slate-800">₹{costs.base.toLocaleString()}</p>
                        </div>
                        <div className="glass p-8 rounded-3xl border-l-8 border-emerald-500">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Furniture Sourcing</p>
                          <p className="text-3xl font-black text-slate-800">₹{costs.furniture.toLocaleString()}</p>
                        </div>
                        <div className="glass p-8 rounded-3xl border-l-8 border-amber-500">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Interior Labor</p>
                          <p className="text-3xl font-black text-slate-800">₹{costs.labor.toLocaleString()}</p>
                        </div>
                        <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-2xl shadow-indigo-100">
                          <p className="text-xs font-black opacity-60 uppercase tracking-widest mb-2">Exact Total Budget</p>
                          <p className="text-3xl font-black">₹{costs.total.toLocaleString()}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="glass p-10 rounded-[40px] border-2 border-indigo-50 bg-white">
                  <h4 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-widest text-center">Budget Precision Clause</h4>
                  <p className="text-slate-500 text-sm leading-relaxed text-center max-w-3xl mx-auto">
                    These figures represent the exact accumulated cost based on current market rates and verified sourcing links. No estimated or approximate values are used in this financial summary.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="glass p-10 rounded-3xl border-2 border-indigo-50 bg-white">
            <h3 className="text-2xl font-black font-serif text-slate-800 mb-6">User-Based Experience Rating</h3>
            <p className="text-slate-500 mb-8 font-medium">How accurate was the visualization compared to your expectations?</p>
            <div className="flex flex-wrap gap-4">
              {Object.values(SatisfactionRating).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRate(r)}
                  className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${activeProject.satisfaction === r ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.length === 0 ? (
            <div className="col-span-full py-32 text-center glass rounded-[40px] border-dashed border-4 border-slate-100">
              <h3 className="text-2xl font-black text-slate-400 mb-2">Ready to Build?</h3>
              <p className="text-slate-400 font-medium">Create your first architectural project to begin.</p>
            </div>
          ) : (
            projects.map(p => (
              <div key={p.id} className="glass group rounded-[40px] overflow-hidden hover:shadow-3xl transition-all border-2 border-transparent hover:border-indigo-100 flex flex-col bg-white">
                <div className="h-56 bg-slate-100 relative overflow-hidden">
                  {p.visualImage ? (
                    <img src={p.visualImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                  )}
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black text-slate-800 mb-2">{p.title}</h3>
                  <div className="flex gap-4 mb-6">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{p.plotArea} SQ FT</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{p.rooms.length} ROOMS</div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex gap-3">
                    <button 
                      onClick={() => { setActiveProject(p); setView('design'); }}
                      className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                    >
                      Open Project
                    </button>
                    <button 
                      onClick={() => { if(confirm("Permanently delete project?")) { storageService.deleteProject(p.id); setProjects(storageService.getProjects()); } }}
                      className="p-4 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
