
import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const shortcuts = [
        { key: ['Cmd', 'K'], label: 'Global Command Palette' },
        { key: ['Shift', '?'], label: 'Show Keyboard Shortcuts' },
        { key: ['Esc'], label: 'Close Modals' },
        { key: ['Cmd', '/'], label: 'Toggle Chat in Studio' },
        { key: ['Cmd', 'S'], label: 'Save Changes (Profile/Settings)' },
        { key: ['1-9'], label: 'Switch Tabs' },
    ];

    return (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="w-full max-w-lg bg-cad-dark rounded-3xl border border-cad-border shadow-2xl p-8 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-cad-text transition-colors">
                    <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-cad-surface/30 rounded-xl border border-cad-border">
                        <Keyboard className="w-6 h-6 text-cad-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-cad-text">Keyboard Shortcuts</h2>
                </div>

                <div className="space-y-2">
                    {shortcuts.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-cad-surface/30 transition-colors group">
                            <span className="text-slate-300 font-medium group-hover:text-cad-text transition-colors">{s.label}</span>
                            <div className="flex gap-1.5">
                                {s.key.map((k, idx) => (
                                    <kbd key={idx} className="bg-black/40 border border-cad-border px-2.5 py-1 rounded-lg text-xs font-bold text-slate-400 font-mono shadow-sm min-w-[28px] text-center">
                                        {k}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShortcutsModal;
