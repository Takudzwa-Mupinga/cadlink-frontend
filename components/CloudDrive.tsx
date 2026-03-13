
import React, { useState } from 'react';
import { HardDrive, Folder, File, MoreVertical, Upload, Cloud, Plus, Share2, Download, Search, LayoutGrid, List as ListIcon, Box, FileText, Image as ImageIcon, Video, FileCode, Loader2, Star, Clock, Smartphone, X, ScanLine, History, Eye, UserPlus, Activity } from 'lucide-react';
import { MOCK_FILES } from '../constants';
import { CloudFile } from '../types';

const CloudDrive: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [files, setFiles] = useState<CloudFile[]>(MOCK_FILES);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);
    const [arModalOpen, setArModalOpen] = useState(false);
    const [selectedArFile, setSelectedArFile] = useState<CloudFile | null>(null);
    const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);

    const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleUpload = () => {
        setUploading(true);
        setTimeout(() => {
            const newFile: CloudFile = {
                id: `f-${Date.now()}`,
                name: `Upload_Demo_${Math.floor(Math.random() * 100)}.dwg`,
                type: 'dwg',
                size: '2.4 MB',
                modified: 'Just now',
                shared: false
            };
            setFiles([newFile, ...files]);
            setUploading(false);
        }, 1500);
    };

    const handleARPreview = (file: CloudFile) => {
        setSelectedArFile(file);
        setArModalOpen(true);
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'folder': return <Folder className="w-10 h-10 text-yellow-400 fill-yellow-400/20" />;
            case 'dwg': return <Box className="w-10 h-10 text-blue-400" />;
            case 'rvt': return <Box className="w-10 h-10 text-blue-600" />;
            case 'pdf': return <FileText className="w-10 h-10 text-red-400" />;
            case 'img': return <ImageIcon className="w-10 h-10 text-purple-400" />;
            case 'blend': return <Box className="w-10 h-10 text-orange-400" />;
            default: return <File className="w-10 h-10 text-slate-400" />;
        }
    };

    const getColor = (type: string) => {
         switch(type) {
            case 'folder': return 'bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/40';
            case 'dwg': return 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40';
            case 'rvt': return 'bg-blue-600/10 border-blue-600/20 hover:border-blue-600/40';
            case 'pdf': return 'bg-red-500/10 border-red-500/20 hover:border-red-500/40';
            case 'img': return 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40';
            default: return 'bg-slate-500/10 border-slate-500/20 hover:border-slate-500/40';
        }
    };

    return (
        <div className="h-full overflow-hidden flex flex-col md:flex-row bg-[#09090b] animate-in fade-in duration-500">
            {/* Left Sidebar (Storage Info) */}
            <div className="w-full md:w-64 bg-[#0e121b] border-r border-white/5 flex flex-col p-6 hidden md:flex shrink-0">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Cloud className="w-8 h-8 text-cad-accent" /> CAD Cloud
                    </h2>
                    <p className="text-cad-muted text-sm mt-1">Secure storage for your projects.</p>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-white/5 mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-white">Storage</span>
                        <span className="text-xs text-cad-muted">45.2 GB / 1 TB</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-cad-accent w-[4%] rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
                    </div>
                    <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/5">
                        Upgrade Plan
                    </button>
                </div>

                <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-cad-accent/10 text-cad-accent rounded-xl font-bold border border-cad-accent/20">
                        <HardDrive className="w-4 h-4" /> My Files
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
                        <Share2 className="w-4 h-4" /> Shared with me
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
                        <Clock className="w-4 h-4" /> Recent
                    </button>
                     <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
                        <Star className="w-4 h-4" /> Starred
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header Actions */}
                <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur-sm z-10 shrink-0">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Search files..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-cad-accent outline-none font-medium transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <button 
                            onClick={handleUpload}
                            disabled={uploading}
                            className="bg-cad-accent text-cad-dark px-4 py-2 rounded-xl font-bold hover:bg-sky-400 transition-all flex items-center gap-2 shadow-lg shadow-cad-accent/20 active:scale-95 disabled:opacity-50"
                        >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            <span className="hidden sm:inline">Upload</span>
                        </button>
                    </div>
                </div>

                {/* File Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <h3 className="text-white font-bold mb-6 text-lg">Recent Files</h3>
                    
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {/* Create Folder Card */}
                            <button className="aspect-[4/5] rounded-2xl border-2 border-dashed border-white/10 hover:border-cad-accent/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-3 group text-slate-500 hover:text-cad-accent">
                                <div className="p-3 rounded-full bg-white/5 group-hover:bg-cad-accent/10 transition-colors">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-sm">New Folder</span>
                            </button>

                            {filteredFiles.map(file => (
                                <div 
                                    key={file.id} 
                                    onClick={() => setSelectedFile(file)}
                                    className={`aspect-[4/5] glass-card rounded-2xl p-4 flex flex-col border transition-all cursor-pointer group hover:-translate-y-1 relative ${
                                        selectedFile?.id === file.id ? 'ring-2 ring-cad-accent border-transparent bg-white/[0.03]' : getColor(file.type)
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className={`w-3 h-3 rounded-full ${file.shared ? 'bg-green-500' : 'bg-transparent'}`}></div>
                                        </div>
                                        <button className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center">
                                        {getIcon(file.type)}
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-white font-bold text-sm truncate mb-1">{file.name}</h4>
                                        <p className="text-xs text-slate-400">{file.size} • {file.modified}</p>
                                    </div>
                                    
                                    {/* AR Quick Action for 3D Files */}
                                    {['dwg', 'rvt', 'blend', 'step'].includes(file.type) && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleARPreview(file); }}
                                            className="absolute bottom-16 right-4 p-2 bg-white text-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                            title="View in AR"
                                        >
                                            <Smartphone className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-xs text-cad-muted uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Size</th>
                                        <th className="px-6 py-4">Modified</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                                    {filteredFiles.map(file => (
                                        <tr 
                                            key={file.id} 
                                            onClick={() => setSelectedFile(file)}
                                            className={`hover:bg-white/5 transition-colors group cursor-pointer ${selectedFile?.id === file.id ? 'bg-white/5' : ''}`}
                                        >
                                            <td className="px-6 py-4 flex items-center gap-3 font-medium text-white">
                                                {getIcon(file.type)}
                                                {file.name}
                                            </td>
                                            <td className="px-6 py-4">{file.size}</td>
                                            <td className="px-6 py-4">{file.modified}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {['dwg', 'rvt', 'blend', 'step'].includes(file.type) && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleARPreview(file); }}
                                                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                                                            title="View in AR"
                                                        >
                                                            <Smartphone className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><Download className="w-4 h-4" /></button>
                                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><Share2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Detail Sidebar */}
            {selectedFile && (
                <div className="w-80 bg-[#0f1423] border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-300 shrink-0 absolute md:relative right-0 top-0 h-full z-20 shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex justify-between items-start">
                        <h3 className="text-white font-bold">File Details</h3>
                        <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                    </div>
                    
                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                        {/* File Preview */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-lg">
                                {getIcon(selectedFile.type)}
                            </div>
                            <h4 className="text-white font-bold text-lg break-all">{selectedFile.name}</h4>
                            <p className="text-slate-400 text-sm mt-1">{selectedFile.size}</p>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-2">
                            <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300">
                                <Download className="w-5 h-5 mb-1" /> Download
                            </button>
                            <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300">
                                <Share2 className="w-5 h-5 mb-1" /> Share
                            </button>
                            <button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300">
                                <Eye className="w-5 h-5 mb-1" /> Preview
                            </button>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-4">
                            <h5 className="text-xs font-bold text-cad-muted uppercase tracking-wider">Information</h5>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Type</span>
                                    <span className="text-white font-medium uppercase">{selectedFile.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Modified</span>
                                    <span className="text-white font-medium">{selectedFile.modified}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Created</span>
                                    <span className="text-white font-medium">Oct 24, 2023</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Location</span>
                                    <span className="text-white font-medium truncate max-w-[150px]">/Projects/Alpha</span>
                                </div>
                            </div>
                        </div>

                        {/* Shared With */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h5 className="text-xs font-bold text-cad-muted uppercase tracking-wider">Shared With</h5>
                                <button className="text-xs bg-cad-accent/10 text-cad-accent p-1.5 rounded-lg hover:bg-cad-accent/20"><UserPlus className="w-3 h-3"/></button>
                            </div>
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                    <img key={i} src={`https://picsum.photos/200/200?random=${i}`} className="w-8 h-8 rounded-full border-2 border-[#0f1423]" alt="User" />
                                ))}
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white border-2 border-[#0f1423] font-bold">+2</div>
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="space-y-4">
                            <h5 className="text-xs font-bold text-cad-muted uppercase tracking-wider">Activity</h5>
                            <div className="space-y-4 relative">
                                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/10"></div>
                                <div className="flex gap-3 relative">
                                    <div className="w-2.5 h-2.5 rounded-full bg-cad-accent mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="text-xs text-white font-bold">Edited by You</p>
                                        <p className="text-[10px] text-slate-500">Just now</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 relative">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600 mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="text-xs text-slate-300">Mike Ross commented</p>
                                        <p className="text-[10px] text-slate-500">2 hours ago</p>
                                    </div>
                                </div>
                                 <div className="flex gap-3 relative">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600 mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="text-xs text-slate-300">Version 1.0 Uploaded</p>
                                        <p className="text-[10px] text-slate-500">Yesterday</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AR MODAL */}
            {arModalOpen && selectedArFile && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-[#0f172a] rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
                        <button onClick={() => setArModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
                        
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-cad-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Box className="w-10 h-10 text-cad-accent" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">View in AR</h3>
                            <p className="text-slate-400 text-sm mb-8">Scan this QR code with your mobile device to visualize <strong className="text-white">{selectedArFile.name}</strong> in your physical space.</p>
                            
                            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto mb-8 relative">
                                {/* Fake QR Code */}
                                <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://cadlink.com/ar/view/123')] bg-contain bg-no-repeat bg-center"></div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-white p-1 rounded-full">
                                        <ScanLine className="w-6 h-6 text-black" />
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2">
                                <Share2 className="w-4 h-4" /> Send Link to Phone
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CloudDrive;
