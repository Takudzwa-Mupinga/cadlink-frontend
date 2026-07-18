import React, { useState } from 'react';
import { MapPin, Mail, Link as LinkIcon, Edit2, Save, Award, Briefcase, Star, Clock, CheckCircle2, X, Upload, Loader2, AlertCircle } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCurrentUser } from '../contexts/UserContext';
import { updateProfile, updateDesignerProfile } from '../services/api';

const SKILL_SUGGESTIONS = ['AutoCAD', 'Revit', 'SolidWorks', 'Fusion 360', 'CATIA', 'SketchUp', 'ArchiCAD', 'Rhino', 'Blender', '3ds Max', 'Civil 3D', 'Inventor', 'ANSYS', 'MATLAB'];

interface CompletenessItem { label: string; done: boolean; points: number; }

function computeCompleteness(fields: {
    firstName: string; lastName: string; headline: string;
    bio: string; rate: string; skills: string[]; location: string;
}): { score: number; items: CompletenessItem[] } {
    const items: CompletenessItem[] = [
        { label: 'Full name', done: !!fields.firstName.trim() && !!fields.lastName.trim(), points: 15 },
        { label: 'Headline', done: !!fields.headline.trim(), points: 15 },
        { label: 'Bio', done: !!fields.bio.trim(), points: 20 },
        { label: 'Hourly rate', done: parseFloat(fields.rate) > 0, points: 15 },
        { label: 'Software skills', done: fields.skills.length > 0, points: 20 },
        { label: 'Location', done: !!fields.location.trim(), points: 15 },
    ];
    const score = items.reduce((sum, i) => sum + (i.done ? i.points : 0), 0);
    return { score, items };
}

