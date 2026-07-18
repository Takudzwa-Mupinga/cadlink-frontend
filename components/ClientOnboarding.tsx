import React, { useState } from 'react';
import { ArrowRight, Loader2, Building2, MapPin, Globe, Users, Briefcase } from 'lucide-react';
import { updateClientProfile } from '../services/api';

const COMPANY_SIZES = ['1–10', '11–50', '51–200', '200+'];
const INDUSTRIES = [
  'Architecture', 'Civil Engineering', 'Mechanical Engineering',
  'Construction', 'Real Estate', 'Manufacturing', 'Interior Design', 'Other',
];

const TOTAL_STEPS = 3;

interface Props {
  onComplete: () => void;
}

const ClientOnboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Basic
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');

  // Step 2 — About
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [typicalHire, setTypicalHire] = useState('');

  // Step 3 — Website
  const [website, setWebsite] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleFinish = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await updateClientProfile({
        companyName: companyName || undefined,
        location: location || undefined,
        industry: industry || undefined,
        companySize: companySize || undefined,
        typicalHire: typicalHire || undefined,
        website: website || undefined,
        photoUrl: photoUrl || undefined,
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
        <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">
          Step {step} of {TOTAL_STEPS}
        </p>

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
                <h2 className="text-2xl font-bold mb-1">Tell us about your company</h2>
                <p className="text-slate-400 text-sm">Designers will see this when reviewing your job posts.</p>
              </div>

              <div className="relative group">
                <Building2 className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Company name (or your name for solo)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Location (e.g. Johannesburg, ZA)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                />
              </div>

              <button
                onClick={next}
                disabled={!companyName.trim()}
                className="w-full bg-cad-accent hover:bg-sky-400 text-cad-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ── Step 2: About ───────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">About your hiring needs</h2>
                <p className="text-slate-400 text-sm">Help us match you with the right designers.</p>
              </div>

              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Industry</p>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setIndustry(ind)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        industry === ind
                          ? 'bg-cad-accent/20 border-cad-accent text-cad-accent'
                          : 'bg-cad-surface/30 border-cad-border text-slate-400 hover:border-white/30'
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Company size</p>
                <div className="grid grid-cols-4 gap-2">
                  {COMPANY_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setCompanySize(size)}
                      className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                        companySize === size
                          ? 'bg-cad-accent/20 border-cad-accent text-cad-accent'
                          : 'bg-cad-surface/30 border-cad-border text-slate-400 hover:border-white/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <Briefcase className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Typical hire (e.g. Revit drafter for residential)"
                  value={typicalHire}
                  onChange={(e) => setTypicalHire(e.target.value)}
                  className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
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

          {/* ── Step 3: Website ─────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Online presence</h2>
                <p className="text-slate-400 text-sm">Optional — helps designers trust your listing.</p>
              </div>

              <div className="space-y-3">
                <div className="relative group">
                  <Users className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                  <input
                    type="url"
                    placeholder="Company logo / photo URL"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                  />
                </div>
                <div className="relative group">
                  <Globe className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                  <input
                    type="url"
                    placeholder="Company website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
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

export default ClientOnboarding;
