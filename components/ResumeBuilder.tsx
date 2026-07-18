
import React, { useState } from 'react';
import { X, Save, Download, Sparkles, Loader2, FileText, User, Briefcase, GraduationCap, PenTool } from 'lucide-react';
import { ResumeData } from '../types';
import { optimizeResumeSection } from '../services/geminiService';

interface ResumeBuilderProps {
    initialData: ResumeData;
    onClose: () => void;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ initialData, onClose }) => {
    const [resume, setResume] = useState<ResumeData>(initialData);
    const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<'basics' | 'summary' | 'experience' | 'skills'>('basics');

    const handleOptimize = async (field: keyof ResumeData | string, text: string) => {
        setIsOptimizing(field as string);
        const improved = await optimizeResumeSection(field as string, text);
        if (field === 'summary') {
            setResume(prev => ({ ...prev, summary: improved }));
        } else if (field.startsWith('exp-')) {
            const index = parseInt(field.split('-')[1]);
            const newExp = [...resume.experience];
            newExp[index].description = improved;
            setResume(prev => ({ ...prev, experience: newExp }));
        }
        setIsOptimizing(null);
    };

    const handleDownload = () => {
        // Simulate PDF generation
        const link = document.createElement('a');
        link.href = '#';
        link.download = `${resume.fullName.replace(' ', '_')}_Resume.pdf`;
        // In a real app, this would generate a PDF blob
        alert("Downloading PDF...");
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-6xl h-[90vh] bg-cad-dark rounded-3xl border border-cad-border shadow-2xl flex overflow-hidden">
                
                {/* LEFT: Editor Panel */}
                <div className="w-full lg:w-1/2 flex flex-col border-r border-cad-border">
                    <div className="p-6 border-b border-cad-border flex justify-between items-center bg-cad-surface">
                        <h3 className="text-xl font-bold text-cad-text flex items-center gap-2">
                            <FileText className="w-5 h-5 text-cad-accent" /> Resume Builder
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-cad-surface/50 rounded-full text-slate-400 hover:text-cad-text transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex bg-cad-dark border-b border-cad-border">
                        <button onClick={() => setActiveSection('basics')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeSection === 'basics' ? 'border-cad-accent text-cad-text' : 'border-transparent text-slate-500 hover:text-cad-text'}`}>Basics</button>
                        <button onClick={() => setActiveSection('summary')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeSection === 'summary' ? 'border-cad-accent text-cad-text' : 'border-transparent text-slate-500 hover:text-cad-text'}`}>Summary</button>
                        <button onClick={() => setActiveSection('experience')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeSection === 'experience' ? 'border-cad-accent text-cad-text' : 'border-transparent text-slate-500 hover:text-cad-text'}`}>Experience</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-cad-dark">
                        {activeSection === 'basics' && (
                            <div className="space-y-4 animate-in slide-in-from-left-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Full Name</label>
                                        <input type="text" value={resume.fullName} onChange={e => setResume({...resume, fullName: e.target.value})} className="w-full bg-cad-surface/30 border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Job Title</label>
                                        <input type="text" value={resume.title} onChange={e => setResume({...resume, title: e.target.value})} className="w-full bg-cad-surface/30 border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Email</label>
                                        <input type="text" value={resume.email} onChange={e => setResume({...resume, email: e.target.value})} className="w-full bg-cad-surface/30 border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Location</label>
                                        <input type="text" value={resume.location} onChange={e => setResume({...resume, location: e.target.value})} className="w-full bg-cad-surface/30 border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'summary' && (
                            <div className="space-y-4 animate-in slide-in-from-left-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-500">Professional Summary</label>
                                    <button 
                                        onClick={() => handleOptimize('summary', resume.summary)}
                                        disabled={!!isOptimizing}
                                        className="text-xs font-bold text-cad-accent flex items-center gap-1 hover:text-cad-text transition-colors"
                                    >
                                        {isOptimizing === 'summary' ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                                        AI Rewrite
                                    </button>
                                </div>
                                <textarea 
                                    rows={8}
                                    value={resume.summary}
                                    onChange={e => setResume({...resume, summary: e.target.value})}
                                    className="w-full bg-cad-surface/30 border border-cad-border rounded-xl p-4 text-cad-text focus:border-cad-accent outline-none leading-relaxed"
                                />
                            </div>
                        )}

                        {activeSection === 'experience' && (
                            <div className="space-y-6 animate-in slide-in-from-left-4">
                                {resume.experience.map((exp, idx) => (
                                    <div key={exp.id} className="bg-cad-surface/30 p-4 rounded-xl border border-cad-border">
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <input type="text" value={exp.role} onChange={e => {
                                                const newExp = [...resume.experience]; newExp[idx].role = e.target.value; setResume({...resume, experience: newExp});
                                            }} className="bg-cad-surface/30 border border-cad-border rounded-lg px-3 py-2 text-sm text-cad-text font-bold" placeholder="Role" />
                                            <input type="text" value={exp.company} onChange={e => {
                                                const newExp = [...resume.experience]; newExp[idx].company = e.target.value; setResume({...resume, experience: newExp});
                                            }} className="bg-cad-surface/30 border border-cad-border rounded-lg px-3 py-2 text-sm text-cad-text" placeholder="Company" />
                                        </div>
                                        <div className="relative">
                                            <textarea 
                                                rows={4}
                                                value={exp.description}
                                                onChange={e => {
                                                    const newExp = [...resume.experience]; newExp[idx].description = e.target.value; setResume({...resume, experience: newExp});
                                                }}
                                                className="w-full bg-cad-surface/30 border border-cad-border rounded-lg p-3 text-sm text-slate-300 focus:border-cad-accent outline-none"
                                            />
                                            <button 
                                                onClick={() => handleOptimize(`exp-${idx}`, exp.description)}
                                                disabled={!!isOptimizing}
                                                className="absolute bottom-3 right-3 p-1.5 bg-cad-accent/10 text-cad-accent rounded-lg hover:bg-cad-accent hover:text-cad-dark transition-colors"
                                                title="Optimize with AI"
                                            >
                                                {isOptimizing === `exp-${idx}` ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5"/>}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 border border-dashed border-cad-border rounded-xl text-slate-500 hover:text-cad-text hover:border-white/30 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Add Experience
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Live Preview (A4 Paper) */}
                <div className="w-full lg:w-1/2 bg-[#525659] p-8 overflow-y-auto flex justify-center shadow-inner">
                    <div className="bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl text-black flex flex-col scale-[0.8] origin-top md:scale-100 transition-transform">
                        {/* Resume Header */}
                        <div className="mb-8 border-b-2 border-slate-800 pb-6">
                            <h1 className="text-4xl font-bold uppercase tracking-tight text-slate-900 mb-2">{resume.fullName || 'Your Name'}</h1>
                            <p className="text-xl text-slate-600 font-medium mb-4">{resume.title || 'Professional Title'}</p>
                            <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span>{resume.email}</span>
                                <span>•</span>
                                <span>{resume.location}</span>
                                <span>•</span>
                                <span>{resume.phone}</span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="mb-8">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-1">Professional Summary</h4>
                            <p className="text-sm text-slate-700 leading-relaxed text-justify">
                                {resume.summary || 'A brief summary of your professional background and key skills will appear here.'}
                            </p>
                        </div>

                        {/* Experience */}
                        <div className="mb-8 flex-1">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 pb-1">Experience</h4>
                            <div className="space-y-6">
                                {resume.experience.map(exp => (
                                    <div key={exp.id}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h5 className="font-bold text-slate-800">{exp.role}</h5>
                                            <span className="text-xs font-bold text-slate-500">{exp.period}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-600 mb-2">{exp.company}</p>
                                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-8">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-1">Technical Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {resume.skills.map(skill => (
                                    <span key={skill} className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        {/* Education */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-1">Education</h4>
                            {resume.education.map(edu => (
                                <div key={edu.id} className="mb-2">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-800 text-sm">{edu.school}</span>
                                        <span className="text-xs text-slate-500 font-bold">{edu.year}</span>
                                    </div>
                                    <span className="text-sm text-slate-600">{edu.degree}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-6 right-12 z-10 flex gap-4">
                    <button 
                        onClick={handleDownload}
                        className="bg-cad-accent text-cad-dark px-6 py-3 rounded-xl font-bold hover:bg-sky-400 transition-all shadow-xl shadow-cad-accent/30 flex items-center gap-2 active:scale-95"
                    >
                        <Download className="w-5 h-5" /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
