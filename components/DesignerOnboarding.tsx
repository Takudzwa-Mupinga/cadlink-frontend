import React, { useState } from 'react';
import {
  ArrowRight, Loader2, User, MapPin, FileText,
  Wrench, GraduationCap, Link2, DollarSign, Briefcase,
} from 'lucide-react';
import { updateProfile, updateDesignerProfile, EducationEntry } from '../services/api';
import { useCurrentUser } from '../contexts/UserContext';

const CAD_SKILLS = [
  'AutoCAD', 'Revit', 'SolidWorks', 'Fusion 360',
  'SketchUp', 'Blender', 'Rhino', 'Civil 3D',
  'Navisworks', 'BIM 360', 'ArchiCAD', '3ds Max',
];

const TOTAL_STEPS = 6;

interface Props {
  onComplete: () => void;
}

const DesignerOnboarding: React.FC<Props> = ({ onComplete }) => {
  const { firstName, lastName } = useCurrentUser();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Basic
  const [location, setLocation] = useState('');

  // Step 2 — Professional
  const [headline, setHeadline] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  // Step 3 — Bio
  const [bio, setBio] = useState('');

  // Step 4 — Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Step 5 — Education
  const [education, setEducation] = useState<EducationEntry[]>([
    { institution: '', qualification: '', yearCompleted: undefined },
  ]);

  // Step 6 — Links
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addEducation = () =>
    setEducation((prev) => [...prev, { institution: '', qualification: '', yearCompleted: undefined }]);

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    setEducation((prev) =>
      prev.map((e, i) =>
        i === index
          ? { ...e, [field]: field === 'yearCompleted' ? (value ? parseInt(value) : undefined) : value }
          : e
      )
    );
  };

  const removeEducation = (index: number) =>
    setEducation((prev) => prev.filter((_, i) => i !== index));

  const handleFinish = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Save base profile — displayName derives from firstName set at signup
      const derivedName = [firstName, lastName].filter(Boolean).join(' ') || undefined;
      await updateProfile({
        displayName: derivedName,
        bio,
        location,
        skills: selectedSkills,
      });

      // Save designer-specific fields
      const cleanedEducation = education.filter(
        (e) => e.institution?.trim() || e.qualification?.trim()
      );
      await updateDesignerProfile({
        headline,
        bio,
        location,
        linkedinUrl: linkedinUrl || undefined,
        cvUrl: cvUrl || undefined,
        photoUrl: photoUrl || undefined,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        education: cleanedEducation.length > 0 ? cleanedEducation : undefined,
      });

      onComplete();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-cad-dark text-cad-text relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg mx-auto px-6">
        {/* Step label */}
        <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">
          Step {step} of {TOTAL_STEPS}
        </p>

        {/* Progress bar */}
        <div className="flex gap-1.5 justify-center mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                i + 1 <= step ? 'bg-cad-accent' : 'bg-cad-surface/50'
              }`}
            />
          ))}
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-[32px] border border-cad-border shadow-2xl">

          {/* ── Step 1: Basic ───────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Welcome, {firstName || 'there'} 👋
                </h2>
                <p className="text-slate-400 text-sm">Let's build your designer profile so clients can find you.</p>
              </div>

              <div className="relative group">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Location (e.g. Cape Town, ZA)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                />
              </div>

              <button
                onClick={next}
                className="w-full bg-cad-accent hover:bg-sky-400 text-cad-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ── Step 2: Professional ────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Your expertise</h2>
                <p className="text-slate-400 text-sm">Help clients understand your experience level.</p>
              </div>

              <div className="relative group">
                <Briefcase className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Headline (e.g. BIM Specialist & Revit Expert)"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <Wrench className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                  <input
                    type="number"
                    min="0"
                    placeholder="Years exp."
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                  />
                </div>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                  <input
                    type="number"
                    min="0"
                    placeholder="Hourly rate ($)"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={back} className="flex-1 py-4 rounded-xl border border-cad-border text-slate-400 hover:border-white/30 font-bold transition-all">
                  Back
                </button>
                <button
                  onClick={next}
                  className="flex-1 bg-cad-accent hover:bg-sky-400 text-cad-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Bio ─────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Tell us about yourself</h2>
                <p className="text-slate-400 text-sm">A strong bio helps you win more jobs.</p>
              </div>

              <div className="relative group">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                <textarea
                  placeholder="e.g. BIM specialist with 5 years experience in Revit and AutoCAD, focused on residential and commercial projects."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={back} className="flex-1 py-4 rounded-xl border border-cad-border text-slate-400 hover:border-white/30 font-bold transition-all">
                  Back
                </button>
                <button
                  onClick={next}
                  className="flex-1 bg-cad-accent hover:bg-sky-400 text-cad-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Skills ──────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Select your skills</h2>
                <p className="text-slate-400 text-sm">Pick the CAD software you work with.</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Wrench className="w-4 h-4" />
                <span>{selectedSkills.length} selected</span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                {CAD_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      selectedSkills.includes(skill)
                        ? 'bg-cad-accent/20 border-cad-accent text-cad-accent'
                        : 'bg-cad-surface/30 border-cad-border text-slate-400 hover:border-white/30'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={back} className="flex-1 py-4 rounded-xl border border-cad-border text-slate-400 hover:border-white/30 font-bold transition-all">
                  Back
                </button>
                <button
                  onClick={next}
                  className="flex-1 bg-cad-accent hover:bg-sky-400 text-cad-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Education ───────────────────────────── */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Education</h2>
                <p className="text-slate-400 text-sm">Add your qualifications. You can add more later.</p>
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {education.map((entry, i) => (
                  <div key={i} className="space-y-2 p-4 bg-cad-surface/30 rounded-xl border border-cad-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Entry {i + 1}
                      </div>
                      {education.length > 1 && (
                        <button
                          onClick={() => removeEducation(i)}
                          className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Institution"
                      value={entry.institution ?? ''}
                      onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                      className="w-full bg-cad-surface/50 border border-cad-border rounded-xl px-4 py-3 text-cad-text text-sm focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="Qualification / Degree"
                      value={entry.qualification ?? ''}
                      onChange={(e) => updateEducation(i, 'qualification', e.target.value)}
                      className="w-full bg-cad-surface/50 border border-cad-border rounded-xl px-4 py-3 text-cad-text text-sm focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500"
                    />
                    <input
                      type="number"
                      placeholder="Year completed"
                      value={entry.yearCompleted ?? ''}
                      onChange={(e) => updateEducation(i, 'yearCompleted', e.target.value)}
                      className="w-full bg-cad-surface/50 border border-cad-border rounded-xl px-4 py-3 text-cad-text text-sm focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addEducation}
                className="w-full py-3 rounded-xl border border-dashed border-white/20 text-slate-400 hover:border-cad-accent hover:text-cad-accent text-sm font-bold transition-all"
              >
                + Add another qualification
              </button>

              <div className="flex gap-3">
                <button onClick={back} className="flex-1 py-4 rounded-xl border border-cad-border text-slate-400 hover:border-white/30 font-bold transition-all">
                  Back
                </button>
                <button
                  onClick={next}
                  className="flex-1 bg-cad-accent hover:bg-sky-400 text-cad-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 6: Links ───────────────────────────────── */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Links &amp; photo</h2>
                <p className="text-slate-400 text-sm">Add your portfolio links. All optional.</p>
              </div>

              <div className="space-y-3">
                <div className="relative group">
                  <User className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                  <input
                    type="url"
                    placeholder="Profile photo URL"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                  />
                </div>
                <div className="relative group">
                  <Link2 className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                  <input
                    type="url"
                    placeholder="LinkedIn URL"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                  />
                </div>
                <div className="relative group">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                  <input
                    type="url"
                    placeholder="CV / Resume URL (Cloudinary, Google Drive, etc.)"
                    value={cvUrl}
                    onChange={(e) => setCvUrl(e.target.value)}
                    className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 font-medium text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button onClick={back} className="flex-1 py-4 rounded-xl border border-cad-border text-slate-400 hover:border-white/30 font-bold transition-all">
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={isLoading}
                  className="flex-1 bg-cad-accent hover:bg-sky-400 text-cad-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finish Setup <ArrowRight className="w-5 h-5" /></>}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <button onClick={onComplete} className="hover:text-slate-300 transition-colors">
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
};

export default DesignerOnboarding;
