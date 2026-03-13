
import React, { useState } from 'react';
import { X, Search, FileText, MessageSquare, Book, Mail, RefreshCw, Code, FolderTree, Terminal, Copy, Check } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRestartTour?: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onRestartTour }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'developer'>('general');
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const installCommand = "npm install lucide-react @google/genai clsx tailwind-merge";

    const fileStructure = `
/src
  ├── App.tsx
  ├── index.tsx
  ├── index.css
  ├── types.ts
  ├── constants.ts
  ├── services/
  │     └── geminiService.ts
  └── components/
        ├── Academy.tsx
        ├── Admin.tsx
        ├── Auth.tsx
        ├── Calendar.tsx
        ├── CloudDrive.tsx
        ├── CommandPalette.tsx
        ├── Community.tsx
        ├── Dashboard.tsx
        ├── Finance.tsx
        ├── HelpModal.tsx
        ├── JobMarket.tsx
        ├── Messages.tsx
        ├── Network.tsx
        ├── Notifications.tsx
        ├── OnboardingTour.tsx
        ├── PricingModal.tsx
        ├── Profile.tsx
        ├── ProjectHub.tsx
        ├── Resources.tsx
        ├── ResumeBuilder.tsx
        ├── Settings.tsx
        ├── ShortcutsModal.tsx
        ├── Sidebar.tsx
        ├── Studio.tsx
        └── Toast.tsx
`;

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
                className="w-full max-w-2xl bg-cad-panel border border-cad-border rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-cad-border flex justify-between items-center bg-cad-surface">
                    <h3 className="text-xl font-bold text-cad-text">Help & Resources</h3>
                    <button onClick={onClose} className="p-2 hover:bg-cad-border rounded-full text-cad-muted hover:text-cad-text transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-cad-border bg-cad-surface/50">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'general' ? 'border-cad-accent text-cad-accent' : 'border-transparent text-cad-muted hover:text-cad-text'}`}
                    >
                        User Guide
                    </button>
                    <button 
                        onClick={() => setActiveTab('developer')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'developer' ? 'border-cad-accent text-cad-accent' : 'border-transparent text-cad-muted hover:text-cad-text'}`}
                    >
                        Developer Info
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-cad-dark/50">
                    {activeTab === 'general' ? (
                        <>
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-cad-muted w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Search articles..." 
                                    className="w-full bg-cad-surface border border-cad-border rounded-xl pl-10 pr-4 py-3 text-sm text-cad-text focus:border-cad-accent outline-none font-medium"
                                />
                            </div>

                            {/* Quick Links */}
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex flex-col items-center justify-center p-4 bg-cad-surface rounded-xl border border-cad-border hover:border-cad-accent/50 hover:bg-cad-accent/5 transition-all gap-2 group">
                                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                                        <Book className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-cad-text">Documentation</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-4 bg-cad-surface rounded-xl border border-cad-border hover:border-cad-accent/50 hover:bg-cad-accent/5 transition-all gap-2 group">
                                    <div className="p-2 bg-green-500/10 text-green-500 rounded-lg group-hover:scale-110 transition-transform">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-cad-text">Live Chat</span>
                                </button>
                            </div>

                            {onRestartTour && (
                                <button 
                                    onClick={onRestartTour}
                                    className="w-full flex items-center justify-center gap-3 p-3 bg-cad-surface border border-cad-border hover:bg-cad-panel rounded-xl text-sm font-bold text-cad-text transition-all group"
                                >
                                    <RefreshCw className="w-4 h-4 text-cad-accent group-hover:rotate-180 transition-transform duration-500" />
                                    Restart App Tutorial
                                </button>
                            )}

                            {/* FAQ */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-cad-muted text-xs uppercase tracking-wider">Common Questions</h4>
                                {[
                                    'How do I withdraw earnings?',
                                    'Can I change my username?',
                                    'How does the escrow system work?',
                                    'Is the 3D viewer compatible with Mobile?'
                                ].map((q, i) => (
                                    <button key={i} className="w-full text-left p-3 rounded-lg hover:bg-cad-surface text-sm text-cad-text flex justify-between items-center group transition-colors">
                                        {q}
                                        <FileText className="w-4 h-4 text-cad-muted group-hover:text-cad-accent" />
                                    </button>
                                ))}
                            </div>

                            {/* Contact */}
                            <div className="pt-6 border-t border-cad-border">
                                <button className="w-full py-3 bg-cad-text text-cad-dark rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-lg">
                                    <Mail className="w-4 h-4" /> Contact Support
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3">
                                <Code className="w-5 h-5 text-blue-400 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-blue-100">Setup Instructions</h4>
                                    <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
                                        To run this project locally, create a Vite React (TypeScript) project and copy the files provided in the chat into the structure below.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-cad-text font-bold text-sm mb-3 flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-cad-accent" /> Installation
                                </h4>
                                <div className="bg-[#0f1423] p-4 rounded-xl border border-cad-border relative group">
                                    <code className="text-xs font-mono text-green-400 break-all">
                                        {installCommand}
                                    </code>
                                    <button 
                                        onClick={() => handleCopy(installCommand)}
                                        className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                    >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-cad-text font-bold text-sm mb-3 flex items-center gap-2">
                                    <FolderTree className="w-4 h-4 text-cad-accent" /> File Structure
                                </h4>
                                <div className="bg-[#0f1423] p-4 rounded-xl border border-cad-border overflow-x-auto">
                                    <pre className="text-[10px] font-mono text-slate-300 leading-relaxed">
                                        {fileStructure}
                                    </pre>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-cad-text font-bold text-sm mb-3 flex items-center gap-2">
                                    <Code className="w-4 h-4 text-cad-accent" /> .env Configuration
                                </h4>
                                <div className="bg-[#0f1423] p-4 rounded-xl border border-cad-border">
                                    <code className="text-xs font-mono text-yellow-400">
                                        VITE_API_KEY=your_gemini_api_key
                                    </code>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
