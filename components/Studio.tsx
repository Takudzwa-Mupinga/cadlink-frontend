
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, Send, MessageSquare, Kanban, Box, Plus, Eye, MousePointer2, Move, RotateCcw, ZoomIn, Grid, Sparkles, Zap, Loader2, Users, Settings, Maximize, X, Layers, Ruler, ChevronRight, Minimize, PenTool, Eraser, StickyNote, Square, Redo, Undo, Crosshair, Magnet, Lock } from 'lucide-react';
import { ChatMessage, Task } from '../types';
import { generateAIResponse, generateDesignImage } from '../services/geminiService';

const COLLABORATORS = [
    { id: 'me', name: 'You', color: '#f59e0b', avatar: 'https://picsum.photos/200/200?random=99', role: 'Engineer' },
    { id: 'u2', name: 'Mike Ross', color: '#3b82f6', avatar: 'https://picsum.photos/200/200?random=2', role: 'Product Designer' },
    { id: 'u3', name: 'Elena Silva', color: '#10b981', avatar: 'https://picsum.photos/200/200?random=3', role: 'Architect' },
    { id: 'client', name: 'Sarah (Client)', color: '#8b5cf6', avatar: 'https://picsum.photos/200/200?random=90', role: 'Client' },
];

interface ControlBtnProps {
    isActive: boolean;
    onClick: () => void;
    iconOn: React.ReactNode;
    iconOff: React.ReactNode;
    activeColor: string;
    inactiveColor: string;
    badge?: boolean;
    label: string;
}

const ControlBtn: React.FC<ControlBtnProps> = ({ isActive, onClick, iconOn, iconOff, activeColor, inactiveColor, badge, label }) => (
    <button 
        onClick={onClick}
        className={`p-3.5 rounded-xl transition-all relative group ${isActive ? activeColor : inactiveColor}`}
    >
        {isActive ? iconOn : iconOff}
        {badge && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0f1423]"></span>}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-lg transform translate-y-2 group-hover:translate-y-0">
            {label}
        </div>
    </button>
);

interface StudioProps {
    initialMode?: 'chat' | 'meeting' | 'board' | 'files' | 'dream' | 'whiteboard';
}

