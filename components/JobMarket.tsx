
import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Plus, Briefcase, Calculator, Star, ChevronDown, Pencil, Sparkles, Loader2, Zap, Clock, DollarSign, Send, CheckCircle2, Bot, X, Image as ImageIcon, Bookmark, BookmarkCheck, UploadCloud, FileText, Paperclip } from 'lucide-react';
import { MOCK_JOBS, MOCK_SERVICES } from '../constants';
import { JobType, Software, Job, ServiceGig, ExperienceLevel, Recommendation, InterviewMessage } from '../types';
import { generateCoverLetter, enhanceServiceDescription, recommendJobs, conductInterviewTurn } from '../services/geminiService';
import { useCurrency } from '../contexts/CurrencyContext';

interface JobMarketProps {
    onStartProject?: (project: string) => void;
}

const JobMarket: React.FC<JobMarketProps> = ({ onStartProject }) => {
  const { format, symbol } = useCurrency();
  const [viewMode, setViewMode] = useState<'jobs' | 'services'>('jobs');
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [services, setServices] = useState<ServiceGig[]>(MOCK_SERVICES);
  
  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<JobType | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  
  // Saved Jobs State
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  
  // Selection & Modal States
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [isPostingService, setIsPostingService] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);
  const [isInterviewing, setIsInterviewing] = useState(false);

  // Proposal State
  const [bidType, setBidType] = useState<'Fixed' | 'Hourly'>('Fixed');
  const [bidRate, setBidRate] = useState<string>('');
  const [bidHours, setBidHours] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Post Job Form State
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
      deadline: '',
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

  // Recommendation State
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [showRecsOnly, setShowRecsOnly] = useState(false);

  // Interview Coach
  const [interviewMessages, setInterviewMessages] = useState<InterviewMessage[]>([]);
  const [userInterviewInput, setUserInterviewInput] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const interviewEndRef = useRef<HTMLDivElement>(null);

  // Placeholder User
  const currentUser = {
      role: 'Mechanical Engineer',
      skills: [Software.SOLIDWORKS, Software.AUTOCAD, Software.FUSION360],
      pastActivity: "Recently applied to 'Senior Mechanical Design Engineer'."
  };

  const toggleSaveJob = (e: React.MouseEvent, jobId: string) => {
      e.stopPropagation();
      const newSaved = new Set(savedJobs);
      if (newSaved.has(jobId)) {
          newSaved.delete(jobId);
      } else {
          newSaved.add(jobId);
      }
      setSavedJobs(newSaved);
  };

  const filteredJobs = jobs.filter(job => 
    (selectedType === 'All' || job.type === selectedType) &&
    (job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     job.software.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (!showRecsOnly || recommendations.some(r => r.jobId === job.id)) &&
    (!showSavedOnly || savedJobs.has(job.id))
  );

  const sortedJobs = showRecsOnly 
    ? [...filteredJobs].sort((a, b) => {
        const scoreA = recommendations.find(r => r.jobId === a.id)?.score || 0;
        const scoreB = recommendations.find(r => r.jobId === b.id)?.score || 0;
        return scoreB - scoreA;
      })
    : filteredJobs;

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setProposalSent(true);
    setTimeout(() => {
        const jobTitle = selectedJob?.title || 'New Project';
        setProposalSent(false);
        setSelectedJob(null);
        setBidRate('');
        if (onStartProject) onStartProject(jobTitle);
    }, 2000);
  };

  const handleAiProposal = async () => {
      if (!selectedJob) return;
      setIsGeneratingAi(true);
      const generated = await generateCoverLetter(selectedJob.title, selectedJob.client, selectedJob.software);
      setCoverLetter(generated);
      setIsGeneratingAi(false);
  };

  const handleGetRecommendations = async () => {
      if (showRecsOnly) { setShowRecsOnly(false); setRecommendations([]); return; }
      setIsLoadingRecs(true);
      const recs = await recommendJobs(currentUser.skills, currentUser.role, currentUser.pastActivity, jobs);
      setRecommendations(recs);
      setShowRecsOnly(true);
      setIsLoadingRecs(false);
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

  // --- Post Job Handlers ---
  const handlePostJob = (e: React.FormEvent) => {
      e.preventDefault();
      const job: Job = {
          id: `j-${Date.now()}`,
          title: newJob.title || 'Untitled Job',
          client: newJob.client || 'Anonymous',
          type: newJob.type || JobType.FREELANCE,
          experienceLevel: newJob.experienceLevel || ExperienceLevel.INTERMEDIATE,
          budget: newJob.budget || 'Negotiable',
          software: newJob.software || [],
          description: newJob.description || '',
          postedAt: 'Just now'
      };
      setJobs([job, ...jobs]);
      setIsPostingJob(false);
      setJobAttachments([]);
      setAttachmentError('');
      setNewJob({ title: '', client: 'My Company Inc.', budget: '', description: '', type: JobType.FREELANCE, experienceLevel: ExperienceLevel.INTERMEDIATE, software: [], discipline: '', deliverables: [], deadline: '' });
  };

  // --- Post Service Handlers ---
  const handlePostService = (e: React.FormEvent) => {
      e.preventDefault();
      const gig: ServiceGig = {
          id: `s-${Date.now()}`,
          title: newService.title || 'Untitled Service',
          freelancerName: 'Takudzwa Mupinga', // Current User
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

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 lg:p-12 bg-cad-dark">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-noise opacity-30 pointer-events-none z-0"></div>
      
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h2 className="text-3xl font-bold text-cad-text tracking-tight">Marketplace</h2>
                <p className="text-cad-muted mt-1 text-sm">Access premium contracts and specialized talent.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-1 bg-cad-panel p-1 rounded-xl border border-cad-border flex-1 md:flex-none">
                    <button onClick={() => setViewMode('jobs')} className={`flex-1 md:flex-none text-center px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'jobs' ? 'bg-cad-accent text-cad-dark shadow-sm' : 'text-slate-500 hover:text-cad-text hover:bg-cad-surface'}`}>
                        Contracts
                    </button>
                    <button onClick={() => setViewMode('services')} className={`flex-1 md:flex-none text-center px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'services' ? 'bg-cad-accent text-cad-dark shadow-sm' : 'text-slate-500 hover:text-cad-text hover:bg-cad-surface'}`}>
                        Talent
                    </button>
                </div>
                
                <button 
                    onClick={() => viewMode === 'jobs' ? setIsPostingJob(true) : setIsPostingService(true)}
                    className="flex-1 md:flex-none bg-cad-text text-cad-dark hover:opacity-90 font-bold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" /> {viewMode === 'jobs' ? 'Post Contract' : 'List Service'}
                </button>
            </div>
        </div>

        {/* AI Banner */}
        {viewMode === 'jobs' && (
            <div className="glass-panel p-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-blue-600/20 border border-indigo-500/30">
                <div className="bg-cad-panel rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xl">
                    <div className="relative z-10 flex gap-5 items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-cad-text text-lg">AI Matching Engine</h3>
                            <p className="text-cad-muted text-sm mt-1">We found <span className="text-cad-text font-bold">3 contracts</span> matching your skill profile.</p>
                        </div>
                    </div>
                    <button onClick={handleGetRecommendations} className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 relative z-10 flex items-center justify-center gap-2 active:scale-95">
                         {isLoadingRecs ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4 text-yellow-200" />}
                         {showRecsOnly ? 'Show All Jobs' : 'Auto-Match Me'}
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
                    placeholder="Search keywords, software, or clients..."
                    className="w-full bg-transparent border-none rounded-lg pl-10 pr-4 py-2.5 text-cad-text focus:outline-none placeholder-slate-500 text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="w-px h-6 bg-cad-border hidden md:block"></div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                    onClick={() => setShowSavedOnly(!showSavedOnly)} 
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${showSavedOnly ? 'bg-cad-accent text-cad-dark' : 'text-slate-400 hover:text-cad-text hover:bg-cad-surface'}`}
                >
                    <BookmarkCheck className="w-4 h-4" /> Saved
                </button>
                <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors ${showFilters ? 'bg-cad-surface text-cad-text' : 'text-slate-400 hover:text-cad-text'}`}>
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-4">
            {viewMode === 'jobs' ? sortedJobs.map(job => (
                <div key={job.id} onClick={() => setSelectedJob(job)} className="group glass-card rounded-2xl p-8 hover:bg-cad-surface transition-all border border-cad-border hover:border-cad-accent/30 cursor-pointer relative overflow-hidden shadow-sm hover:shadow-lg">
                    {/* Hover Glow */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-cad-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2 md:hidden">
                                <h3 className="text-xl font-bold text-cad-text">{job.title}</h3>
                                <button 
                                    onClick={(e) => toggleSaveJob(e, job.id)}
                                    className={`p-2 rounded-full transition-colors ${savedJobs.has(job.id) ? 'text-cad-accent' : 'text-slate-500 hover:text-cad-text'}`}
                                >
                                    {savedJobs.has(job.id) ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                                </button>
                            </div>
                            <h3 className="hidden md:block text-2xl font-bold text-cad-text group-hover:text-cad-accent transition-colors mb-2 leading-tight">{job.title}</h3>
                            
                            <div className="flex flex-wrap items-center gap-4 text-xs text-cad-muted mb-5 font-medium uppercase tracking-wide">
                                <span className="text-white flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-slate-400"/> {job.client}</span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{job.type}</span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span>{job.postedAt}</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-4xl line-clamp-2 mb-6">{job.description}</p>
                            <div className="flex gap-2">
                                {job.software.map(s => (
                                    <span key={s} className="text-[10px] font-bold text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 group-hover:border-white/20 transition-colors">{s}</span>
                                ))}
                            </div>
                        </div>
                        <div className="text-right min-w-[180px] hidden md:flex flex-col items-end">
                            <button 
                                onClick={(e) => toggleSaveJob(e, job.id)}
                                className={`mb-6 p-2 rounded-full transition-colors ${savedJobs.has(job.id) ? 'text-cad-accent bg-cad-accent/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                title="Save Job"
                            >
                                {savedJobs.has(job.id) ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                            </button>
                            <p className="text-2xl font-bold text-white mb-1 tracking-tight">{job.budget}</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{job.experienceLevel}</p>
                        </div>
                        {/* Mobile Budget display */}
                        <div className="md:hidden w-full border-t border-cad-border pt-4 mt-2 flex justify-between items-center">
                             <p className="text-xs text-cad-muted font-bold uppercase tracking-wider">{job.experienceLevel}</p>
                             <p className="text-xl font-bold text-white">{job.budget}</p>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredServices.map(service => (
                        <div key={service.id} className="glass-card rounded-2xl overflow-hidden hover:border-cad-accent/30 transition-all group cursor-pointer border border-cad-border hover:-translate-y-1">
                            <div className="h-48 bg-slate-800 relative">
                                <img src={service.coverImage} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt={service.title}/>
                                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                    <img src={service.freelancerAvatar} className="w-6 h-6 rounded-full border border-white/20" alt="Avatar"/>
                                    <span className="text-xs font-bold text-white shadow-black drop-shadow-md">{service.freelancerName}</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-cad-text font-bold text-sm line-clamp-2 mb-3 h-10 leading-snug">{service.title}</h3>
                                <div className="flex justify-between items-center border-t border-cad-border pt-3">
                                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                                        <Star className="w-3.5 h-3.5 fill-current" /> {service.rating || 'New'}
                                    </div>
                                    <p className="text-cad-text font-bold text-sm">From {format(service.price)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
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

                        <div className="bg-cad-surface rounded-2xl p-6 border border-cad-border mb-8">
                            <h4 className="text-cad-text font-bold mb-4 text-sm uppercase tracking-wider">Submit Proposal</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1.5">Rate ({symbol})</label>
                                    <input type="number" className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text text-sm focus:border-cad-accent outline-none" placeholder="1000" value={bidRate} onChange={e => setBidRate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1.5">Delivery (Days)</label>
                                    <input type="number" className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text text-sm focus:border-cad-accent outline-none" placeholder="7" />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-bold text-slate-500 block mb-1.5 flex justify-between">
                                    <span>Cover Letter</span>
                                    <button onClick={handleAiProposal} className="text-cad-accent hover:text-cad-text transition-colors flex items-center gap-1">
                                        {isGeneratingAi ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>} AI Assist
                                    </button>
                                </label>
                                <textarea rows={5} className="w-full bg-cad-panel border border-cad-border rounded-xl p-4 text-cad-text text-sm focus:border-cad-accent outline-none leading-relaxed" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Introduce yourself..."></textarea>
                            </div>

                            {/* Detailed Fee Breakdown (Professional Invoice Style) */}
                            {bidRate && (
                                <div className="bg-cad-panel rounded-xl p-4 border border-cad-border space-y-2">
                                    <div className="flex justify-between text-sm text-cad-muted">
                                        <span>Bid Amount</span>
                                        <span>{format(parseFloat(bidRate))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-cad-muted">
                                        <span>Service Fee (10%)</span>
                                        <span>-{format(parseFloat(bidRate) * 0.10)}</span>
                                    </div>
                                    <div className="border-t border-cad-border my-2"></div>
                                    <div className="flex justify-between text-base font-bold text-cad-text">
                                        <span>You'll Receive</span>
                                        <span className="text-cad-success">{format(parseFloat(bidRate) * 0.90)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t border-cad-border bg-cad-surface flex justify-between items-center">
                        <button onClick={startInterview} className="text-sm font-bold text-cad-muted hover:text-cad-text flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-cad-panel transition-colors">
                            <Bot className="w-4 h-4" /> Practice Interview
                        </button>
                        <div className="flex gap-3">
                            <button onClick={() => setSelectedJob(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-cad-muted hover:text-cad-text hover:bg-cad-panel">Cancel</button>
                            <button onClick={handleApply} className="px-8 py-2.5 bg-cad-accent text-cad-dark rounded-xl text-sm font-bold hover:bg-violet-400 shadow-lg shadow-cad-accent/20 active:scale-95 transition-all">
                                {proposalSent ? 'Sent!' : 'Submit Proposal'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL: POST JOB (CLIENT) */}
        {isPostingJob && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-2xl bg-cad-panel rounded-3xl border border-cad-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
                    <div className="p-6 border-b border-cad-border flex justify-between items-center bg-cad-surface">
                        <h3 className="text-xl font-bold text-cad-text">Post a New Contract</h3>
                        <button onClick={() => setIsPostingJob(false)} className="text-slate-500 hover:text-cad-text"><X className="w-6 h-6"/></button>
                    </div>
                    <form onSubmit={handlePostJob} className="p-8 space-y-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
                        <div>
                            <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Job Title</label>
                            <input 
                                required type="text" placeholder="e.g. Mechanical Design for HVAC System" 
                                className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium"
                                value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Discipline</label>
                                <select
                                    required
                                    className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium appearance-none"
                                    value={newJob.discipline} onChange={e => setNewJob({...newJob, discipline: e.target.value})}
                                >
                                    <option value="">Select discipline...</option>
                                    {['Architecture', 'Mechanical Engineering', 'Structural Engineering', 'MEP', 'Civil / Infrastructure', 'Industrial Design', 'Interior Design', 'Other'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Job Type</label>
                                <select
                                    className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium appearance-none"
                                    value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value as JobType})}
                                >
                                    {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Budget Range</label>
                                <input
                                    required type="text" placeholder="e.g. R1500 - R3000"
                                    className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium"
                                    value={newJob.budget} onChange={e => setNewJob({...newJob, budget: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Deadline</label>
                                <select
                                    required
                                    className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium appearance-none"
                                    value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})}
                                >
                                    <option value="">Select timeline...</option>
                                    {['1–2 weeks', '2–4 weeks', '1–3 months', '3–6 months', 'Flexible'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Experience Level</label>
                            <div className="flex gap-3">
                                {Object.values(ExperienceLevel).map(lvl => (
                                    <button
                                        key={lvl} type="button"
                                        onClick={() => setNewJob({...newJob, experienceLevel: lvl})}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                            newJob.experienceLevel === lvl
                                            ? 'bg-cad-accent text-cad-dark border-cad-accent'
                                            : 'bg-cad-surface text-slate-400 border-cad-border hover:border-cad-accent/50'
                                        }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Deliverables</label>
                            <div className="flex flex-wrap gap-2 p-3 bg-cad-panel rounded-xl border border-cad-border">
                                {['2D Drawings', '3D Model', 'Construction Documents', 'Shop Drawings', 'Renders / Visualizations', 'BIM Model', 'Technical Report'].map(d => (
                                    <button
                                        key={d} type="button"
                                        onClick={() => {
                                            const current = newJob.deliverables || [];
                                            setNewJob({...newJob, deliverables: current.includes(d) ? current.filter(x => x !== d) : [...current, d]});
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                            newJob.deliverables?.includes(d)
                                            ? 'bg-cad-accent text-cad-dark border-cad-accent'
                                            : 'bg-cad-surface text-slate-400 border-transparent hover:bg-cad-border'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Project Description</label>
                            <textarea
                                required rows={5} placeholder="Describe the project background, site conditions, standards to follow, and any other context the designer needs..."
                                className="w-full bg-cad-panel border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none leading-relaxed"
                                value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})}
                            />
                        </div>
                        {/* File Upload */}
                        <div>
                            <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">
                                Reference Files <span className="normal-case font-normal text-slate-500">(optional · max {MAX_FILES} files · {MAX_FILE_SIZE_MB}MB each)</span>
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.png,.jpg,.jpeg,.svg,.dwg,.dxf"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-cad-border hover:border-cad-accent/60 hover:bg-cad-accent/5 transition-all group"
                            >
                                <UploadCloud className="w-7 h-7 text-cad-muted group-hover:text-cad-accent transition-colors" />
                                <span className="text-sm font-medium text-cad-muted group-hover:text-cad-text transition-colors">
                                    Click to upload sketches, drawings, or specs
                                </span>
                                <span className="text-xs text-slate-500">PDF · PNG · JPG · SVG · DWG · DXF</span>
                            </button>

                            {/* Error message */}
                            {attachmentError && (
                                <p className="mt-2 text-xs text-red-400 flex items-start gap-1.5">
                                    <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    {attachmentError}
                                </p>
                            )}

                            {/* File list */}
                            {jobAttachments.length > 0 && (
                                <ul className="mt-3 space-y-2">
                                    {jobAttachments.map((file, i) => {
                                        const ext = file.name.split('.').pop()?.toUpperCase() || '';
                                        return (
                                            <li key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-cad-surface border border-cad-border">
                                                <div className="w-8 h-8 rounded-lg bg-cad-accent/10 border border-cad-accent/20 flex items-center justify-center shrink-0">
                                                    {['PNG', 'JPG', 'JPEG', 'SVG'].includes(ext)
                                                        ? <ImageIcon className="w-4 h-4 text-cad-accent" />
                                                        : <FileText className="w-4 h-4 text-cad-accent" />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-cad-text truncate">{file.name}</p>
                                                    <p className="text-xs text-slate-500">{ext} · {formatFileSize(file.size)}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(i)}
                                                    className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        <div className="pt-4 border-t border-cad-border flex justify-between items-center">
                            {jobAttachments.length > 0 && (
                                <span className="text-xs text-cad-muted flex items-center gap-1.5">
                                    <Paperclip className="w-3.5 h-3.5" />
                                    {jobAttachments.length} file{jobAttachments.length > 1 ? 's' : ''} attached
                                </span>
                            )}
                            <div className="flex gap-3 ml-auto">
                                <button type="button" onClick={() => setIsPostingJob(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-cad-text transition-colors">Cancel</button>
                                <button type="submit" className="px-8 py-3 bg-cad-accent text-cad-dark rounded-xl font-bold hover:bg-violet-400 shadow-lg shadow-cad-accent/20">Post Contract</button>
                            </div>
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

      </div>
    </div>
  );
};

export default JobMarket;
