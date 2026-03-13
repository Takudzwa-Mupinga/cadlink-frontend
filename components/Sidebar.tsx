
import React, { useState } from 'react';
import { Briefcase, Users, Video, GraduationCap, Settings, Wallet, Package, Bell, User, LayoutDashboard, Globe2, Calendar, MessageCircle, FolderKanban, Box, HardDrive, Shield, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, toggleCollapse }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'messages', icon: MessageCircle, label: 'Inbox', badge: 2 },
    { id: 'market', icon: Briefcase, label: 'Job Market' },
    { id: 'projects', icon: FolderKanban, label: 'Projects' },
    { id: 'drive', icon: HardDrive, label: 'Cloud Drive' },
    { id: 'network', icon: Users, label: 'Network' },
    { id: 'community', icon: Globe2, label: 'Community' },
    { id: 'studio', icon: Video, label: 'Studio' }, 
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
    { id: 'finance', icon: Wallet, label: 'Finance' }, 
    { id: 'resources', icon: Package, label: 'Library' },
    { id: 'learn', icon: GraduationCap, label: 'Academy' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  const handleLogoClick = () => {
    // On mobile, toggle the overlay menu
    if (window.innerWidth < 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      // On desktop, toggle the collapse state
      toggleCollapse();
    }
  };

  const mobileClasses = isMobileOpen 
    ? 'w-72 translate-x-0 opacity-100 pointer-events-auto' 
    : 'w-0 -translate-x-full opacity-0 pointer-events-none';

  const desktopClasses = isCollapsed 
    ? 'md:w-0 md:opacity-0 md:-translate-x-4 md:pointer-events-none' 
    : 'md:w-72 md:opacity-100 md:translate-x-0 md:pointer-events-auto';

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* FIXED LOGO TOGGLE BUTTON */}
      <button 
        onClick={handleLogoClick}
        className={`fixed top-5 left-6 z-[70] group transition-all duration-300 active:scale-95 ${isCollapsed && !isMobileOpen ? 'scale-100' : 'scale-100'}`}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg border ${
            (isCollapsed && !isMobileOpen) || isMobileOpen
            ? 'bg-cad-accent text-cad-dark border-cad-accent shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          }`}>
              <Box className={`w-5 h-5 transition-transform duration-500 ${isCollapsed && !isMobileOpen ? 'rotate-90 fill-current' : ''}`} />
          </div>
      </button>

      {/* SIDEBAR CONTAINER */}
      <div 
        className={`fixed left-0 top-0 h-[100dvh] bg-[#0B1121]/95 backdrop-blur-2xl border-r border-white/5 z-[65] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex flex-col overflow-hidden shadow-2xl ${mobileClasses} ${desktopClasses}`}
      >
        {/* Brand Header */}
        <div className="h-24 flex items-center px-6 gap-4 shrink-0 pl-20 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cad-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex flex-col justify-center opacity-0 animate-in fade-in slide-in-from-left-4 duration-700 delay-100 fill-mode-forwards relative z-10">
              <span className="text-xl font-black tracking-tighter text-white font-sans flex items-center gap-1">
                  CAD<span className="text-cad-accent">Link</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Workspace</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 mb-2 mt-2">Main Menu</div>
          {menuItems.map((item) => {
             const isActive = activeTab === item.id;
             return (
                <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center h-12 rounded-xl transition-all duration-200 group relative px-4 gap-3.5 ${
                    isActive 
                    ? 'bg-cad-accent/10 text-white shadow-inner' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cad-accent rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>}
                
                <item.icon className={`w-5 h-5 transition-all duration-300 shrink-0 ${
                    isActive ? 'text-cad-accent scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'group-hover:text-slate-200'
                }`} />
                
                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden tracking-wide transition-all ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                </span>
                
                {(item.id === 'notifications' || (item as any).badge) && (
                    <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md bg-white/10 border border-white/5 text-[10px] font-bold text-white shadow-sm">
                       { (item as any).badge || 3 }
                    </span>
                )}
                </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-1 shrink-0 bg-black/20">
          <button 
            onClick={() => handleTabClick('admin')}
            className={`w-full flex items-center h-10 rounded-lg transition-all group px-3 gap-3 ${
              activeTab === 'admin' ? 'bg-red-500/10 text-red-400' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/5'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold whitespace-nowrap overflow-hidden uppercase tracking-wider">
              Admin Mode
            </span>
          </button>

          <button 
            onClick={() => handleTabClick('settings')}
            className={`w-full flex items-center h-12 rounded-xl transition-all group px-4 gap-3 ${
              activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className={`w-5 h-5 shrink-0 ${activeTab === 'settings' ? 'text-cad-accent' : ''}`} />
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
              Settings
            </span>
          </button>
          
          <div className="pt-3 mt-1 px-2 flex items-center gap-3">
             <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    AD
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0B1121] rounded-full"></div>
             </div>
             <div className="overflow-hidden">
                 <p className="text-xs font-bold text-white truncate">Alex Drafter</p>
                 <p className="text-[10px] text-slate-500 truncate">Pro Account</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
