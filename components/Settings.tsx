
import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, CreditCard, Monitor, Cpu, HardDrive, Check, ToggleLeft, ToggleRight, Save, Lock, Sun, Moon, Layers, Github, Hash, Cloud, Database, Link as LinkIcon, ExternalLink, Zap, Globe, Loader2, MapPin, DollarSign, Briefcase, Link2, FileText } from 'lucide-react';
import PricingModal from './PricingModal';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCurrentUser } from '../contexts/UserContext';
import { updateProfile, updateDesignerProfile } from '../services/api';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '../lib/currency';

interface SettingsProps {
  theme?: 'dark' | 'light' | 'system';
  onSetTheme?: (t: 'dark' | 'light' | 'system') => void;
  onLogout?: () => void;
}

const CAD_SKILLS = [
  'AutoCAD', 'Revit', 'SolidWorks', 'Fusion 360',
  'SketchUp', 'Blender', 'Rhino', 'Civil 3D',
  'Navisworks', 'BIM 360', 'ArchiCAD', '3ds Max',
];

const Settings: React.FC<SettingsProps> = ({ theme = 'system', onSetTheme, onLogout }) => {
  const { currency, setCurrency, format } = useCurrency();
  const { profile, designerProfile, email: userEmail, firstName: ctxFirst, lastName: ctxLast, role, refetch } = useCurrentUser();
  const isDesigner = role === 'DESIGNER';
  const [activeSection, setActiveSection] = useState('general');
  const [showPricing, setShowPricing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile fields
  const [firstName, setFirstName] = useState(ctxFirst || '');
  const [lastName, setLastName] = useState(ctxLast || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || designerProfile?.location || '');
  // Designer-only fields
  const [headline, setHeadline] = useState(designerProfile?.headline || '');
  const [hourlyRate, setHourlyRate] = useState(designerProfile?.hourlyRate?.toString() || '');
  const [yearsExperience, setYearsExperience] = useState(designerProfile?.yearsExperience?.toString() || '');
  const [linkedinUrl, setLinkedinUrl] = useState(designerProfile?.linkedinUrl || '');
  const [cvUrl, setCvUrl] = useState(designerProfile?.cvUrl || '');
  const [photoUrl, setPhotoUrl] = useState(designerProfile?.photoUrl || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(designerProfile?.skills ?? profile?.skills ?? []);

  const [settings, setSettings] = useState({
      publicProfile: true,
      gpuEnabled: true,
      highTextures: 'High (4K)',
      emailNotifs: true,
      desktopNotifs: true,
      marketingEmails: false
  });

  useEffect(() => {
    setFirstName(ctxFirst || '');
    setLastName(ctxLast || '');
    setBio(profile?.bio || '');
    setLocation(profile?.location || designerProfile?.location || '');
    setHeadline(designerProfile?.headline || '');
    setHourlyRate(designerProfile?.hourlyRate?.toString() || '');
    setYearsExperience(designerProfile?.yearsExperience?.toString() || '');
    setLinkedinUrl(designerProfile?.linkedinUrl || '');
    setCvUrl(designerProfile?.cvUrl || '');
    setPhotoUrl(designerProfile?.photoUrl || '');
    setSelectedSkills(designerProfile?.skills ?? profile?.skills ?? []);
  }, [profile, designerProfile, ctxFirst, ctxLast]);

  const toggleSkill = (skill: string) =>
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);

  const [integrations, setIntegrations] = useState([
      { id: 'autodesk', name: 'Autodesk Cloud', icon: Layers, connected: true, desc: 'Sync Revit families and AutoCAD blocks.' },
      { id: 'github', name: 'GitHub', icon: Github, connected: false, desc: 'Version control for scripts and plugins.' },
      { id: 'slack', name: 'Slack', icon: Hash, connected: true, desc: 'Receive job notifications in your channel.' },
      { id: 'drive', name: 'Google Drive', icon: Cloud, connected: false, desc: 'Backup project files automatically.' },
      { id: 'notion', name: 'Notion', icon: Database, connected: false, desc: 'Export project milestones to Notion.' },
  ]);

  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        firstName,
        lastName,
        bio: bio || undefined,
        location: location || undefined,
        skills: isDesigner ? selectedSkills : undefined,
      });
      if (isDesigner) {
        await updateDesignerProfile({
          headline: headline || undefined,
          bio: bio || undefined,
          location: location || undefined,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
          linkedinUrl: linkedinUrl || undefined,
          cvUrl: cvUrl || undefined,
          photoUrl: photoUrl || undefined,
          skills: selectedSkills,
        });
      }
      refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
      setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleIntegration = (id: string) => {
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
  };

  const PLANS = [
    {
        name: 'Starter',
        price: 0,
        isFree: true,
        period: 'Forever',
        description: 'Essential tools for casual designers.',
        features: ['Public Profile', '5 Job Bids / Month', '1 GB Cloud Storage', 'Basic 3D Viewer', 'Community Access'],
        cta: 'Current Plan',
        current: true
    },
    {
        name: 'Pro Freelancer',
        price: 87,
        period: '/ month',
        description: 'Power tools for serious professionals.',
        features: ['Unlimited Job Bids', '1 TB Cloud Storage', 'AI DreamCanvas', '0% Withdrawal Fees', 'Verified Badge'],
        cta: 'Upgrade',
        popular: true
    },
    {
        name: 'Studio Team',
        price: 297,
        period: '/ month',
        description: 'Collaborative power for agencies.',
        features: ['5 Team Seats Included', 'Shared Cloud Drive', 'SSO Authentication', 'Priority Support', 'Custom Contracts'],
        cta: 'Contact Sales'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Basic info — all roles */}
            <div>
              <h3 className="text-lg font-bold text-cad-text mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-cad-accent" /> Profile Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    className="w-full bg-cad-surface border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    className="w-full bg-cad-surface border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Email Address</label>
                  <input type="email" value={userEmail || ''} readOnly
                    className="w-full bg-cad-surface/40 border border-cad-border rounded-xl px-4 py-3 text-slate-500 outline-none font-medium cursor-not-allowed" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-cad-muted uppercase tracking-wider mb-2"><MapPin className="w-3 h-3" /> Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Cape Town, ZA"
                    className="w-full bg-cad-surface border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium transition-colors placeholder-slate-600" />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-cad-muted uppercase tracking-wider mb-2"><FileText className="w-3 h-3" /> Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="A short bio visible on your public profile…"
                    className="w-full bg-cad-surface border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium transition-colors resize-none placeholder-slate-600" />
                </div>
              </div>
            </div>

            {/* Designer-only fields */}
            {isDesigner && (
              <>
                <div className="pt-6 border-t border-cad-border">
                  <h3 className="text-lg font-bold text-cad-text mb-6 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cad-accent" /> Professional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Headline</label>
                      <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. BIM Specialist & Revit Expert"
                        className="w-full bg-cad-surface border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium transition-colors placeholder-slate-600" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-cad-muted uppercase tracking-wider mb-2"><DollarSign className="w-3 h-3" /> Hourly Rate ($)</label>
                      <input type="number" min="0" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="e.g. 75"
                        className="w-full bg-cad-surface border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium transition-colors placeholder-slate-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-cad-muted uppercase tracking-wider mb-2">Years of Experience</label>
                      <input type="number" min="0" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} placeholder="e.g. 5"
                        className="w-full bg-cad-surface border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium transition-colors placeholder-slate-600" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-cad-muted uppercase tracking-wider mb-2"><Link2 className="w-3 h-3" /> LinkedIn URL</label>
                      <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…"
                        className="w-full bg-cad-surface border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium transition-colors placeholder-slate-600" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-cad-muted uppercase tracking-wider mb-2"><FileText className="w-3 h-3" /> CV / Resume URL</label>
                      <input type="url" value={cvUrl} onChange={e => setCvUrl(e.target.value)} placeholder="Google Drive, Cloudinary…"
                        className="w-full bg-cad-surface border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium transition-colors placeholder-slate-600" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-cad-muted uppercase tracking-wider mb-2"><User className="w-3 h-3" /> Profile Photo URL</label>
                      <input type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://…"
                        className="w-full bg-cad-surface border border-cad-border rounded-xl px-4 py-3 text-cad-text focus:border-cad-accent outline-none font-medium transition-colors placeholder-slate-600" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-cad-border">
                  <h3 className="text-lg font-bold text-cad-text mb-2">Software Skills</h3>
                  <p className="text-sm text-cad-muted mb-4">{selectedSkills.length} selected</p>
                  <div className="flex flex-wrap gap-2">
                    {CAD_SKILLS.map(skill => (
                      <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                          selectedSkills.includes(skill)
                            ? 'bg-cad-accent/20 border-cad-accent text-cad-accent'
                            : 'bg-cad-surface/30 border-cad-border text-slate-400 hover:border-white/30'
                        }`}>
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="pt-8 border-t border-cad-border">
               <h3 className="text-lg font-bold text-cad-text mb-6">Preferences</h3>
               <div className="flex items-center justify-between p-5 bg-cad-panel rounded-2xl border border-cad-border mb-4">
                  <div>
                    <div className="font-bold text-cad-text">Public Profile</div>
                    <div className="text-sm text-cad-muted mt-1">Allow others to find you in the network</div>
                  </div>
                  <button onClick={() => updateSetting('publicProfile', !settings.publicProfile)} className={`transition-colors ${settings.publicProfile ? 'text-cad-success' : 'text-slate-500'}`}>
                    {settings.publicProfile ? <ToggleRight className="w-10 h-10 fill-current" /> : <ToggleLeft className="w-10 h-10" />}
                  </button>
               </div>

               {/* Appearance */}
               <div className="p-5 bg-cad-panel rounded-2xl border border-cad-border space-y-4">
                  <div>
                    <div className="font-bold text-cad-text flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-cad-accent" />
                      Appearance
                    </div>
                    <div className="text-sm text-cad-muted mt-1">Choose a theme or follow your system setting</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'system', label: 'System', icon: Monitor },
                      { value: 'dark',  label: 'Dark',   icon: Moon },
                    ] as const).map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => onSetTheme?.(value)}
                        className={`flex flex-col items-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${
                          theme === value
                            ? 'bg-cad-accent text-cad-dark border-cad-accent shadow-lg shadow-cad-accent/20'
                            : 'bg-cad-surface text-cad-muted border-cad-border hover:border-cad-accent/50 hover:text-cad-text'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
               </div>

               {/* Currency */}
               <div className="p-5 bg-cad-panel rounded-2xl border border-cad-border space-y-4">
                  <div>
                    <div className="font-bold text-cad-text flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cad-accent" />
                      Currency
                    </div>
                    <div className="text-sm text-cad-muted mt-1">Choose the currency used across the app</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SUPPORTED_CURRENCIES.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setCurrency(c.code as CurrencyCode)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                          currency === c.code
                            ? 'bg-cad-accent text-cad-dark border-cad-accent shadow-lg shadow-cad-accent/20'
                            : 'bg-cad-surface text-cad-muted border-cad-border hover:border-cad-accent/50 hover:text-cad-text'
                        }`}
                      >
                        <span className="text-base">{c.symbol}</span>
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        );
      case 'notifications':
          return (
             <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-cad-text mb-2">Notification Preferences</h3>
                <div className="space-y-4">
                     <div className="flex items-center justify-between p-5 bg-cad-panel rounded-2xl border border-cad-border">
                        <div>
                            <div className="font-bold text-cad-text">Email Notifications</div>
                            <div className="text-sm text-cad-muted mt-1">Receive digests and important alerts</div>
                        </div>
                        <button onClick={() => updateSetting('emailNotifs', !settings.emailNotifs)} className={`transition-colors ${settings.emailNotifs ? 'text-cad-success' : 'text-slate-500'}`}>
                            {settings.emailNotifs ? <ToggleRight className="w-10 h-10 fill-current" /> : <ToggleLeft className="w-10 h-10" />}
                        </button>
                    </div>
                     <div className="flex items-center justify-between p-5 bg-cad-panel rounded-2xl border border-cad-border">
                        <div>
                            <div className="font-bold text-cad-text">Desktop Alerts</div>
                            <div className="text-sm text-cad-muted mt-1">Show popups when app is running</div>
                        </div>
                        <button onClick={() => updateSetting('desktopNotifs', !settings.desktopNotifs)} className={`transition-colors ${settings.desktopNotifs ? 'text-cad-success' : 'text-slate-500'}`}>
                            {settings.desktopNotifs ? <ToggleRight className="w-10 h-10 fill-current" /> : <ToggleLeft className="w-10 h-10" />}
                        </button>
                    </div>
                     <div className="flex items-center justify-between p-5 bg-cad-panel rounded-2xl border border-cad-border">
                        <div>
                            <div className="font-bold text-cad-text">Marketing Emails</div>
                            <div className="text-sm text-cad-muted mt-1">Receive tips, trends, and offers</div>
                        </div>
                        <button onClick={() => updateSetting('marketingEmails', !settings.marketingEmails)} className={`transition-colors ${settings.marketingEmails ? 'text-cad-success' : 'text-slate-500'}`}>
                            {settings.marketingEmails ? <ToggleRight className="w-10 h-10 fill-current" /> : <ToggleLeft className="w-10 h-10" />}
                        </button>
                    </div>
                </div>
             </div>
          );
      case 'integrations':
          return (
              <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-lg font-bold text-cad-text mb-2">Connected Apps</h3>
                  <p className="text-cad-muted text-sm -mt-2 mb-6">Supercharge your workflow by connecting your favorite tools.</p>
                  
                  <div className="grid grid-cols-1 gap-4">
                      {integrations.map((app) => (
                          <div key={app.id} className="flex items-center justify-between p-5 bg-cad-panel rounded-2xl border border-cad-border group hover:border-cad-accent/30 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-xl ${app.connected ? 'bg-cad-accent/10 text-cad-accent' : 'bg-cad-surface text-slate-500'}`}>
                                      <app.icon className="w-6 h-6" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-cad-text text-base flex items-center gap-2">
                                          {app.name}
                                          {app.connected && <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-wide">Active</span>}
                                      </h4>
                                      <p className="text-sm text-cad-muted">{app.desc}</p>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => toggleIntegration(app.id)}
                                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                                      app.connected 
                                      ? 'border-cad-border text-cad-muted hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5' 
                                      : 'bg-cad-text text-cad-dark border-transparent hover:opacity-90 shadow-lg'
                                  }`}
                              >
                                  {app.connected ? 'Disconnect' : 'Connect'}
                              </button>
                          </div>
                      ))}
                  </div>
                  
                  <div className="p-6 rounded-2xl border border-dashed border-cad-border flex flex-col items-center justify-center text-center gap-3 hover:bg-cad-panel/50 transition-colors cursor-pointer">
                      <div className="p-3 bg-cad-surface rounded-full">
                          <ExternalLink className="w-5 h-5 text-cad-muted" />
                      </div>
                      <h4 className="font-bold text-cad-text">Request an Integration</h4>
                      <p className="text-xs text-cad-muted max-w-xs">Don't see your favorite tool? Let us know and we'll add it to the roadmap.</p>
                  </div>
              </div>
          );
      case 'hardware':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl flex items-start gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Monitor className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-cad-text text-lg">System Compatibility Check</h4>
                <p className="text-sm text-cad-muted mt-1 leading-relaxed">Your system is optimized for WebGL 2.0 rendering. Large assemblies (&gt;500MB) may require more memory.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-cad-panel p-5 rounded-2xl border border-cad-border">
                <div className="flex items-center gap-2 mb-3 text-cad-muted font-bold text-xs uppercase tracking-wider">
                  <Cpu className="w-4 h-4" /> CPU Cores
                </div>
                <div className="text-3xl font-bold text-cad-text tracking-tight">8 Cores</div>
                <div className="text-xs text-green-400 mt-2 font-bold bg-green-500/10 w-fit px-2 py-0.5 rounded border border-green-500/20">DETECTED</div>
              </div>
               <div className="bg-cad-panel p-5 rounded-2xl border border-cad-border">
                <div className="flex items-center gap-2 mb-3 text-cad-muted font-bold text-xs uppercase tracking-wider">
                  <HardDrive className="w-4 h-4" /> Memory
                </div>
                <div className="text-3xl font-bold text-cad-text tracking-tight">16 GB</div>
                <div className="text-xs text-green-400 mt-2 font-bold bg-green-500/10 w-fit px-2 py-0.5 rounded border border-green-500/20">AVAILABLE</div>
              </div>
               <div className="bg-cad-panel p-5 rounded-2xl border border-cad-border">
                <div className="flex items-center gap-2 mb-3 text-cad-muted font-bold text-xs uppercase tracking-wider">
                  <Monitor className="w-4 h-4" /> GPU
                </div>
                <div className="text-2xl font-bold text-cad-text truncate" title="NVIDIA RTX 3080">NVIDIA RTX 3080</div>
                <div className="text-xs text-green-400 mt-2 font-bold bg-green-500/10 w-fit px-2 py-0.5 rounded border border-green-500/20">ACTIVE</div>
              </div>
            </div>

            <div className="pt-6">
               <h3 className="text-lg font-bold text-cad-text mb-6">Graphics Settings</h3>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-5 bg-cad-panel rounded-2xl border border-cad-border">
                    <div>
                      <div className="font-bold text-cad-text flex items-center gap-2">
                         Hardware Acceleration <span className="text-[10px] bg-cad-accent text-cad-dark px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">BETA</span>
                      </div>
                      <div className="text-sm text-cad-muted mt-1">Use GPU for 3D viewer rendering</div>
                    </div>
                    <button onClick={() => updateSetting('gpuEnabled', !settings.gpuEnabled)} className={`transition-colors ${settings.gpuEnabled ? 'text-cad-accent' : 'text-slate-500'}`}>
                      {settings.gpuEnabled ? <ToggleRight className="w-10 h-10 fill-current" /> : <ToggleLeft className="w-10 h-10" />}
                    </button>
                 </div>
                 
                 <div className="flex items-center justify-between p-5 bg-cad-panel rounded-2xl border border-cad-border">
                    <div>
                      <div className="font-bold text-cad-text">High Quality Textures</div>
                      <div className="text-sm text-cad-muted mt-1">May impact performance on large files</div>
                    </div>
                    <div className="flex items-center gap-2">
                       <select 
                          value={settings.highTextures}
                          onChange={(e) => updateSetting('highTextures', e.target.value)}
                          className="bg-cad-surface text-cad-text text-sm border border-cad-border rounded-lg px-3 py-2 outline-none font-medium"
                        >
                         <option>High (4K)</option>
                         <option>Medium (2K)</option>
                         <option>Low (1K)</option>
                       </select>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        );
      case 'billing':
        return (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="glass-card p-8 rounded-3xl border border-cad-accent/30 relative overflow-hidden shadow-glow">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <CreditCard className="w-48 h-48 text-cad-text" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-cad-accent font-bold uppercase tracking-wider text-xs mb-2">Current Plan</p>
                        <h3 className="text-3xl font-bold text-cad-text mb-2">Starter (Free)</h3>
                        <p className="text-cad-muted font-medium mb-8 text-lg">Limited features • Upgrade to unlock full potential</p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowPricing(true)}
                                className="bg-cad-accent text-cad-dark px-6 py-2.5 rounded-xl font-bold hover:bg-violet-400 transition-colors shadow-lg shadow-cad-accent/20"
                            >
                                Upgrade Plan
                            </button>
                            <button className="bg-cad-panel text-cad-text px-6 py-2.5 rounded-xl font-bold hover:bg-cad-surface transition-colors border border-cad-border">View Invoices</button>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-cad-text mb-6 text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-cad-accent" /> Available Plans
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PLANS.map(plan => (
                            <div key={plan.name} className={`relative p-6 rounded-2xl border flex flex-col ${plan.popular ? 'bg-cad-accent/5 border-cad-accent/50 shadow-glow-accent' : 'bg-cad-panel border-cad-border'}`}>
                                {plan.popular && <div className="absolute top-0 right-0 bg-cad-accent text-cad-dark text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">Most Popular</div>}
                                <div className="mb-4">
                                    <h4 className="text-lg font-bold text-cad-text">{plan.name}</h4>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-2xl font-bold text-cad-text">{(plan as any).isFree ? 'Free' : format(plan.price)}</span>
                                        <span className="text-xs text-cad-muted">{plan.period}</span>
                                    </div>
                                    <p className="text-xs text-cad-muted mt-2 h-8">{plan.description}</p>
                                </div>
                                <div className="space-y-2 mb-6 flex-1">
                                    {plan.features.map((feat, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                                            <Check className={`w-3 h-3 ${plan.popular ? 'text-cad-accent' : 'text-slate-500'}`} />
                                            {feat}
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setShowPricing(true)}
                                    className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                                        plan.current 
                                        ? 'bg-cad-surface/30 text-slate-400 cursor-default' 
                                        : plan.popular
                                        ? 'bg-cad-accent text-cad-dark hover:bg-sky-400 shadow-lg'
                                        : 'bg-white text-black hover:bg-slate-200'
                                    }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-cad-text mb-6 text-lg">Payment Methods</h3>
                    <div className="space-y-4">
                         <div className="flex items-center justify-between p-5 bg-cad-panel rounded-2xl border border-cad-border">
                            <div className="flex items-center gap-4">
                                <div className="bg-cad-surface p-3 rounded-xl border border-cad-border">
                                    <CreditCard className="w-6 h-6 text-cad-text" />
                                </div>
                                <div>
                                    <div className="font-bold text-cad-text text-lg">Visa ending in 4242</div>
                                    <div className="text-sm text-cad-muted font-medium">Expires 12/25</div>
                                </div>
                            </div>
                            <span className="text-xs bg-cad-surface text-cad-text px-3 py-1 rounded-full font-bold border border-cad-border">Default</span>
                         </div>
                         <button className="w-full py-4 border border-dashed border-cad-border rounded-2xl text-cad-muted hover:text-cad-text hover:border-cad-accent hover:bg-cad-accent/5 transition-all flex items-center justify-center gap-2 font-bold">
                            <CreditCard className="w-5 h-5" /> Add Payment Method
                         </button>
                    </div>
                </div>
            </div>
        );
      case 'security':
          return (
             <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-4">
                    <h3 className="font-bold text-cad-text text-lg">Password & Authentication</h3>
                    <div className="p-6 bg-cad-panel rounded-2xl border border-cad-border space-y-4">
                         <div className="flex justify-between items-center">
                             <div>
                                <h4 className="font-bold text-cad-text">Password</h4>
                                <p className="text-sm text-cad-muted">Last changed 3 months ago</p>
                             </div>
                             <button className="text-sm font-bold text-cad-text bg-cad-surface px-4 py-2 rounded-lg hover:bg-cad-border">Change</button>
                         </div>
                         <div className="w-full h-px bg-cad-border"></div>
                          <div className="flex justify-between items-center">
                             <div>
                                <h4 className="font-bold text-cad-text flex items-center gap-2">Two-Factor Authentication <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">ENABLED</span></h4>
                                <p className="text-sm text-cad-muted">Secure your account with 2FA</p>
                             </div>
                             <button className="text-sm font-bold text-red-400 bg-red-500/10 px-4 py-2 rounded-lg hover:bg-red-500/20">Disable</button>
                         </div>
                    </div>
                </div>
             </div>
          );
      default: 
        return null;
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-cad-text mb-2">Settings</h2>
      <p className="text-cad-muted mb-8">Manage your account preferences and workspace configuration.</p>

      <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-full md:w-72 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => setActiveSection('general')}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all ${activeSection === 'general' ? 'bg-cad-accent text-cad-dark font-bold shadow-lg shadow-cad-accent/20' : 'text-cad-muted hover:text-cad-text hover:bg-cad-panel font-medium'}`}
          >
            <User className="w-5 h-5" /> General
          </button>
          <button 
             onClick={() => setActiveSection('integrations')}
             className={`flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all ${activeSection === 'integrations' ? 'bg-cad-accent text-cad-dark font-bold shadow-lg shadow-cad-accent/20' : 'text-cad-muted hover:text-cad-text hover:bg-cad-panel font-medium'}`}
          >
            <LinkIcon className="w-5 h-5" /> Integrations
          </button>
          <button 
             onClick={() => setActiveSection('notifications')}
             className={`flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all ${activeSection === 'notifications' ? 'bg-cad-accent text-cad-dark font-bold shadow-lg shadow-cad-accent/20' : 'text-cad-muted hover:text-cad-text hover:bg-cad-panel font-medium'}`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
             onClick={() => setActiveSection('hardware')}
             className={`flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all ${activeSection === 'hardware' ? 'bg-cad-accent text-cad-dark font-bold shadow-lg shadow-cad-accent/20' : 'text-cad-muted hover:text-cad-text hover:bg-cad-panel font-medium'}`}
          >
            <Monitor className="w-5 h-5" /> Hardware & GPU
          </button>
           <button 
             onClick={() => setActiveSection('billing')}
             className={`flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all ${activeSection === 'billing' ? 'bg-cad-accent text-cad-dark font-bold shadow-lg shadow-cad-accent/20' : 'text-cad-muted hover:text-cad-text hover:bg-cad-panel font-medium'}`}
          >
            <CreditCard className="w-5 h-5" /> Billing
          </button>
          <button
             onClick={() => setActiveSection('security')}
             className={`flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all ${activeSection === 'security' ? 'bg-cad-accent text-cad-dark font-bold shadow-lg shadow-cad-accent/20' : 'text-cad-muted hover:text-cad-text hover:bg-cad-panel font-medium'}`}
          >
            <Shield className="w-5 h-5" /> Security
          </button>

          <div className="mt-4 pt-4 border-t border-cad-border">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-xl text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-panel rounded-3xl border border-cad-border p-8 md:p-10 overflow-y-auto custom-scrollbar shadow-2xl">
            {renderSection()}
            
            <div className="mt-10 pt-8 border-t border-cad-border space-y-3">
                 {saveError && (
                   <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{saveError}</p>
                 )}
                 <div className="flex justify-end">
                   <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-60 ${saved ? 'bg-green-500 text-cad-text' : 'bg-cad-accent text-cad-dark hover:bg-violet-400'}`}
                   >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                      {isSaving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                   </button>
                 </div>
            </div>
        </div>
      </div>

      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  );
};

export default Settings;
