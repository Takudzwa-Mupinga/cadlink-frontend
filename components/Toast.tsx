import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastProps {
  notifications: ToastNotification[];
  removeNotification: (id: string) => void;
}

const ToastContainer: React.FC<ToastProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {notifications.map((notif) => (
        <ToastItem key={notif.id} notification={notif} onRemove={removeNotification} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ notification: ToastNotification; onRemove: (id: string) => void }> = ({ notification, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = () => {
      switch (notification.type) {
        case 'success': return 'bg-green-500/10 border-green-500/20 shadow-green-900/20';
        case 'error': return 'bg-red-500/10 border-red-500/20 shadow-red-900/20';
        default: return 'bg-blue-500/10 border-blue-500/20 shadow-blue-900/20';
      }
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg animate-in slide-in-from-right-10 fade-in duration-300 min-w-[300px] ${getBgColor()}`}>
      {getIcon()}
      <p className="text-sm font-bold text-white flex-1">{notification.message}</p>
      <button onClick={() => onRemove(notification.id)} className="text-slate-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastContainer;