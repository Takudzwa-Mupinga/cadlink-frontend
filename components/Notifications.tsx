import React, { useState, useEffect } from 'react';
import { Bell, Briefcase, MessageSquare, AlertCircle, Check, Star, Loader2 } from 'lucide-react';
import { ApiNotification, listNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

const TYPE_LABEL: Record<string, string> = {
    ORDER: 'Marketplace',
    MESSAGE: 'Message',
    REVIEW: 'Review',
    SYSTEM: 'Update',
};

function relativeTime(iso: string): string {
    const t = new Date(iso).getTime();
    if (isNaN(t)) return '';
    const s = Math.floor((Date.now() - t) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
}

const Notifications: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [notifications, setNotifications] = useState<ApiNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        listNotifications()
            .then(setNotifications)
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try { await markNotificationRead(id); } catch { /* optimistic; ignore */ }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try { await markAllNotificationsRead(); } catch { /* optimistic; ignore */ }
    };

    const filteredList = filter === 'all' ? notifications : notifications.filter(n => !n.read);

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER': return <Briefcase className="w-5 h-5 text-blue-400" />;
            case 'MESSAGE': return <MessageSquare className="w-5 h-5 text-green-400" />;
            case 'REVIEW': return <Star className="w-5 h-5 text-amber-400" />;
            default: return <AlertCircle className="w-5 h-5 text-cad-accent" />;
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-cad-text flex items-center gap-3">
                        <Bell className="w-8 h-8 text-cad-accent" /> Notifications
                    </h2>
                    <p className="text-cad-muted mt-1">Stay updated with your latest activity.</p>
                </div>
                <div className="flex gap-2 bg-cad-surface/30 p-1 rounded-xl border border-cad-border">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-cad-accent text-cad-dark shadow-lg' : 'text-slate-400 hover:text-cad-text hover:bg-cad-surface/30'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'unread' ? 'bg-cad-accent text-cad-dark shadow-lg' : 'text-slate-400 hover:text-cad-text hover:bg-cad-surface/30'}`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                 <button
                    onClick={markAllAsRead}
                    className="text-sm font-bold text-cad-accent hover:text-cad-text transition-colors flex items-center gap-1.5"
                >
                    <Check className="w-4 h-4" /> Mark all as read
                </button>
            </div>

            <div className="glass-panel rounded-3xl border border-cad-border overflow-hidden shadow-2xl">
                {isLoading ? (
                    <div className="p-16 text-center text-cad-muted flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" /> Loading notifications…
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-cad-surface/30 rounded-full flex items-center justify-center mb-4">
                             <Bell className="w-8 h-8 opacity-30" />
                        </div>
                        <p className="text-lg font-medium">No notifications {filter === 'unread' ? 'unread' : 'yet'}.</p>
                        <p className="text-sm">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredList.map(notif => (
                            <div
                                key={notif.id}
                                className={`p-6 flex items-start gap-5 hover:bg-cad-surface/30 transition-colors group relative ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                            >
                                {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cad-accent"></div>}

                                <div className={`p-3.5 rounded-2xl border ${!notif.read ? 'bg-cad-surface/50 border-cad-border' : 'bg-cad-dark border-cad-border'}`}>
                                    {getIcon(notif.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-xs uppercase tracking-wider ${!notif.read ? 'font-bold text-cad-accent' : 'font-medium text-slate-500'}`}>
                                            {TYPE_LABEL[notif.type] ?? 'Update'}
                                            {!notif.read && <span className="ml-2 w-2 h-2 inline-block rounded-full bg-cad-accent animate-pulse"></span>}
                                        </h4>
                                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{relativeTime(notif.createdAt)}</span>
                                    </div>
                                    <p className={`leading-relaxed text-sm ${!notif.read ? 'text-cad-text' : 'text-slate-400'}`}>{notif.content}</p>

                                    {!notif.read && (
                                        <div className="mt-3 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="text-xs text-slate-500 hover:text-cad-text flex items-center gap-1.5 font-medium"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Mark read
                                            </button>
                                        </div>
                                    )}
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
