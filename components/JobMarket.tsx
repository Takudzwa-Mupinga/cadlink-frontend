
import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Plus, Briefcase, Calculator, ChevronDown, Pencil, Sparkles, Loader2, Zap, Clock, DollarSign, Send, CheckCircle2, Bot, X, Image as ImageIcon, Bookmark, BookmarkCheck, UploadCloud, FileText, Paperclip, MapPin, Star, ExternalLink } from 'lucide-react';
import { JobType, Software, Job, ExperienceLevel, InterviewMessage } from '../types';
import { generateCoverLetter, enhanceServiceDescription, conductInterviewTurn } from '../services/geminiService';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCurrentUser } from '../contexts/UserContext';
import {
  listDesigners, TalentCard,
  ApiJob, ApiJobApplication, ApiJobType, ApiExperienceLevel, ApiApplicationStatus,
  listOpenJobs, postJob as apiPostJob, listMyJobs,
  applyToJob, listApplicationsForJob, updateApplicationStatus, listMyApplications,
  getDesignerProfileByUserId, DesignerProfilePayload,
  createProject,
  saveJob as apiSaveJob, unsaveJob as apiUnsaveJob,
} from '../services/api';

interface JobMarketProps {
    onStartProject?: (project: string) => void;
    onNavigate?: (tab: string) => void;
}

