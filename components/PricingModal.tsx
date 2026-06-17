
import React, { useState } from 'react';
import { Check, X, Zap, Crown, Building2, Star, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    if (!isOpen) return null;

    const plans = [
        {
            name: 'Starter',
            price: 'Free',
            period: 'Forever',
            description: 'Essential tools for casual designers.',
            features: [
                'Public Profile',
                '5 Job Bids / Month',
                '1 GB Cloud Storage',
                'Basic 3D Viewer',
                'Community Access'
            ],
            notIncluded: [
                'AI Design Assistant',
                'Unlimited Bids',
                '4K Texture Support',
                'Priority Support'
            ],
            cta: 'Current Plan',
            current: true,
            color: 'bg-slate-800'
        },
        {
            name: 'Pro Freelancer',
            price: 'R87',
            period: '/ month',
            description: 'Power tools for serious professionals.',
            features: [
                'Everything in Starter',
                'Unlimited Job Bids',
                '1 TB Cloud Storage',
                'AI DreamCanvas (500 gens)',
                'AutoCAD-style CLI & Tools',
                '0% Withdrawal Fees',
                'Verified Badge'
            ],
            notIncluded: [
                'Team Management',
                'API Access'
            ],
            cta: 'Upgrade to Pro',
            popular: true,
            color: 'bg-gradient-to-b from-cad-accent to-blue-600'
        },
        {
            name: 'Studio Team',
            price: 'R297',
            period: '/ month',
            description: 'Collaborative power for agencies.',
            features: [
                'Everything in Pro',
                '5 Team Seats Included',
                'Admin Dashboard',
                'Shared Cloud Drive',
                'SSO Authentication',
                'Priority 24/7 Support',
                'Custom Contracts'
            ],
            notIncluded: [],
            cta: 'Contact Sales',
            color: 'bg-slate-800'
        }
    ];

    const faqs = [
        {
            q: "Why is the Starter plan free?",
            a: "We operate on a 'Success-Based' model. We charge a 10% platform fee on payments processed through our Job Market. We only make money when you get hired and paid."
        },
        {
            q: "Can I cancel my Pro subscription anytime?",
            a: "Yes! There are no long-term contracts. You can cancel directly from your settings, and you will retain access until the end of your billing cycle."
        },
        {
            q: "What payment methods do you support?",
            a: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and direct bank transfers for Enterprise clients."
        },
        {
            q: "Is my CAD data secure?",
            a: "Absolutely. All files are encrypted at rest using AES-256 and transmitted via secure SSL/TLS channels. We are SOC2 compliant."
        }
    ];

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-6xl h-full max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#0B1121] rounded-3xl border border-white/10 shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors z-50"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-8 md:p-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cad-accent/10 text-cad-accent border border-cad-accent/20 text-xs font-bold uppercase tracking-wider mb-6">
                        <Zap className="w-3 h-3" /> Upgrade your Workflow
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Simple pricing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cad-accent to-purple-400">Engineers</span>.</h2>
                    <p className="text-xl text-cad-muted max-w-2xl mx-auto mb-16">
                        Unlock the full potential of CADLink. From AI generation to unlimited storage, choose the plan that fits your career.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
                        {plans.map((plan) => (
                            <div 
                                key={plan.name} 
                                className={`relative rounded-3xl p-1 ${plan.popular ? 'ring-2 ring-cad-accent shadow-[0_0_40px_rgba(56,189,248,0.2)]' : 'border border-white/5'}`}
                            >
                                <div className={`h-full bg-[#121214] rounded-[22px] overflow-hidden flex flex-col relative ${plan.popular ? '' : ''}`}>
                                    {plan.popular && (
                                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cad-accent to-purple-500"></div>
                                    )}
                                    {plan.popular && (
                                        <div className="absolute top-4 right-4 bg-cad-accent text-cad-dark text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" /> Most Popular
                                        </div>
                                    )}

                                    <div className="p-8 text-left">
                                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-4xl font-bold text-white tracking-tight">{plan.price}</span>
                                            <span className="text-slate-500 font-medium">{plan.period}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 h-10">{plan.description}</p>
                                    </div>

                                    <div className="px-8 pb-8 flex-1 flex flex-col text-left">
                                        <div className="space-y-4 mb-8 flex-1">
                                            {plan.features.map((feature) => (
                                                <div key={feature} className="flex items-start gap-3">
                                                    <div className={`p-0.5 rounded-full ${plan.popular ? 'bg-cad-accent/20 text-cad-accent' : 'bg-white/10 text-slate-300'}`}>
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-sm text-slate-200 font-medium">{feature}</span>
                                                </div>
                                            ))}
                                            {plan.notIncluded.map((feature) => (
                                                <div key={feature} className="flex items-start gap-3 opacity-40">
                                                    <div className="p-0.5 rounded-full bg-slate-800 text-slate-500">
                                                        <X className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-sm text-slate-500 font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button 
                                            className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${
                                                plan.popular 
                                                ? 'bg-cad-accent text-cad-dark hover:bg-sky-400 shadow-lg shadow-cad-accent/20' 
                                                : plan.current 
                                                ? 'bg-white/5 text-slate-400 cursor-default'
                                                : 'bg-white text-black hover:bg-slate-200'
                                            }`}
                                        >
                                            {plan.cta}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="max-w-3xl mx-auto text-left border-t border-white/5 pt-16">
                        <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
                            <HelpCircle className="w-6 h-6 text-cad-muted" /> Frequently Asked Questions
                        </h3>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div 
                                    key={idx} 
                                    className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 transition-all"
                                >
                                    <button 
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                                    >
                                        <span className="font-bold text-white text-sm md:text-base">{faq.q}</span>
                                        {openFaq === idx ? <ChevronUp className="w-5 h-5 text-cad-accent" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                                    </button>
                                    {openFaq === idx && (
                                        <div className="px-6 pb-6 pt-0 text-slate-400 text-sm leading-relaxed animate-in slide-in-from-top-2">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-8 text-slate-500 text-sm">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" /> Enterprise Plans available
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5" /> Cancel anytime
                        </div>
                        <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5" /> 14-day free trial on Pro
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingModal;
