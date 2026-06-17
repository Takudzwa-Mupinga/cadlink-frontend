
import React, { useMemo, useState } from 'react';
import { Play, Pause, Calendar, ArrowRight, Briefcase, Zap, MoreHorizontal, Sun, Clock, Activity, Users, CreditCard, CheckCircle2, X, FileText, MessageSquare, Star, TrendingUp, DollarSign, Newspaper, ExternalLink, Video, Box, Search, Layers, Command } from 'lucide-react';
import { CURRENT_USER, MOCK_EVENTS } from '../constants';

interface DashboardProps {
    timerState: {
        isRunning: boolean;
        elapsedTime: number;
        project: string;
    };
    onToggleTimer: () => void;
    onProjectChange: (project: string) => void;
    onNavigate?: (tab: string) => void;
}

const ActivityHeatmap = () => {
    // Use memo to prevent regeneration on re-renders
    const data = useMemo(() => {
        const weeks = 26; // Half a year
        const days = 7;
        const grid = [];
        for (let i = 0; i < weeks; i++) {
            const week = [];
            for (let j = 0; j < days; j++) {
                // Weighted random for more realistic activity
                const rand = Math.random();
                let intensity = 0;
                if (rand > 0.92) intensity = 4;
                else if (rand > 0.75) intensity = 3;
                else if (rand > 0.5) intensity = 2;
                else if (rand > 0.25) intensity = 1;
                week.push(intensity);
            }
            grid.push(week);
        }
        return grid;
    }, []);

    const getColor = (intensity: number) => {
        switch(intensity) {
            case 1: return 'bg-cad-accent/20 border-cad-accent/5';
            case 2: return 'bg-cad-accent/50 border-cad-accent/10';
            case 3: return 'bg-cad-accent border-cad-accent/20';
            case 4: return 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)] border-white'; 
            default: return 'bg-white/5 border-transparent';
        }
    };

    const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']; 

    return (
        <div className="glass-panel p-6 rounded-2xl border border-cad-border relative overflow-hidden group hover:border-cad-accent/20 transition-colors">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-cad-accent/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cad-accent/10 transition-colors duration-700"></div>

            <div className="flex justify-between items-end mb-6 relative z-10">
                <div>
                    <h3 className="font-bold text-cad-text text-base flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cad-accent" /> Contribution Graph
                    </h3>
                    <p className="text-xs text-cad-muted mt-1">1,248 commits in the last 6 months</p>
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] text-cad-muted font-medium">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-white/5 border border-transparent"></div>
                    <div className="w-3 h-3 rounded-sm bg-cad-accent/20 border border-cad-accent/5"></div>
                    <div className="w-3 h-3 rounded-sm bg-cad-accent/50 border border-cad-accent/10"></div>
                    <div className="w-3 h-3 rounded-sm bg-cad-accent border border-cad-accent/20"></div>
                    <div className="w-3 h-3 rounded-sm bg-white border border-white shadow-[0_0_4px_rgba(255,255,255,0.5)]"></div>
                    <span>More</span>
                </div>
            </div>
            
            <div className="relative z-10 flex gap-3">
                <div className="flex flex-col justify-between py-[3px] text-[9px] font-bold text-cad-muted h-[108px] text-right leading-none opacity-60">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                </div>

                <div className="overflow-x-auto custom-scrollbar pb-2 flex-1">
                    <div className="flex text-[10px] font-bold text-cad-muted mb-2 gap-[38px] px-1">
                        {months.map(m => <span key={m}>{m}</span>)}
                    </div>

                    <div className="flex gap-[3px]">
                        {data.map((week, wIdx) => (
                            <div key={wIdx} className="flex flex-col gap-[3px]">
                                {week.map((val, dIdx) => (
                                    <div 
                                        key={`${wIdx}-${dIdx}`} 
                                        className={`w-3 h-3 rounded-[2px] ${getColor(val)} transition-all duration-200 hover:scale-150 hover:z-20 hover:rounded-sm border cursor-pointer relative`}
                                        title={`${val === 0 ? 'No' : val * 2 + 1} contributions`}
                                    ></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlatformPillars = ({ onNavigate }: { onNavigate?: (t: string) => void }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
                onClick={() => onNavigate && onNavigate('market')}
                className="relative rounded-3xl overflow-hidden cursor-pointer group h-40 border border-white/10 shadow-lg hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-blue-950"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
                
                <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-glow">
                            <Search className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-blue-400 transition-colors">Find Contracts</h3>
                        <p className="text-xs text-slate-400">Bid on high-value engineering projects.</p>
                    </div>
                </div>
            </div>

            <div 
                onClick={() => onNavigate && onNavigate('market')}
                className="relative rounded-3xl overflow-hidden cursor-pointer group h-40 border border-white/10 shadow-lg hover:shadow-2xl hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-purple-950"></div>
                <div className="absolute inset-0 opacity-20"><div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px]"></div></div>

                <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-glow">
                            <Box className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-purple-400 transition-colors">Sell Services</h3>
                        <p className="text-xs text-slate-400">Monetize your skills with fixed-price gigs.</p>
                    </div>
                </div>
            </div>

            <div 
                onClick={() => onNavigate && onNavigate('studio')}
                className="relative rounded-3xl overflow-hidden cursor-pointer group h-40 border border-white/10 shadow-lg hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-emerald-950"></div>
                
                <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow">
                            <Users className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-emerald-400 transition-colors">Team Studio</h3>
                        <p className="text-xs text-slate-400">Real-time collaboration & design review.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OnboardingChecklist = () => {
    const [isVisible, setIsVisible] = useState(true);
    const steps = [
        { id: 1, label: "Complete your Profile", done: true },
        { id: 2, label: "Upload Portfolio Item", done: true },
        { id: 3, label: "Apply to your first Job", done: false },
        { id: 4, label: "Join a Community Discussion", done: false },
    ];

    if (!isVisible) return null;

    return (
        <div className="glass-panel p-6 rounded-2xl border border-cad-border relative overflow-hidden mb-8 animate-in slide-in-from-top-4">
            <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-4 h-4"/></button>
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cad-accent to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cad-accent/20 shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-cad-text text-lg">Getting Started</h3>
                    <p className="text-sm text-cad-muted mb-4">Complete these steps to verify your account and boost your visibility.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {steps.map(step => (
                            <div key={step.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${step.done ? 'text-cad-muted line-through decoration-slate-600' : 'text-cad-text bg-white/5'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${step.done ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'border-slate-600'}`}>
                                    {step.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                                <span className="text-sm font-medium">{step.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-1/2 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ timerState, onToggleTimer, onProjectChange, onNavigate }) => {
    const [viewMode, setViewMode] = useState<'freelancer' | 'client'>('freelancer');

    const { isTimerRunning, elapsedTime, selectedProject } = {
        isTimerRunning: timerState?.isRunning || false,
        elapsedTime: timerState?.elapsedTime || 0,
        selectedProject: timerState?.project || 'No Project'
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-8 lg:p-12 relative">
            <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500 pb-20 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-2">
                    <div>
                        <div className="flex items-center gap-2 text-cad-accent mb-3 bg-cad-accent/10 w-fit px-3 py-1.5 rounded-full border border-cad-accent/20 backdrop-blur-sm">
                            <Sun className="w-3.5 h-3.5" />
                            <span className="font-mono text-[10px] uppercase tracking-wider font-bold">Good Morning</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-cad-text tracking-tight mb-2">Hello, {CURRENT_USER.name.split(' ')[0]}.</h2>
                        <p className="text-cad-muted text-lg font-light max-w-2xl">
                            {viewMode === 'freelancer' 
                                ? "You have 3 meetings and 1 deadline pending. Your efficiency is up 12% this week."
                                : "You have 2 active contracts and 65 new applicants to review for your open roles."
                            }
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-4">
                        <div className="flex bg-[#121214] p-1 rounded-xl border border-white/10 shadow-lg">
                            <button 
                                onClick={() => setViewMode('freelancer')}
                                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'freelancer' ? 'bg-cad-accent text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                Freelancer
                            </button>
                            <button 
                                onClick={() => setViewMode('client')}
                                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'client' ? 'bg-cad-accent text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                Client
                            </button>
                        </div>
                    </div>
                </div>

                <PlatformPillars onNavigate={onNavigate} />
                <OnboardingChecklist />

                {viewMode === 'freelancer' ? (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* LEFT COLUMN (2/3) */}
                        <div className="xl:col-span-2 space-y-8">
                            {/* Time Tracker Widget */}
                            <div className="glass-panel rounded-2xl p-0 overflow-hidden relative group border border-cad-border shadow-premium">
                                <div className="px-8 py-5 border-b border-cad-border bg-white/[0.02] flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-cad-text flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-cad-accent" /> Work Session
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-xs font-mono text-green-400">ONLINE</span>
                                    </div>
                                </div>
                                
                                <div className="p-8 relative">
                                    <div className="flex flex-col md:flex-row items-center gap-10">
                                        <div className="flex-1 w-full space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-cad-muted font-bold uppercase tracking-widest">Active Project</label>
                                                <div className="relative group/select">
                                                    <select 
                                                        value={selectedProject}
                                                        onChange={(e) => onProjectChange(e.target.value)}
                                                        className="w-full bg-[#050505] text-cad-text border border-cad-border rounded-xl px-5 py-4 focus:border-cad-accent outline-none font-medium appearance-none transition-all cursor-pointer hover:border-white/20 text-lg shadow-inner"
                                                    >
                                                        <option>HVAC Layout - BuildTech</option>
                                                        <option>Villa Rendering - ArchViz</option>
                                                        <option>Internal: Portfolio Update</option>
                                                        <option>{selectedProject}</option>
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-x-1/2 pointer-events-none text-slate-500">
                                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-center md:text-right min-w-[240px] flex flex-col items-center md:items-end bg-[#050505] p-6 rounded-2xl border border-cad-border shadow-inner">
                                            <div className={`font-mono text-5xl font-bold tracking-wider tabular-nums transition-all ${isTimerRunning ? 'text-white' : 'text-slate-500'}`}>
                                                {formatTime(elapsedTime)}
                                            </div>
                                            <div className="mt-5 w-full">
                                                 <button 
                                                    onClick={onToggleTimer}
                                                    className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                                        isTimerRunning 
                                                        ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                                                        : 'bg-cad-accent text-cad-dark hover:bg-violet-400 shadow-glow-accent'
                                                    }`}
                                                >
                                                    {isTimerRunning ? <><Pause className="w-3.5 h-3.5 fill-current" /> Pause</> : <><Play className="w-3.5 h-3.5 fill-current" /> Start Focus</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Projects Grid */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="font-bold text-cad-text text-lg">Active Projects</h3>
                                    <button className="text-xs font-bold text-cad-muted hover:text-cad-text transition-colors uppercase tracking-wider">View All</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div 
                                        onClick={() => onNavigate && onNavigate('projects')}
                                        className="glass-card p-6 rounded-2xl transition-all hover:bg-white/[0.05] cursor-pointer group border border-cad-border hover:border-cad-accent/30 relative"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-blue-900/20 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20 uppercase tracking-wide">Due in 2 days</span>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-cad-text text-lg group-hover:text-cad-accent transition-colors mb-1">Commercial Complex HVAC</h4>
                                        <p className="text-sm text-cad-muted">BuildTech Solutions</p>
                                        <div className="mt-6">
                                            <div className="flex justify-between text-[10px] font-bold text-cad-muted mb-2 uppercase tracking-wide">
                                                <span>Progress</span>
                                                <span className="text-cad-text">75%</span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-cad-accent h-full rounded-full shadow-[0_0_10px_rgba(139,92,246,0.4)]" style={{ width: '75%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                     <div 
                                        onClick={() => onNavigate && onNavigate('projects')}
                                        className="glass-card p-6 rounded-2xl transition-all hover:bg-white/[0.05] cursor-pointer group border border-cad-border hover:border-cad-accent/30 relative"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20 uppercase tracking-wide">On Track</span>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-cad-text text-lg group-hover:text-cad-accent transition-colors mb-1">Tesla Chassis Design</h4>
                                        <p className="text-sm text-cad-muted">Tesla Dynamics</p>
                                        <div className="mt-6">
                                            <div className="flex justify-between text-[10px] font-bold text-cad-muted mb-2 uppercase tracking-wide">
                                                <span>Progress</span>
                                                <span className="text-cad-text">30%</span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]" style={{ width: '30%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (1/3) */}
                        <div className="space-y-8">
                             {/* Stats Row */}
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="glass-card p-5 rounded-2xl border border-cad-border relative overflow-hidden group">
                                    <p className="text-[10px] text-cad-muted font-bold uppercase tracking-wider mb-2">Weekly Earnings</p>
                                    <p className="text-2xl font-bold text-cad-text tracking-tight group-hover:text-cad-success transition-colors">R7,350</p>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cad-success/50 to-transparent"></div>
                                 </div>
                                 <div className="glass-card p-5 rounded-2xl border border-cad-border relative overflow-hidden group">
                                    <p className="text-[10px] text-cad-muted font-bold uppercase tracking-wider mb-2">Hours Logged</p>
                                    <p className="text-2xl font-bold text-cad-text tracking-tight group-hover:text-cad-accent transition-colors">32.5h</p>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cad-accent/50 to-transparent"></div>
                                 </div>
                            </div>

                            <ActivityHeatmap />
                            
                            {/* Agenda */}
                            <div className="glass-panel rounded-2xl p-0 flex flex-col border border-cad-border shadow-xl h-full max-h-[500px]">
                                <div className="p-6 border-b border-cad-border flex justify-between items-center">
                                    <h3 className="font-bold text-cad-text text-sm flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-cad-accent" /> Upcoming
                                    </h3>
                                    <button className="text-xs font-bold text-cad-muted hover:text-cad-text uppercase tracking-wider">View Calendar</button>
                                </div>

                                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                    {MOCK_EVENTS.map((event, index) => (
                                        <div key={event.id} className="relative pl-6 group">
                                            <div className="absolute left-[3px] top-2 bottom-0 w-px bg-cad-border group-last:bottom-auto group-last:h-full"></div>
                                            <div className={`absolute left-0 top-1.5 w-[7px] h-[7px] rounded-full ring-4 ring-cad-panel ${
                                                event.type === 'Deadline' ? 'bg-red-500' : 'bg-cad-accent'
                                            }`}></div>
                                            
                                            <div className="transition-transform duration-300 group-hover:translate-x-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`font-bold text-sm leading-tight mb-1 ${event.type === 'Deadline' ? 'text-red-400' : 'text-cad-text'}`}>
                                                        {event.title}
                                                    </h4>
                                                    <span className="text-[10px] font-mono text-cad-muted bg-white/5 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap border border-white/5">{event.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 text-slate-500">
                        Client Dashboard View (Same Structure as before)
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