const Profile: React.FC = () => {
    const { format, symbol } = useCurrency();
    const { profile, designerProfile, stats, email, role: userRole, firstName, lastName, refetch } = useCurrentUser();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Edit form state — seeded on edit open
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editHeadline, setEditHeadline] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editRate, setEditRate] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editSkills, setEditSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');

    // Derived display values from real API data
    const displayName = [firstName, lastName].filter(Boolean).join(' ') || profile?.displayName || email;
    const displayHeadline = designerProfile?.headline || '';
    const displayBio = profile?.bio || designerProfile?.bio || '';
    const displayRate = designerProfile?.hourlyRate;
    const displaySkills: string[] = (designerProfile?.skills ?? profile?.skills ?? []) as string[];
    const displayLocation = profile?.location || '';
    const displayRating = designerProfile?.userRating;

    const handleStartEdit = () => {
        setEditFirstName(firstName || '');
        setEditLastName(lastName || '');
        setEditHeadline(displayHeadline);
        setEditBio(displayBio);
        setEditRate(displayRate?.toString() ?? '');
        setEditLocation(displayLocation);
        setEditSkills([...displaySkills]);
        setSaveError('');
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setSaveError('');
        try {
            await updateProfile({
                firstName: editFirstName,
                lastName: editLastName,
                bio: editBio,
                location: editLocation,
                skills: editSkills,
            });
            if (userRole === 'DESIGNER') {
                await updateDesignerProfile({
                    headline: editHeadline,
                    hourlyRate: parseFloat(editRate) || undefined,
                    skills: editSkills,
                });
            }
            await refetch();
            setIsEditing(false);
        } catch (err: any) {
            setSaveError(err.message ?? 'Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const addSkill = (skill: string) => {
        const s = skill.trim();
        if (s && !editSkills.includes(s)) setEditSkills(prev => [...prev, s]);
        setNewSkill('');
    };

    const removeSkill = (skill: string) => setEditSkills(prev => prev.filter(s => s !== skill));

    // Completeness — live during edit, from API when viewing
    const liveCompleteness = isEditing
        ? computeCompleteness({ firstName: editFirstName, lastName: editLastName, headline: editHeadline, bio: editBio, rate: editRate, skills: editSkills, location: editLocation })
        : computeCompleteness({ firstName, lastName, headline: displayHeadline, bio: displayBio, rate: displayRate?.toString() ?? '', skills: displaySkills, location: displayLocation });
    const savedScore = designerProfile?.profileCompleteness ?? liveCompleteness.score;

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-cad-text tracking-tight">My Profile</h2>
                        <p className="text-cad-muted mt-1">Manage your personal information and portfolio.</p>
                    </div>
                    <div className="flex gap-3">
                        {isEditing && (
                            <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-cad-text transition-colors">
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={isEditing ? handleSaveProfile : handleStartEdit}
                            disabled={isSaving}
                            className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-60 ${
                                isEditing
                                ? 'bg-green-500 text-cad-text hover:bg-green-400 shadow-green-500/20'
                                : 'bg-cad-accent text-cad-dark hover:bg-sky-400 shadow-cad-accent/20'
                            }`}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : isEditing ? <Save className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>}
                            {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                {saveError && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        <X className="w-4 h-4 shrink-0"/>{saveError}
                    </div>
                )}

                {/* Header Card */}
                <div className="glass-panel rounded-3xl overflow-hidden relative border border-cad-border shadow-2xl">
                    <div className="h-64 bg-gradient-to-r from-blue-900 via-slate-800 to-indigo-900 relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] to-transparent"></div>
                    </div>

                    <div className="px-8 md:px-12 pb-10">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar */}
                            <div className="relative -mt-20">
                                <div className="p-1.5 bg-cad-dark rounded-3xl shadow-2xl">
                                    {profile?.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="Profile" className="w-36 h-36 rounded-2xl object-cover" />
                                    ) : (
                                        <div className="w-36 h-36 rounded-2xl bg-cad-surface flex items-center justify-center text-4xl font-bold text-cad-accent">
                                            {(firstName?.[0] ?? email?.[0] ?? '?').toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 pt-2 space-y-4 w-full">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="space-y-1 w-full">
                                        {isEditing ? (
                                            <div className="space-y-3 max-w-md">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="text" placeholder="First name" value={editFirstName} onChange={e => setEditFirstName(e.target.value)}
                                                        className="bg-cad-surface/50 border border-cad-border rounded-xl px-4 py-2 text-lg font-bold text-cad-text focus:border-cad-accent outline-none" />
                                                    <input type="text" placeholder="Last name" value={editLastName} onChange={e => setEditLastName(e.target.value)}
                                                        className="bg-cad-surface/50 border border-cad-border rounded-xl px-4 py-2 text-lg font-bold text-cad-text focus:border-cad-accent outline-none" />
                                                </div>
                                                {userRole === 'DESIGNER' && (
                                                    <input type="text" placeholder="Headline (e.g. Senior Mechanical Engineer)" value={editHeadline} onChange={e => setEditHeadline(e.target.value)}
                                                        className="w-full bg-cad-surface/50 border border-cad-border rounded-xl px-4 py-2 text-sm text-cad-text focus:border-cad-accent outline-none" />
                                                )}
                                                <input type="text" placeholder="Location (e.g. Cape Town, ZA)" value={editLocation} onChange={e => setEditLocation(e.target.value)}
                                                    className="w-full bg-cad-surface/50 border border-cad-border rounded-xl px-4 py-2 text-sm text-cad-text focus:border-cad-accent outline-none" />
                                            </div>
                                        ) : (
                                            <>
                                                <h1 className="text-4xl font-bold text-cad-text tracking-tight">{displayName}</h1>
                                                {displayHeadline && (
                                                    <p className="text-xl text-cad-muted flex items-center gap-2 font-medium">
                                                        <Briefcase className="w-5 h-5 text-cad-accent" /> {displayHeadline}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {userRole === 'DESIGNER' && (
                                            <div className="bg-cad-surface/30 px-5 py-3 rounded-2xl border border-cad-border backdrop-blur-sm">
                                                <p className="text-[10px] text-cad-muted uppercase tracking-wider font-bold mb-1">Hourly Rate</p>
                                                {isEditing ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-cad-success font-bold">{symbol}</span>
                                                        <input type="number" value={editRate} onChange={e => setEditRate(e.target.value)}
                                                            className="w-20 bg-cad-surface/50 border border-cad-border rounded px-2 py-0.5 text-cad-success font-bold focus:border-cad-accent outline-none" />
                                                    </div>
                                                ) : (
                                                    <p className="text-2xl font-bold text-cad-success">
                                                        {displayRate != null ? `${format(displayRate)}/hr` : '—'}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {userRole === 'DESIGNER' && (
                                            <div className="bg-cad-surface/30 px-5 py-3 rounded-2xl border border-cad-border backdrop-blur-sm">
                                                <p className="text-[10px] text-cad-muted uppercase tracking-wider font-bold mb-1">Rating</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                                    <span className="text-2xl font-bold text-cad-text">
                                                        {displayRating != null ? displayRating.toFixed(1) : '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-6 pt-2 text-sm text-slate-400 font-medium">
                                    {displayLocation && (
                                        <span className="flex items-center gap-2 bg-cad-surface/30 px-3 py-1.5 rounded-lg border border-cad-border">
                                            <MapPin className="w-4 h-4 text-cad-accent"/> {displayLocation}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-2 bg-cad-surface/30 px-3 py-1.5 rounded-lg border border-cad-border">
                                        <Mail className="w-4 h-4 text-cad-accent"/> {email}
                                    </span>
                                    {profile?.website && (
                                        <span className="flex items-center gap-2 bg-cad-surface/30 px-3 py-1.5 rounded-lg border border-cad-border hover:text-cad-text cursor-pointer transition-colors">
                                            <LinkIcon className="w-4 h-4 text-cad-accent"/> {profile.website}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile completeness — designer only */}
                {userRole === 'DESIGNER' && (() => {
                    const { score, items } = liveCompleteness;
                    const displayScore = isEditing ? score : savedScore;
                    const missing = items.filter(i => !i.done);
                    const barColor = displayScore === 100 ? 'bg-green-500' : displayScore >= 70 ? 'bg-cad-accent' : displayScore >= 40 ? 'bg-amber-500' : 'bg-red-500';
                    const message = displayScore === 100
                        ? 'Your profile is complete — you\'re fully visible to clients.'
                        : displayScore >= 70
                        ? 'Almost there! A complete profile gets 5× more responses.'
                        : displayScore >= 40
                        ? 'Add a few more details to stand out in the talent directory.'
                        : 'Complete your profile to start receiving job invitations.';
                    return (
                        <div className={`glass-panel rounded-2xl border p-5 ${displayScore === 100 ? 'border-green-500/30 bg-green-500/5' : 'border-cad-border'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {displayScore === 100
                                        ? <CheckCircle2 className="w-5 h-5 text-green-400"/>
                                        : <AlertCircle className="w-5 h-5 text-amber-400"/>}
                                    <h3 className="font-bold text-cad-text text-sm">Profile Completeness</h3>
                                </div>
                                <span className={`text-2xl font-bold ${displayScore === 100 ? 'text-green-400' : displayScore >= 70 ? 'text-cad-accent' : 'text-amber-400'}`}>
                                    {displayScore}%
                                </span>
                            </div>
                            <div className="h-2 bg-cad-surface rounded-full overflow-hidden mb-3">
                                <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${displayScore}%` }}/>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">{message}</p>
                            {missing.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {missing.map(item => (
                                        <span key={item.label} onClick={() => !isEditing && handleStartEdit()}
                                            className="flex items-center gap-1.5 px-2.5 py-1 bg-cad-surface border border-cad-border rounded-lg text-xs text-slate-400 hover:text-cad-text hover:border-cad-accent/40 cursor-pointer transition-all">
                                            <X className="w-3 h-3 text-red-400/70"/> {item.label}
                                            <span className="text-slate-600">+{item.points}%</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })()}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Track Record — designer only */}
                        {userRole === 'DESIGNER' && (
                            <div className="glass-panel p-6 rounded-2xl border border-cad-border">
                                <h3 className="font-bold text-cad-text mb-6 text-lg">Track Record</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Jobs Completed', value: stats?.jobsCompleted, icon: <CheckCircle2 className="w-5 h-5"/>, color: 'blue' },
                                        { label: 'Active Contracts', value: stats?.activeContracts, icon: <Briefcase className="w-5 h-5"/>, color: 'green' },
                                        { label: 'Total Applications', value: stats?.totalApplications, icon: <Clock className="w-5 h-5"/>, color: 'purple' },
                                        { label: 'Member Since', value: stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }) : null, icon: <Award className="w-5 h-5"/>, color: 'amber' },
                                    ].map(({ label, value, icon, color }) => (
                                        <div key={label} className="flex items-center gap-4 p-4 bg-cad-surface/30 rounded-xl border border-cad-border">
                                            <div className={`p-2.5 bg-${color}-500/10 rounded-xl text-${color}-400 border border-${color}-500/10`}>{icon}</div>
                                            <div>
                                                <p className="text-xs text-cad-muted font-bold uppercase tracking-wider">{label}</p>
                                                <p className="font-bold text-cad-text text-lg">{value ?? '—'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        <div className="glass-panel p-6 rounded-2xl border border-cad-border">
                            <h3 className="font-bold text-cad-text text-lg mb-4">Software Skills</h3>

                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {editSkills.map(skill => (
                                            <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-cad-accent/10 border border-cad-accent/30 rounded-lg text-sm text-sky-200 font-medium">
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className="text-slate-500 hover:text-red-400 transition-colors"><X className="w-3 h-3"/></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SKILL_SUGGESTIONS.filter(s => !editSkills.includes(s)).map(s => (
                                            <button key={s} onClick={() => addSkill(s)}
                                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cad-surface text-slate-400 border border-cad-border hover:border-cad-accent/50 hover:text-cad-text transition-all">
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
                                            placeholder="Type to add custom skill…"
                                            className="flex-1 bg-cad-surface border border-cad-border rounded-lg px-3 py-1.5 text-sm text-cad-text focus:border-cad-accent outline-none" />
                                        <button onClick={() => addSkill(newSkill)} className="px-3 py-1.5 bg-cad-accent text-cad-dark rounded-lg text-sm font-bold hover:bg-sky-400">Add</button>
                                    </div>
                                </div>
                            ) : displaySkills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {displaySkills.map(skill => (
                                        <span key={skill} className="px-3.5 py-1.5 bg-cad-surface/30 border border-cad-border rounded-lg text-sm text-sky-200 font-medium hover:bg-cad-surface/50 transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">No skills added yet. Click Edit Profile to add your software skills.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bio */}
                        <div className="glass-panel p-8 rounded-2xl border border-cad-border">
                            <h3 className="font-bold text-cad-text mb-4 text-lg">About Me</h3>
                            {isEditing ? (
                                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={6} placeholder="Tell clients about your background, experience, and what makes you stand out…"
                                    className="w-full bg-cad-surface/50 border border-cad-border rounded-xl p-4 text-slate-300 focus:border-cad-accent outline-none leading-relaxed text-base" />
                            ) : displayBio ? (
                                <p className="text-slate-300 leading-relaxed text-lg">{displayBio}</p>
                            ) : (
                                <p className="text-slate-500">No bio yet. Click Edit Profile to add one.</p>
                            )}
                        </div>

                        {/* Portfolio placeholder */}
                        <div className="glass-panel p-8 rounded-2xl border border-cad-border">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-cad-text text-lg">My Portfolio</h3>
                            </div>
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500 border-2 border-dashed border-cad-border rounded-xl">
                                <Upload className="w-8 h-8 mb-3 opacity-40"/>
                                <p className="font-medium">Portfolio uploads coming soon</p>
                                <p className="text-xs mt-1 text-slate-600">You'll be able to attach project files, images, and case studies.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
