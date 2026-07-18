import React, { useState } from 'react';
import { MessageSquare, Image as ImageIcon, ThumbsUp, MessageCircle, Share2, Plus, Sparkles, Loader2, Bot, Heart, Tag, CheckCircle2, Search, Filter } from 'lucide-react';
import { MOCK_POSTS, MOCK_GALLERY } from '../constants';
import { solveTechnicalQuestion } from '../services/geminiService';

const Community: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'discussions' | 'gallery'>('discussions');
    const [posts, setPosts] = useState(MOCK_POSTS);
    const [gallery, setGallery] = useState(MOCK_GALLERY);
    
    // AI Solving State
    const [solvingId, setSolvingId] = useState<string | null>(null);
    const [aiSolutions, setAiSolutions] = useState<Record<string, string>>({});

    const handleAiSolve = async (postId: string) => {
        const post = posts.find(p => p.id === postId);
        if(!post) return;

        setSolvingId(postId);
        const solution = await solveTechnicalQuestion(post.title, post.content, post.tags);
        
        setAiSolutions(prev => ({...prev, [postId]: solution}));
        setSolvingId(null);
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-cad-text tracking-tight flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-cad-accent" /> Community Hub
                    </h2>
                    <p className="text-cad-muted mt-1">Connect, share, and solve technical problems together.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                     {/* View Toggle */}
                    <div className="glass-panel p-1 rounded-xl flex border border-cad-border bg-cad-surface/30 backdrop-blur-md">
                        <button 
                            onClick={() => setActiveTab('discussions')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'discussions' ? 'bg-cad-accent text-cad-dark shadow-glow-accent' : 'text-slate-400 hover:text-cad-text hover:bg-cad-surface/30'}`}
                        >
                            <MessageSquare className="w-4 h-4"/> Discussions
                        </button>
                        <button 
                            onClick={() => setActiveTab('gallery')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'gallery' ? 'bg-cad-accent text-cad-dark shadow-glow-accent' : 'text-slate-400 hover:text-cad-text hover:bg-cad-surface/30'}`}
                        >
                            <ImageIcon className="w-4 h-4"/> Showcase
                        </button>
                    </div>
                    <button className="bg-gradient-to-r from-cad-accent to-blue-500 hover:to-blue-400 text-cad-text font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> {activeTab === 'discussions' ? 'New Post' : 'Upload Work'}
                    </button>
                </div>
            </div>

            {/* --- DISCUSSIONS TAB --- */}
            {activeTab === 'discussions' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search Bar */}
                        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 border border-cad-border">
                            <Search className="w-5 h-5 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Search discussions, error codes, or software..." 
                                className="flex-1 bg-transparent text-cad-text placeholder-slate-500 focus:outline-none"
                            />
                            <div className="w-px h-6 bg-cad-surface/50"></div>
                            <button className="text-slate-400 hover:text-cad-text transition-colors">
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>

                        {posts.map(post => (
                            <div key={post.id} className="glass-card rounded-2xl p-8 hover:border-cad-accent/20 transition-all group border border-cad-border hover:bg-white/[0.03]">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-xl border border-cad-border shadow-lg" />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cad-surface rounded-full flex items-center justify-center border border-slate-700">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-cad-text text-lg group-hover:text-cad-accent transition-colors leading-tight">{post.title}</h3>
                                            <p className="text-sm text-cad-muted flex items-center gap-2 mt-1">
                                                <span className="font-medium text-slate-300">{post.authorName}</span>
                                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                                <span>{post.postedAt}</span>
                                            </p>
                                        </div>
                                    </div>
                                    {post.isSolved && (
                                        <div className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-500/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                                        </div>
                                    )}
                                </div>
                                
                                <p className="text-slate-300 mb-6 leading-relaxed text-base">
                                    {post.content}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="text-xs font-bold bg-cad-surface/30 text-sky-200 px-3 py-1.5 rounded-lg border border-cad-border hover:border-sky-500/30 transition-colors">#{tag}</span>
                                    ))}
                                </div>

                                {/* AI Solution Area */}
                                {aiSolutions[post.id] && (
                                    <div className="mb-6 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                                        
                                        <div className="flex items-center gap-2 mb-3 text-purple-300 font-bold text-sm relative z-10 uppercase tracking-wide">
                                            <Bot className="w-4 h-4" /> CADLink AI Solution
                                        </div>
                                        <div className="text-sm text-purple-100 whitespace-pre-wrap leading-relaxed relative z-10 font-medium">
                                            {aiSolutions[post.id]}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-purple-500/20 flex gap-4 text-xs font-bold text-purple-300 relative z-10">
                                            <button className="hover:text-cad-text transition-colors">Did this help?</button>
                                            <button className="hover:text-cad-text transition-colors">Refine Answer</button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-6 border-t border-cad-border">
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-2 text-slate-400 hover:text-cad-accent transition-colors text-sm font-bold bg-cad-surface/30 px-4 py-2 rounded-xl border border-transparent hover:border-cad-accent/20 hover:bg-cad-accent/5">
                                            <ThumbsUp className="w-4 h-4" /> {post.upvotes}
                                        </button>
                                        <button className="flex items-center gap-2 text-slate-400 hover:text-cad-text transition-colors text-sm font-bold bg-cad-surface/30 px-4 py-2 rounded-xl border border-transparent hover:border-cad-border">
                                            <MessageCircle className="w-4 h-4" /> {post.comments} Comments
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        {!aiSolutions[post.id] && (
                                            <button 
                                                onClick={() => handleAiSolve(post.id)}
                                                disabled={solvingId === post.id}
                                                className="flex items-center gap-2 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-cad-text px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 hover:scale-[1.02] active:scale-95 border border-transparent"
                                            >
                                                {solvingId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5 text-yellow-200" />}
                                                Ask AI to Solve
                                            </button>
                                        )}
                                        <button className="text-slate-400 hover:text-cad-text p-2.5 rounded-xl hover:bg-cad-surface/50 transition-colors">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="glass-panel rounded-2xl p-6 border border-cad-border">
                            <h3 className="font-bold text-cad-text mb-5 flex items-center gap-2 text-sm uppercase tracking-wider"><Tag className="w-4 h-4 text-cad-accent"/> Trending Topics</h3>
                            <div className="space-y-1">
                                {['#AutoCAD2025', '#BlenderNodes', '#RevitBIM', '#3DPrinting', '#GenerativeDesign'].map((topic, i) => (
                                    <div key={topic} className="flex justify-between items-center text-sm group cursor-pointer p-3 hover:bg-cad-surface/30 rounded-xl transition-colors">
                                        <span className="text-slate-300 font-medium group-hover:text-cad-text transition-colors">{topic}</span>
                                        <span className="text-slate-500 text-xs font-bold bg-cad-surface/30 px-2 py-0.5 rounded-md border border-cad-border group-hover:border-cad-border">{2.4 - i * 0.3}k</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-3xl p-8 border border-cad-border shadow-2xl relative overflow-hidden group text-center">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Bot className="w-32 h-32 text-cad-text" />
                            </div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="p-4 bg-white/20 rounded-full mb-6 backdrop-blur-md shadow-lg">
                                    <Bot className="w-8 h-8 text-cad-text" />
                                </div>
                                <h3 className="font-bold text-cad-text mb-2 text-xl">Stuck on a command?</h3>
                                <p className="text-sm text-indigo-100 mb-8 leading-relaxed max-w-[200px] mx-auto opacity-90">Ask the community or use our AI helper to troubleshoot syntax errors instantly.</p>
                                <button className="w-full bg-white text-indigo-900 text-sm font-bold py-4 rounded-xl transition-transform hover:scale-105 shadow-xl">
                                    Try AI Troubleshooter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- GALLERY TAB --- */}
            {activeTab === 'gallery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     {gallery.map(item => (
                         <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-cad-surface border border-cad-border hover:border-cad-accent/50 hover:shadow-glow transition-all duration-500 cursor-pointer hover:-translate-y-2">
                             <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                             
                             {/* Overlay */}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-cad-text font-bold text-lg leading-tight mb-2">{item.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img src={item.authorAvatar} alt={item.authorName} className="w-6 h-6 rounded-full border border-slate-500" />
                                            <span className="text-xs font-bold text-slate-300">{item.authorName}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-pink-500 font-bold text-sm bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20 backdrop-blur-md">
                                            <Heart className="w-3.5 h-3.5 fill-pink-500" /> {item.likes}
                                        </div>
                                    </div>
                                </div>
                             </div>

                             <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold text-white border border-cad-border opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                {item.software}
                             </div>
                         </div>
                     ))}
                     
                     {/* Upload Placeholder */}
                     <div className="aspect-square rounded-2xl border-2 border-dashed border-cad-border hover:border-cad-accent/30 hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center text-slate-500 hover:text-cad-accent cursor-pointer group bg-white/[0.01]">
                        <div className="p-5 rounded-full bg-cad-surface/30 group-hover:bg-cad-accent/10 mb-4 transition-colors border border-cad-border group-hover:border-cad-accent/20">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-sm">Share your work</span>
                        <span className="text-xs text-slate-600 mt-1">PNG, JPG, or GIF</span>
                     </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default Community;