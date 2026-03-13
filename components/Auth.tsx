import React, { useState } from 'react';
import { Box, Mail, Lock, ArrowRight, Github, Chrome, CheckCircle2, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="h-[100dvh] w-full flex bg-[#0B1121] text-white overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      {/* Left Side - Visuals (Hidden on mobile) */}
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

              <div className="flex gap-4 pt-4">
                  <div className="glass-panel px-5 py-3 rounded-xl flex items-center gap-3 border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-bold">12k+ Engineers Online</span>
                  </div>
                  <div className="glass-panel px-5 py-3 rounded-xl flex items-center gap-3 border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-cad-accent animate-pulse"></div>
                      <span className="text-sm font-bold">500+ Active Jobs</span>
                  </div>
              </div>
           </div>

           {/* decorative grid */}
           <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none -z-10 mask-gradient"></div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md glass-panel p-8 md:p-12 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Top Glow */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cad-accent via-purple-500 to-cad-accent opacity-50"></div>

            <div className="mb-10 text-center">
                <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-cad-accent to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
                    <Box className="w-8 h-8 text-white fill-white/20" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-slate-400">
                    {isLogin ? 'Enter your credentials to access your workspace.' : 'Join the world\'s largest CAD network.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-cad-accent transition-colors" />
                        <input 
                            type="email" 
                            placeholder="Email address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
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
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cad-accent transition-all placeholder-slate-500 font-medium"
                            required
                        />
                    </div>
                </div>

                {isLogin && (
                    <div className="flex justify-end">
                        <button type="button" className="text-sm font-bold text-cad-accent hover:text-white transition-colors">Forgot Password?</button>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-cad-accent hover:bg-sky-400 text-cad-dark font-bold py-4 rounded-xl shadow-lg shadow-cad-accent/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')} 
                    {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
            </form>

            <div className="my-8 flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Or continue with</span>
                <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm font-bold transition-colors">
                    <Chrome className="w-5 h-5" /> Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm font-bold transition-colors">
                    <Github className="w-5 h-5" /> GitHub
                </button>
            </div>

            <div className="mt-8 text-center">
                <p className="text-slate-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-white font-bold hover:underline">
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