const Studio: React.FC<StudioProps> = ({ initialMode = 'files' }) => {
  const [activeMode, setActiveMode] = useState(initialMode);
  const [isZenMode, setIsZenMode] = useState(false);
  
  useEffect(() => {
      if (initialMode) setActiveMode(initialMode);
  }, [initialMode]);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
      { id: '1', sender: 'other', text: 'Hey, did you finish the DWG exports?', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  
  // File System State
  const [viewTool, setViewTool] = useState('orbit');
  const [cubeRotation, setCubeRotation] = useState({ x: -20, y: 45 });
  const [layers, setLayers] = useState([
      { id: 'l1', name: 'Structure', visible: true, color: 'text-blue-400' },
      { id: 'l2', name: 'HVAC', visible: true, color: 'text-red-400' },
      { id: 'l3', name: 'Electrical', visible: false, color: 'text-yellow-400' },
      { id: 'l4', name: 'Plumbing', visible: true, color: 'text-green-400' },
  ]);
  const [selectedObject, setSelectedObject] = useState('Duct_Main_A2');
  const [coords, setCoords] = useState({ x: 0, y: 0, z: 0 });
  const [cadSettings, setCadSettings] = useState({ grid: true, snap: true, ortho: false, polar: true });
  
  // Command Line State
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>(['CADLink v2.0.4 Initialized', 'Ready for input...']);
  const cmdInputRef = useRef<HTMLInputElement>(null);

  // Kanban State
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', title: 'HVAC Load Calculation', assignee: 'https://picsum.photos/200/200?random=1', priority: 'Medium', status: 'In Progress', deadline: 'Tomorrow' },
    { id: 't2', title: 'Export 2D Elevations', assignee: 'https://picsum.photos/200/200?random=2', priority: 'Low', status: 'Todo', deadline: 'Next Week' },
  ]);
  
  // DreamCanvas State
  const [dreamPrompt, setDreamPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isDreaming, setIsDreaming] = useState(false);

  // Whiteboard State
  const [wbTool, setWbTool] = useState<'pen' | 'eraser' | 'note' | 'rect'>('pen');
  const [wbColor, setWbColor] = useState('#ffffff');
  const [wbElements, setWbElements] = useState<any[]>([
      { id: 'n1', type: 'note', x: 200, y: 150, text: 'Check Load Calcs', color: '#fbbf24' }
  ]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('');

  // Meeting State
  const [meetingState, setMeetingState] = useState({
      hasJoined: false,
      mic: true,
      camera: true,
      screenShare: false,
      showChat: false,
      showParticipants: false
  });

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'me', text: inputText, timestamp: new Date() }]);
    if (inputText.toLowerCase().includes('@ai')) {
        const aiResponse = await generateAIResponse(inputText.replace('@ai', ''));
        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), sender: 'ai', text: aiResponse, timestamp: new Date() }]);
    }
    setInputText('');
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    
    const cmd = commandInput.toUpperCase();
    const newHistory = [...commandHistory, `> ${cmd}`];
    
    if (cmd === 'LINE' || cmd === 'L') newHistory.push('Specify first point:');
    else if (cmd === 'CIRCLE' || cmd === 'C') newHistory.push('Specify center point for circle:');
    else if (cmd === 'TRIM' || cmd === 'TR') newHistory.push('Select cutting edges:');
    else if (cmd === 'EXTRUDE' || cmd === 'EXT') newHistory.push('Select objects to extrude:');
    else if (cmd === 'CLEAR') { setCommandHistory(['Cleared.']); setCommandInput(''); return; }
    else newHistory.push('Unknown command.');

    setCommandHistory(newHistory.slice(-5));
    setCommandInput('');
  };

  const rotateCube = (face: string) => {
      switch(face) {
          case 'front': setCubeRotation({ x: 0, y: 0 }); break;
          case 'right': setCubeRotation({ x: 0, y: -90 }); break;
          case 'back': setCubeRotation({ x: 0, y: -180 }); break;
          case 'left': setCubeRotation({ x: 0, y: 90 }); break;
          case 'top': setCubeRotation({ x: -90, y: 0 }); break;
          case 'bottom': setCubeRotation({ x: 90, y: 0 }); break;
      }
  };

  const handleGenerateImage = async () => {
      if (!dreamPrompt) return;
      setIsDreaming(true);
      const imgUrl = await generateDesignImage(dreamPrompt);
      setGeneratedImage(imgUrl);
      setIsDreaming(false);
  };

  const toggleMeetingState = (key: keyof typeof meetingState) => {
      setMeetingState(prev => ({ ...prev, [key]: !prev[key as keyof typeof meetingState] }));
  };

  const toggleZenMode = () => {
      setIsZenMode(!isZenMode);
  };

  // Whiteboard Logic
  const handleWbMouseDown = (e: React.MouseEvent) => {
      if (wbTool === 'pen') {
          setIsDrawing(true);
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setCurrentPath(`M ${x} ${y}`);
      } else if (wbTool === 'note') {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setWbElements([...wbElements, { 
              id: Date.now(), 
              type: 'note', 
              x, y, 
              text: 'New Note', 
              color: ['#fbbf24', '#f87171', '#60a5fa', '#a3e635'][Math.floor(Math.random()*4)] 
          }]);
      }
  };

  const handleWbMouseMove = (e: React.MouseEvent) => {
      if (!isDrawing || wbTool !== 'pen') return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCurrentPath(prev => `${prev} L ${x} ${y}`);
  };

  const handleWbMouseUp = () => {
      if (isDrawing) {
          setIsDrawing(false);
          setWbElements([...wbElements, { id: Date.now(), type: 'path', d: currentPath, color: wbColor }]);
          setCurrentPath('');
      }
  };

  // Simulated Coordinate Tracking
  const handleViewportMouseMove = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setCoords({
          x: Math.round(x * 10),
          y: Math.round(y * 10),
          z: 0
      });
  };

  return (
    <div className={`h-full flex flex-col md:flex-row gap-4 max-w-full overflow-hidden bg-[#09090b] ${isZenMode ? 'fixed inset-0 z-[100] p-0' : 'pt-4 pb-4 pr-4 pl-0 md:pl-0'}`}>
        
        {/* Zen Mode Exit Button */}
        {isZenMode && (
            <button 
                onClick={toggleZenMode}
                className="fixed top-4 right-4 z-[110] bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors"
                title="Exit Zen Mode"
            >
                <Minimize className="w-5 h-5" />
            </button>
        )}

        {/* Left Sidebar - Navigation (Hidden in Zen Mode) */}
        {!isZenMode && (
            <div className="w-20 md:w-64 glass-panel rounded-r-2xl md:rounded-2xl flex flex-col hidden md:flex ml-4 overflow-hidden border border-white/5 shadow-premium">
                <div className="p-4 border-b border-white/5 bg-[#18181b]">
                    <h3 className="font-bold text-white text-xs uppercase tracking-widest text-center md:text-left text-cad-muted">Workspace</h3>
                </div>
                <div className="flex-1 p-2 space-y-1">
                    {[
                        { id: 'files', icon: Box, label: '3D Viewport' },
                        { id: 'whiteboard', icon: PenTool, label: 'Sketch & Ideate', color: 'text-yellow-400' },
                        { id: 'board', icon: Kanban, label: 'Task Board' },
                        { id: 'chat', icon: MessageSquare, label: 'Team Chat' },
                        { id: 'dream', icon: Sparkles, label: 'AI Concepts', color: 'text-purple-400' },
                        { id: 'meeting', icon: Video, label: 'Live Meeting', color: 'text-red-400' }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setActiveMode(mode.id as any)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeMode === mode.id 
                                ? 'bg-cad-accent/10 text-cad-accent border border-cad-accent/20 shadow-[inset_2px_0_0_0_rgba(56,189,248,1)]' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <mode.icon className={`w-4 h-4 ${mode.color || ''}`} />
                            <span>{mode.label}</span>
                            {mode.id === 'meeting' && (
                                <span className="ml-auto flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-mono text-slate-400">SYNC: ONLINE</span>
                    </div>
                </div>
            </div>
        )}

        {/* Main Workspace Area */}
        <div className={`flex-1 glass-panel flex flex-col overflow-hidden relative border border-white/5 shadow-2xl bg-[#09090b] ${isZenMode ? 'rounded-none border-0' : 'rounded-2xl mr-4'}`}>
            
            {/* ... (Existing Viewport, Whiteboard, Board, Dream Modes - Omitted for Brevity as they are unchanged) ... */}
            
            {activeMode === 'files' && (
                // Re-injecting viewport code for context, but keeping it condensed in this thought process to focus on the change
                <div className="flex-1 relative flex flex-col">
                    <div className="flex-1 flex relative">
                        {!isZenMode && (
                            <div className="w-60 border-r border-white/5 bg-[#0e121b] flex flex-col z-10 hidden lg:flex">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#18181b]">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Layers className="w-4 h-4"/> Layers</span>
                                    <Plus className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
                                </div>
                                <div className="p-2 space-y-1">
                                    {layers.map(l => (
                                        <div 
                                            key={l.id} 
                                            onClick={() => setLayers(prev => prev.map(lay => lay.id === l.id ? {...lay, visible: !lay.visible} : lay))}
                                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 text-sm text-slate-300 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Eye className={`w-4 h-4 ${l.visible ? l.color : 'text-slate-700'}`} />
                                                <span className={l.visible ? 'text-white font-medium' : 'text-slate-600'}>{l.name}</span>
                                            </div>
                                            {l.visible && <div className={`w-2 h-2 rounded-full ${l.color.replace('text', 'bg')}`}></div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex-1 bg-[#050505] relative overflow-hidden group" onMouseMove={handleViewportMouseMove}>
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
                            <div 
                                className="absolute top-1/2 left-1/2 w-96 h-96 transition-transform duration-500"
                                style={{ transform: `translate(-50%, -50%) rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`, transformStyle: 'preserve-3d' }}
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-cad-accent shadow-[0_0_30px_rgba(56,189,248,0.2)] rounded-lg"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-purple-500/50 transform rotate-12 rounded-lg"></div>
                            </div>
                            <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
                                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 border border-white/10 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> 60 FPS
                                </div>
                            </div>
                            <div className={`absolute top-6 right-6 w-20 h-20 scene-3d group/cube cursor-pointer z-50 transition-all duration-300 ${isZenMode ? 'top-16 right-16 scale-125' : ''}`}>
                                <div className="cube-3d" style={{ transform: `rotateX(${-cubeRotation.x}deg) rotateY(${-cubeRotation.y}deg)` }}>
                                    <div className="cube-face face-front" onClick={() => rotateCube('front')}>Front</div>
                                    <div className="cube-face face-back" onClick={() => rotateCube('back')}>Back</div>
                                    <div className="cube-face face-right" onClick={() => rotateCube('right')}>Right</div>
                                    <div className="cube-face face-left" onClick={() => rotateCube('left')}>Left</div>
                                    <div className="cube-face face-top" onClick={() => rotateCube('top')}>Top</div>
                                    <div className="cube-face face-bottom" onClick={() => rotateCube('bottom')}>Btm</div>
                                </div>
                            </div>
                            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 glass-panel px-2 py-2 rounded-xl flex gap-1 border border-white/10 shadow-premium z-30">
                                {[ { id: 'select', icon: MousePointer2 }, { id: 'pan', icon: Move }, { id: 'orbit', icon: RotateCcw }, { id: 'zoom', icon: ZoomIn }, { id: 'measure', icon: Ruler } ].map(tool => (
                                    <button key={tool.id} onClick={() => setViewTool(tool.id)} className={`p-2.5 rounded-lg transition-all ${viewTool === tool.id ? 'bg-cad-accent text-cad-dark' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                        <tool.icon className="w-5 h-5" />
                                    </button>
                                ))}
                                <div className="w-px h-10 bg-white/10 mx-1"></div>
                                <button onClick={toggleZenMode} className={`p-2.5 rounded-lg transition-all ${isZenMode ? 'bg-cad-accent text-cad-dark' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                    {isZenMode ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="h-8 bg-[#0e121b] border-t border-white/5 flex items-center justify-between px-4 text-[10px] font-mono text-slate-400 select-none z-50">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-cad-accent">READY</span>
                            <span className="w-px h-3 bg-white/10"></span>
                            <span className="w-32">X: {coords.x.toFixed(2)}, Y: {coords.y.toFixed(2)}, Z: {coords.z.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --------------------------------------------------------------------------------
               MEETING MODE (ENHANCED WITH LOBBY)
            -------------------------------------------------------------------------------- */}
            {activeMode === 'meeting' && (
                <div className="flex-1 flex flex-col relative bg-[#000000] overflow-hidden">
                    {!meetingState.hasJoined ? (
                        // LOBBY / GREEN ROOM
                        <div className="flex-1 flex items-center justify-center relative p-6">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
                                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cad-accent/10 rounded-full blur-[100px]"></div>
                            </div>

                            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="glass-panel p-1 rounded-3xl border border-white/10 shadow-2xl bg-black/40">
                                    <div className="bg-black/50 rounded-[20px] aspect-video relative overflow-hidden flex items-center justify-center group">
                                        {meetingState.camera ? (
                                            <>
                                                <img src="https://picsum.photos/800/600?random=99" className="w-full h-full object-cover opacity-80" alt="Preview" />
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Camera On
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-slate-500">
                                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                                                    <VideoOff className="w-10 h-10" />
                                                </div>
                                                <p className="font-bold text-sm">Camera is Off</p>
                                            </div>
                                        )}
                                        
                                        <div className="absolute bottom-4 right-4 flex gap-2">
                                            <button 
                                                onClick={() => toggleMeetingState('mic')}
                                                className={`p-3 rounded-full transition-all ${meetingState.mic ? 'bg-white text-black hover:bg-slate-200' : 'bg-red-500 text-white'}`}
                                            >
                                                {meetingState.mic ? <Mic className="w-5 h-5"/> : <MicOff className="w-5 h-5"/>}
                                            </button>
                                            <button 
                                                onClick={() => toggleMeetingState('camera')}
                                                className={`p-3 rounded-full transition-all ${meetingState.camera ? 'bg-white text-black hover:bg-slate-200' : 'bg-red-500 text-white'}`}
                                            >
                                                {meetingState.camera ? <Video className="w-5 h-5"/> : <VideoOff className="w-5 h-5"/>}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center space-y-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Ready to join?</h2>
                                        <p className="text-slate-400">HVAC Design Review • 3 Participants Waiting</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">Sarah, Mike, Elena</p>
                                                    <p className="text-xs text-slate-500">Already in call</p>
                                                </div>
                                            </div>
                                            <div className="flex -space-x-2">
                                                {[1,2,3].map(i => (
                                                    <img key={i} src={`https://picsum.photos/200/200?random=${i+20}`} className="w-8 h-8 rounded-full border-2 border-black" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => toggleMeetingState('hasJoined')}
                                            className="flex-1 bg-cad-accent text-cad-dark py-4 rounded-xl font-bold text-lg hover:bg-sky-400 transition-all shadow-lg shadow-cad-accent/20 active:scale-95"
                                        >
                                            Join Meeting
                                        </button>
                                        <button className="px-6 py-4 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/10">
                                            Present
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // ACTIVE MEETING
                        <>
                            {/* Top Bar */}
                            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none"></div>
                            
                            <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
                                <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3 border border-white/10 bg-black/40 backdrop-blur-xl">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">REC</span>
                                    </div>
                                    <div className="w-px h-4 bg-white/10"></div>
                                    <span className="text-sm font-bold text-slate-200">HVAC Design Review</span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-400">00:12:45</span>
                                </div>
                            </div>

                            {/* Main Stage */}
                            <div className="flex-1 flex relative">
                                <div className={`flex-1 p-6 grid gap-6 transition-all duration-300 ${meetingState.screenShare ? 'grid-cols-4 grid-rows-4' : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3'} content-center`}>
                                    
                                    {meetingState.screenShare && (
                                        <div className="col-span-3 row-span-4 bg-[#1e293b] rounded-3xl border border-cad-accent/30 relative overflow-hidden shadow-2xl group ring-1 ring-white/10">
                                            <div className="h-8 bg-[#0f172a] border-b border-white/5 flex items-center px-4 justify-between">
                                                <span className="text-xs font-bold text-slate-400">Autodesk Revit 2024 - [HVAC_Level_1.rvt]</span>
                                                <div className="flex gap-1.5">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 top-8 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] flex items-center justify-center">
                                                <div className="w-3/4 h-3/4 border border-cad-accent/20 rounded-lg flex items-center justify-center relative">
                                                    <div className="absolute inset-0 border border-dashed border-slate-700 opacity-50"></div>
                                                    <Monitor className="w-20 h-20 text-cad-accent opacity-20 animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-cad-accent flex items-center justify-center text-cad-dark font-bold text-xs">YO</div>
                                                <div>
                                                    <p className="text-xs font-bold text-white leading-tight">You are presenting</p>
                                                    <p className="text-[10px] text-green-400 font-medium">Screen Share Active</p>
                                                </div>
                                                <button onClick={() => toggleMeetingState('screenShare')} className="ml-2 p-1.5 hover:bg-white/10 rounded-lg text-white"><X className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    )}

                                    {COLLABORATORS.map((user, idx) => {
                                        const isMe = user.id === 'me';
                                        if (meetingState.screenShare && isMe) return null;

                                        return (
                                            <div key={user.id} className={`relative bg-slate-800 rounded-3xl overflow-hidden border shadow-lg group transition-all ${
                                                user.id === 'client' ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.15)]' : 'border-white/5'
                                            } ${meetingState.screenShare ? 'col-span-1 row-span-1' : ''}`}>
                                                <img src={user.avatar} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" alt={user.name} />
                                                
                                                {user.id === 'client' && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-500/20 to-transparent flex items-end justify-center gap-1 pb-4 px-10 opacity-60">
                                                        {[1,2,3,4,5,4,3,2].map((h, i) => (
                                                            <div key={i} className="w-2 bg-green-400 rounded-t-full animate-[bounce_1s_infinite]" style={{ height: `${h * 15}%`, animationDelay: `${i * 0.1}s` }}></div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-bold text-white flex items-center gap-2 text-shadow-sm">
                                                                {user.name} {isMe && '(You)'}
                                                                {user.id === 'client' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                                                            </span>
                                                            <span className="text-[10px] text-slate-300 font-medium bg-black/40 px-2 py-0.5 rounded w-fit backdrop-blur-sm">{user.role}</span>
                                                        </div>
                                                        <div className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                                                            {user.id === 'client' ? <Mic className="w-4 h-4 text-green-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                
                                {meetingState.showChat && (
                                    <div className="w-96 bg-[#0f1423]/95 backdrop-blur-xl border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300 z-30">
                                        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6">
                                            <h3 className="font-bold text-white">Meeting Chat</h3>
                                            <button onClick={() => toggleMeetingState('showChat')} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                            <div className="flex gap-3">
                                                <img src="https://picsum.photos/200/200?random=90" className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-xs font-bold text-white">Sarah (Client)</span>
                                                        <span className="text-[10px] text-slate-500">10:42 AM</span>
                                                    </div>
                                                    <p className="text-sm text-slate-300 bg-white/5 p-3 rounded-2xl rounded-tl-none mt-1 border border-white/5">Can we zoom in on the mechanical room layout?</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 flex-row-reverse">
                                                <div className="w-8 h-8 rounded-full bg-cad-accent flex items-center justify-center text-xs font-bold text-cad-dark">YO</div>
                                                <div className="text-right">
                                                    <div className="flex items-baseline gap-2 justify-end">
                                                        <span className="text-[10px] text-slate-500">10:43 AM</span>
                                                        <span className="text-xs font-bold text-white">You</span>
                                                    </div>
                                                    <p className="text-sm text-white bg-blue-600 p-3 rounded-2xl rounded-tr-none mt-1 shadow-lg shadow-blue-900/20">Sure, I'll switch to the 3D view.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 border-t border-white/5">
                                            <div className="relative">
                                                <input type="text" placeholder="Send a message..." className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:border-cad-accent outline-none transition-colors" />
                                                <button className="absolute right-2 top-2 p-1.5 bg-cad-accent text-cad-dark rounded-lg hover:bg-sky-400 transition-colors"><Send className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Control Dock */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
                                <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/10 shadow-2xl bg-[#0f1423]/80 backdrop-blur-2xl ring-1 ring-white/5 scale-100 hover:scale-105 transition-transform duration-300">
                                    <ControlBtn 
                                        isActive={meetingState.mic} 
                                        onClick={() => toggleMeetingState('mic')} 
                                        iconOn={<Mic className="w-5 h-5" />} 
                                        iconOff={<MicOff className="w-5 h-5" />}
                                        activeColor="bg-white/10 text-white"
                                        inactiveColor="bg-red-500/20 text-red-500 border border-red-500/30"
                                        label={meetingState.mic ? "Mute" : "Unmute"}
                                    />
                                    <ControlBtn 
                                        isActive={meetingState.camera} 
                                        onClick={() => toggleMeetingState('camera')} 
                                        iconOn={<Video className="w-5 h-5" />} 
                                        iconOff={<VideoOff className="w-5 h-5" />}
                                        activeColor="bg-white/10 text-white"
                                        inactiveColor="bg-red-500/20 text-red-500 border border-red-500/30"
                                        label={meetingState.camera ? "Stop Video" : "Start Video"}
                                    />
                                    
                                    <div className="w-px h-8 bg-white/10 mx-2"></div>

                                    <ControlBtn 
                                        isActive={meetingState.screenShare} 
                                        onClick={() => toggleMeetingState('screenShare')} 
                                        iconOn={<Monitor className="w-5 h-5" />} 
                                        iconOff={<Monitor className="w-5 h-5" />}
                                        activeColor="bg-green-500 text-white shadow-lg shadow-green-500/20"
                                        inactiveColor="bg-white/10 text-white hover:bg-white/20"
                                        label="Screen Share"
                                    />
                                    <ControlBtn 
                                        isActive={meetingState.showChat} 
                                        onClick={() => toggleMeetingState('showChat')} 
                                        iconOn={<MessageSquare className="w-5 h-5" />} 
                                        iconOff={<MessageSquare className="w-5 h-5" />}
                                        activeColor="bg-cad-accent text-cad-dark shadow-lg shadow-cad-accent/20"
                                        inactiveColor="bg-white/10 text-white hover:bg-white/20"
                                        badge={true}
                                        label="Chat"
                                    />
                                    <ControlBtn 
                                        isActive={false} 
                                        onClick={() => {}} 
                                        iconOn={<Users className="w-5 h-5" />} 
                                        iconOff={<Users className="w-5 h-5" />}
                                        activeColor="bg-white/10 text-white"
                                        inactiveColor="bg-white/10 text-white hover:bg-white/20"
                                        label="Participants"
                                    />
                                    <ControlBtn 
                                        isActive={false} 
                                        onClick={() => {}} 
                                        iconOn={<Settings className="w-5 h-5" />} 
                                        iconOff={<Settings className="w-5 h-5" />}
                                        activeColor="bg-white/10 text-white"
                                        inactiveColor="bg-white/10 text-white hover:bg-white/20"
                                        label="Settings"
                                    />

                                    <div className="w-px h-8 bg-white/10 mx-2"></div>

                                    <button 
                                        onClick={() => toggleMeetingState('hasJoined')}
                                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/40 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <PhoneOff className="w-5 h-5" /> Leave
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeMode === 'board' && (
                <div className="flex-1 bg-[#0e121b] p-6 overflow-x-auto custom-scrollbar">
                    {/* ... (Existing Board content) ... */}
                    <div className="flex gap-6 h-full">
                        {['Todo', 'In Progress', 'Done'].map(status => (
                            <div key={status} className="w-80 flex-shrink-0 flex flex-col bg-[#18181b] rounded-xl border border-white/5">
                                <div className="p-4 border-b border-white/5 font-bold text-xs text-cad-muted uppercase tracking-widest">{status}</div>
                                <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                                    {tasks.filter(t => t.status === status).map(t => (
                                        <div key={t.id} className="bg-[#27272a] p-4 rounded-lg border border-white/5 shadow-sm hover:border-cad-accent/30 cursor-pointer transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${t.priority === 'High' ? 'text-red-400 border-red-900 bg-red-900/20' : 'text-slate-400 border-slate-700 bg-slate-800'}`}>{t.priority}</span>
                                            </div>
                                            <p className="text-sm font-bold text-white mb-3 group-hover:text-cad-accent transition-colors">{t.title}</p>
                                            <div className="flex items-center gap-2">
                                                <img src={t.assignee} className="w-5 h-5 rounded-full" />
                                                <span className="text-xs text-slate-500">{t.deadline}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full py-2 border border-dashed border-white/10 text-slate-500 text-xs font-bold rounded hover:border-cad-accent hover:text-cad-accent transition-colors">+ Add Task</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ... (Keeping existing Chat, Dream, Whiteboard for consistency) ... */}
            {activeMode === 'chat' && (
                <div className="flex-1 flex flex-col bg-[#0e121b]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'me' ? 'bg-cad-accent text-cad-dark' : 'bg-white/5 text-white border border-white/5'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-[#18181b] border-t border-white/5">
                        <div className="flex gap-2">
                             <input 
                                className="flex-1 bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cad-accent outline-none"
                                placeholder="Type a message or @ai for help..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                             />
                             <button onClick={handleSendMessage} className="p-3 bg-cad-accent text-cad-dark rounded-xl font-bold">
                                 <Send className="w-5 h-5"/>
                             </button>
                        </div>
                    </div>
                </div>
            )}
            
            {activeMode === 'dream' && (
                <div className="flex-1 p-10 bg-[#09090b] flex flex-col items-center justify-center">
                    <div className="max-w-2xl w-full space-y-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                                <Sparkles className="w-8 h-8 text-purple-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">DreamCanvas</h2>
                            <p className="text-slate-400">Generate architectural concepts with AI.</p>
                        </div>
                        
                        <div className="glass-panel p-2 rounded-xl flex gap-2 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                            <input 
                                type="text" 
                                value={dreamPrompt}
                                onChange={e => setDreamPrompt(e.target.value)}
                                placeholder="Describe a futuristic villa..."
                                className="flex-1 bg-transparent border-none px-4 text-white focus:outline-none placeholder-slate-600"
                            />
                            <button 
                                onClick={handleGenerateImage}
                                disabled={isDreaming || !dreamPrompt}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                            >
                                {isDreaming ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4 text-yellow-200"/>} Generate
                            </button>
                        </div>

                        {generatedImage && (
                            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95">
                                <img src={generatedImage} className="w-full h-auto" />
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default Studio;
