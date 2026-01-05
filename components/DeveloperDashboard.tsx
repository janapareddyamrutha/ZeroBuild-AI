
import React, { useState, useEffect } from 'react';
import { Project, Language, SatisfactionRating, BuildingType } from '../types';
import { TRANSLATIONS } from '../constants';
import { storageService } from '../services/storageService';
import RoomManager from './RoomManager';

interface DeveloperDashboardProps {
  lang: Language;
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ lang }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    setProjects(storageService.getProjects());
  }, []);

  const totalValuation = projects.reduce((sum, p) => {
    const baseCost = p.plotArea * 2150;
    const furnitureCost = p.rooms.reduce((s, r) => s + r.furniture.reduce((fs, f) => fs + f.price, 0), 0);
    return sum + baseCost + furnitureCost + (p.rooms.length * 45000);
  }, 0);

  const ratings = {
    [SatisfactionRating.BAD]: 0,
    [SatisfactionRating.AVERAGE]: 0,
    [SatisfactionRating.GOOD]: 0,
    [SatisfactionRating.EXCELLENT]: 0,
    [SatisfactionRating.OUTSTANDING]: 0,
  };

  projects.forEach(p => {
    if (p.satisfaction) ratings[p.satisfaction]++;
  });

  if (reviewingProject) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black font-serif text-white">Reviewing: {reviewingProject.title}</h2>
            <p className="text-slate-400 font-medium">Design Audit & Evaluation Mode</p>
          </div>
          <button 
            onClick={() => setReviewingProject(null)}
            className="px-6 py-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 font-black uppercase tracking-widest text-[10px] transition-all"
          >
            Close Review
          </button>
        </div>
        <div className="bg-white p-10 rounded-[40px]">
          <RoomManager project={reviewingProject} onUpdateRooms={() => {}} lang={lang} readOnly={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black font-serif text-white tracking-tight">ZeroBuild Admin Console</h2>
          <p className="text-slate-400 font-medium">Monitoring architectural output and user satisfaction.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Portfolio</p>
          <p className="text-emerald-400 font-bold">₹{(totalValuation / 10000000).toFixed(2)}Cr Market Value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dark-glass p-8 rounded-[40px] border-b-8 border-indigo-500">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Deployments</p>
          <p className="text-4xl font-black text-white">{projects.length}</p>
        </div>
        <div className="dark-glass p-8 rounded-[40px] border-b-8 border-emerald-500">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Interior Units</p>
          <p className="text-4xl font-black text-white">{projects.reduce((s, p) => s + p.rooms.length, 0)}</p>
        </div>
        <div className="dark-glass p-8 rounded-[40px] border-b-8 border-sky-500">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Average Satisfaction</p>
          <p className="text-4xl font-black text-sky-400">92%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 dark-glass rounded-[40px] overflow-hidden">
          <div className="p-8 border-b border-slate-800 bg-white/5">
            <h3 className="font-black text-white uppercase tracking-widest text-xs">Project Design Streams</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="px-8 py-5">Project Focus</th>
                  <th className="px-8 py-5">Accuracy/Rating</th>
                  <th className="px-8 py-5">Financials</th>
                  <th className="px-8 py-5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {projects.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-500">No active projects found.</td></tr>
                ) : (
                  projects.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-all">
                      <td className="px-8 py-6">
                        <div className="font-black text-white text-sm">{p.title}</div>
                        <div className="text-[10px] opacity-40 font-bold uppercase">{p.buildingType}</div>
                      </td>
                      <td className="px-8 py-6">
                        {p.satisfaction ? (
                          <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-sky-500/20 text-sky-400">{p.satisfaction}</span>
                        ) : (
                          <span className="text-[9px] font-black text-slate-600 uppercase">NO FEEDBACK</span>
                        )}
                      </td>
                      <td className="px-8 py-6 font-mono text-emerald-400 text-xs font-bold">
                        ₹{(p.plotArea * 2150 + p.rooms.reduce((s, r) => s + r.furniture.reduce((fs, f) => fs + f.price, 0), 0) + (p.rooms.length * 45000)).toLocaleString()}
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => setReviewingProject(p)}
                          className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors tracking-widest"
                        >
                          EVALUATE DESIGN
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dark-glass p-8 rounded-[40px] border border-slate-800">
          <h3 className="font-black text-white uppercase tracking-widest text-xs mb-8">User Quality Metric</h3>
          <div className="space-y-6">
            {Object.entries(ratings).reverse().map(([rating, count]) => {
              const percentage = projects.length ? (count / projects.length) * 100 : 0;
              return (
                <div key={rating} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>{rating}</span>
                    <span className="text-white">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
