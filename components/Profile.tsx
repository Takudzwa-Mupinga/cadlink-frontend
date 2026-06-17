import React, { useState } from 'react';
import { Camera, MapPin, Mail, Link as LinkIcon, Edit2, Save, Award, Briefcase, Star, Clock, CheckCircle2, Plus, X, Image as ImageIcon, Upload, FileText } from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { Software, PortfolioItem, ResumeData } from '../types';
import ResumeBuilder from './ResumeBuilder';

const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(CURRENT_USER);
    const [showResumeBuilder, setShowResumeBuilder] = useState(false);

    // Form states for profile editing
    const [name, setName] = useState(user.name);
    const [role, setRole] = useState(user.role);
    const [bio, setBio] = useState(user.bio);
    const [rate, setRate] = useState(user.hourlyRate.toString());

    // State for adding new portfolio item
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', category: '', image: '' });

    const handleSaveProfile = () => {
        setUser({
            ...user,
            name,
            role,
            bio,
            hourlyRate: parseFloat(rate) || 0
        });
        setIsEditing(false);
    };

    const handleAddProject = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: PortfolioItem = {
            id: `p-${Date.now()}`,
            title: newProject.title || 'Untitled Project',
            category: newProject.category || 'General',
            image: newProject.image || `https://picsum.photos/600/400?random=${Date.now()}`
        };

        setUser(prev => ({
            ...prev,
            portfolio: [newItem, ...(prev.portfolio || [])]
        }));

        setIsAddingProject(false);
        setNewProject({ title: '', category: '', image: '' });
    };

    // Construct mock resume data from profile
    const resumeData: ResumeData = {
        fullName: user.name,
        title: user.role,
        email: 'takudzwam@cadlink.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        summary: user.bio,
        skills: user.skills,
        experience: [
            { id: 'e1', role: 'Senior Mechanical Engineer', company: 'Tesla Dynamics', period: '2020 - Present', description: 'Led the design of next-gen chassis systems using SolidWorks. Reduced weight by 15%.' },
            { id: 'e2', role: 'CAD Drafter', company: 'BuildTech Solutions', period: '2018 - 2020', description: 'Created detailed HVAC layouts for commercial buildings. Coordinated BIM models in Revit.' }
        ],
        education: [
            { id: 'ed1', school: 'MIT', degree: 'B.S. Mechanical Engineering', year: '2018' }
        ]
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">My Profile</h2>
                    <p className="text-cad-muted mt-1">Manage your personal information and portfolio.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowResumeBuilder(true)}
                        className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all bg-white/5 text-white hover:bg-white/10 border border-white/10"
                    >
                        <FileText className="w-4 h-4" /> Build Resume
                    </button>
                    <button 
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                        className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                            isEditing 
                            ? 'bg-green-500 text-white hover:bg-green-400 shadow-green-500/20' 
                            : 'bg-cad-accent text-cad-dark hover:bg-sky-400 shadow-cad-accent/20'
                        }`}
                    >
                        {isEditing ? <><Save className="w-4 h-4"/> Save Changes</> : <><Edit2 className="w-4 h-4"/> Edit Profile</>}
                    </button>
                </div>
            </div>

            {/* Header Card */}
            <div className="glass-panel rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl">
                {/* Cover Banner */}
                <div className="h-64 bg-gradient-to-r from-blue-900 via-slate-800 to-indigo-900 relative">
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] to-transparent"></div>
                    <button className="absolute top-6 right-6 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md transition-colors border border-white/10">
                        <Camera className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="px-8 md:px-12 pb-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="relative -mt-20">
                            <div className="p-1.5 bg-[#0B1121] rounded-3xl shadow-2xl">
                                <img src={user.avatar} alt="Profile" className="w-36 h-36 rounded-2xl object-cover" />
                            </div>
                            <button className="absolute bottom-2 right-2 bg-cad-accent text-cad-dark p-2 rounded-xl shadow-lg hover:bg-sky-400 transition-colors border-2 border-[#0B1121]">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 pt-2 space-y-4 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-1 w-full">
                                    {isEditing ? (
                                        <div className="space-y-3 max-w-md">
                                            <input 
                                                type="text" 
                                                value={name} 
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-2xl font-bold text-white focus:border-cad-accent outline-none"
                                            />
                                            <input 
                                                type="text" 
                                                value={role} 
                                                onChange={(e) => setRole(e.target.value)}
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cad-accent outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="text-4xl font-bold text-white tracking-tight">{user.name}</h1>
                                            <p className="text-xl text-cad-muted flex items-center gap-2 font-medium">
                                                <Briefcase className="w-5 h-5 text-cad-accent" /> {user.role}
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        <p className="text-[10px] text-cad-muted uppercase tracking-wider font-bold mb-1">Hourly Rate</p>
                                        {isEditing ? (
                                             <div className="flex items-center gap-1">
                                                <span className="text-cad-success font-bold">$</span>
                                                <input 
                                                    type="number" 
                                                    value={rate} 
                                                    onChange={(e) => setRate(e.target.value)}
                                                    className="w-20 bg-slate-900/50 border border-white/10 rounded px-2 py-0.5 text-cad-success font-bold focus:border-cad-accent outline-none"
                                                />
                                             </div>
                                        ) : (
                                            <p className="text-2xl font-bold text-cad-success">${user.hourlyRate}/hr</p>
                                        )}
                                    </div>
                                    <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        <p className="text-[10px] text-cad-muted uppercase tracking-wider font-bold mb-1">Rating</p>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                            <span className="text-2xl font-bold text-white">{user.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-6 pt-2 text-sm text-slate-400 font-medium">
                                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><MapPin className="w-4 h-4 text-cad-accent"/> San Francisco, CA</span>
                                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Mail className="w-4 h-4 text-cad-accent"/> {user.name.toLowerCase().replace(' ', '.')}@cadlink.com</span>
                                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:text-white cursor-pointer transition-colors"><LinkIcon className="w-4 h-4 text-cad-accent"/> portfolio.com/takudzwa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Skills */}
                <div className="space-y-8">
                    {/* Quick Stats */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white mb-6 text-lg">Performance</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/10">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-cad-muted font-bold uppercase tracking-wider">Jobs Done</p>
                                        <p className="font-bold text-white text-lg">124</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-green-500/10 rounded-xl text-green-400 border border-green-500/10">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-cad-muted font-bold uppercase tracking-wider">Earnings</p>
                                        <p className="font-bold text-white text-lg">R426k</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/10">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-cad-muted font-bold uppercase tracking-wider">Hours</p>
                                        <p className="font-bold text-white text-lg">1,850h</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white text-lg">Software Skills</h3>
                            {isEditing && <button className="text-xs font-bold text-cad-accent hover:text-white transition-colors">+ Add</button>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {user.skills.map(skill => (
                                <span key={skill} className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-sky-200 font-medium hover:bg-white/10 transition-colors">
                                    {skill}
                                    {isEditing && <button className="ml-2 text-slate-500 hover:text-red-400">×</button>}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio & Portfolio */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio */}
                    <div className="glass-panel p-8 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white mb-4 text-lg">About Me</h3>
                        {isEditing ? (
                            <textarea 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={6}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-slate-300 focus:border-cad-accent outline-none leading-relaxed text-base"
                            />
                        ) : (
                            <p className="text-slate-300 leading-relaxed text-lg">{user.bio}</p>
                        )}
                    </div>

                    {/* Portfolio */}
                    <div className="glass-panel p-8 rounded-2xl border border-white/5">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white text-lg">My Portfolio</h3>
                            <button 
                                onClick={() => setIsAddingProject(true)}
                                className="text-sm bg-cad-accent text-cad-dark px-4 py-2 rounded-xl font-bold hover:bg-sky-400 transition-all shadow-lg shadow-cad-accent/20 flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" /> Upload New Project
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {user.portfolio?.map((item) => (
                                <div key={item.id} className="group relative aspect-video rounded-xl overflow-hidden border border-white/5 cursor-pointer shadow-lg hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                        <span className="text-xs text-cad-accent font-bold uppercase tracking-wider mb-1">{item.category}</span>
                                        <h4 className="text-white font-bold text-xl">{item.title}</h4>
                                    </div>
                                    {isEditing && (
                                        <button className="absolute top-3 right-3 bg-red-500/80 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 backdrop-blur-md">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {/* Empty State / Add Placeholder if no items */}
                            {(!user.portfolio || user.portfolio.length === 0) && (
                                <div onClick={() => setIsAddingProject(true)} className="aspect-video rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 hover:text-cad-accent hover:border-cad-accent/30 hover:bg-white/5 transition-all cursor-pointer group">
                                    <div className="p-4 rounded-full bg-white/5 mb-3 group-hover:bg-cad-accent/10 transition-colors">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <p className="font-bold">Add your first project</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ADD PROJECT MODAL */}
            {isAddingProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="text-xl font-bold text-white">Add Portfolio Item</h3>
                            <button onClick={() => setIsAddingProject(false)} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddProject} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Project Title</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cad-accent outline-none font-medium"
                                    placeholder="e.g. Modern Loft Interior"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Category</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={newProject.category}
                                    onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cad-accent outline-none font-medium"
                                    placeholder="e.g. Architecture, Mechanical, Industrial"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Image URL</label>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <ImageIcon className="absolute left-4 top-3.5 text-slate-500 w-4 h-4" />
                                        <input 
                                            type="text" 
                                            value={newProject.image}
                                            onChange={(e) => setNewProject({...newProject, image: e.target.value})}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-cad-accent outline-none font-medium"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">Leave empty for a random placeholder image.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddingProject(false)} className="px-6 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 font-bold transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-8 py-3 bg-cad-accent text-cad-dark font-bold rounded-xl hover:bg-sky-400 shadow-lg shadow-cad-accent/20 transition-all active:scale-95">
                                    Add to Portfolio
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showResumeBuilder && <ResumeBuilder initialData={resumeData} onClose={() => setShowResumeBuilder(false)} />}
        </div>
        </div>
    );
};

export default Profile;