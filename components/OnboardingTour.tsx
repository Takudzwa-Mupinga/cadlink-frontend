
import React, { useState } from 'react';
import { X, ChevronRight, Briefcase, Video, Wallet, Command, CheckCircle2, Box } from 'lucide-react';

interface OnboardingTourProps {
    isOpen: boolean;
    onClose: () => void;
}

const TOUR_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to CADLink',
        description: 'The ultimate ecosystem for CAD professionals. Connect, collaborate, and manage your engineering career in one powerful workspace.',
        icon: <Box className="w-16 h-16 text-cad-accent" />,
        color: 'from-cad-accent/20 to-blue-600/20'
    },
    {
        id: 'market',
        title: 'Find Premium Work',
        description: 'Navigate to the Job Market to bid on high-value contracts or list your specialized CAD services. Use AI to write winning proposals instantly.',
        icon: <Briefcase className="w-12 h-12 text-blue-400" />,
        color: 'from-blue-500/20 to-indigo-500/20'
    },
    {
        id: 'studio',
        title: 'The Studio Workspace',
        description: 'Collaborate in real-time. The Studio features a 3D viewport, whiteboard, and secure video conferencing for seamless design reviews.',
        icon: <Video className="w-12 h-12 text-purple-400" />,
        color: 'from-purple-500/20 to-pink-500/20'
    },
    {
        id: 'finance',
        title: 'Manage Earnings',
        description: 'Track your income, manage project milestones, and automate client invoices directly from the Finance dashboard.',
        icon: <Wallet className="w-12 h-12 text-green-400" />,
        color: 'from-green-500/20 to-emerald-500/20'
    },
    {
        id: 'power',
        title: 'Power User Tips',
        description: 'Press Cmd+K (or Ctrl+K) anytime to open the Command Palette. Use the built-in AI to answer technical questions or generate assets.',
        icon: <Command className="w-12 h-12 text-amber-400" />,
        color: 'from-amber-500/20 to-orange-500/20'
    }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const step = TOUR_STEPS[currentStep];
    const isLastStep = currentStep === TOUR_STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg relative">
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-[40px] blur-3xl transition-all duration-700`}></div>
                
                <div className="relative bg-cad-dark border border-cad-border rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[450px] animate-in slide-in-from-bottom-8 duration-500">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-500 hover:text-cad-text transition-colors z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 relative z-10">
                        <div className="mb-8 p-6 bg-cad-surface/30 rounded-3xl border border-cad-border shadow-lg relative group">
                            <div className="absolute inset-0 bg-cad-surface/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                            <div className="relative z-10 transition-transform duration-500 transform group-hover:scale-110">
                                {step.icon}
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-bold text-cad-text mb-4 tracking-tight">{step.title}</h2>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                            {step.description}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-cad-border flex justify-between items-center bg-cad-surface/30">
                        <div className="flex gap-2">
                            {TOUR_STEPS.map((_, idx) => (
                                <div 
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        idx === currentStep ? 'w-8 bg-cad-accent' : 'w-2 bg-cad-surface/50'
                                    }`}
                                />
                            ))}
                        </div>

                        <button 
                            onClick={handleNext}
                            className="bg-white text-black hover:bg-slate-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 group"
                        >
                            {isLastStep ? 'Get Started' : 'Next'}
                            {isLastStep ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