const JobMarket: React.FC<JobMarketProps> = ({ onStartProject, onNavigate }) => {
  const { format, symbol } = useCurrency();
  const { profile, email, role, firstName, lastName } = useCurrentUser();
  const currentUserName = [firstName, lastName].filter(Boolean).join(' ') || profile?.displayName || email || 'You';
  const isClient = role === 'CLIENT';
  const [viewMode, setViewMode] = useState<'jobs' | 'services' | 'proposals'>(isClient ? 'services' : 'jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apiJobs, setApiJobs] = useState<ApiJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [designers, setDesigners] = useState<TalentCard[]>([]);
  const [isLoadingDesigners, setIsLoadingDesigners] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState<TalentCard | null>(null);
  const [viewingProposals, setViewingProposals] = useState<ApiJob | null>(null);
  const [proposals, setProposals] = useState<ApiJobApplication[]>([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [viewingDesignerProfile, setViewingDesignerProfile] = useState<DesignerProfilePayload | null>(null);
  const [isLoadingDesignerProfile, setIsLoadingDesignerProfile] = useState(false);
  const [myApplications, setMyApplications] = useState<ApiJobApplication[]>([]);
  const [isLoadingMyApplications, setIsLoadingMyApplications] = useState(false);
  // Post-acceptance: prompt client to create a project
  const [acceptedApp, setAcceptedApp] = useState<ApiJobApplication | null>(null);
  const [createProjectTitle, setCreateProjectTitle] = useState('');
  const [createProjectBudget, setCreateProjectBudget] = useState('');
  const [createProjectDeadline, setCreateProjectDeadline] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ApiJobType | 'All'>('All');
  const [filterExperience, setFilterExperience] = useState<ApiExperienceLevel | 'All'>('All');
  const [filterSoftware, setFilterSoftware] = useState<string[]>([]);
  const [filterRemote, setFilterRemote] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Skill match — client-side overlap scoring
  const [showMatchOnly, setShowMatchOnly] = useState(false);
  const mySkills: string[] = (profile as any)?.skills ?? [];
  const matchScore = (aj: ApiJob) => {
    if (!mySkills.length || !aj.software?.length) return 0;
    return Math.round(
      aj.software.filter(s => mySkills.some(sk => sk.toLowerCase() === s.toLowerCase())).length
      / aj.software.length * 100
    );
  };
  
  // Selection & Modal States
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [isPostingService, setIsPostingService] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);
  const [isInterviewing, setIsInterviewing] = useState(false);

  // Proposal State
  const [coverLetter, setCoverLetter] = useState('');
  const [proposalCvUrl, setProposalCvUrl] = useState('');
  const [proposalAvailability, setProposalAvailability] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Post Job Wizard State
  const [postJobStep, setPostJobStep] = useState<1 | 2 | 3>(1);
  const [newJobPricingModel, setNewJobPricingModel] = useState<'FIXED' | 'HOURLY'>('FIXED');
  const [newJobBudgetFixed, setNewJobBudgetFixed] = useState('');
  const [newJobBudgetHourlyMin, setNewJobBudgetHourlyMin] = useState('');
  const [newJobBudgetHourlyMax, setNewJobBudgetHourlyMax] = useState('');
  const [newJob, setNewJob] = useState<Partial<Job>>({
      title: '',
      client: 'My Company Inc.',
      budget: '',
      description: '',
      type: JobType.FREELANCE,
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      software: [],
      discipline: '',
      deliverables: [],
      duration: '',
  });

  // File upload state for Post Job form
  const [jobAttachments, setJobAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/png': 'PNG',
    'image/jpeg': 'JPG',
    'image/jpg': 'JPG',
    'image/svg+xml': 'SVG',
  };
  const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.svg', '.dwg', '.dxf'];
  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILES = 5;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError('');
    const incoming = Array.from(e.target.files || []);
    const errors: string[] = [];
    const valid: File[] = [];

    for (const file of incoming) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAllowedType = ALLOWED_TYPES[file.type] || ['.dwg', '.dxf'].includes(ext);
      const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
      const isUnderLimit = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;

      if (!isAllowedType && !isAllowedExt) {
        errors.push(`"${file.name}" — unsupported file type.`);
      } else if (!isUnderLimit) {
        errors.push(`"${file.name}" — exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      } else {
        valid.push(file);
      }
    }

    const combined = [...jobAttachments, ...valid];
    if (combined.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} files allowed.`);
      valid.splice(MAX_FILES - jobAttachments.length);
    }

    if (errors.length) setAttachmentError(errors.join(' '));
    setJobAttachments(prev => [...prev, ...valid].slice(0, MAX_FILES));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setJobAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentError('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Post Service Form State
  const [newService, setNewService] = useState<Partial<ServiceGig>>({
      title: 'I will ',
      price: 0,
      deliveryTime: '',
      description: '',
      software: []
  });
  const [isEnhancingDesc, setIsEnhancingDesc] = useState(false);


  // Interview Coach
  const [interviewMessages, setInterviewMessages] = useState<InterviewMessage[]>([]);
  const [userInterviewInput, setUserInterviewInput] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const interviewEndRef = useRef<HTMLDivElement>(null);

  // ── API ↔ UI converters ────────────────────────────────────────────────────
  const apiJobToJob = (aj: ApiJob): Job => {
    const typeMap: Record<ApiJobType, JobType> = { FREELANCE: JobType.FREELANCE, PERMANENT: JobType.PERMANENT, CONTRACT: JobType.CONTRACT };
    const levelMap: Record<ApiExperienceLevel, ExperienceLevel> = { ENTRY: ExperienceLevel.ENTRY, INTERMEDIATE: ExperienceLevel.INTERMEDIATE, EXPERT: ExperienceLevel.EXPERT };
    const diffH = Math.floor((Date.now() - new Date(aj.postedAt).getTime()) / 3600000);
    const rel = diffH < 1 ? 'Just now' : diffH < 24 ? `${diffH}h ago` : `${Math.floor(diffH / 24)}d ago`;
    return {
      id: aj.id,
      title: aj.title,
      client: aj.clientEmail?.split('@')[0] || 'Client',
      type: typeMap[aj.type] ?? JobType.FREELANCE,
      experienceLevel: levelMap[aj.experienceLevel] ?? ExperienceLevel.INTERMEDIATE,
      budget: aj.budget,
      software: (aj.software || []) as Software[],
      description: aj.description,
      postedAt: rel,
      requirements: aj.requirements,
    };
  };
  const jobTypeToApi = (t: JobType): ApiJobType => ({ [JobType.FREELANCE]: 'FREELANCE', [JobType.PERMANENT]: 'PERMANENT', [JobType.CONTRACT]: 'CONTRACT' }[t] as ApiJobType);
  const expLevelToApi = (e: ExperienceLevel): ApiExperienceLevel => ({ [ExperienceLevel.ENTRY]: 'ENTRY', [ExperienceLevel.INTERMEDIATE]: 'INTERMEDIATE', [ExperienceLevel.EXPERT]: 'EXPERT' }[e] as ApiExperienceLevel);

  // Placeholder User
  const currentUser = {
      role: 'Mechanical Engineer',
      skills: [Software.SOLIDWORKS, Software.AUTOCAD, Software.FUSION360],
      pastActivity: "Recently applied to 'Senior Mechanical Design Engineer'."
  };

  const toggleSaveJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    const isSaved = apiJobs.find(j => j.id === jobId)?.savedByMe ?? false;
    // optimistic update
    setApiJobs(prev => prev.map(j => j.id === jobId ? { ...j, savedByMe: !isSaved } : j));
    try {
      if (isSaved) await apiUnsaveJob(jobId);
      else await apiSaveJob(jobId);
    } catch {
      setApiJobs(prev => prev.map(j => j.id === jobId ? { ...j, savedByMe: isSaved } : j));
    }
  };

  const filteredJobs = jobs.filter(job => {
    const aj = apiJobs.find(j => j.id === job.id);
    if (!aj) return false;
    if (filterType !== 'All' && aj.type !== filterType) return false;
    if (filterExperience !== 'All' && aj.experienceLevel !== filterExperience) return false;
    if (filterRemote !== null && aj.remote !== filterRemote) return false;
    if (filterSoftware.length > 0 && !filterSoftware.some(s => aj.software?.includes(s))) return false;
    if (showSavedOnly && !aj.savedByMe) return false;
    if (showMatchOnly && matchScore(aj) === 0) return false;
    const q = searchTerm.toLowerCase();
    if (q && !job.title.toLowerCase().includes(q) && !job.software.some(s => s.toLowerCase().includes(q))) return false;
    return true;
  });

  const sortedJobs = showMatchOnly
    ? [...filteredJobs].sort((a, b) => {
        const ajA = apiJobs.find(j => j.id === a.id);
        const ajB = apiJobs.find(j => j.id === b.id);
        return (ajB ? matchScore(ajB) : 0) - (ajA ? matchScore(ajA) : 0);
      })
    : filteredJobs;

  const filteredDesigners = designers.filter(d =>
    (d.displayName || d.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.headline || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || isSubmittingProposal) return;
    setIsSubmittingProposal(true);
    try {
      await applyToJob(selectedJob.id, {
        coverLetter,
        cvUrl: proposalCvUrl || undefined,
        availability: proposalAvailability || undefined,
      });
      setProposalSent(true);
      setTimeout(() => {
        setProposalSent(false);
        setSelectedJob(null);
        setCoverLetter(''); setProposalCvUrl(''); setProposalAvailability('');
        if (onStartProject) onStartProject(selectedJob.title);
      }, 2000);
    } catch {
      // silently ignore — could add toast here
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  const handleAiProposal = async () => {
      if (!selectedJob) return;
      setIsGeneratingAi(true);
      const generated = await generateCoverLetter(selectedJob.title, selectedJob.client, selectedJob.software);
      setCoverLetter(generated);
      setIsGeneratingAi(false);
  };

  const handleFindMatches = () => {
    setShowMatchOnly(v => !v);
  };

  const startInterview = async () => {
      if (!selectedJob) return;
      setIsInterviewing(true);
      setIsAiReplying(true);
      setInterviewMessages([]);
      const response = await conductInterviewTurn(selectedJob.title, selectedJob.description, []);
      setInterviewMessages([{ id: 'init', sender: 'ai', text: response.question, feedback: response.feedback }]);
      setIsAiReplying(false);
  };

  const handleSendInterview = async () => {
      if (!userInterviewInput.trim() || !selectedJob) return;
      const userMsg: InterviewMessage = { id: Date.now().toString(), sender: 'user', text: userInterviewInput };
      setInterviewMessages(prev => [...prev, userMsg]);
      setUserInterviewInput('');
      setIsAiReplying(true);
      const history = interviewMessages.map(m => ({ role: m.sender === 'ai' ? 'interviewer' : 'candidate', content: m.text }));
      history.push({ role: 'candidate', content: userMsg.text });
      const response = await conductInterviewTurn(selectedJob.title, selectedJob.description, history);
      setInterviewMessages(prev => [...prev, { id: (Date.now()+1).toString(), sender: 'ai', text: response.question, feedback: response.feedback }]);
      setIsAiReplying(false);
  };

  const resetPostJobForm = () => {
    setPostJobStep(1);
    setNewJobPricingModel('FIXED');
    setNewJobBudgetFixed('');
    setNewJobBudgetHourlyMin('');
    setNewJobBudgetHourlyMax('');
    setNewJob({ title: '', client: 'My Company Inc.', budget: '', description: '', type: JobType.FREELANCE, experienceLevel: ExperienceLevel.INTERMEDIATE, software: [], discipline: '', deliverables: [], duration: '' });
    setJobAttachments([]);
    setAttachmentError('');
  };

  // --- Post Job Handlers ---
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetDisplay = newJobPricingModel === 'FIXED'
      ? newJobBudgetFixed
      : `${newJobBudgetHourlyMin}–${newJobBudgetHourlyMax}/hr`;
    try {
      const created = await apiPostJob({
        title: newJob.title || 'Untitled Job',
        description: newJob.description || '',
        type: jobTypeToApi(newJob.type || JobType.FREELANCE),
        experienceLevel: expLevelToApi(newJob.experienceLevel || ExperienceLevel.INTERMEDIATE),
        budget: budgetDisplay,
        software: (newJob.software || []).map(s => String(s)),
        duration: newJob.duration || undefined,
        pricingModel: newJobPricingModel,
        budgetFixed: newJobPricingModel === 'FIXED' && newJobBudgetFixed ? parseFloat(newJobBudgetFixed) : undefined,
        budgetHourlyMin: newJobPricingModel === 'HOURLY' && newJobBudgetHourlyMin ? parseFloat(newJobBudgetHourlyMin) : undefined,
        budgetHourlyMax: newJobPricingModel === 'HOURLY' && newJobBudgetHourlyMax ? parseFloat(newJobBudgetHourlyMax) : undefined,
      } as any);
      setApiJobs(prev => [created, ...prev]);
      setJobs(prev => [apiJobToJob(created), ...prev]);
      setIsPostingJob(false);
      resetPostJobForm();
    } catch {
      // could add error toast here
    }
  };

  // --- Post Service Handlers ---
  const handlePostService = (e: React.FormEvent) => {
      e.preventDefault();
      const gig: ServiceGig = {
          id: `s-${Date.now()}`,
          title: newService.title || 'Untitled Service',
          freelancerName: currentUserName,
          freelancerAvatar: 'https://picsum.photos/200/200?random=100',
          price: newService.price || 0,
          deliveryTime: newService.deliveryTime || 'TBD',
          software: newService.software || [],
          description: newService.description || '',
          rating: 0,
          reviewsCount: 0,
          coverImage: `https://picsum.photos/600/400?random=${Date.now()}`,
          responseRate: 100
      };
      setServices([gig, ...services]);
      setIsPostingService(false);
      setNewService({ title: 'I will ', price: 0, deliveryTime: '', description: '', software: [] });
  };

  const handleEnhanceDescription = async () => {
      if (!newService.description) return;
      setIsEnhancingDesc(true);
      const enhanced = await enhanceServiceDescription(newService.title || 'Service', newService.description);
      setNewService({ ...newService, description: enhanced });
      setIsEnhancingDesc(false);
  };

  useEffect(() => { interviewEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [interviewMessages]);

  // Load open jobs for designers
  useEffect(() => {
    if (isClient) return;
    setIsLoadingJobs(true);
    listOpenJobs()
      .then(data => { setApiJobs(data); setJobs(data.map(apiJobToJob)); })
      .catch(() => {})
      .finally(() => setIsLoadingJobs(false));
  }, [isClient]);

  // Load client's own posted jobs
  useEffect(() => {
    if (!isClient) return;
    setIsLoadingJobs(true);
    listMyJobs()
      .then(data => { setApiJobs(data); setJobs(data.map(apiJobToJob)); })
      .catch(() => {})
      .finally(() => setIsLoadingJobs(false));
  }, [isClient]);

  // Load proposals when client opens a job
  useEffect(() => {
    if (!viewingProposals) { setProposals([]); return; }
    setIsLoadingProposals(true);
    listApplicationsForJob(viewingProposals.id)
      .then(setProposals)
      .catch(() => {})
      .finally(() => setIsLoadingProposals(false));
  }, [viewingProposals]);

  useEffect(() => {
    if (!isClient) return;
    setIsLoadingDesigners(true);
    listDesigners()
      .then(setDesigners)
      .catch(() => {})
      .finally(() => setIsLoadingDesigners(false));
  }, [isClient]);

  useEffect(() => {
    if (isClient) return;
    listMyApplications()
      .then(setMyApplications)
      .catch(() => {});
  }, [isClient]);

  useEffect(() => {
    if (isClient || viewMode !== 'proposals') return;
    setIsLoadingMyApplications(true);
    listMyApplications()
      .then(setMyApplications)
      .catch(() => {})
      .finally(() => setIsLoadingMyApplications(false));
  }, [isClient, viewMode]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 lg:p-12 bg-cad-dark">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-noise opacity-30 pointer-events-none z-0"></div>
      
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h2 className="text-3xl font-bold text-cad-text tracking-tight">
                    {isClient ? 'Find Talent' : 'Marketplace'}
                </h2>
                <p className="text-cad-muted mt-1 text-sm">
                    {isClient
                        ? 'Browse verified CAD designers or post a contract to your network.'
                        : 'Find and apply to contracts that match your skill profile.'}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                {isClient ? (
                    <div className="flex items-center gap-1 bg-cad-panel p-1 rounded-xl border border-cad-border flex-1 md:flex-none">
                        <button onClick={() => setViewMode('services')} className={`flex-1 md:flex-none text-center px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'services' ? 'bg-cad-accent text-cad-dark shadow-sm' : 'text-slate-500 hover:text-cad-text hover:bg-cad-surface'}`}>
                            Browse Talent
                        </button>
                        <button onClick={() => setViewMode('jobs')} className={`flex-1 md:flex-none text-center px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'jobs' ? 'bg-cad-accent text-cad-dark shadow-sm' : 'text-slate-500 hover:text-cad-text hover:bg-cad-surface'}`}>
                            My Contracts
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 bg-cad-panel p-1 rounded-xl border border-cad-border flex-1 md:flex-none">
                        <button onClick={() => setViewMode('jobs')} className={`flex-1 md:flex-none text-center px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'jobs' ? 'bg-cad-accent text-cad-dark shadow-sm' : 'text-slate-500 hover:text-cad-text hover:bg-cad-surface'}`}>
                            Contracts
                        </button>
                        <button onClick={() => setViewMode('proposals')} className={`flex-1 md:flex-none relative text-center px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'proposals' ? 'bg-cad-accent text-cad-dark shadow-sm' : 'text-slate-500 hover:text-cad-text hover:bg-cad-surface'}`}>
                            My Proposals
                            {myApplications.some(a => a.status === 'ACCEPTED') && viewMode !== 'proposals' && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border border-cad-panel" />
                            )}
                        </button>
                    </div>
                )}

                {/* Post Contract — clients only, and only when viewing contracts */}
                {isClient && viewMode === 'jobs' && (
                    <button
                        onClick={() => setIsPostingJob(true)}
                        className="flex-1 md:flex-none bg-cad-text text-cad-dark hover:opacity-90 font-bold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Post Contract
                    </button>
                )}
            </div>
        </div>

        {/* AI Banner — designers only */}
        {!isClient && viewMode === 'jobs' && (
            <div className="glass-panel p-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-blue-600/20 border border-indigo-500/30">
                <div className="bg-cad-panel rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xl">
                    <div className="relative z-10 flex gap-5 items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Sparkles className="w-6 h-6 text-cad-text" />
                        </div>
                        <div>
                            <h3 className="font-bold text-cad-text text-lg">Smart Match</h3>
                            <p className="text-cad-muted text-sm mt-1">
                              {mySkills.length > 0
                                ? <>Contracts ranked by overlap with your <span className="text-cad-text font-bold">{mySkills.length} skills</span>.</>
                                : <>Add skills in Settings to unlock skill-based matching.</>}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleFindMatches} disabled={mySkills.length === 0} className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-cad-text text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 relative z-10 flex items-center justify-center gap-2 active:scale-95">
                         <Zap className="w-4 h-4 text-yellow-200" />
                         {showMatchOnly ? 'Show All Contracts' : 'Find Matches'}
                    </button>
                </div>
            </div>
        )}

        {/* Search Bar */}
        <div className="glass-panel p-2 rounded-xl flex flex-col md:flex-row items-center gap-3 sticky top-4 z-20 shadow-2xl backdrop-blur-xl border border-cad-border bg-cad-panel/80">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3 text-slate-500 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder={isClient && viewMode === 'services' ? 'Search by name, software, or skill...' : 'Search contracts by keyword or software...'}
                    className="w-full bg-transparent border-none rounded-lg pl-10 pr-4 py-2.5 text-cad-text focus:outline-none placeholder-slate-500 text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="w-px h-6 bg-cad-border hidden md:block"></div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                {!isClient && (() => {
                    const savedCount = apiJobs.filter(j => j.savedByMe).length;
                    return (
                        <button
                            onClick={() => setShowSavedOnly(!showSavedOnly)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${showSavedOnly ? 'bg-cad-accent text-cad-dark' : 'text-slate-400 hover:text-cad-text hover:bg-cad-surface'}`}
                        >
                            <BookmarkCheck className="w-4 h-4" />
                            Saved
                            {savedCount > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${showSavedOnly ? 'bg-cad-dark/30 text-cad-dark' : 'bg-cad-accent/20 text-cad-accent'}`}>
                                    {savedCount}
                                </span>
                            )}
                        </button>
                    );
                })()}
                <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${showFilters ? 'bg-cad-surface text-cad-text' : 'text-slate-400 hover:text-cad-text'}`}>
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass-panel rounded-xl border border-cad-border p-5 space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-wrap gap-6">
              {/* Job Type */}
              <div className="flex-1 min-w-[180px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Job Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['All', 'FREELANCE', 'CONTRACT', 'PERMANENT'] as const).map(t => (
                    <button key={t} onClick={() => setFilterType(t as ApiJobType | 'All')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterType === t ? 'bg-cad-accent text-cad-dark border-cad-accent' : 'bg-cad-surface text-slate-400 border-cad-border hover:border-cad-accent/40'}`}>
                      {t === 'All' ? 'All Types' : t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="flex-1 min-w-[180px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Experience</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['All', 'ENTRY', 'INTERMEDIATE', 'EXPERT'] as const).map(e => (
                    <button key={e} onClick={() => setFilterExperience(e as ApiExperienceLevel | 'All')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterExperience === e ? 'bg-cad-accent text-cad-dark border-cad-accent' : 'bg-cad-surface text-slate-400 border-cad-border hover:border-cad-accent/40'}`}>
                      {e === 'All' ? 'All Levels' : e.charAt(0) + e.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remote */}
              <div className="flex-1 min-w-[150px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Location</p>
                <div className="flex flex-wrap gap-1.5">
                  {([null, true, false] as const).map(r => (
                    <button key={String(r)} onClick={() => setFilterRemote(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterRemote === r ? 'bg-cad-accent text-cad-dark border-cad-accent' : 'bg-cad-surface text-slate-400 border-cad-border hover:border-cad-accent/40'}`}>
                      {r === null ? 'All' : r ? 'Remote' : 'On-site'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Software Tags */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Software</p>
              <div className="flex flex-wrap gap-1.5">
                {['AutoCAD', 'Revit', 'SolidWorks', 'Fusion 360', 'CATIA', 'SketchUp', 'ArchiCAD', 'Rhino', 'Blender', '3ds Max', 'Civil 3D', 'Inventor'].map(s => (
                  <button key={s} onClick={() => setFilterSoftware(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterSoftware.includes(s) ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-cad-surface text-slate-400 border-cad-border hover:border-cad-accent/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {(filterType !== 'All' || filterExperience !== 'All' || filterRemote !== null || filterSoftware.length > 0) && (
              <button onClick={() => { setFilterType('All'); setFilterExperience('All'); setFilterRemote(null); setFilterSoftware([]); }}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors font-medium">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-4">
            {viewMode === 'proposals' ? (
              isLoadingMyApplications ? (
                <div className="flex items-center justify-center py-20 text-cad-muted gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading your proposals...
                </div>
              ) : myApplications.length === 0 ? (
                <div className="text-center py-20 text-cad-muted">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No proposals submitted yet.</p>
                  <p className="text-sm mt-1">Browse contracts and submit your first proposal.</p>
                  <button onClick={() => setViewMode('jobs')} className="mt-4 px-5 py-2 bg-cad-accent text-cad-dark rounded-xl text-sm font-bold hover:bg-violet-400 transition-colors">
                    Browse Contracts
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">{myApplications.length} proposal{myApplications.length !== 1 ? 's' : ''} submitted</p>
                  {myApplications.map(app => {
                    const statusConfig: Record<string, { label: string; classes: string; bg: string }> = {
                      SUBMITTED:  { label: 'Submitted',  classes: 'text-blue-400 border-blue-500/20',   bg: 'bg-blue-500/10' },
                      REVIEWED:   { label: 'Reviewed',   classes: 'text-yellow-400 border-yellow-500/20', bg: 'bg-yellow-500/10' },
                      ACCEPTED:   { label: 'Accepted',   classes: 'text-green-400 border-green-500/30',  bg: 'bg-green-500/10' },
                      REJECTED:   { label: 'Rejected',   classes: 'text-red-400 border-red-500/20',     bg: 'bg-red-500/10' },
                      COMPLETED:  { label: 'Completed',  classes: 'text-purple-400 border-purple-500/20', bg: 'bg-purple-500/10' },
                    };
                    const cfg = statusConfig[app.status] ?? statusConfig.SUBMITTED;
                    const isAccepted = app.status === 'ACCEPTED';
                    const appliedMs = Date.now() - new Date(app.appliedAt).getTime();
                    const appliedH = Math.floor(appliedMs / 3600000);
                    const appliedRel = appliedH < 1 ? 'Just now' : appliedH < 24 ? `${appliedH}h ago` : `${Math.floor(appliedH / 24)}d ago`;
                    return (
                      <div key={app.id} className={`rounded-2xl p-6 border transition-all ${isAccepted ? 'bg-green-500/5 border-green-500/30 shadow-lg shadow-green-500/5' : 'bg-cad-surface border-cad-border'}`}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h4 className="font-bold text-cad-text text-base">{app.jobTitle ?? 'Contract'}</h4>
                            <p className="text-xs text-cad-muted mt-0.5 flex items-center gap-1.5">
                              <Clock className="w-3 h-3" /> Applied {appliedRel}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border uppercase tracking-wide whitespace-nowrap ${cfg.classes} ${cfg.bg}`}>
                            {cfg.label}
                          </span>
                        </div>
                        {isAccepted && (
                          <div className="flex items-center gap-2 mb-3 text-green-400 text-sm font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> Your proposal was accepted — check your projects!
                          </div>
                        )}
                        {app.coverLetter && (
                          <p className="text-sm text-cad-muted leading-relaxed line-clamp-2 mb-3">{app.coverLetter}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                          {app.availability && (
                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{app.availability}</span>
                          )}
                          {app.cvUrl && (
                            <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-cad-accent hover:text-violet-300 transition-colors">
                              <ExternalLink className="w-3 h-3" /> View CV
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : viewMode === 'jobs' ? (
              isLoadingJobs ? (
                <div className="flex items-center justify-center py-20 text-cad-muted gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading contracts...
                </div>
              ) : sortedJobs.length === 0 ? (
                <div className="text-center py-20 text-cad-muted">
                  <p className="font-medium">{isClient ? 'No contracts posted yet.' : 'No open contracts found.'}</p>
                  {isClient && <p className="text-sm mt-1">Click "Post Contract" to get started.</p>}
                </div>
              ) : sortedJobs.map(job => {
                const aj = apiJobs.find(j => j.id === job.id);
                const isSaved = aj?.savedByMe ?? false;
                const score = aj ? matchScore(aj) : 0;
                const clientLabel = aj?.clientName || aj?.clientEmail?.split('@')[0] || 'Client';
                const budgetDisplay = aj?.pricingModel === 'FIXED' && aj.budgetFixed != null
                  ? format(aj.budgetFixed)
                  : aj?.pricingModel === 'HOURLY'
                  ? [aj.budgetHourlyMin != null ? `${format(aj.budgetHourlyMin)}/hr` : null, aj.budgetHourlyMax != null ? `${format(aj.budgetHourlyMax)}/hr` : null].filter(Boolean).join(' – ')
                  : job.budget
                    ? (isNaN(Number(job.budget)) ? job.budget : format(Number(job.budget)))
                    : '—';
                return (
                <div key={job.id} onClick={() => { if (isClient) { if (aj) setViewingProposals(aj); } else { setSelectedJob(job); } }} className="group glass-card rounded-2xl p-8 hover:bg-cad-surface transition-all border border-cad-border hover:border-cad-accent/30 cursor-pointer relative overflow-hidden shadow-sm hover:shadow-lg">
                    {/* Hover Glow */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-cad-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2 md:hidden">
                                <h3 className="text-xl font-bold text-cad-text">{job.title}</h3>
                                {!isClient && <button
                                    onClick={(e) => toggleSaveJob(e, job.id)}
                                    className={`p-2 rounded-full transition-colors ${isSaved ? 'text-cad-accent' : 'text-slate-500 hover:text-cad-text'}`}
                                >
                                    {isSaved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                                </button>}
                            </div>
                            <div className="hidden md:flex items-start justify-between mb-2">
                              <h3 className="text-2xl font-bold text-cad-text group-hover:text-cad-accent transition-colors leading-tight">{job.title}</h3>
                              {showMatchOnly && score > 0 && (
                                <span className="ml-3 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">{score}% match</span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-cad-muted mb-4 font-medium">
                                <span className="text-cad-text flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400"/> {clientLabel}</span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className="bg-cad-surface/30 px-2 py-0.5 rounded border border-cad-border uppercase tracking-wide">{job.type}</span>
                                {aj?.remote != null && (
                                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${aj.remote ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                    {aj.remote ? 'Remote' : 'On-site'}
                                  </span>
                                )}
                                {aj?.duration && (
                                  <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3 h-3"/>{aj.duration}</span>
                                )}
                                {aj?.location && !aj?.remote && (
                                  <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-3 h-3"/>{aj.location}</span>
                                )}
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span>{job.postedAt}</span>
                                {aj?.applicationCount != null && aj.applicationCount > 0 && (
                                  <span className="text-slate-500">{aj.applicationCount} proposal{aj.applicationCount !== 1 ? 's' : ''}</span>
                                )}
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-4xl line-clamp-2 mb-5">{job.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {job.software.map(s => (
                                    <span key={s} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${showMatchOnly && mySkills.some(sk => sk.toLowerCase() === s.toLowerCase()) ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'text-cad-text bg-cad-surface/30 border-cad-border group-hover:border-white/20'}`}>{s}</span>
                                ))}
                            </div>
                        </div>
                        <div className="text-right min-w-[160px] hidden md:flex flex-col items-end">
                            {!isClient && <button
                                onClick={(e) => toggleSaveJob(e, job.id)}
                                className={`mb-5 p-2 rounded-full transition-colors ${isSaved ? 'text-cad-accent bg-cad-accent/10' : 'text-slate-500 hover:text-cad-text hover:bg-cad-surface/30'}`}
                                title="Save Job"
                            >
                                {isSaved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                            </button>}
                            <p className="text-2xl font-bold text-cad-text mb-1 tracking-tight">{budgetDisplay}</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{job.experienceLevel}</p>
                        </div>
                        {/* Mobile Budget display */}
                        <div className="md:hidden w-full border-t border-cad-border pt-4 mt-2 flex justify-between items-center">
                             <p className="text-xs text-cad-muted font-bold uppercase tracking-wider">{job.experienceLevel}</p>
                             <p className="text-xl font-bold text-cad-text">{budgetDisplay}</p>
                        </div>
                    </div>
                </div>
                );
              })) : (
                <div>
                    {isLoadingDesigners ? (
                        <div className="flex items-center justify-center py-20 text-cad-muted gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading talent...
                        </div>
                    ) : filteredDesigners.length === 0 ? (
                        <div className="text-center py-20 text-cad-muted">
                            <p className="font-medium">No designers found.</p>
                            <p className="text-sm mt-1">Try adjusting your search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredDesigners.map(designer => {
                                const name = designer.displayName || designer.email.split('@')[0];
                                const initials = name.slice(0, 2).toUpperCase();
                                return (
                                    <div key={designer.userId} onClick={() => setSelectedDesigner(designer)} className="glass-card rounded-2xl overflow-hidden hover:border-cad-accent/30 transition-all group cursor-pointer border border-cad-border hover:-translate-y-1">
                                        <div className="h-36 bg-gradient-to-br from-cad-surface to-cad-panel relative flex items-center justify-center">
                                            {designer.avatarUrl ? (
                                                <img src={designer.avatarUrl} className="w-20 h-20 rounded-2xl object-cover border-2 border-cad-border shadow-lg" alt={name} />
                                            ) : (
                                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cad-accent to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                                    {initials}
                                                </div>
                                            )}
                                            {designer.location && (
                                                <span className="absolute bottom-2 right-3 text-[10px] text-cad-muted flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />{designer.location}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-5 space-y-3">
                                            <div>
                                                <h3 className="text-cad-text font-bold text-sm truncate">{name}</h3>
                                                {designer.headline && (
                                                    <p className="text-cad-muted text-xs mt-0.5 line-clamp-1">{designer.headline}</p>
                                                )}
                                            </div>
                                            {designer.skills && designer.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {designer.skills.slice(0, 3).map(s => (
                                                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-cad-surface border border-cad-border text-cad-muted font-medium">{s}</span>
                                                    ))}
                                                    {designer.skills.length > 3 && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-cad-surface border border-cad-border text-cad-muted">+{designer.skills.length - 3}</span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center border-t border-cad-border pt-3">
                                                <div className="flex items-center gap-1">
                                                    {designer.userRating != null ? (
                                                        <>
                                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                            <span className="text-xs font-bold text-cad-text">{designer.userRating.toFixed(1)}</span>
                                                        </>
                                                    ) : designer.yearsExperience ? (
                                                        <span className="text-[10px] text-cad-muted font-medium">{designer.yearsExperience}y exp</span>
                                                    ) : <span />}
                                                </div>
                                                {designer.hourlyRate ? (
                                                    <p className="text-cad-text font-bold text-sm">{format(designer.hourlyRate)}/hr</p>
                                                ) : (
                                                    <p className="text-cad-muted text-xs">Rate TBD</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* MODAL: JOB DETAIL / APPLY */}
        {selectedJob && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-3xl bg-cad-panel rounded-3xl border border-cad-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                    {/* Header */}
                    <div className="p-6 border-b border-cad-border flex justify-between items-start bg-cad-surface">
                        <div>
                            <h3 className="text-2xl font-bold text-cad-text mb-1">{selectedJob.title}</h3>
                            <p className="text-sm text-cad-muted flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5" /> {selectedJob.client}
                            </p>
                        </div>
                        <button onClick={() => setSelectedJob(null)} className="text-slate-500 hover:text-cad-text p-2 hover:bg-cad-border rounded-full transition-colors"><X className="w-6 h-6"/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="prose prose-invert max-w-none mb-8">
                            <h4 className="text-cad-text font-bold mb-2">Description</h4>
                            <p className="text-cad-muted text-sm leading-relaxed">{selectedJob.description}</p>
                        </div>

                        {!isClient && (
                          <div className="bg-cad-surface rounded-2xl p-6 border border-cad-border mb-8 space-y-5">
                            <h4 className="text-cad-text font-bold text-sm uppercase tracking-wider">Your Proposal</h4>

                            <div>
                              <label className="text-xs font-bold text-slate-500 block mb-1.5">CV / Portfolio URL</label>
                              <input type="url" className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text text-sm focus:border-cad-accent outline-none" placeholder="https://your-portfolio.com/cv.pdf" value={proposalCvUrl} onChange={e => setProposalCvUrl(e.target.value)} />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-500 block mb-1.5">Availability</label>
                              <select className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text text-sm focus:border-cad-accent outline-none" value={proposalAvailability} onChange={e => setProposalAvailability(e.target.value)}>
                                <option value="">Select your availability...</option>
                                <option value="Available immediately">Available immediately</option>
                                <option value="Available within 1 week">Available within 1 week</option>
                                <option value="Available within 2 weeks">Available within 2 weeks</option>
                                <option value="Available within 1 month">Available within 1 month</option>
                                <option value="Currently busy">Currently busy</option>
                              </select>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-bold text-slate-500">Cover Letter</label>
                                <button type="button" onClick={handleAiProposal} className="text-cad-accent hover:text-cad-text transition-colors flex items-center gap-1 text-xs">
                                  {isGeneratingAi ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>} AI Assist
                                </button>
                              </div>
                              <textarea rows={4} className="w-full bg-cad-panel border border-cad-border rounded-xl p-4 text-cad-text text-sm focus:border-cad-accent outline-none leading-relaxed" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Introduce yourself and explain why you're the right fit..."/>
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-cad-border bg-cad-surface flex justify-between items-center">
                        {!isClient ? (
                            <>
                                <button onClick={startInterview} className="text-sm font-bold text-cad-muted hover:text-cad-text flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-cad-panel transition-colors">
                                    <Bot className="w-4 h-4" /> Practice Interview
                                </button>
                                <div className="flex gap-3">
                                    <button onClick={() => setSelectedJob(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-cad-muted hover:text-cad-text hover:bg-cad-panel">Cancel</button>
                                    <button onClick={handleApply} className="px-8 py-2.5 bg-cad-accent text-cad-dark rounded-xl text-sm font-bold hover:bg-violet-400 shadow-lg shadow-cad-accent/20 active:scale-95 transition-all">
                                        {proposalSent ? 'Sent!' : 'Submit Proposal'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button onClick={() => setSelectedJob(null)} className="ml-auto px-5 py-2.5 rounded-xl text-sm font-bold text-cad-muted hover:text-cad-text hover:bg-cad-panel">Close</button>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* MODAL: POST JOB (CLIENT) — 3-step wizard */}
        {isPostingJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-cad-panel rounded-3xl border border-cad-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">

              {/* Wizard header */}
              <div className="px-6 pt-6 pb-4 border-b border-cad-border bg-cad-surface">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-cad-text">Post a Contract</h3>
                  <button onClick={() => { setIsPostingJob(false); resetPostJobForm(); }} className="text-slate-500 hover:text-cad-text"><X className="w-6 h-6"/></button>
                </div>
                {/* Step indicators */}
                <div className="flex items-center gap-2">
                  {([1, 2, 3] as const).map((s, i) => (
                    <React.Fragment key={s}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${postJobStep === s ? 'bg-cad-accent text-cad-dark border-cad-accent' : postJobStep > s ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-cad-surface text-slate-500 border-cad-border'}`}>{postJobStep > s ? '✓' : s}</div>
                      {i < 2 && <div className={`flex-1 h-0.5 ${postJobStep > s ? 'bg-green-500/40' : 'bg-cad-border'}`}/>}
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">{postJobStep === 1 ? 'Basics — title & description' : postJobStep === 2 ? 'Pay & requirements' : 'Skills & deliverables'}</p>
              </div>

              <form onSubmit={postJobStep < 3 ? (e) => { e.preventDefault(); setPostJobStep(s => (s < 3 ? s + 1 as 1|2|3 : s)); } : handlePostJob} className="p-8 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
                {/* ── Step 1: Title + Description + Files ── */}
                {postJobStep === 1 && <>
                  <div>
                    <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Job Title *</label>
                    <input required type="text" placeholder="e.g. Mechanical Design for HVAC System"
                      className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium"
                      value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Project Description *</label>
                    <textarea required rows={5} placeholder="Describe the project goals, site conditions, standards to follow, and any context the designer needs..."
                      className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none leading-relaxed text-sm"
                      value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">
                      Reference Files <span className="normal-case font-normal text-slate-500">(optional · max {MAX_FILES} · {MAX_FILE_SIZE_MB}MB each)</span>
                    </label>
                    <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.svg,.dwg,.dxf" className="hidden" onChange={handleFileSelect} />
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed border-cad-border hover:border-cad-accent/60 hover:bg-cad-accent/5 transition-all group">
                      <UploadCloud className="w-6 h-6 text-cad-muted group-hover:text-cad-accent transition-colors" />
                      <span className="text-sm text-cad-muted group-hover:text-cad-text transition-colors">Click to upload sketches or specs</span>
                      <span className="text-xs text-slate-500">PDF · PNG · JPG · SVG · DWG · DXF</span>
                    </button>
                    {attachmentError && <p className="mt-2 text-xs text-red-400">{attachmentError}</p>}
                    {jobAttachments.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {jobAttachments.map((f, i) => (
                          <li key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-cad-surface border border-cad-border">
                            <FileText className="w-4 h-4 text-cad-accent shrink-0" />
                            <span className="flex-1 text-sm text-cad-text truncate">{f.name}</span>
                            <span className="text-xs text-slate-500">{formatFileSize(f.size)}</span>
                            <button type="button" onClick={() => removeAttachment(i)} className="text-slate-500 hover:text-red-400"><X className="w-4 h-4"/></button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>}

                {/* ── Step 2: Pay type + requirements ── */}
                {postJobStep === 2 && <>
                  <div>
                    <p className="text-xs font-bold text-cad-muted uppercase tracking-wider mb-3">What is the pay?</p>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {(['FIXED', 'HOURLY'] as const).map(pm => (
                        <button key={pm} type="button" onClick={() => setNewJobPricingModel(pm)}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${newJobPricingModel === pm ? 'border-cad-accent bg-cad-accent/5' : 'border-cad-border bg-cad-surface/30 hover:border-cad-accent/40'}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${newJobPricingModel === pm ? 'bg-cad-accent text-cad-dark' : 'bg-cad-surface text-slate-400'}`}>
                            {pm === 'FIXED' ? <DollarSign className="w-4 h-4"/> : <Clock className="w-4 h-4"/>}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-cad-text">{pm === 'FIXED' ? 'Fixed price' : 'Pay by hour'}</p>
                            <p className="text-[10px] text-slate-500">{pm === 'FIXED' ? 'One total budget' : 'Rate range'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {newJobPricingModel === 'FIXED' ? (
                      <div>
                        <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Budget ({symbol})</label>
                        <input type="number" min="0" placeholder="e.g. 5000"
                          className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium"
                          value={newJobBudgetFixed} onChange={e => setNewJobBudgetFixed(e.target.value)} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Min Rate ({symbol}/hr)</label>
                          <input type="number" min="0" placeholder="e.g. 150"
                            className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium"
                            value={newJobBudgetHourlyMin} onChange={e => setNewJobBudgetHourlyMin(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Max Rate ({symbol}/hr)</label>
                          <input type="number" min="0" placeholder="e.g. 350"
                            className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium"
                            value={newJobBudgetHourlyMax} onChange={e => setNewJobBudgetHourlyMax(e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Experience Level</label>
                    <div className="flex gap-3">
                      {Object.values(ExperienceLevel).map(lvl => (
                        <button key={lvl} type="button" onClick={() => setNewJob({...newJob, experienceLevel: lvl})}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${newJob.experienceLevel === lvl ? 'bg-cad-accent text-cad-dark border-cad-accent' : 'bg-cad-surface text-slate-400 border-cad-border hover:border-cad-accent/50'}`}>
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Job Type</label>
                      <select className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium appearance-none"
                        value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value as JobType})}>
                        {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Deadline</label>
                      <select className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium appearance-none"
                        value={newJob.duration} onChange={e => setNewJob({...newJob, duration: e.target.value})}>
                        <option value="">Select timeline...</option>
                        {['1–2 weeks', '2–4 weeks', '1–3 months', '3–6 months', 'Flexible'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </>}

                {/* ── Step 3: Skills + Discipline + Deliverables ── */}
                {postJobStep === 3 && <>
                  <div>
                    <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Discipline</label>
                    <select className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium appearance-none"
                      value={newJob.discipline} onChange={e => setNewJob({...newJob, discipline: e.target.value})}>
                      <option value="">Select discipline...</option>
                      {['Architecture', 'Mechanical Engineering', 'Structural Engineering', 'MEP', 'Civil / Infrastructure', 'Industrial Design', 'Interior Design', 'Other'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Required Software / Skills</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-cad-panel rounded-xl border border-cad-border">
                      {['AutoCAD', 'Revit', 'SolidWorks', 'Fusion 360', 'CATIA', 'SketchUp', 'ArchiCAD', 'Rhino', 'Blender', '3ds Max', 'Civil 3D', 'Inventor'].map(s => {
                        const active = (newJob.software || []).map(String).includes(s);
                        return (
                          <button key={s} type="button"
                            onClick={() => { const curr = (newJob.software || []).map(String); setNewJob({...newJob, software: (active ? curr.filter(x => x !== s) : [...curr, s]) as any}); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${active ? 'bg-cad-accent text-cad-dark border-cad-accent' : 'bg-cad-surface text-slate-400 border-transparent hover:bg-cad-border'}`}>
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Deliverables</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-cad-panel rounded-xl border border-cad-border">
                      {['2D Drawings', '3D Model', 'Construction Documents', 'Shop Drawings', 'Renders / Visualizations', 'BIM Model', 'Technical Report'].map(d => (
                        <button key={d} type="button"
                          onClick={() => { const curr = newJob.deliverables || []; setNewJob({...newJob, deliverables: curr.includes(d) ? curr.filter(x => x !== d) : [...curr, d]}); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${newJob.deliverables?.includes(d) ? 'bg-cad-accent text-cad-dark border-cad-accent' : 'bg-cad-surface text-slate-400 border-transparent hover:bg-cad-border'}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </>}

                {/* Footer nav */}
                <div className="pt-4 border-t border-cad-border flex justify-between items-center">
                  <button type="button"
                    onClick={() => postJobStep > 1 ? setPostJobStep(s => (s - 1) as 1|2|3) : (setIsPostingJob(false), resetPostJobForm())}
                    className="px-5 py-3 rounded-xl font-bold text-slate-400 hover:text-cad-text transition-colors">
                    {postJobStep === 1 ? 'Cancel' : '← Back'}
                  </button>
                  <button type="submit"
                    className="px-8 py-3 bg-cad-accent text-cad-dark rounded-xl font-bold hover:bg-violet-400 shadow-lg shadow-cad-accent/20 transition-all">
                    {postJobStep < 3 ? 'Next →' : 'Post Contract'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: LIST SERVICE (FREELANCER) */}
        {isPostingService && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-2xl bg-cad-panel rounded-3xl border border-cad-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
                    <div className="p-6 border-b border-cad-border flex justify-between items-center bg-cad-surface">
                        <h3 className="text-xl font-bold text-cad-text">List Your Service</h3>
                        <button onClick={() => setIsPostingService(false)} className="text-slate-500 hover:text-cad-text"><X className="w-6 h-6"/></button>
                    </div>
                    <form onSubmit={handlePostService} className="p-8 space-y-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
                        <div>
                            <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Service Title</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-500 font-bold">I will</span>
                                <input 
                                    required type="text" placeholder="do high quality 3D rendering..." 
                                    className="w-full bg-cad-panel border border-cad-border rounded-xl pl-16 pr-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium"
                                    value={newService.title?.replace('I will ', '')} onChange={e => setNewService({...newService, title: `I will ${e.target.value}`})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Starting Price ({symbol})</label>
                                <input 
                                    required type="number" placeholder="100" 
                                    className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium"
                                    value={newService.price || ''} onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Delivery Time</label>
                                <input 
                                    required type="text" placeholder="e.g. 3 Days" 
                                    className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium"
                                    value={newService.deliveryTime} onChange={e => setNewService({...newService, deliveryTime: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Software Used</label>
                            <div className="flex flex-wrap gap-2 p-3 bg-cad-panel rounded-xl border border-cad-border">
                                {Object.values(Software).map(s => (
                                    <button 
                                        key={s} type="button"
                                        onClick={() => {
                                            const current = newService.software || [];
                                            setNewService({...newService, software: current.includes(s) ? current.filter(x => x !== s) : [...current, s]});
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                            newService.software?.includes(s) 
                                            ? 'bg-cad-accent text-cad-dark border-cad-accent' 
                                            : 'bg-cad-surface text-slate-400 border-transparent hover:bg-cad-border'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2 flex justify-between">
                                <span>Description</span>
                                <button type="button" onClick={handleEnhanceDescription} className="text-cad-accent hover:text-cad-text transition-colors flex items-center gap-1 text-[10px]">
                                    {isEnhancingDesc ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>} Enhance with AI
                                </button>
                            </label>
                            <textarea 
                                required rows={5} placeholder="Describe exactly what you offer..." 
                                className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none leading-relaxed"
                                value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})}
                            />
                        </div>
                        <div className="pt-4 border-t border-cad-border flex justify-end gap-3">
                            <button type="button" onClick={() => setIsPostingService(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-cad-text transition-colors">Cancel</button>
                            <button type="submit" className="px-8 py-3 bg-cad-accent text-cad-dark rounded-xl font-bold hover:bg-violet-400 shadow-lg shadow-cad-accent/20">Publish Service</button>
                        </div>
                    </form>
                </div>
             </div>
        )}

        {/* MODAL: PROPOSALS (CLIENT) */}
        {viewingProposals && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-cad-panel rounded-3xl border border-cad-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
              <div className="p-6 border-b border-cad-border flex justify-between items-start bg-cad-surface">
                <div>
                  <h3 className="text-xl font-bold text-cad-text">{viewingProposals.title}</h3>
                  <p className="text-xs text-cad-muted mt-1">{proposals.length} proposal{proposals.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setViewingProposals(null)} className="text-slate-500 hover:text-cad-text p-2 hover:bg-cad-border rounded-full"><X className="w-5 h-5"/></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {isLoadingProposals ? (
                  <div className="flex items-center justify-center py-16 text-cad-muted gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading proposals...
                  </div>
                ) : proposals.length === 0 ? (
                  <div className="text-center py-16 text-cad-muted">
                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No proposals yet.</p>
                    <p className="text-sm mt-1">Designers will appear here once they apply.</p>
                  </div>
                ) : proposals.map(p => {
                  const name = p.applicantDisplayName || p.applicantEmail?.split('@')[0] || 'Applicant';
                  const initials = name.slice(0, 2).toUpperCase();
                  const statusColors: Record<string, string> = {
                    SUBMITTED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    REVIEWED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                    ACCEPTED: 'bg-green-500/10 text-green-400 border-green-500/20',
                    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
                    COMPLETED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                  };
                  const appliedH = Math.floor((Date.now() - new Date(p.appliedAt).getTime()) / 3600000);
                  const appliedRel = appliedH < 1 ? 'Just now' : appliedH < 24 ? `${appliedH}h ago` : `${Math.floor(appliedH / 24)}d ago`;
                  const openDesignerProfile = () => {
                    setIsLoadingDesignerProfile(true);
                    getDesignerProfileByUserId(p.applicantId)
                      .then(setViewingDesignerProfile)
                      .catch(() => {})
                      .finally(() => setIsLoadingDesignerProfile(false));
                  };
                  return (
                    <div key={p.id} className="bg-cad-surface rounded-2xl p-5 border border-cad-border">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <button onClick={openDesignerProfile} className="w-9 h-9 rounded-xl bg-gradient-to-br from-cad-accent to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0 hover:opacity-80 transition-opacity">{initials}</button>
                          <div>
                            <button onClick={openDesignerProfile} className="font-bold text-cad-text text-sm hover:text-cad-accent transition-colors text-left">{name}</button>
                            <p className="text-xs text-cad-muted">{p.applicantEmail} · {appliedRel}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${statusColors[p.status] || ''}`}>{p.status}</span>
                      </div>
                      <p className="text-sm text-cad-muted leading-relaxed line-clamp-3">{p.coverLetter || 'No cover letter provided.'}</p>
                      {(p.cvUrl || p.availability) && (
                        <div className="flex flex-wrap gap-4 mt-3">
                          {p.cvUrl && (
                            <a href={p.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-cad-accent hover:text-violet-300 transition-colors">
                              <ExternalLink className="w-3 h-3" /> View CV
                            </a>
                          )}
                          {p.availability && (
                            <span className="text-xs text-slate-400 flex items-center gap-1.5">
                              <Clock className="w-3 h-3" /> {p.availability}
                            </span>
                          )}
                        </div>
                      )}
                      {(p.status === 'SUBMITTED' || p.status === 'REVIEWED') && (
                        <div className="flex gap-3 mt-4 pt-4 border-t border-cad-border">
                          <button
                            onClick={async () => {
                              const updated = await updateApplicationStatus(p.id, 'ACCEPTED');
                              setProposals(prev => prev.map(x => x.id === p.id ? updated : x));
                              setAcceptedApp(updated);
                              setCreateProjectTitle(viewingProposals?.title ?? '');
                              setCreateProjectBudget(viewingProposals?.budget ?? '');
                              setViewingProposals(null);
                            }}
                            className="flex-1 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={async () => {
                              const updated = await updateApplicationStatus(p.id, 'REJECTED');
                              setProposals(prev => prev.map(x => x.id === p.id ? updated : x));
                            }}
                            className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Designer profile modal (from proposals) ─────────────────────── */}
      {viewingDesignerProfile && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-cad-panel rounded-2xl border border-cad-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="h-24 bg-gradient-to-br from-cad-surface to-cad-dark relative flex-shrink-0">
              <button onClick={() => setViewingDesignerProfile(null)} className="absolute top-3 right-3 text-slate-500 hover:text-cad-text p-1.5 bg-black/30 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 pb-6 overflow-y-auto custom-scrollbar">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cad-accent to-blue-600 flex items-center justify-center text-2xl font-bold text-white -mt-8 mb-3 border-4 border-cad-panel">
                {(viewingDesignerProfile.displayName || 'D').slice(0, 2).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-cad-text">{viewingDesignerProfile.displayName || 'Designer'}</h3>
              {viewingDesignerProfile.headline && <p className="text-sm text-cad-accent mt-0.5">{viewingDesignerProfile.headline}</p>}
              {viewingDesignerProfile.location && (
                <p className="text-xs text-cad-muted flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/>{viewingDesignerProfile.location}</p>
              )}
              <div className="space-y-4 mt-5">
                {viewingDesignerProfile.bio && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">About</p>
                    <p className="text-sm text-cad-muted leading-relaxed">{viewingDesignerProfile.bio}</p>
                  </div>
                )}
                {viewingDesignerProfile.skills && viewingDesignerProfile.skills.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingDesignerProfile.skills.map(s => (
                        <span key={s} className="text-xs bg-cad-accent/10 text-cad-accent border border-cad-accent/20 px-2.5 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {viewingDesignerProfile.cvUrl && (
                  <a href={viewingDesignerProfile.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-cad-accent hover:text-violet-300 transition-colors">
                    <ExternalLink className="w-4 h-4" /> View CV / Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Designer profile modal ───────────────────────────────────────── */}
      {selectedDesigner && (() => {
        const d = selectedDesigner;
        const name = d.displayName || d.email.split('@')[0];
        const initials = name.slice(0, 2).toUpperCase();
        return (
          <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-cad-panel rounded-2xl border border-cad-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

              {/* Header banner */}
              <div className="h-28 bg-gradient-to-br from-cad-surface to-cad-dark relative flex-shrink-0">
                <button
                  onClick={() => setSelectedDesigner(null)}
                  className="absolute top-3 right-3 text-slate-500 hover:text-cad-text p-1.5 bg-black/30 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Avatar overlapping banner */}
                <div className="absolute -bottom-10 left-6">
                  {d.avatarUrl ? (
                    <img src={d.avatarUrl} className="w-20 h-20 rounded-2xl object-cover border-4 border-cad-panel shadow-lg" alt={name} />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cad-accent to-blue-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-cad-panel shadow-lg">
                      {initials}
                    </div>
                  )}
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto custom-scrollbar pt-14 px-6 pb-6 space-y-5">

                {/* Name + headline */}
                <div>
                  <h2 className="text-xl font-bold text-cad-text">{name}</h2>
                  {d.headline && <p className="text-sm text-cad-muted mt-0.5">{d.headline}</p>}
                  {d.location && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{d.location}
                    </p>
                  )}
                </div>

                {/* Stats row */}
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
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{d.userRating.toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {d.bio && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About</p>
                    <p className="text-sm text-cad-muted leading-relaxed">{d.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {d.skills && d.skills.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Software Skills ({d.skills.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {d.skills.map(skill => (
                        <span key={skill} className="text-xs px-3 py-1 rounded-lg bg-cad-accent/10 border border-cad-accent/20 text-cad-accent font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="pt-2 border-t border-cad-border">
                  <button
                    onClick={() => setSelectedDesigner(null)}
                    className="w-full py-3 rounded-xl bg-cad-accent text-cad-dark text-sm font-bold hover:bg-sky-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Post-acceptance: Create Project modal ────────────────────────── */}
      {acceptedApp && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-cad-panel rounded-2xl border border-cad-border shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-cad-border bg-green-500/5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-cad-text">Proposal accepted!</h3>
              </div>
              <p className="text-sm text-slate-400 ml-11">
                Create a project to kick things off with <span className="text-cad-text font-medium">{acceptedApp.applicantDisplayName ?? acceptedApp.applicantEmail}</span>.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Project Title</label>
                <input
                  value={createProjectTitle}
                  onChange={e => setCreateProjectTitle(e.target.value)}
                  placeholder="e.g. Brand Identity Redesign"
                  className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2.5 text-sm text-cad-text placeholder-slate-600 focus:outline-none focus:border-cad-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Budget ($)</label>
                  <input
                    value={createProjectBudget}
                    onChange={e => setCreateProjectBudget(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2.5 text-sm text-cad-text placeholder-slate-600 focus:outline-none focus:border-cad-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Deadline</label>
                  <input
                    type="date"
                    value={createProjectDeadline}
                    onChange={e => setCreateProjectDeadline(e.target.value)}
                    className="w-full bg-cad-surface border border-cad-border rounded-lg px-3 py-2.5 text-sm text-cad-text focus:outline-none focus:border-cad-accent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setAcceptedApp(null);
                    setCreateProjectTitle('');
                    setCreateProjectBudget('');
                    setCreateProjectDeadline('');
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-cad-border text-sm text-slate-400 hover:text-cad-text transition-colors"
                >
                  Do it later
                </button>
                <button
                  disabled={!createProjectTitle.trim() || isCreatingProject}
                  onClick={async () => {
                    if (!acceptedApp || !createProjectTitle.trim()) return;
                    setIsCreatingProject(true);
                    try {
                      await createProject({
                        applicationId: acceptedApp.id,
                        title: createProjectTitle,
                        budget: createProjectBudget || undefined,
                        deadline: createProjectDeadline || undefined,
                      });
                      setAcceptedApp(null);
                      setCreateProjectTitle('');
                      setCreateProjectBudget('');
                      setCreateProjectDeadline('');
                      onNavigate?.('projects');
                    } finally {
                      setIsCreatingProject(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-cad-accent text-cad-dark text-sm font-bold hover:bg-sky-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreatingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMarket;
