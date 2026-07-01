
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, DollarSign, FileText, MessageSquare, Shield, Upload, Video, Zap, AlertCircle, Download, Briefcase, Calendar, Check, Loader2, ArrowDown, Wallet, Building2 } from 'lucide-react';
import { MOCK_CONTRACTS } from '../constants';
import { Milestone, ProjectContract } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';

interface ProjectHubProps {
    onNavigate: (tab: string) => void;
}

const ProjectHub: React.FC<ProjectHubProps> = ({ onNavigate }) => {
    const { format } = useCurrency();
    // Local state to manage contract updates
    const [contracts, setContracts] = useState<ProjectContract[]>(MOCK_CONTRACTS);
    const [activeContractId, setActiveContractId] = useState<string>(MOCK_CONTRACTS[0]?.id || '');
    const [processingId, setProcessingId] = useState<string | null>(null);
    
    // Funnel System State
    const [funnelMilestone, setFunnelMilestone] = useState<Milestone | null>(null);
    const [funnelStep, setFunnelStep] = useState(0); // 0: Init, 1: Processing, 2: Complete

    const activeContract = contracts.find(c => c.id === activeContractId) || contracts[0];

    // Simulate contract lifecycle actions
    const handleMilestoneAction = (contractId: string, milestoneId: string, action: 'submit' | 'approve') => {
        if (action === 'approve') {
            // Trigger Funnel System
            const milestone = activeContract.milestones.find(m => m.id === milestoneId);
            if (milestone) {
                setFunnelMilestone(milestone);
                setFunnelStep(0);
                
                // Sequence the funnel animation
                setTimeout(() => setFunnelStep(1), 500); // Start processing
                setTimeout(() => {
                    setFunnelStep(2); // Complete
                    finalizePayment(contractId, milestoneId);
                }, 3500);
            }
        } else {
            // Standard submit logic
            setProcessingId(milestoneId);
            setTimeout(() => {
                updateContractState(contractId, milestoneId, action);
                setProcessingId(null);
            }, 1500);
        }
    };

    const finalizePayment = (contractId: string, milestoneId: string) => {
        updateContractState(contractId, milestoneId, 'approve');
        // Close modal after a delay to show success state
        setTimeout(() => {
            setFunnelMilestone(null);
            setFunnelStep(0);
        }, 1500);
    };

    const updateContractState = (contractId: string, milestoneId: string, action: 'submit' | 'approve') => {
        setContracts(prev => prev.map(c => {
            if (c.id !== contractId) return c;
            
            const updatedMilestones = c.milestones.map(m => {
                if (m.id !== milestoneId) return m;
                
                if (action === 'submit') {
                    return { ...m, status: 'In Review' as const };
                } else if (action === 'approve') {
                    return { ...m, status: 'Paid' as const };
                }
                return m;
            });

            // Update total paid if needed
            const newPaid = updatedMilestones.reduce((acc, m) => m.status === 'Paid' ? acc + m.amount : acc, 0);

            return { ...c, milestones: updatedMilestones, paidAmount: newPaid };
        }));
    };

    return (
        <div className="p-8 lg:p-12 h-full overflow-y-auto custom-scrollbar bg-[#09090b]">
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                             Project Hub
                        </h2>
                        <p className="text-cad-muted mt-2 font-light">Manage active contracts and milestones.</p>
                    </div>
                    {/* Switcher */}
                    <div className="flex bg-[#18181b] p-1 rounded-lg border border-white/10 overflow-x-auto max-w-full custom-scrollbar">
                        {contracts.map(c => (
                            <button 
                                key={c.id}
                                onClick={() => setActiveContractId(c.id)}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeContractId === c.id ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                            >
                                {c.jobTitle.split(' ').slice(0, 2).join(' ')}...
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Contract Card */}
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#121214] shadow-2xl p-8 group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
                            
                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                                    <div>
                                        <div className="inline-flex items-center gap-2 mb-3">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            <span className="text-xs font-bold text-green-500 uppercase tracking-widest">{activeContract.status}</span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-2">{activeContract.jobTitle}</h3>
                                        <div className="flex items-center gap-2">
                                            <img src={activeContract.clientAvatar} className="w-6 h-6 rounded-full" alt="Client" />
                                            <p className="text-slate-400 text-sm">Client: <span className="text-white font-medium">{activeContract.clientName}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Value</p>
                                        <p className="text-3xl font-mono text-white font-bold">{format(activeContract.totalBudget)}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">In Escrow</p>
                                        <p className="text-xl font-bold text-blue-400">{format(activeContract.escrowAmount)}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Paid</p>
                                        <p className="text-xl font-bold text-green-400">{format(activeContract.paidAmount)}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Deadline</p>
                                        <p className="text-xl font-bold text-purple-400">{activeContract.deadline}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-[#121214] rounded-2xl border border-white/5 p-8">
                            <h4 className="font-bold text-white mb-8 text-sm uppercase tracking-wider flex items-center gap-2">
                                <Clock className="w-4 h-4 text-cad-accent" /> Milestones & Payments
                            </h4>
                            <div className="relative space-y-8 pl-8">
                                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10"></div>
                                {activeContract.milestones.map((ms, i) => (
                                    <div key={ms.id} className="relative group">
                                        <div className={`absolute -left-[25px] top-1 w-[9px] h-[9px] rounded-full ring-4 ring-[#121214] z-10 ${
                                            ms.status === 'Paid' ? 'bg-green-500' : 
                                            ms.status === 'In Progress' ? 'bg-cad-accent' : 
                                            ms.status === 'In Review' ? 'bg-yellow-500' : 'bg-slate-700'
                                        }`}></div>
                                        
                                        <div className={`p-5 rounded-xl border transition-all ${
                                            ms.status === 'In Progress' || ms.status === 'In Review' 
                                            ? 'bg-white/[0.04] border-white/10 shadow-lg' 
                                            : 'bg-white/[0.02] border-white/5 opacity-80 hover:opacity-100'
                                        }`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h5 className={`font-bold text-lg ${ms.status === 'Pending' ? 'text-slate-500' : 'text-white'}`}>{ms.title}</h5>
                                                <span className="font-mono text-sm font-bold text-slate-400 bg-black/30 px-2 py-1 rounded">{format(ms.amount)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                                    ms.status === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                                    ms.status === 'In Review' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    ms.status === 'In Progress' ? 'bg-cad-accent/10 text-cad-accent border-cad-accent/20' :
                                                    'bg-slate-800 text-slate-400 border-slate-700'
                                                }`}>{ms.status}</span>
                                                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {ms.dueDate}
                                                </span>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                                                {ms.status === 'In Progress' && (
                                                    <button 
                                                        onClick={() => handleMilestoneAction(activeContract.id, ms.id, 'submit')}
                                                        disabled={processingId === ms.id}
                                                        className="text-xs bg-cad-accent text-cad-dark px-4 py-2 rounded font-bold hover:bg-sky-400 transition-colors flex items-center gap-2"
                                                    >
                                                        {processingId === ms.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Upload className="w-3 h-3"/>}
                                                        Submit Work
                                                    </button>
                                                )}
                                                {/* Simulation for Client Approval */}
                                                {ms.status === 'In Review' && (
                                                    <button 
                                                        onClick={() => handleMilestoneAction(activeContract.id, ms.id, 'approve')}
                                                        disabled={processingId === ms.id}
                                                        className="text-xs bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-500 transition-colors flex items-center gap-2 border border-green-500"
                                                    >
                                                         {processingId === ms.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>}
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
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <div className="space-y-6">
                        <div className="bg-[#121214] rounded-2xl border border-white/5 p-6 shadow-lg">
                            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Quick Actions</h4>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors text-sm font-medium border border-transparent hover:border-white/5">
                                    <MessageSquare className="w-4 h-4" /> Message Client
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors text-sm font-medium border border-transparent hover:border-white/5">
                                    <Video className="w-4 h-4" /> Schedule Meeting
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors text-sm font-medium border border-transparent hover:border-white/5">
                                    <AlertCircle className="w-4 h-4" /> Report Issue
                                </button>
                            </div>
                        </div>
                        
                         <div className="bg-[#121214] rounded-2xl border border-white/5 p-6 shadow-lg">
                            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Project Files</h4>
                            <div className="space-y-3">
                                {[1,2].map(i => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-900/30">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-300 truncate group-hover:text-white">Requirements_v{i}.pdf</p>
                                            <p className="text-xs text-slate-600">2.4 MB • 2 days ago</p>
                                        </div>
                                        <Download className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                                    </div>
                                ))}
                                <button className="w-full py-3 border border-dashed border-white/10 text-slate-500 text-xs font-bold rounded-xl hover:text-cad-accent hover:border-cad-accent/30 hover:bg-cad-accent/5 transition-all flex items-center justify-center gap-2">
                                    <Upload className="w-3 h-3" /> Upload File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAYMENT FUNNEL MODAL (The "Funnel System") */}
            {funnelMilestone && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-[#0f172a] rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
                        
                        {/* Status Header */}
                        <div className="p-6 text-center border-b border-white/5 bg-[#1e293b]/50">
                            {funnelStep === 2 ? (
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4 animate-in zoom-in">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                            ) : (
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cad-accent/20 text-cad-accent mb-4 relative">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-white">
                                {funnelStep === 0 ? 'Initializing Payment...' : funnelStep === 1 ? 'Processing Funnel' : 'Payment Complete'}
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Distributing funds securely.</p>
                        </div>

                        {/* Funnel Visualization */}
                        <div className="p-8 relative">
                            {/* Source */}
                            <div className="flex justify-center mb-8 relative z-10">
                                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-center min-w-[180px]">
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Released</div>
                                    <div className="text-2xl font-mono text-white font-bold">{format(funnelMilestone.amount)}</div>
                                </div>
                            </div>

                            {/* Flow Lines */}
                            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full h-16 flex justify-center">
                                {/* Left Flow (Fee) */}
                                <div className={`absolute top-0 left-[50%] w-[2px] h-full origin-top -rotate-[25deg] transition-all duration-700 bg-gradient-to-b from-white/20 ${funnelStep >= 1 ? 'to-purple-500 h-full' : 'to-transparent h-0'}`}></div>
                                {/* Right Flow (Net) */}
                                <div className={`absolute top-0 right-[50%] w-[2px] h-full origin-top rotate-[25deg] transition-all duration-700 bg-gradient-to-b from-white/20 ${funnelStep >= 1 ? 'to-green-500 h-full' : 'to-transparent h-0'}`}></div>
                            </div>

                            {/* Destination Buckets */}
                            <div className="flex justify-between items-start gap-4 mt-8 relative z-10">
                                {/* Platform Fee Bucket */}
                                <div className={`flex-1 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center transition-all duration-700 ${funnelStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Platform Fee</div>
                                    <div className="text-lg font-bold text-white mt-1">-{format(funnelMilestone.amount * 0.10)}</div>
                                    <div className="text-[10px] text-slate-500 mt-1">10% Commission</div>
                                </div>

                                {/* Freelancer Net Bucket */}
                                <div className={`flex-1 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center transition-all duration-700 delay-100 ${funnelStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-2">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div className="text-[10px] text-green-300 font-bold uppercase tracking-wider">Net Payout</div>
                                    <div className="text-lg font-bold text-white mt-1">+{format(funnelMilestone.amount * 0.90)}</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Sent to Wallet</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectHub;
