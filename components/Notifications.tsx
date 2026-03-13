import React, { useState } from 'react';
import { Bell, Briefcase, MessageSquare, AlertCircle, Check, Filter, Calendar } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
    { id: '1', type: 'job_invite', title: 'New Job Invitation', message: 'Tesla Dynamics invited you to apply for "Chassis Design Lead".', time: '10 mins ago', read: false },
    { id: '2', type: 'message', title: 'New Message', message: 'Sarah Chen: "Can you send over the STEP files?"', time: '1 hour ago', read: false },
    { id: '3', type: 'system', title: 'System Alert', message: 'Scheduled maintenance: Tonight at 02:00 UTC.', time: '4 hours ago', read: true },
    { id: '4', type: 'deadline', title: 'Upcoming Deadline', message: 'Submission for "Villa Rendering" due in 24 hours.', time: '5 hours ago', read: true },
    { id: '5', type: 'payment', title: 'Payment Received', message: 'You received $850.00 from BuildTech Solutions.', time: '1 day ago', read: true },
];

const Notifications: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const filteredList = filter === 'all' ? notifications : notifications.filter(n => !n.read);

    const getIcon = (type: string) => {
        switch(type) {
            case 'job_invite': return <Briefcase className="w-5 h-5 text-blue-400" />;
            case 'message': return <MessageSquare className="w-5 h-5 text-green-400" />;
            case 'deadline': return <Calendar className="w-5 h-5 text-red-400" />;
            default: return <AlertCircle className="w-5 h-5 text-cad-accent" />;
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="w-8 h-8 text-cad-accent" /> Notifications
                    </h2>
                    <p className="text-cad-muted mt-1">Stay updated with your latest activity.</p>
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-cad-accent text-cad-dark shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'unread' ? 'bg-cad-accent text-cad-dark shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                 <button 
                    onClick={markAllAsRead}
                    className="text-sm font-bold text-cad-accent hover:text-white transition-colors flex items-center gap-1.5"
                >
                    <Check className="w-4 h-4" /> Mark all as read
                </button>
            </div>

            <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                {filteredList.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                             <Bell className="w-8 h-8 opacity-30" />
                        </div>
                        <p className="text-lg font-medium">No notifications found.</p>
                        <p className="text-sm">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredList.map(notif => (
                            <div 
                                key={notif.id} 
                                className={`p-6 flex items-start gap-5 hover:bg-white/5 transition-colors group relative ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                            >
                                {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cad-accent"></div>}
                                
                                <div className={`p-3.5 rounded-2xl border ${!notif.read ? 'bg-white/10 border-white/10' : 'bg-[#0B1121] border-white/5'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-base truncate pr-4 ${!notif.read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                                            {notif.title}
                                            {!notif.read && <span className="ml-2 w-2 h-2 inline-block rounded-full bg-cad-accent animate-pulse"></span>}
                                        </h4>
                                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{notif.time}</span>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed text-sm">{notif.message}</p>
                                    
                                    <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {notif.type === 'job_invite' && (
                                            <button className="text-xs bg-cad-accent text-cad-dark px-4 py-2 rounded-lg font-bold hover:bg-sky-400 transition-colors shadow-lg shadow-cad-accent/20">View Job</button>
                                        )}
                                        {notif.type === 'message' && (
                                            <button className="text-xs border border-white/10 bg-white/5 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/10 transition-colors">Reply</button>
                                        )}
                                        {!notif.read && (
                                            <button 
                                                onClick={() => markAsRead(notif.id)}
                                                className="text-xs text-slate-500 hover:text-white flex items-center gap-1.5 font-medium ml-auto"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Mark read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default Notifications;