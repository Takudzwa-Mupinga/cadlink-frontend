
import React, { useState } from 'react';
import { Briefcase, Users, Settings, Package, User, LayoutDashboard, Globe2, Calendar, MessageCircle, FolderKanban, Box } from 'lucide-react';

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
    { id: 'network', icon: Users, label: 'Network' },
    { id: 'community', icon: Globe2, label: 'Community' },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
    { id: 'resources', icon: Package, label: 'Library' },
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
            : 'bg-cad-surface/30 border-cad-border text-slate-400 hover:text-cad-text hover:bg-cad-surface/50'
          }`}>
              <Box className={`w-5 h-5 transition-transform duration-500 ${isCollapsed && !isMobileOpen ? 'rotate-90 fill-current' : ''}`} />
          </div>
      </button>

      {/* SIDEBAR CONTAINER */}
      <div 
        className={`fixed left-0 top-0 h-[100dvh] bg-cad-dark/95 backdrop-blur-2xl border-r border-cad-border z-[65] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex flex-col overflow-hidden shadow-2xl ${mobileClasses} ${desktopClasses}`}
      >
        {/* Brand Header */}
        <div className="h-24 flex items-center px-6 gap-4 shrink-0 pl-20 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cad-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex flex-col justify-center opacity-0 animate-in fade-in slide-in-from-left-4 duration-700 delay-100 fill-mode-forwards relative z-10">
              <span className="text-xl font-black tracking-tighter text-cad-text font-sans flex items-center gap-1">
                  CAD<span className="text-cad-accent">Link</span>
              </span>
              <span className="text-[10px] text-cad-muted font-bold uppercase tracking-widest">Workspace</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="text-[10px] font-bold text-cad-muted uppercase tracking-widest px-4 mb-2 mt-2">Main Menu</div>
          {menuItems.map((item) => {
             const isActive = activeTab === item.id;
             return (
                <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center h-12 rounded-xl transition-all duration-200 group relative px-4 gap-3.5 ${
                    isActive
                    ? 'bg-cad-accent/10 text-cad-text shadow-inner'
                    : 'text-cad-muted hover:text-cad-text hover:bg-cad-surface/30'
                }`}
                >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cad-accent rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>}
                
                <item.icon className={`w-5 h-5 transition-all duration-300 shrink-0 ${
                    isActive ? 'text-cad-accent scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'group-hover:text-cad-text'
                }`} />
                
                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden tracking-wide transition-all ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                </span>
                
                {(item.id === 'notifications' || (item as any).badge) && (
                    <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md bg-cad-surface/50 border border-cad-border text-[10px] font-bold text-cad-text shadow-sm">
                       { (item as any).badge || 3 }
                    </span>
                )}
                </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-cad-border space-y-1 shrink-0 bg-cad-surface/30">
          <button 
            onClick={() => handleTabClick('settings')}
            className={`w-full flex items-center h-12 rounded-xl transition-all group px-4 gap-3 ${
              activeTab === 'settings' ? 'bg-cad-surface/50 text-cad-text' : 'text-cad-muted hover:text-cad-text hover:bg-cad-surface/30'
            }`}
          >
            <Settings className={`w-5 h-5 shrink-0 ${activeTab === 'settings' ? 'text-cad-accent' : ''}`} />
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
              Settings
            </span>
          </button>
          
        </div>
      </div>
    </>
  );
};

export default Sidebar;
