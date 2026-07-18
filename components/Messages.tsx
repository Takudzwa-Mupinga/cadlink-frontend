
import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, Video, MoreVertical, Paperclip, Send, Check, CheckCheck, Circle, Plus, FileText, Calendar, DollarSign } from 'lucide-react';
import { MOCK_CONVERSATIONS } from '../constants';
import { Conversation, DirectMessage } from '../types';

interface MessagesProps {
    initialUserId?: string | null;
    onClearInitialUser?: () => void;
    onStartCall?: () => void;
}

const Messages: React.FC<MessagesProps> = ({ initialUserId, onClearInitialUser, onStartCall }) => {
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize with specific user if passed via props
    useEffect(() => {
        if (initialUserId) {
            const existing = conversations.find(c => c.userId === initialUserId);
            if (existing) {
                setActiveConvId(existing.id);
            } else {
                // In a real app, fetch user details and create temp conversation
                // For now, default to first one
                setActiveConvId(conversations[0].id);
            }
            if (onClearInitialUser) onClearInitialUser();
        } else if (!activeConvId && conversations.length > 0) {
            setActiveConvId(conversations[0].id);
        }
    }, [initialUserId, onClearInitialUser]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConvId, conversations]);

    const activeConversation = conversations.find(c => c.id === activeConvId);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeConvId) return;

        const newMessage: DirectMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'me',
            timestamp: 'Just now',
            isRead: false
        };

        setConversations(prev => prev.map(c => {
            if (c.id === activeConvId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: inputText,
                    lastMessageTime: 'Just now'
                };
            }
            return c;
        }));
        setInputText('');

        // Simulate reply
        setTimeout(() => {
            setConversations(prev => prev.map(c => {
                if (c.id === activeConvId) {
                    return {
                        ...c,
                        messages: [...c.messages, {
                            id: (Date.now() + 1).toString(),
                            text: "Thanks for the update! I'll check it out.",
                            sender: 'them',
                            timestamp: 'Just now',
                            isRead: true
                        }]
                    };
                }
                return c;
            }));
        }, 3000);
    };

    const filteredConversations = conversations.filter(c => 
        c.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col md:flex-row bg-cad-dark overflow-hidden">
            {/* LEFT: Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-cad-border bg-cad-dark flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-cad-border">
                    <h2 className="text-2xl font-bold text-cad-text mb-4">Inbox</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-cad-surface/50 border border-cad-border rounded-xl pl-10 pr-4 py-2 text-sm text-cad-text focus:border-cad-accent outline-none font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredConversations.map(conv => (
                        <div 
                            key={conv.id}
                            onClick={() => setActiveConvId(conv.id)}
                            className={`p-4 flex items-start gap-3 cursor-pointer transition-colors border-b border-cad-border hover:bg-cad-surface/30 ${activeConvId === conv.id ? 'bg-cad-surface/30 border-l-2 border-l-cad-accent' : 'border-l-2 border-l-transparent'}`}
                        >
                            <div className="relative">
                                <img src={conv.userAvatar} alt={conv.userName} className="w-12 h-12 rounded-xl object-cover border border-cad-border" />
                                {conv.isOnline && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f1423]"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'font-bold text-cad-text' : 'font-medium text-slate-200'}`}>{conv.userName}</h4>
                                    <span className="text-[10px] text-slate-500">{conv.lastMessageTime}</span>
                                </div>
                                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-cad-text font-medium' : 'text-slate-500'}`}>{conv.lastMessage}</p>
                            </div>
                            {conv.unreadCount > 0 && (
                                <div className="w-5 h-5 bg-cad-accent text-cad-dark rounded-full flex items-center justify-center text-[10px] font-bold">
                                    {conv.unreadCount}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Chat Area */}
            {activeConversation ? (
                <div className={`flex-1 flex flex-col h-full bg-cad-dark ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="h-20 border-b border-cad-border flex items-center justify-between px-6 bg-cad-dark/50 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setActiveConvId(null)} className="md:hidden text-slate-400 hover:text-cad-text">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                            <div className="relative">
                                <img src={activeConversation.userAvatar} className="w-10 h-10 rounded-full border border-cad-border" />
                                {activeConversation.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B1121]"></div>}
                            </div>
                            <div>
                                <h3 className="font-bold text-cad-text text-base leading-tight">{activeConversation.userName}</h3>
                                <p className="text-xs text-cad-muted flex items-center gap-1.5">
                                    {activeConversation.userRole}
                                    {activeConversation.isOnline && <span className="text-green-500">• Online</span>}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-cad-accent/10 text-cad-accent rounded-lg text-xs font-bold hover:bg-cad-accent hover:text-cad-dark transition-all border border-cad-accent/20">
                                <DollarSign className="w-3.5 h-3.5" /> Create Offer
                            </button>
                            <button className="p-2.5 text-slate-400 hover:text-cad-text hover:bg-cad-surface/30 rounded-xl transition-colors">
                                <Phone className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={onStartCall}
                                className="p-2.5 text-slate-400 hover:text-cad-text hover:bg-cad-surface/30 rounded-xl transition-colors group"
                                title="Start Video Meeting"
                            >
                                <Video className="w-5 h-5 group-hover:text-cad-accent transition-colors" />
                            </button>
                            <button className="p-2.5 text-slate-400 hover:text-cad-text hover:bg-cad-surface/30 rounded-xl transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-cad-dark">
                        <div className="flex justify-center">
                            <span className="text-[10px] font-bold text-slate-500 bg-cad-surface/30 px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
                        </div>

                        {activeConversation.messages.map((msg, idx) => {
                            const isMe = msg.sender === 'me';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] md:max-w-[60%] flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                            isMe 
                                            ? 'bg-gradient-to-br from-cad-accent to-blue-600 text-white rounded-tr-none'
                                            : 'bg-cad-surface text-cad-text border border-cad-border rounded-tl-none'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        <div className="flex flex-col justify-end gap-1">
                                            <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{msg.timestamp}</span>
                                            {isMe && (
                                                <span className="text-cad-accent">
                                                    {msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-cad-dark border-t border-cad-border">
                        <form onSubmit={handleSendMessage} className="flex gap-4 items-end bg-cad-surface p-2 rounded-2xl border border-cad-border focus-within:border-cad-accent/50 transition-colors">
                            <button type="button" className="p-3 text-slate-400 hover:text-cad-text hover:bg-cad-surface/30 rounded-xl transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                            <textarea 
                                rows={1}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none text-cad-text placeholder-slate-500 focus:outline-none py-3 min-h-[48px] max-h-[120px] resize-none custom-scrollbar"
                            />
                            <div className="flex gap-1 pb-1">
                                <button type="button" className="p-2 text-slate-400 hover:text-cad-text hover:bg-cad-surface/30 rounded-lg transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button type="submit" disabled={!inputText.trim()} className="p-2 bg-cad-accent text-cad-dark rounded-xl hover:bg-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 hidden md:flex flex-col items-center justify-center text-slate-500 bg-cad-dark">
                    <div className="w-20 h-20 bg-cad-surface/30 rounded-full flex items-center justify-center mb-6 border border-cad-border">
                        <Search className="w-10 h-10 opacity-30" />
                    </div>
                    <p className="text-lg font-medium">Select a conversation to start chatting</p>
                </div>
            )}
        </div>
    );
};

export default Messages;
