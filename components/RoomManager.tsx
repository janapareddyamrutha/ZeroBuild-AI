
import React, { useState } from 'react';
import { Project, Room, Language, FurnitureItem, RoomType } from '../types';
import { TRANSLATIONS } from '../constants';
import { geminiService } from '../services/geminiService';

interface RoomManagerProps {
  project: Project;
  onUpdateRooms: (rooms: Room[]) => void;
  lang: Language;
  readOnly?: boolean;
}

const RoomManager: React.FC<RoomManagerProps> = ({ project, onUpdateRooms, lang, readOnly = false }) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(project.rooms[0]?.id || null);
  const [showAfter, setShowAfter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingVisual, setLoadingVisual] = useState(false);
  
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    type: RoomType.BEDROOM,
    color: '#4f46e5' 
  });

  const t = TRANSLATIONS[lang];
  const selectedRoom = project.rooms.find(r => r.id === selectedRoomId);

  const handleDownloadImage = () => {
    if (!selectedRoom) return;
    const targetImage = showAfter ? selectedRoom.afterImage : selectedRoom.beforeImage;
    if (targetImage) {
      const link = document.createElement('a');
      link.href = targetImage;
      link.download = `ZeroBuild_${selectedRoom.name}_${showAfter ? 'After' : 'Before'}.png`;
      link.click();
    }
  };

  const handleAddRoom = () => {
    if (readOnly) return;
    
    const roomInteriorConfig: Record<RoomType, FurnitureItem[]> = {
      [RoomType.BEDROOM]: [
        { id: 'b1', name: 'Premium Teak Bed', type: 'Bedding', price: 72500, link: 'https://www.ikea.com/in/en/', source: 'IKEA' },
        { id: 'b2', name: 'Memory Foam Mattress', type: 'Bedding', price: 45000, link: 'https://www.amazon.in/', source: 'Amazon' },
        { id: 'b3', name: 'Smart Wardrobe 4-Door', type: 'Storage', price: 85000, link: 'https://www.flipkart.com/', source: 'Flipkart' }
      ],
      [RoomType.LIVING_ROOM]: [
        { id: 'l1', name: 'Italian Leather Sofa', type: 'Seating', price: 145000, link: 'https://www.amazon.in/', source: 'Amazon' },
        { id: 'l2', name: 'Marble Top Coffee Table', type: 'Furniture', price: 28000, link: 'https://www.ikea.com/in/en/', source: 'IKEA' },
        { id: 'l3', name: '85" QLED Display', type: 'Electronics', price: 195000, link: 'https://www.flipkart.com/', source: 'Flipkart' }
      ],
      [RoomType.KITCHEN]: [
        { id: 'k1', name: 'Modular Cabinetry Set', type: 'Kitchen', price: 350000, link: 'https://www.ikea.com/in/en/', source: 'IKEA' },
        { id: 'k2', name: 'Smart Dishwasher', type: 'Appliance', price: 62000, link: 'https://www.amazon.in/', source: 'Amazon' }
      ],
      [RoomType.BATHROOM]: [
        { id: 'ba1', name: 'Granite Vanity Unit', type: 'Sanitary', price: 42000, link: 'https://www.amazon.in/', source: 'Amazon' },
        { id: 'ba2', name: 'Hydro-Massage Shower', type: 'Fixture', price: 88000, link: 'https://www.flipkart.com/', source: 'Flipkart' }
      ],
      [RoomType.GUEST_ROOM]: [
        { id: 'g1', name: 'Compact Queen Bed', type: 'Bedding', price: 38000, link: 'https://www.ikea.com/in/en/', source: 'IKEA' }
      ],
      [RoomType.DINING]: [
        { id: 'd1', name: '8-Seater Walnut Table', type: 'Dining', price: 115000, link: 'https://www.ikea.com/in/en/', source: 'IKEA' }
      ],
      [RoomType.OFFICE]: [
        { id: 'o1', name: 'Adjustable Standing Desk', type: 'Office', price: 42000, link: 'https://www.amazon.in/', source: 'Amazon' },
        { id: 'o2', name: 'High-Back Executive Chair', type: 'Office', price: 28500, link: 'https://www.ikea.com/in/en/', source: 'IKEA' }
      ],
      [RoomType.KIDS_ROOM]: [
        { id: 'kr1', name: 'Bunk Bed with Storage', type: 'Bedding', price: 58000, link: 'https://www.ikea.com/in/en/', source: 'IKEA' }
      ]
    };

    const newRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      name: newRoomData.name || `Unit ${project.rooms.length + 1}`,
      type: newRoomData.type,
      color: newRoomData.color,
      furniture: roomInteriorConfig[newRoomData.type] || []
    };

    onUpdateRooms([...project.rooms, newRoom]);
    setSelectedRoomId(newRoom.id);
    setShowAddModal(false);
    setNewRoomData({ name: '', type: RoomType.BEDROOM, color: '#4f46e5' });
  };

  const handleGenerateRoomVisuals = async () => {
    if (!selectedRoom || loadingVisual) return;
    setLoadingVisual(true);
    try {
      // ZeroBuild AI Strict Visualization Logic
      const beforeUrl = await geminiService.generateRoomVisual(project, selectedRoom, 'before');
      const afterUrl = await geminiService.generateRoomVisual(project, selectedRoom, 'after');
      
      const updatedRooms = project.rooms.map(r => 
        r.id === selectedRoom.id 
          ? { ...r, beforeImage: beforeUrl, afterImage: afterUrl } 
          : r
      );
      
      onUpdateRooms(updatedRooms);
    } catch (e) {
      console.error("Room visual generation failed", e);
      alert(e instanceof Error ? e.message : "Visualization engine error.");
    } finally {
      setLoadingVisual(false);
    }
  };

  const handleRemoveRoom = (id: string) => {
    if (readOnly) return;
    const filtered = project.rooms.filter(r => r.id !== id);
    onUpdateRooms(filtered);
    if (selectedRoomId === id) setSelectedRoomId(filtered[0]?.id || null);
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    if (readOnly) return;
    const updated = project.rooms.map(r => r.id === id ? { ...r, ...updates } : r);
    onUpdateRooms(updated);
  };

  const calculateRoomBudget = (room: Room) => {
    return room.furniture.reduce((sum, f) => sum + f.price, 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
      <div className="lg:col-span-1 space-y-6">
        <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">{t.rooms}</h3>
          {!readOnly && (
            <button 
              onClick={() => setShowAddModal(true)} 
              className="px-4 py-2 bg-indigo-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:scale-105 transition-transform shadow-lg shadow-indigo-100"
            >
              + {t.addRoom}
            </button>
          )}
        </div>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {project.rooms.length === 0 ? (
            <div className="p-12 text-center border-4 border-dashed border-slate-100 rounded-[35px] flex flex-col items-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">No Rooms Added</p>
            </div>
          ) : (
            project.rooms.map(room => (
              <div 
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`p-5 rounded-3xl cursor-pointer transition-all border-4 flex flex-col gap-2 group ${selectedRoomId === room.id ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-50' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full shadow-inner ring-4 ring-white" style={{ backgroundColor: room.color }} />
                    <div>
                      <span className={`font-black uppercase tracking-widest text-[10px] block ${selectedRoomId === room.id ? 'text-indigo-600' : 'text-slate-500'}`}>{room.name}</span>
                      <span className="text-[8px] opacity-40 font-bold uppercase tracking-tight">{room.type}</span>
                    </div>
                  </div>
                  {!readOnly && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveRoom(room.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-8">
        {selectedRoom ? (
          <div className="glass p-10 rounded-[40px] animate-in slide-in-from-right-8 duration-700 shadow-3xl bg-white border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-10 border-b-2 border-slate-50 pb-10">
              <div className="flex-1 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedRoom.type} AI Visualization</span>
                  {readOnly ? (
                    <h2 className="text-4xl font-black font-serif text-slate-800">{selectedRoom.name}</h2>
                  ) : (
                    <input 
                      type="text" 
                      value={selectedRoom.name}
                      onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })}
                      className="text-4xl font-black font-serif bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-200"
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="p-1.5 bg-slate-50 rounded-2xl flex border border-slate-100 shadow-inner">
                    <button 
                      onClick={() => setShowAfter(false)}
                      className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!showAfter ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}
                    >
                      Before (Strictly Empty)
                    </button>
                    <button 
                      onClick={() => setShowAfter(true)}
                      className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showAfter ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}
                    >
                      After (Strictly Furnished)
                    </button>
                  </div>

                  {!readOnly && (
                    <>
                      <div className="flex items-center gap-4 bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Theme Color</span>
                         <input 
                            type="color" 
                            value={selectedRoom.color}
                            onChange={(e) => updateRoom(selectedRoom.id, { color: e.target.value })}
                            className="w-10 h-10 rounded-full border-4 border-white shadow-md cursor-pointer overflow-hidden p-0"
                          />
                      </div>
                      <button 
                        onClick={handleGenerateRoomVisuals}
                        disabled={loadingVisual}
                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
                      >
                        {loadingVisual ? 'Rendering...' : 'Generate 3D Visual'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right flex flex-col justify-center bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Interior Budget</p>
                <p className="text-4xl font-black text-indigo-600">₹{calculateRoomBudget(selectedRoom).toLocaleString()}</p>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-2">Precise Item Sum</div>
              </div>
            </div>

            <div className="aspect-[16/9] bg-slate-100 rounded-[35px] overflow-hidden relative shadow-inner group border-8 border-white transition-all duration-700">
              {loadingVisual ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-10 text-center">
                   <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                   <h4 className="text-xl font-black italic">"ZeroBuild Engine: Crafting {selectedRoom.type}..."</h4>
                   <p className="text-xs opacity-60 mt-2">Enforcing photorealistic lighting and your specific {selectedRoom.color} palette.</p>
                </div>
              ) : (
                <>
                  {/* Download Action Overlay */}
                  {((showAfter && selectedRoom.afterImage) || (!showAfter && selectedRoom.beforeImage)) && (
                    <button 
                      onClick={handleDownloadImage}
                      className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-2xl opacity-0 group-hover:opacity-100"
                      title="Download Rendering"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </button>
                  )}

                  {showAfter ? (
                    selectedRoom.afterImage ? (
                      <div className="w-full h-full relative animate-in fade-in zoom-in-95 duration-1000">
                         <img 
                          src={selectedRoom.afterImage} 
                          alt="Furnished Interior" 
                          className="w-full h-full object-cover"
                         />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                        <p className="font-black uppercase tracking-widest text-xs">No "After" Visual Generated</p>
                        <p className="text-[10px] mt-2 italic">Click 'Generate 3D Visual' to start engine</p>
                      </div>
                    )
                  ) : (
                    selectedRoom.beforeImage ? (
                      <img 
                        src={selectedRoom.beforeImage} 
                        alt="Empty Shell" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                        <p className="font-black uppercase tracking-widest text-xs">No "Before" Visual Generated</p>
                      </div>
                    )
                  )}
                </>
              )}
              
              {!loadingVisual && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-10 pointer-events-none">
                  <div className="flex flex-col gap-2">
                    <span className="px-6 py-2 bg-white/10 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20 w-fit">
                      {showAfter ? `PROPOSED ${selectedRoom.type.toUpperCase()}` : 'STRICT BARE SHELL'}
                    </span>
                    <p className="text-white/95 text-lg font-black font-serif italic max-w-lg">
                      {showAfter ? `Applying ${selectedRoom.color} mood to ${selectedRoom.type} interior.` : 'Empty room preview before design application.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 space-y-8">
              <h4 className="text-xl font-black font-serif text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                Interior Furniture Sourcing
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedRoom.furniture.map((item) => (
                  <div key={item.id} className="p-8 bg-white rounded-[35px] border border-slate-50 hover:border-indigo-100 transition-all shadow-sm hover:shadow-2xl group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded-lg uppercase">{item.source} Certified</span>
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.type} Category</p>
                        <h5 className="text-xl font-black text-slate-800 leading-tight">{item.name}</h5>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Fixed Price</p>
                        <p className="text-2xl font-black text-slate-800">₹{item.price.toLocaleString()}</p>
                      </div>
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                      >
                        Shop Source
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[70vh] glass rounded-[50px] flex flex-col items-center justify-center text-center p-16 border-4 border-dashed border-slate-100 bg-white/50">
             <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest mb-4">Space Planner</h3>
             <p className="text-slate-400 max-w-sm font-medium leading-relaxed">Add rooms to visualize interiors and calculate exact budgets.</p>
             {!readOnly && (
               <button 
                  onClick={() => setShowAddModal(true)}
                  className="mt-8 px-10 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100"
               >
                  + Add First Room
               </button>
             )}
          </div>
        )}
      </div>

      {showAddModal && !readOnly && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black font-serif text-slate-800">New Room Entry</h3>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
              </div>
              <div className="space-y-8">
                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Room Name</label>
                    <input 
                      type="text"
                      value={newRoomData.name}
                      onChange={e => setNewRoomData({...newRoomData, name: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-slate-700"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Room Category</label>
                       <select 
                         value={newRoomData.type}
                         onChange={e => setNewRoomData({...newRoomData, type: e.target.value as RoomType})}
                         className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-slate-700 appearance-none bg-white"
                       >
                          {Object.values(RoomType).map(v => <option key={v} value={v}>{v}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Accent Color</label>
                       <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                          <input 
                            type="color"
                            value={newRoomData.color}
                            onChange={e => setNewRoomData({...newRoomData, color: e.target.value})}
                            className="w-10 h-10 rounded-full border-4 border-white shadow-md cursor-pointer overflow-hidden p-0"
                          />
                          <span className="font-mono text-[10px] font-black text-slate-400">{newRoomData.color.toUpperCase()}</span>
                       </div>
                    </div>
                 </div>
                 <div className="pt-6">
                    <button 
                       onClick={handleAddRoom}
                       className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-3xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100"
                    >
                       Confirm Configuration
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RoomManager;
