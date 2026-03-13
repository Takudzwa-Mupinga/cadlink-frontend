import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, Briefcase, User, File, Settings, Calendar, ArrowRight, CornerDownLeft, Box } from 'lucide-react';
import { MOCK_JOBS, MOCK_USERS } from '../constants';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (tab: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Navigation Items
    const navItems = [
        { id: 'dashboard', label: 'Go to Dashboard', icon: <Briefcase className="w-4 h-4" />, type: 'Navigation' },
        { id: 'studio', label: 'Go to Studio', icon: <Briefcase className="w-4 h-4" />, type: 'Navigation' },
        { id: 'market', label: 'Go to Job Market', icon: <Briefcase className="w-4 h-4" />, type: 'Navigation' },
        { id: 'finance', label: 'Go to Finance', icon: <Briefcase className="w-4 h-4" />, type: 'Navigation' },
        { id: 'settings', label: 'Go to Settings', icon: <Settings className="w-4 h-4" />, type: 'Navigation' },
    ];

    // Search Results Logic
    const filteredItems = [
        ...navItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
        ...MOCK_JOBS.filter(job => job.title.toLowerCase().includes(query.toLowerCase())).map(job => ({
            id: 'market',
            label: `Job: ${job.title}`,
            icon: <Briefcase className="w-4 h-4 text-blue-400" />,
            type: 'Job'
        })),
        ...MOCK_USERS.filter(user => user.name.toLowerCase().includes(query.toLowerCase())).map(user => ({
            id: 'network',
            label: `User: ${user.name}`,
            icon: <User className="w-4 h-4 text-green-400" />,
            type: 'User'
        }))
    ].slice(0, 8); // Limit results

    const handleSelect = (id: string) => {
        onNavigate(id);
        onClose();
        setQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[20vh] animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className="w-full max-w-xl bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ring-1 ring-white/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-4 p-5 border-b border-white/5">
                    <Search className="w-5 h-5 text-cad-accent" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Type a command or search..." 
                        className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-lg font-medium"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') onClose();
                            if (e.key === 'Enter' && filteredItems.length > 0) handleSelect(filteredItems[0].id);
                        }}
                    />
                    <div className="hidden md:flex items-center gap-1">
                        <kbd className="bg-white/10 text-slate-400 px-2 py-1 rounded-md text-[10px] font-bold font-mono border border-white/5">ESC</kbd>
                    </div>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto p-2 custom-scrollbar">
                    {filteredItems.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No results found.
                        </div>
                    ) : (
                        <>
                            <div className="text-[10px] font-bold text-slate-500 px-4 py-3 uppercase tracking-wider">Suggestions</div>
                            {filteredItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(item.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-cad-accent hover:text-cad-dark group transition-all text-left mb-1 ${idx === 0 ? 'bg-white/5' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-slate-400 group-hover:text-cad-dark transition-colors bg-white/5 p-2 rounded-lg border border-white/5 group-hover:border-transparent group-hover:bg-black/10">{item.icon}</div>
                                        <div>
                                            <span className={`text-sm font-bold ${idx === 0 ? 'text-white' : 'text-slate-300'} group-hover:text-cad-dark transition-colors`}>{item.label}</span>
                                        </div>
                                    </div>
                                    {idx === 0 && <CornerDownLeft className="w-4 h-4 text-slate-500 group-hover:text-cad-dark" />}
                                </button>
                            ))}
                        </>
                    )}
                </div>

                <div className="bg-[#0f172a]/50 p-3 border-t border-white/5 flex justify-between items-center px-5 text-xs text-slate-500 font-medium">
                    <div className="flex gap-4">
                        <span><strong className="text-slate-400">↑↓</strong> to navigate</span>
                        <span><strong className="text-slate-400">↵</strong> to select</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Box className="w-4 h-4 text-cad-accent" /> CADLink
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;