import React, { useState, useEffect } from 'react';
import { Search, Box, Users, Briefcase, ArrowRight, Loader2, CheckCircle2, Clock, Award, FileText } from 'lucide-react';
import { useCurrentUser } from '../contexts/UserContext';
import { getMyStats, listMyProjects, listMyJobs, DesignerStats, ApiProject, ApiJob } from '../services/api';

interface DashboardProps {
    // timer props are accepted for compatibility but no longer used (the fake
    // time tracker was removed — there is no time-tracking backend).
    timerState?: { isRunning: boolean; elapsedTime: number; project: string };
    onToggleTimer?: () => void;
    onProjectChange?: (project: string) => void;
    onNavigate?: (tab: string) => void;
}

function projectProgress(p: ApiProject): number {
    const ms = p.milestones ?? [];
    if (ms.length === 0) return 0;
    const approved = ms.filter(m => m.status === 'APPROVED').length;
    return Math.round((approved / ms.length) * 100);
}

const Pillar = ({ icon: Icon, title, desc, color, onClick }: any) => (
    <div
        onClick={onClick}
        className="relative rounded-3xl overflow-hidden cursor-pointer group h-40 border border-cad-border shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-cad-panel"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 ${color} rounded-full blur-[60px] opacity-20`}></div>
        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl ${color}/20 border border-cad-border flex items-center justify-center text-cad-accent`}>
                    <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cad-text transition-colors" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-cad-text mb-0.5 group-hover:text-cad-accent transition-colors">{title}</h3>
                <p className="text-xs text-cad-muted">{desc}</p>
            </div>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { firstName: ctxFirstName, email, role } = useCurrentUser();
    const firstName = ctxFirstName || email.split('@')[0] || 'there';
    const isClient = role === 'CLIENT';

    const [projects, setProjects] = useState<ApiProject[]>([]);
    const [stats, setStats] = useState<DesignerStats | null>(null);
    const [myJobs, setMyJobs] = useState<ApiJob[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tasks: Promise<any>[] = [listMyProjects().then(setProjects).catch(() => {})];
        if (isClient) tasks.push(listMyJobs().then(setMyJobs).catch(() => {}));
        else tasks.push(getMyStats().then(setStats).catch(() => {}));
        Promise.allSettled(tasks).finally(() => setLoading(false));
    }, [isClient]);

    const activeProjects = projects.filter(p => p.status === 'ACTIVE');
    const completedCount = projects.filter(p => p.status === 'COMPLETED').length;
    const openJobs = myJobs.filter(j => j.status === 'OPEN').length;

    const go = (tab: string) => onNavigate && onNavigate(tab);

    const subtitle = isClient
        ? `You have ${activeProjects.length} active ${activeProjects.length === 1 ? 'project' : 'projects'} and ${openJobs} open ${openJobs === 1 ? 'contract' : 'contracts'}.`
        : activeProjects.length > 0
            ? `You have ${activeProjects.length} active ${activeProjects.length === 1 ? 'project' : 'projects'} on the go.`
            : `Browse the Job Market to find your next contract.`;

    const tiles = isClient
        ? [
            { label: 'Active Projects', value: activeProjects.length, icon: Briefcase },
            { label: 'Completed', value: completedCount, icon: CheckCircle2 },
            { label: 'Jobs Posted', value: myJobs.length, icon: FileText },
            { label: 'Open Contracts', value: openJobs, icon: Clock },
        ]
        : [
            { label: 'Active Projects', value: activeProjects.length, icon: Briefcase },
            { label: 'Completed', value: stats?.jobsCompleted ?? completedCount, icon: CheckCircle2 },
            { label: 'Proposals Sent', value: stats?.totalApplications ?? 0, icon: FileText },
            {
                label: 'Member Since',
                value: stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }) : '—',
                icon: Award,
            },
        ];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-8 lg:p-12 relative">
            <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500 pb-20 relative z-10">
                {/* Header */}
                <div className="pb-2">
                    <h2 className="text-4xl lg:text-5xl font-bold text-cad-text tracking-tight mb-2">Hello, {firstName}.</h2>
                    <p className="text-cad-muted text-lg font-light max-w-2xl">{subtitle}</p>
                </div>

                {/* Quick navigation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Pillar icon={Search} title="Job Market" desc={isClient ? 'Post a contract and review proposals.' : 'Find and bid on CAD contracts.'} color="bg-blue-500" onClick={() => go('market')} />
                    <Pillar icon={Box} title="Projects" desc="Track milestones and deliverables." color="bg-purple-500" onClick={() => go('projects')} />
                    <Pillar icon={Users} title="Network" desc={isClient ? 'Discover and connect with talent.' : 'Connect with other professionals.'} color="bg-emerald-500" onClick={() => go('network')} />
                </div>

                {/* Stat tiles — real data */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {tiles.map(t => (
                        <div key={t.label} className="glass-card p-5 rounded-2xl border border-cad-border">
                            <div className="flex items-center gap-2 text-cad-muted mb-3">
                                <t.icon className="w-4 h-4" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">{t.label}</p>
                            </div>
                            <p className="text-2xl font-bold text-cad-text tracking-tight">{loading ? '—' : t.value}</p>
                        </div>
                    ))}
                </div>

                {/* Active projects — real data */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="font-bold text-cad-text text-lg">Active Projects</h3>
                        <button onClick={() => go('projects')} className="text-xs font-bold text-cad-muted hover:text-cad-text transition-colors uppercase tracking-wider">View All</button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-cad-muted gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading projects…
                        </div>
                    ) : activeProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-cad-border rounded-2xl">
                            <div className="w-14 h-14 rounded-2xl bg-cad-panel border border-cad-border flex items-center justify-center mb-4">
                                <Briefcase className="w-6 h-6 text-slate-500" />
                            </div>
                            <h4 className="font-bold text-cad-text mb-1">No active projects</h4>
                            <p className="text-slate-500 text-sm max-w-xs mb-5">
                                {isClient ? 'Accept a proposal in the Job Market to start a project.' : 'Apply to contracts in the Job Market to land your next project.'}
                            </p>
                            <button onClick={() => go('market')} className="px-5 py-2.5 bg-cad-accent text-cad-dark text-sm font-bold rounded-lg hover:bg-violet-400 transition-colors flex items-center gap-2">
                                Go to Job Market <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeProjects.slice(0, 4).map(p => {
                                const progress = projectProgress(p);
                                const counterpart = isClient ? (p.designerName || p.designerEmail) : (p.clientName || p.clientEmail);
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => go('projects')}
                                        className="glass-card p-6 rounded-2xl transition-all hover:bg-white/[0.05] cursor-pointer group border border-cad-border hover:border-cad-accent/30"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-cad-accent/10 border border-cad-accent/20 flex items-center justify-center text-cad-accent group-hover:scale-110 transition-transform">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20 uppercase tracking-wide">Active</span>
                                        </div>
                                        <h4 className="font-bold text-cad-text text-lg group-hover:text-cad-accent transition-colors mb-1 truncate">{p.title || p.jobTitle || 'Project'}</h4>
                                        <p className="text-sm text-cad-muted truncate">{counterpart || '—'}</p>
                                        <div className="mt-6">
                                            <div className="flex justify-between text-[10px] font-bold text-cad-muted mb-2 uppercase tracking-wide">
                                                <span>Progress</span>
                                                <span className="text-cad-text">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-cad-surface/50 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-cad-accent h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
