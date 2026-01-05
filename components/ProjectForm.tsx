
import React, { useState, useEffect } from 'react';
import { Project, LocationType, BuildingType, BudgetLevel, Room } from '../types';

interface ProjectFormProps {
  onSave: (project: Project) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    length: 0,
    breadth: 0,
    plotArea: 0,
    locationType: LocationType.URBAN,
    budgetLevel: BudgetLevel.MEDIUM,
    buildingType: BuildingType.HOUSE,
    floors: 1,
    buildingColor: '#ffffff',
    architecturalStyle: 'Modern',
    rooms: []
  });

  // Smart Sync: L * B = Area
  const handleDimChange = (field: 'length' | 'breadth', value: number) => {
    const newData = { ...formData, [field]: value };
    const area = (newData.length || 0) * (newData.breadth || 0);
    setFormData({ ...newData, plotArea: area });
  };

  // Smart Sync: Area -> L = B = sqrt(Area)
  const handleAreaChange = (val: number) => {
    const side = Math.round(Math.sqrt(val) * 100) / 100;
    setFormData(prev => ({ 
      ...prev, 
      plotArea: val,
      length: side,
      breadth: side
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.plotArea) return;

    onSave({
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      clientId: 'active-session-user',
      rooms: [], // Starting with zero rooms as per requirement
      createdAt: Date.now()
    } as Project);
  };

  return (
    <div className="glass p-8 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold font-serif text-slate-800">Initiate Project</h2>
          <p className="text-slate-500">Provide dimensions and architectural preferences</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Project Name</label>
              <input 
                type="text" required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 font-bold"
                placeholder="e.g., Skyview Residence"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Length (ft)</label>
                <input 
                  type="number" required
                  value={formData.length || ''}
                  onChange={e => handleDimChange('length', Number(e.target.value))}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Breadth (ft)</label>
                <input 
                  type="number" required
                  value={formData.breadth || ''}
                  onChange={e => handleDimChange('breadth', Number(e.target.value))}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 font-bold"
                />
              </div>
            </div>

            <div className="p-6 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <label className="block text-xs font-black uppercase tracking-widest opacity-80 mb-2">Total Plot Area (sq ft)</label>
              <input 
                type="number" required
                value={formData.plotArea || ''}
                onChange={e => handleAreaChange(Number(e.target.value))}
                className="w-full bg-transparent text-4xl font-bold outline-none border-b-2 border-white/20 pb-2 focus:border-white/60 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Building Type</label>
                <select 
                  value={formData.buildingType}
                  onChange={e => setFormData({ ...formData, buildingType: e.target.value as BuildingType })}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 font-bold appearance-none bg-white"
                >
                  {Object.values(BuildingType).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Location Type</label>
                <select 
                  value={formData.locationType}
                  onChange={e => setFormData({ ...formData, locationType: e.target.value as LocationType })}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 font-bold bg-white"
                >
                  {Object.values(LocationType).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Floors</label>
                <input 
                  type="number" min="1" required
                  value={formData.floors}
                  onChange={e => setFormData({ ...formData, floors: Number(e.target.value) })}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Budget Preference</label>
                <select 
                  value={formData.budgetLevel}
                  onChange={e => setFormData({ ...formData, budgetLevel: e.target.value as BudgetLevel })}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 font-bold bg-white"
                >
                  {Object.values(BudgetLevel).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Architectural Style</label>
              <input 
                type="text" required
                value={formData.architecturalStyle}
                onChange={e => setFormData({ ...formData, architecturalStyle: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 font-bold"
                placeholder="e.g., Ultra Modern, Victorian, Indian Vernacular"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex-1">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Theme Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color"
                    value={formData.buildingColor}
                    onChange={e => setFormData({ ...formData, buildingColor: e.target.value })}
                    className="w-14 h-14 rounded-full border-4 border-white shadow-md cursor-pointer overflow-hidden p-0"
                  />
                  <span className="font-mono text-sm font-bold text-slate-400">{formData.buildingColor?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 hover:-translate-y-1"
        >
          Initialize Plan
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;
