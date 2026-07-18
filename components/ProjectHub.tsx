
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Clock, FileText, MessageSquare, Upload, Video, AlertCircle, Download, Calendar, Check, Loader2, Wallet, Building2, Plus, X } from 'lucide-react';
import { Milestone, ProjectContract } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCurrentUser } from '../contexts/UserContext';
import {
    listMyProjects, createProject, listReadyToStart,
    updateMilestoneStatus, completeProject,
    ApiProject, ApiJobApplication, ApiMilestoneStatus,
} from '../services/api';

interface ProjectHubProps {
    onNavigate: (tab: string) => void;
}

// ── Type mappers ──────────────────────────────────────────────────────────────

function apiMilestoneStatusToLocal(s: ApiMilestoneStatus): Milestone['status'] {
    switch (s) {
        case 'IN_PROGRESS': return 'In Progress';
        case 'SUBMITTED':   return 'In Review';
        case 'APPROVED':    return 'Paid';
        default:            return 'Pending';
    }
}

function apiProjectToContract(p: ApiProject): ProjectContract {
    const budget = parseFloat(p.budget ?? '0') || 0;
    const milestones: Milestone[] = (p.milestones ?? []).map(m => ({
        id: m.id,
        title: m.title,
        amount: parseFloat(m.amount ?? '0') || 0,
        dueDate: m.dueDate ?? '',
        status: apiMilestoneStatusToLocal(m.status),
    }));
    const paidAmount = milestones.filter(m => m.status === 'Paid').reduce((acc, m) => acc + m.amount, 0);
    const statusMap: Record<ApiProject['status'], ProjectContract['status']> = {
        ACTIVE: 'Active', COMPLETED: 'Completed', CANCELLED: 'On Hold',
    };
    return {
        id: p.id,
        jobTitle: p.jobTitle ?? p.title,
        clientName: p.clientName ?? p.clientEmail,
        clientAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.clientName ?? p.clientEmail)}&background=1a1a2e&color=fff&size=32`,
        totalBudget: budget,
        escrowAmount: budget - paidAmount,
        paidAmount,
        startDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
        deadline: p.deadline ?? 'TBD',
        status: statusMap[p.status] ?? 'Active',
        milestones,
    };
}

// ── Create Project modal ──────────────────────────────────────────────────────

interface CreateModalProps {
    readyToStart: ApiJobApplication[];
    onClose: () => void;
    onCreated: () => void;
}

const CreateProjectModal: React.FC<CreateModalProps> = ({ readyToStart, onClose, onCreated }) => {
    const [selectedApp, setSelectedApp] = useState<string>('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApp || !title) { setError('Please select a proposal and enter a title.'); return; }
        setIsSubmitting(true);
        try {
            await createProject({ applicationId: selectedApp, title, description, budget, deadline });
            onCreated();
        } catch (err: any) {
            setError(err?.message ?? 'Failed to create project.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-cad-panel rounded-2xl border border-cad-border shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-cad-border">
                    <h3 className="text-lg font-bold text-cad-text">New Project</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-cad-text transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Accepted Proposal</label>
                        {readyToStart.length === 0 ? (
                            <p className="text-sm text-slate-500 py-2">No accepted proposals without a project yet.</p>
                        ) : (
                            <select
                                value={selectedApp}
                                onChange={e => setSelectedApp(e.target.value)}
                                className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2 text-sm text-cad-text focus:outline-none focus:border-cad-accent"
                            >
                                <option value="">Select a proposal…</option>
                                {readyToStart.map(app => (
                                    <option key={app.id} value={app.id}>
                                        {app.applicantDisplayName ?? app.applicantEmail} — {app.coverLetter?.slice(0, 60) ?? 'No cover letter'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Project Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Brand Identity Redesign"
                            className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2 text-sm text-cad-text placeholder-slate-600 focus:outline-none focus:border-cad-accent" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Budget ($)</label>
                            <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 2500"
                                className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2 text-sm text-cad-text placeholder-slate-600 focus:outline-none focus:border-cad-accent" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Deadline</label>
                            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                                className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2 text-sm text-cad-text focus:outline-none focus:border-cad-accent" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Scope, deliverables, expectations…"
                            className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2 text-sm text-cad-text placeholder-slate-600 focus:outline-none focus:border-cad-accent resize-none" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-cad-border text-sm text-slate-400 hover:text-cad-text transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || readyToStart.length === 0}
                            className="flex-1 py-2 rounded-lg bg-cad-accent text-cad-dark text-sm font-bold hover:bg-sky-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

const ProjectHub: React.FC<ProjectHubProps> = ({ onNavigate }) => {
    const { format } = useCurrency();
    const { role } = useCurrentUser();
    const isClient = role === 'CLIENT';

    const [contracts, setContracts] = useState<ProjectContract[]>([]);
    const [activeContractId, setActiveContractId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [readyToStart, setReadyToStart] = useState<ApiJobApplication[]>([]);

    // Funnel System State
    const [funnelMilestone, setFunnelMilestone] = useState<Milestone | null>(null);
    const [funnelStep, setFunnelStep] = useState(0);

    const activeContract = contracts.find(c => c.id === activeContractId) ?? contracts[0];

    const loadProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const projects = await listMyProjects();
            const mapped = projects.map(apiProjectToContract);
            setContracts(mapped);
            if (mapped.length > 0) setActiveContractId(mapped[0].id);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadProjects(); }, [loadProjects]);

    useEffect(() => {
        if (isClient && showCreateModal) {
            listReadyToStart().then(setReadyToStart).catch(() => setReadyToStart([]));
        }
    }, [isClient, showCreateModal]);

    const handleMilestoneAction = async (contractId: string, milestoneId: string, action: 'start' | 'submit' | 'approve') => {
        const newApiStatus: ApiMilestoneStatus = action === 'start' ? 'IN_PROGRESS' : action === 'submit' ? 'SUBMITTED' : 'APPROVED';

        if (action === 'approve') {
            const milestone = activeContract?.milestones.find(m => m.id === milestoneId);
            if (milestone) {
                setFunnelMilestone(milestone);
                setFunnelStep(0);
                setTimeout(() => setFunnelStep(1), 500);
                try {
                    await updateMilestoneStatus(contractId, milestoneId, newApiStatus);
                    setTimeout(() => {
                        setFunnelStep(2);
                        updateLocalMilestone(contractId, milestoneId, 'approve');
                        setTimeout(() => { setFunnelMilestone(null); setFunnelStep(0); }, 1500);
                    }, 3000);
                } catch {
                    setFunnelMilestone(null);
                    setFunnelStep(0);
                }
            }
        } else {
            setProcessingId(milestoneId);
            try {
                await updateMilestoneStatus(contractId, milestoneId, newApiStatus);
                updateLocalMilestone(contractId, milestoneId, action);
            } finally {
                setProcessingId(null);
            }
        }
    };

    const updateLocalMilestone = (contractId: string, milestoneId: string, action: 'start' | 'submit' | 'approve') => {
        setContracts(prev => prev.map(c => {
            if (c.id !== contractId) return c;
            const updatedMilestones = c.milestones.map(m => {
                if (m.id !== milestoneId) return m;
                if (action === 'start')  return { ...m, status: 'In Progress' as const };
                if (action === 'submit') return { ...m, status: 'In Review' as const };
                return { ...m, status: 'Paid' as const };
            });
            const newPaid = updatedMilestones.reduce((acc, m) => m.status === 'Paid' ? acc + m.amount : acc, 0);
            return { ...c, milestones: updatedMilestones, paidAmount: newPaid, escrowAmount: c.totalBudget - newPaid };
        }));
    };

    const handleCompleteProject = async (contractId: string) => {
        setProcessingId(contractId);
        try {
            await completeProject(contractId);
            setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status: 'Completed' } : c));
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 lg:p-12 h-full flex items-center justify-center bg-cad-dark">
                <Loader2 className="w-8 h-8 animate-spin text-cad-accent" />
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 h-full overflow-y-auto custom-scrollbar bg-cad-dark">
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-cad-text tracking-tight">Project Hub</h2>
                        <p className="text-cad-muted mt-2 font-light">Manage active contracts and milestones.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isClient && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-cad-accent text-cad-dark text-xs font-bold rounded-lg hover:bg-sky-400 transition-colors"
                            >
                                <Plus className="w-3 h-3" /> New Project
                            </button>
                        )}
                        {contracts.length > 0 && (
                            <div className="flex bg-cad-panel p-1 rounded-lg border border-cad-border overflow-x-auto max-w-full custom-scrollbar">
                                {contracts.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setActiveContractId(c.id)}
                                        className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeContractId === c.id ? 'bg-white text-black' : 'text-slate-500 hover:text-cad-text'}`}
                                    >
                                        {c.jobTitle.split(' ').slice(0, 2).join(' ')}…
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Empty state */}
                {contracts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-cad-panel border border-cad-border flex items-center justify-center mb-4">
                            <FileText className="w-7 h-7 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-bold text-cad-text mb-2">No projects yet</h3>
                        <p className="text-slate-500 text-sm max-w-xs">
                            {isClient
                                ? 'Accept a proposal in the Job Market, then create a project here to kick things off.'
                                : 'Once a client accepts your proposal and creates a project, it will appear here.'}
                        </p>
                        {isClient && (
                            <button onClick={() => setShowCreateModal(true)}
                                className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-cad-accent text-cad-dark text-sm font-bold rounded-lg hover:bg-sky-400 transition-colors">
                                <Plus className="w-4 h-4" /> New Project
                            </button>
                        )}
                    </div>
                )}

                {activeContract && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Contract Card */}
                            <div className="relative rounded-2xl overflow-hidden border border-cad-border bg-cad-panel shadow-2xl p-8 group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                                        <div>
                                            <div className="inline-flex items-center gap-2 mb-3">
                                                <span className={`w-2 h-2 rounded-full animate-pulse ${activeContract.status === 'Active' ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                                                <span className={`text-xs font-bold uppercase tracking-widest ${activeContract.status === 'Active' ? 'text-green-500' : 'text-slate-400'}`}>{activeContract.status}</span>
                                            </div>
                                            <h3 className="text-3xl font-bold text-cad-text mb-2">{activeContract.jobTitle}</h3>
                                            <div className="flex items-center gap-2">
                                                <img src={activeContract.clientAvatar} className="w-6 h-6 rounded-full" alt="Client" />
                                                <p className="text-slate-400 text-sm">Client: <span className="text-cad-text font-medium">{activeContract.clientName}</span></p>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Value</p>
                                            <p className="text-3xl font-mono text-cad-text font-bold">{format(activeContract.totalBudget)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 border-t border-cad-border pt-6">
                                        <div className="bg-cad-surface/30 rounded-xl p-4 border border-cad-border">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">In Escrow</p>
                                            <p className="text-xl font-bold text-blue-400">{format(activeContract.escrowAmount)}</p>
                                        </div>
                                        <div className="bg-cad-surface/30 rounded-xl p-4 border border-cad-border">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Paid</p>
                                            <p className="text-xl font-bold text-green-400">{format(activeContract.paidAmount)}</p>
                                        </div>
                                        <div className="bg-cad-surface/30 rounded-xl p-4 border border-cad-border">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Deadline</p>
                                            <p className="text-xl font-bold text-purple-400">{activeContract.deadline}</p>
                                        </div>
                                    </div>

                                    {isClient && activeContract.status === 'Active' && activeContract.milestones.every(m => m.status === 'Paid') && activeContract.milestones.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-cad-border">
                                            <button
                                                onClick={() => handleCompleteProject(activeContract.id)}
                                                disabled={processingId === activeContract.id}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-cad-text text-sm font-bold rounded-lg hover:bg-green-500 transition-colors border border-green-500 disabled:opacity-50"
                                            >
                                                {processingId === activeContract.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                Mark Project Complete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Milestones Timeline */}
                            <div className="bg-cad-panel rounded-2xl border border-cad-border p-8">
                                <h4 className="font-bold text-cad-text mb-8 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-cad-accent" /> Milestones & Payments
                                </h4>
                                {activeContract.milestones.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-8">No milestones defined for this project.</p>
                                ) : (
                                    <div className="relative space-y-8 pl-8">
                                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-cad-surface/50"></div>
                                        {activeContract.milestones.map((ms) => (
                                            <div key={ms.id} className="relative group">
                                                <div className={`absolute -left-[25px] top-1 w-[9px] h-[9px] rounded-full ring-4 ring-[#121214] z-10 ${
                                                    ms.status === 'Paid' ? 'bg-green-500' :
                                                    ms.status === 'In Progress' ? 'bg-cad-accent' :
                                                    ms.status === 'In Review' ? 'bg-yellow-500' : 'bg-slate-700'
                                                }`}></div>

                                                <div className={`p-5 rounded-xl border transition-all ${
                                                    ms.status === 'In Progress' || ms.status === 'In Review'
                                                    ? 'bg-white/[0.04] border-cad-border shadow-lg'
                                                    : 'bg-white/[0.02] border-cad-border opacity-80 hover:opacity-100'
                                                }`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h5 className={`font-bold text-lg ${ms.status === 'Pending' ? 'text-slate-500' : 'text-cad-text'}`}>{ms.title}</h5>
                                                        <span className="font-mono text-sm font-bold text-slate-400 bg-cad-surface/40 px-2 py-1 rounded">{format(ms.amount)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                                            ms.status === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            ms.status === 'In Review' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                            ms.status === 'In Progress' ? 'bg-cad-accent/10 text-cad-accent border-cad-accent/20' :
                                                            'bg-cad-surface text-slate-400 border-slate-700'
                                                        }`}>{ms.status}</span>
                                                        {ms.dueDate && (
                                                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" /> {ms.dueDate}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-cad-border flex gap-3">
                                                        {/* Designer: start work */}
                                                        {!isClient && ms.status === 'Pending' && (
                                                            <button
                                                                onClick={() => handleMilestoneAction(activeContract.id, ms.id, 'start')}
                                                                disabled={processingId === ms.id}
                                                                className="text-xs bg-cad-surface border border-cad-border text-cad-text px-4 py-2 rounded font-bold hover:bg-cad-accent/10 hover:border-cad-accent/40 hover:text-cad-accent transition-colors flex items-center gap-2"
                                                            >
                                                                {processingId === ms.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                                                                Start Work
                                                            </button>
                                                        )}
                                                        {/* Designer: submit work */}
                                                        {!isClient && ms.status === 'In Progress' && (
                                                            <button
                                                                onClick={() => handleMilestoneAction(activeContract.id, ms.id, 'submit')}
                                                                disabled={processingId === ms.id}
                                                                className="text-xs bg-cad-accent text-cad-dark px-4 py-2 rounded font-bold hover:bg-sky-400 transition-colors flex items-center gap-2"
                                                            >
                                                                {processingId === ms.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                                                Submit Work
                                                            </button>
                                                        )}
                                                        {/* Client: approve */}
                                                        {isClient && ms.status === 'In Review' && (
                                                            <button
                                                                onClick={() => handleMilestoneAction(activeContract.id, ms.id, 'approve')}
                                                                disabled={processingId === ms.id}
                                                                className="text-xs bg-green-600 text-cad-text px-4 py-2 rounded font-bold hover:bg-green-500 transition-colors flex items-center gap-2 border border-green-500"
                                                            >
                                                                {processingId === ms.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                                Approve & Pay
                                                            </button>
                                                        )}
                                                        {ms.status === 'Paid' && (
                                                            <div className="flex items-center gap-2 text-xs font-bold text-green-500">
                                                                <CheckCircle2 className="w-4 h-4" /> Payment Released
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Widgets */}
                        <div className="space-y-6">
                            <div className="bg-cad-panel rounded-2xl border border-cad-border p-6 shadow-lg">
                                <h4 className="font-bold text-cad-text mb-4 text-xs uppercase tracking-wider">Quick Actions</h4>
                                <div className="space-y-2">
                                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-cad-surface/30 text-slate-400 hover:text-cad-text transition-colors text-sm font-medium border border-transparent hover:border-cad-border">
                                        <MessageSquare className="w-4 h-4" /> Message {isClient ? 'Designer' : 'Client'}
                                    </button>
                                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-cad-surface/30 text-slate-400 hover:text-cad-text transition-colors text-sm font-medium border border-transparent hover:border-cad-border">
                                        <Video className="w-4 h-4" /> Schedule Meeting
                                    </button>
                                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-cad-surface/30 text-slate-400 hover:text-cad-text transition-colors text-sm font-medium border border-transparent hover:border-cad-border">
                                        <AlertCircle className="w-4 h-4" /> Report Issue
                                    </button>
                                </div>
                            </div>

                            <div className="bg-cad-panel rounded-2xl border border-cad-border p-6 shadow-lg">
                                <h4 className="font-bold text-cad-text mb-4 text-xs uppercase tracking-wider">Project Files</h4>
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-cad-border hover:bg-cad-surface/30 transition-colors cursor-pointer group">
                                            <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400 group-hover:text-blue-300">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-slate-300 truncate group-hover:text-cad-text">Requirements_v{i}.pdf</p>
                                                <p className="text-xs text-slate-600">2.4 MB • 2 days ago</p>
                                            </div>
                                            <Download className="w-4 h-4 text-slate-600 group-hover:text-cad-text transition-colors" />
                                        </div>
                                    ))}
                                    <button className="w-full py-3 border border-dashed border-cad-border text-slate-500 text-xs font-bold rounded-xl hover:text-cad-accent hover:border-cad-accent/30 hover:bg-cad-accent/5 transition-all flex items-center justify-center gap-2">
                                        <Upload className="w-3 h-3" /> Upload File
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Funnel Modal */}
            {funnelMilestone && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-cad-dark rounded-3xl border border-cad-border shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="p-6 text-center border-b border-cad-border bg-cad-surface/50">
                            {funnelStep === 2 ? (
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4 animate-in zoom-in">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                            ) : (
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cad-accent/20 text-cad-accent mb-4 relative">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-cad-text">
                                {funnelStep === 0 ? 'Initializing Payment…' : funnelStep === 1 ? 'Processing Funnel' : 'Payment Complete'}
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Distributing funds securely.</p>
                        </div>

                        <div className="p-8 relative">
                            <div className="flex justify-center mb-8 relative z-10">
                                <div className="bg-cad-surface/30 border border-cad-border px-6 py-3 rounded-2xl text-center min-w-[180px]">
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Released</div>
                                    <div className="text-2xl font-mono text-cad-text font-bold">{format(funnelMilestone.amount)}</div>
                                </div>
                            </div>

                            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full h-16 flex justify-center">
                                <div className={`absolute top-0 left-[50%] w-[2px] h-full origin-top -rotate-[25deg] transition-all duration-700 bg-gradient-to-b from-white/20 ${funnelStep >= 1 ? 'to-purple-500' : 'to-transparent'}`}></div>
                                <div className={`absolute top-0 right-[50%] w-[2px] h-full origin-top rotate-[25deg] transition-all duration-700 bg-gradient-to-b from-white/20 ${funnelStep >= 1 ? 'to-green-500' : 'to-transparent'}`}></div>
                            </div>

                            <div className="flex justify-between items-start gap-4 mt-8 relative z-10">
                                <div className={`flex-1 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center transition-all duration-700 ${funnelStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Platform Fee</div>
                                    <div className="text-lg font-bold text-cad-text mt-1">-{format(funnelMilestone.amount * 0.10)}</div>
                                    <div className="text-[10px] text-slate-500 mt-1">10% Commission</div>
                                </div>

                                <div className={`flex-1 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center transition-all duration-700 delay-100 ${funnelStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-2">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div className="text-[10px] text-green-300 font-bold uppercase tracking-wider">Net Payout</div>
                                    <div className="text-lg font-bold text-cad-text mt-1">+{format(funnelMilestone.amount * 0.90)}</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Sent to Wallet</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Project Modal */}
            {showCreateModal && (
                <CreateProjectModal
                    readyToStart={readyToStart}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => { setShowCreateModal(false); loadProjects(); }}
                />
            )}
        </div>
    );
};

export default ProjectHub;
