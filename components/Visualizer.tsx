
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface VisualizerProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
}

const Visualizer: React.FC<VisualizerProps> = ({ project, onUpdateProject }) => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'render' | 'layout'>('render');
  const [conceptualLayout, setConceptualLayout] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Load existing layout if available
  useEffect(() => {
    const loadLayout = async () => {
      if (viewMode === 'layout' && !conceptualLayout && project.visualImage) {
        setLoading(true);
        try {
          const layoutSvg = await geminiService.generateConceptualFloorPlan(project);
          setConceptualLayout(layoutSvg);
        } catch (e) {
          console.error("Failed to fetch stored layout", e);
        } finally {
          setLoading(false);
        }
      }
    };
    loadLayout();
  }, [viewMode, project.visualImage]);

  const handleDownload = () => {
    if (viewMode === 'render' && project.visualImage) {
      const link = document.createElement('a');
      link.href = project.visualImage;
      link.download = `ZeroBuild_${project.title}_3D_Render.png`;
      link.click();
    } else if (viewMode === 'layout' && conceptualLayout) {
      const blob = new Blob([conceptualLayout], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ZeroBuild_${project.title}_CAD_Layout.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const generateVisual = async () => {
    setLoading(true);
    setError(null);
    try {
      const imageUrl = await geminiService.generate3DVisual(project);
      if (!imageUrl) throw new Error("Image generation engine failed to return data.");

      const layoutSvg = await geminiService.generateConceptualFloorPlan(project);
      setConceptualLayout(layoutSvg);

      const updated = { ...project, visualImage: imageUrl };
      storageService.saveProject(updated);
      onUpdateProject(updated);
    } catch (err) {
      console.error("Design generation failed", err);
      setError("The visualization engine is currently busy or the request was filtered. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-[40px] border border-slate-100 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h3 className="text-3xl font-black font-serif text-slate-800">Architectural Engine</h3>
            <p className="text-slate-500 font-medium text-sm">AI-Powered CAD & Photorealistic Rendering</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <div className="bg-slate-50 p-1.5 rounded-2xl flex border border-slate-200 shadow-inner">
                <button 
                  onClick={() => setViewMode('render')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'render' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                  3D Render
                </button>
                <button 
                  onClick={() => setViewMode('layout')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'layout' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                  CAD Layout
                </button>
             </div>
             <button 
               onClick={generateVisual}
               disabled={loading}
               className={`px-8 py-3 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all flex items-center gap-2 shadow-xl ${project.visualImage ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white shadow-indigo-100'}`}
             >
               {loading ? 'Engine Processing...' : project.visualImage ? 'Re-Generate Designs' : 'Initialize Architecture'}
             </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        <div className="relative aspect-video rounded-[45px] bg-slate-950 border-[12px] border-white shadow-3xl overflow-hidden group">
          {/* Download Action Overlay */}
          {(project.visualImage || (viewMode === 'layout' && conceptualLayout)) && !loading && (
            <button 
              onClick={handleDownload}
              className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-2xl opacity-0 group-hover:opacity-100"
              title="Download Asset"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </button>
          )}

          {viewMode === 'render' ? (
            project.visualImage ? (
              <div className="w-full h-full relative cursor-zoom-in overflow-hidden">
                 <img 
                  src={project.visualImage} 
                  alt="3D Architectural Visual" 
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ transform: `scale(${zoom})` }}
                  onClick={() => setZoom(z => z === 1 ? 1.5 : 1)}
                />
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                   <p className="text-white/60 text-[9px] font-bold uppercase tracking-[0.2em]">ZeroBuild.AI Conceptual 3D Model • {project.architecturalStyle}</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-12 text-center bg-slate-900">
                {loading ? (
                  <div className="space-y-6">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xl font-serif text-white italic">"Engine initializing architectural aesthetics..."</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] animate-pulse">Computing Materials • Finalizing Textures</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-sm">
                    <svg className="w-20 h-20 opacity-10 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    <p className="text-lg font-bold text-white/50">Residential Render Required</p>
                    <p className="text-xs opacity-40">Click the button above to start the ZeroBuild AI Engine and generate your photorealistic 3D render.</p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white p-10 overflow-hidden">
               {loading ? (
                 <div className="text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 font-bold text-xs">Generating CAD Layout...</p>
                 </div>
               ) : conceptualLayout ? (
                 <div className="w-full h-full flex items-center justify-center technical-layout" dangerouslySetInnerHTML={{ __html: conceptualLayout }} />
               ) : (
                 <div className="text-center space-y-4">
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No CAD Data Available</p>
                    <p className="text-xs text-slate-300">Generate visualization to compute conceptual architectural floor plans.</p>
                 </div>
               )}
               <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-white to-transparent pointer-events-none">
                  <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em]">CAD-STYLE CONCEPTUAL LAYOUT (NOT FOR CONSTRUCTION)</p>
               </div>
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Scope & Accuracy Protocol</p>
           <p className="text-slate-500 text-xs italic font-medium">"ZeroBuild.AI provides conceptual architectural visualization and layout ideas. We do not provide engineering or construction drawings."</p>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
