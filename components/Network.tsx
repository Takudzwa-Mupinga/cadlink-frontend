
import React, { useState } from 'react';
import { Star, MessageSquare, UserPlus, X, MapPin, Briefcase, ExternalLink, Award, Search, Filter, UserCheck, Loader2 } from 'lucide-react';
import { MOCK_USERS } from '../constants';
import { UserProfile } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';

interface NetworkProps {
    onMessage?: (userId: string) => void;
}

// Enriched mock data with portfolios
const ENRICHED_USERS: UserProfile[] = MOCK_USERS.map(u => ({
  ...u,
  portfolio: [
    { id: 'p1', title: 'Modern Villa Exterior', category: 'Architecture', image: `https://picsum.photos/600/400?random=${Math.random()}` },
    { id: 'p2', title: 'Mechanical Pump Assembly', category: 'Mechanical', image: `https://picsum.photos/600/400?random=${Math.random()}` },
    { id: 'p3', title: 'Interior Rendering', category: 'Interior', image: `https://picsum.photos/600/400?random=${Math.random()}` },
    { id: 'p4', title: 'Structural Steel Details', category: 'Structural', image: `https://picsum.photos/600/400?random=${Math.random()}` },
  ]
}));

const Network: React.FC<NetworkProps> = ({ onMessage }) => {
    const { format } = useCurrency();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Connection State Management
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'none' | 'pending' | 'connected'>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredUsers = ENRICHED_USERS.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.role.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleMessageClick = (userId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (onMessage) {
          onMessage(userId);
      }
  };

  const handleConnect = (userId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setLoadingId(userId);
      
      // Simulate API call
      setTimeout(() => {
          setConnectionStatus(prev => {
              const current = prev[userId] || 'none';
              return {
                  ...prev,
                  [userId]: current === 'none' ? 'pending' : current === 'pending' ? 'connected' : 'none'
              };
          });
          setLoadingId(null);
      }, 800);
  };

  const getConnectButtonText = (status: string) => {
      switch(status) {
          case 'connected': return 'Connected';
          case 'pending': return 'Pending';
          default: return 'Connect';
      }
  };

  const getConnectButtonIcon = (status: string, id: string) => {
      if (loadingId === id) return <Loader2 className="w-4 h-4 animate-spin" />;
      switch(status) {
          case 'connected': return <UserCheck className="w-4 h-4" />;
          case 'pending': return <UserCheck className="w-4 h-4" />;
          default: return <UserPlus className="w-4 h-4" />;
      }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Professional Network</h2>
          <p className="text-cad-muted mt-1">Connect with top CAD talent and engineers.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search people..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-cad-accent outline-none backdrop-blur-sm"
                />
            </div>
            <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <Filter className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => {
            const status = connectionStatus[user.id] || 'none';
            return (
                <div 
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className="glass-card rounded-2xl overflow-hidden hover:border-cad-accent/30 hover:shadow-glow transition-all duration-300 cursor-pointer group relative flex flex-col"
                >
                    {/* Header Gradient */}
                    <div className="h-28 bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className={`absolute top-4 right-4 flex items-center gap-2 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/5 ${user.isOnline ? 'text-green-400' : 'text-slate-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{user.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                    </div>
                    
                    <div className="px-6 pb-6 relative flex-1 flex flex-col">
                    <div className="relative -mt-12 mb-4">
                        <div className="relative inline-block">
                            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl border-4 border-[#131b2e] object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-start mb-2">
                        <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cad-accent transition-colors">{user.name}</h3>
                        <p className="text-cad-muted font-medium text-sm flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {user.role}</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 bg-amber-900/10 px-2 py-1 rounded border border-amber-500/10">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-sm font-bold">{user.rating}</span>
                        </div>
                    </div>

                    <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">{user.bio}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {user.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="text-[10px] font-bold text-sky-200 bg-sky-900/20 px-2 py-1 rounded border border-sky-500/10">
                            {skill}
                        </span>
                        ))}
                        {user.skills.length > 3 && <span className="text-[10px] font-bold text-slate-500 px-1 self-center">+ {user.skills.length - 3}</span>}
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                        <button 
                            onClick={(e) => handleConnect(user.id, e)}
                            className={`flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl transition-all border text-sm ${
                                status === 'connected' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                : 'bg-white/5 hover:bg-cad-accent hover:text-cad-dark text-white border-white/5'
                            }`}
                        >
                        {getConnectButtonIcon(status, user.id)}
                        {getConnectButtonText(status)}
                        </button>
                        <button onClick={(e) => handleMessageClick(user.id, e)} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl transition-all border border-white/5 text-sm">
                        <MessageSquare className="w-4 h-4" /> Message
                        </button>
                    </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* USER PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-panel w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                
                {/* Modal Header */}
                <div className="relative h-56 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                     <button 
                        onClick={() => setSelectedUser(null)} 
                        className="absolute top-6 right-6 bg-black/20 hover:bg-white/10 text-white p-2 rounded-full transition-colors z-10 backdrop-blur-md border border-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-12 left-10">
                         <img src={selectedUser.avatar} alt={selectedUser.name} className="w-32 h-32 rounded-3xl border-4 border-[#141b2d] object-cover shadow-2xl" />
                    </div>
                </div>

                {/* Modal Content */}
                <div className="pt-16 px-10 pb-10 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">{selectedUser.name}</h2>
                            <div className="flex items-center gap-4 text-cad-muted mt-2 text-sm font-medium">
                                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-cad-accent"/> {selectedUser.role}</span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-cad-accent"/> Remote</span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className="text-green-400 font-bold bg-green-900/20 px-2 py-0.5 rounded border border-green-500/10">{format(selectedUser.hourlyRate)}/hr</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                             <button className="px-6 py-2.5 bg-cad-accent text-cad-dark font-bold rounded-xl hover:bg-sky-400 shadow-lg shadow-cad-accent/20 transition-all active:scale-95">
                                Hire {selectedUser.name.split(' ')[0]}
                            </button>
                            <button onClick={() => { if(onMessage) { onMessage(selectedUser.id); setSelectedUser(null); } }} className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                                Message
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Left Column: Info */}
                        <div className="md:col-span-1 space-y-8">
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><Star className="w-4 h-4 text-cad-accent"/> About</h3>
                                <p className="text-slate-300 text-sm leading-relaxed">{selectedUser.bio} I specialize in complex parametric modeling and large-scale BIM coordination.</p>
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUser.skills.map(skill => (
                                        <span key={skill} className="text-xs font-bold text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-cad-accent/50 transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                             <div>
                                <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Certifications</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
                                            <Award className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm text-slate-300 font-medium">Autodesk Certified</span>
                                    </li>
                                    <li className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
                                            <Award className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm text-slate-300 font-medium">SolidWorks CSWP</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Right Column: Portfolio */}
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white text-lg">Portfolio</h3>
                                <button className="text-cad-accent text-sm font-bold hover:text-white transition-colors flex items-center gap-1">
                                    View All <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {selectedUser.portfolio?.map(item => (
                                    <div key={item.id} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 cursor-pointer">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                            <span className="text-xs text-cad-accent font-bold uppercase tracking-wider mb-1">{item.category}</span>
                                            <h4 className="text-white font-bold text-lg leading-tight">{item.title}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Network;
