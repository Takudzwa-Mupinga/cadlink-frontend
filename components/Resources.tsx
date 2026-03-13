import React, { useState } from 'react';
import { Package, Download, Search, Box, Layers, Image as ImageIcon, CheckCircle2, Loader2, Star } from 'lucide-react';

interface Asset {
    id: string;
    title: string;
    type: '2D Block' | '3D Model' | 'Material';
    format: string;
    size: string;
    downloads: number;
    rating: number;
    image: string;
    isPremium: boolean;
}

const MOCK_ASSETS: Asset[] = [
    { id: '1', title: 'Modern Office Chair', type: '3D Model', format: '.OBJ', size: '12 MB', downloads: 1240, rating: 4.8, image: 'https://picsum.photos/400/300?random=101', isPremium: false },
    { id: '2', title: 'Standard Steel Beams (I-Section)', type: '2D Block', format: '.DWG', size: '256 KB', downloads: 5430, rating: 4.9, image: 'https://picsum.photos/400/300?random=102', isPremium: false },
    { id: '3', title: 'Brushed Concrete Texture', type: 'Material', format: '.JPG + .MAP', size: '45 MB', downloads: 890, rating: 4.7, image: 'https://picsum.photos/400/300?random=103', isPremium: true },
    { id: '4', title: 'Industrial Pump Assembly', type: '3D Model', format: '.STEP', size: '28 MB', downloads: 320, rating: 4.9, image: 'https://picsum.photos/400/300?random=104', isPremium: true },
    { id: '5', title: 'Residential Tree Pack', type: '2D Block', format: '.DWG', size: '1.2 MB', downloads: 8500, rating: 4.5, image: 'https://picsum.photos/400/300?random=105', isPremium: false },
    { id: '6', title: 'Sci-Fi Panel Kitbash', type: '3D Model', format: '.FBX', size: '150 MB', downloads: 2100, rating: 5.0, image: 'https://picsum.photos/400/300?random=106', isPremium: true },
];

const Resources: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'All' | '2D Block' | '3D Model' | 'Material'>('All');
    const [downloading, setDownloading] = useState<string | null>(null);

    const filteredAssets = MOCK_ASSETS.filter(asset => 
        (activeTab === 'All' || asset.type === activeTab) &&
        asset.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = (id: string) => {
        setDownloading(id);
        setTimeout(() => setDownloading(null), 2000);
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Package className="w-8 h-8 text-cad-accent" /> Asset Library
                    </h2>
                    <p className="text-cad-muted mt-1">High-quality CAD blocks, models, and textures.</p>
                </div>
            </div>

            {/* Search and Tabs */}
            <div className="glass-panel p-2 rounded-2xl flex flex-col md:flex-row gap-3 items-center sticky top-4 z-20 shadow-xl">
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-4 top-3 text-slate-500 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search for models, blocks, textures..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none placeholder-slate-500 font-medium"
                    />
                </div>
                <div className="w-px h-8 bg-white/10 hidden md:block"></div>
                <div className="flex p-1 rounded-xl w-full md:w-auto gap-1">
                    {['All', '2D Block', '3D Model', 'Material'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === tab 
                                ? 'bg-cad-accent text-cad-dark shadow-lg' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.map(asset => (
                    <div key={asset.id} className="glass-card rounded-2xl overflow-hidden hover:border-cad-accent/40 hover:shadow-glow transition-all duration-300 group hover:-translate-y-1 flex flex-col">
                        <div className="relative h-56 bg-slate-900 overflow-hidden">
                            <img src={asset.image} alt={asset.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] via-transparent to-transparent opacity-60"></div>
                            
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 backdrop-blur-md shadow-lg ${
                                    asset.type === '3D Model' ? 'bg-blue-600/90' : 
                                    asset.type === '2D Block' ? 'bg-emerald-600/90' : 'bg-purple-600/90'
                                }`}>
                                    {asset.type}
                                </span>
                                {asset.isPremium && (
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-black bg-amber-400 border border-amber-300 shadow-lg flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-black" /> Premium
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col flex-1 relative -mt-4">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-white text-lg leading-tight group-hover:text-cad-accent transition-colors">{asset.title}</h3>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                                    {asset.type === '3D Model' ? <Box className="w-3.5 h-3.5 text-blue-400" /> : asset.type === '2D Block' ? <Layers className="w-3.5 h-3.5 text-emerald-400" /> : <ImageIcon className="w-3.5 h-3.5 text-purple-400" />}
                                    {asset.format}
                                </span>
                                <span className="w-px h-3 bg-white/10"></span>
                                <span>{asset.size}</span>
                                <span className="w-px h-3 bg-white/10"></span>
                                <span>{asset.downloads.toLocaleString()} DLs</span>
                            </div>

                            <div className="mt-auto">
                                <button 
                                    onClick={() => handleDownload(asset.id)}
                                    disabled={downloading === asset.id}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                                        downloading === asset.id 
                                        ? 'bg-green-500 text-white shadow-lg' 
                                        : 'bg-white/5 hover:bg-cad-accent hover:text-cad-dark text-white border border-white/10 hover:border-transparent hover:shadow-glow'
                                    }`}
                                >
                                    {downloading === asset.id ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" /> Download Asset
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
};

export default Resources;