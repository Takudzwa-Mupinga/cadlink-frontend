
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, UserPlus, X, MapPin, Briefcase, Search, Filter, UserCheck, Loader2, DollarSign } from 'lucide-react';
import { TalentCard, listDesigners } from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCurrentUser } from '../contexts/UserContext';

interface NetworkProps {
    onMessage?: (userId: string) => void;
}

const Network: React.FC<NetworkProps> = ({ onMessage }) => {
  const { format } = useCurrency();
  const { email: myEmail } = useCurrentUser();
  const [designers, setDesigners] = useState<TalentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDesigner, setSelectedDesigner] = useState<TalentCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Connection state — local-only for now, pending backend
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'none' | 'pending' | 'connected'>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    listDesigners()
      .then(setDesigners)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = designers
    .filter(d => d.email !== myEmail) // don't show current user
    .filter(d => {
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      return (
        (d.displayName || d.email).toLowerCase().includes(q) ||
        (d.headline || '').toLowerCase().includes(q) ||
        (d.skills || []).some(s => s.toLowerCase().includes(q)) ||
        (d.location || '').toLowerCase().includes(q)
      );
    });

  const handleConnect = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = connectionStatus[userId] || 'none';
    if (current !== 'none') return; // pending/connected states are sticky
    setLoadingId(userId);
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, [userId]: 'pending' }));
      setLoadingId(null);
    }, 600);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 bg-cad-dark">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold text-cad-text tracking-tight">Professional Network</h2>
            <p className="text-cad-muted mt-1 text-sm">Connect with verified CAD designers.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, skill, or location..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-9 pr-4 py-2 text-sm text-cad-text focus:border-cad-accent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-cad-muted gap-3">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading network...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-cad-muted">
            <p className="font-medium">No designers found.</p>
            {searchTerm && <p className="text-sm mt-1">Try a different search term.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(designer => {
              const name = designer.displayName || designer.email.split('@')[0];
              const initials = name.slice(0, 2).toUpperCase();
              const status = connectionStatus[designer.userId] || 'none';
              return (
                <div
                  key={designer.userId}
                  onClick={() => setSelectedDesigner(designer)}
                  className="glass-card rounded-2xl overflow-hidden hover:border-cad-accent/30 transition-all duration-300 cursor-pointer group flex flex-col border border-cad-border hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {/* Banner */}
                  <div className="h-24 bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900 relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cad-accent to-transparent"></div>
                  </div>

                  <div className="px-5 pb-5 relative flex-1 flex flex-col">
                    {/* Avatar */}
                    <div className="relative -mt-10 mb-3">
                      {designer.avatarUrl ? (
                        <img src={designer.avatarUrl} alt={name} className="w-20 h-20 rounded-2xl border-4 border-[#131b2e] object-cover shadow-lg group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cad-accent to-blue-600 flex items-center justify-center text-xl font-bold text-white border-4 border-[#131b2e] shadow-lg">
                          {initials}
                        </div>
                      )}
                    </div>

                    {/* Name + rating row */}
                    <div className="flex justify-between items-start mb-1">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-cad-text group-hover:text-cad-accent transition-colors truncate">{name}</h3>
                        {designer.headline && (
                          <p className="text-xs text-cad-muted mt-0.5 line-clamp-1">{designer.headline}</p>
                        )}
                      </div>
                      {designer.userRating != null && (
                        <div className="flex items-center gap-1 text-amber-400 bg-amber-900/10 px-2 py-1 rounded border border-amber-500/10 shrink-0 ml-2">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span className="text-xs font-bold">{designer.userRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Location + rate */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      {designer.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{designer.location}</span>
                      )}
                      {designer.hourlyRate != null && designer.location && <span>·</span>}
                      {designer.hourlyRate != null && (
                        <span className="text-green-400 font-bold">{format(designer.hourlyRate)}/hr</span>
                      )}
                    </div>

                    {/* Bio */}
                    {designer.bio && (
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">{designer.bio}</p>
                    )}

                    {/* Skills */}
                    {designer.skills && designer.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {designer.skills.slice(0, 3).map(s => (
                          <span key={s} className="text-[10px] font-bold text-sky-300 bg-sky-900/20 px-2 py-0.5 rounded border border-sky-500/15">{s}</span>
                        ))}
                        {designer.skills.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-medium self-center">+{designer.skills.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t border-cad-border">
                      <button
                        onClick={(e) => handleConnect(designer.userId, e)}
                        disabled={status !== 'none'}
                        className={`flex items-center justify-center gap-1.5 font-bold py-2 rounded-xl transition-all border text-xs ${
                          status === 'connected'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20 cursor-default'
                            : status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 cursor-default'
                            : 'bg-cad-surface/30 hover:bg-cad-accent hover:text-cad-dark text-cad-text border-cad-border'
                        }`}
                      >
                        {loadingId === designer.userId
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : status === 'connected'
                          ? <UserCheck className="w-3.5 h-3.5" />
                          : <UserPlus className="w-3.5 h-3.5" />}
                        {status === 'connected' ? 'Connected' : status === 'pending' ? 'Pending' : 'Connect'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onMessage?.(designer.userId); }}
                        className="flex items-center justify-center gap-1.5 bg-cad-surface/30 hover:bg-cad-surface/50 text-cad-text font-bold py-2 rounded-xl transition-all border border-cad-border text-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Message
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Designer Detail Modal */}
        {selectedDesigner && (() => {
          const d = selectedDesigner;
          const name = d.displayName || d.email.split('@')[0];
          const initials = name.slice(0, 2).toUpperCase();
          const status = connectionStatus[d.userId] || 'none';
          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="glass-panel w-full max-w-2xl rounded-3xl border border-cad-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">

                {/* Banner */}
                <div className="relative h-40 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-shrink-0">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cad-accent to-transparent"></div>
                  <button
                    onClick={() => setSelectedDesigner(null)}
                    className="absolute top-5 right-5 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full transition-colors z-10 border border-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute -bottom-12 left-8">
                    {d.avatarUrl ? (
                      <img src={d.avatarUrl} alt={name} className="w-24 h-24 rounded-2xl border-4 border-[#141b2d] object-cover shadow-xl" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cad-accent to-blue-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-[#141b2d] shadow-xl">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto custom-scrollbar pt-16 px-8 pb-8 space-y-6">

                  {/* Name + actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-cad-text">{name}</h2>
                      {d.headline && <p className="text-sm text-cad-muted mt-0.5">{d.headline}</p>}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                        {d.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{d.location}</span>}
                        {d.yearsExperience != null && <span>{d.yearsExperience}y experience</span>}
                        {d.hourlyRate != null && <span className="text-green-400 font-bold">{format(d.hourlyRate)}/hr</span>}
                        {d.userRating != null && (
                          <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400"/>{d.userRating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={(e) => handleConnect(d.userId, e)}
                        disabled={status !== 'none'}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          status === 'connected'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20 cursor-default'
                            : status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 cursor-default'
                            : 'bg-cad-accent text-cad-dark border-cad-accent hover:bg-violet-400'
                        }`}
                      >
                        {status === 'connected' ? <><UserCheck className="w-3.5 h-3.5"/>Connected</> : status === 'pending' ? 'Request Sent' : <><UserPlus className="w-3.5 h-3.5"/>Connect</>}
                      </button>
                      <button
                        onClick={() => { onMessage?.(d.userId); setSelectedDesigner(null); }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-cad-surface border border-cad-border text-cad-text hover:bg-cad-surface/80 transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5"/> Message
                      </button>
                    </div>
                  </div>

                  {/* Bio */}
                  {d.bio && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">About</p>
                      <p className="text-sm text-cad-muted leading-relaxed">{d.bio}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {d.skills && d.skills.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Software Skills ({d.skills.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {d.skills.map(skill => (
                          <span key={skill} className="text-xs px-3 py-1 rounded-lg bg-sky-900/20 border border-sky-500/15 text-sky-300 font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats row — only show fields that exist */}
                  {(d.hourlyRate != null || d.yearsExperience != null || d.userRating != null) && (
                    <div className="grid grid-cols-3 gap-3">
                      {d.hourlyRate != null && (
                        <div className="bg-cad-surface rounded-xl p-3 border border-cad-border text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Rate</p>
                          <p className="text-sm font-bold text-cad-text">{format(d.hourlyRate)}/hr</p>
                        </div>
                      )}
                      {d.yearsExperience != null && (
                        <div className="bg-cad-surface rounded-xl p-3 border border-cad-border text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Experience</p>
                          <p className="text-sm font-bold text-cad-text">{d.yearsExperience}y</p>
                        </div>
                      )}
                      {d.userRating != null && (
                        <div className="bg-cad-surface rounded-xl p-3 border border-cad-border text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Rating</p>
                          <p className="text-sm font-bold text-cad-text flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{d.userRating.toFixed(1)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
};

export default Network;
