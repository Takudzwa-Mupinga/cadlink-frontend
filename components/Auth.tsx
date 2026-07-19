import React, { useState, useEffect } from 'react';
import { Box, Mail, Lock, ArrowRight, User, Loader2 } from 'lucide-react';
import { login, register } from '../services/api';

type Role = 'DESIGNER' | 'CLIENT';

interface AuthProps {
  onLogin: (role: string) => void;
  onRegisterDesigner: (role: string) => void;
  onRegisterClient: (role: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegisterDesigner, onRegisterClient }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('DESIGNER');
  const [error, setError] = useState<string | null>(null);

  // Deep link from the marketing site (designlynk.co.za):
  // ?signup=designer | ?signup=client opens the signup form with the role preselected.
  useEffect(() => {
    const signup = new URLSearchParams(window.location.search).get('signup');
    if (signup === null) return;
    setIsLogin(false);
    if (signup.toLowerCase() === 'client') setRole('CLIENT');
    else if (signup.toLowerCase() === 'designer') setRole('DESIGNER');
    // Clean the param so a refresh after logging in doesn't reopen signup.
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const res = await login(email, password);
        localStorage.setItem('token', res.token);
        localStorage.setItem('email', res.email);
        localStorage.setItem('role', res.role);
        onLogin(res.role);
      } else {
        await register(email, password, role, firstName.trim(), lastName.trim());
        // Auto-login after registration
        const res = await login(email, password);
        localStorage.setItem('token', res.token);
        localStorage.setItem('email', res.email);
        localStorage.setItem('role', res.role);
        if (role === 'DESIGNER') {
          onRegisterDesigner(res.role);
        } else if (role === 'CLIENT') {
          onRegisterClient(res.role);
        } else {
          onLogin(res.role);
        }
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex bg-cad-dark text-cad-text overflow-hidden relative">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-20 z-10">
        <div className="relative w-full max-w-lg">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-cad-accent/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 space-y-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cad-accent to-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.3)]">
              <Box className="w-10 h-10 text-white fill-white/20" />
            </div>
            <h1 className="text-6xl font-bold tracking-tight leading-tight">
              Build the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cad-accent to-purple-400">Future</span> of Engineering.
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-md">
              The ultimate ecosystem for CAD professionals. Connect, collaborate, and create with AI-powered tools.
            </p>
          </div>
          <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none -z-10 mask-gradient"></div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md glass-panel p-8 md:p-12 rounded-[40px] border border-cad-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cad-accent via-purple-500 to-cad-accent opacity-50"></div>

          <div className="mb-10 text-center">
            <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-cad-accent to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
              <Box className="w-8 h-8 text-white fill-white/20" />
            </div>
            <h2 className="text-3xl font-bold text-cad-text mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-slate-400">
              {isLogin ? 'Enter your credentials to access your workspace.' : 'Create your free account and start connecting with CAD work.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector — signup only */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                {(['DESIGNER', 'CLIENT'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${
                      role === r
                        ? 'bg-cad-accent/20 border-cad-accent text-cad-accent'
                        : 'bg-cad-surface/30 border-cad-border text-slate-400 hover:border-white/30'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    {r === 'DESIGNER' ? 'Designer' : 'Client'}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group">
                    <User className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <User className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                      required
                    />
                  </div>
                </div>
              )}
              <div className="relative group">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                  required
                />
              </div>
              {!isLogin && (
                <div className="relative group">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-cad-surface/50 border rounded-xl pl-12 pr-4 py-4 text-cad-text focus:outline-none transition-all placeholder-slate-500 font-medium ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-500/60 focus:border-red-500'
                        : confirmPassword && confirmPassword === password
                        ? 'border-green-500/60 focus:border-green-500'
                        : 'border-cad-border focus:border-cad-accent'
                    }`}
                    required
                  />
                  {confirmPassword && confirmPassword === password && (
                    <span className="absolute right-4 top-4 text-green-400 text-xs font-bold">✓</span>
                  )}
                </div>
              )}
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm font-bold text-cad-accent hover:text-cad-text transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 font-medium text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cad-accent hover:bg-sky-400 text-cad-dark font-bold py-4 rounded-xl shadow-lg shadow-cad-accent/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(null); setFirstName(''); setLastName(''); setConfirmPassword(''); }}
                className="text-cad-text font-bold hover:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
