

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users, Plus, Check, X, ExternalLink, Video } from 'lucide-react';
import { MOCK_EVENTS } from '../constants';
import { CalendarEvent } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    
    // Get days in month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    const getEventsForDay = (day: number) => {
        return MOCK_EVENTS.filter(e => e.day === day);
    };

    const getTypeColor = (type: string) => {
        switch(type) {
            case 'Meeting': return 'bg-blue-500';
            case 'Deadline': return 'bg-red-500';
            case 'Site': return 'bg-green-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="h-full overflow-hidden flex flex-col p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-cad-accent" /> Schedule
                    </h2>
                    <p className="text-cad-muted mt-1">Manage deadlines, meetings, and project milestones.</p>
                </div>
                <button className="bg-cad-accent text-cad-dark px-6 py-2.5 rounded-xl font-bold hover:bg-sky-400 transition-all flex items-center gap-2 shadow-lg shadow-cad-accent/20 active:scale-95">
                    <Plus className="w-5 h-5" /> New Event
                </button>
            </div>

            <div className="flex-1 glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col lg:flex-row shadow-2xl relative">
                {/* Calendar Grid (Main) */}
                <div className="flex-1 p-8 border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-bold text-white tracking-tight">
                            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-4 mb-4">
                        {DAYS.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-cad-muted uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-4 flex-1 auto-rows-fr">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="p-2"></div>
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const events = getEventsForDay(day);
                            const isSelected = selectedDate === day;
                            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

                            return (
                                <div 
                                    key={day} 
                                    onClick={() => setSelectedDate(day)}
                                    className={`min-h-[100px] rounded-2xl border p-3 cursor-pointer transition-all flex flex-col gap-1.5 ${
                                        isSelected 
                                        ? 'bg-cad-accent/10 border-cad-accent/50 shadow-glow' 
                                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                                            isToday ? 'bg-cad-accent text-cad-dark shadow-lg shadow-cad-accent/30' : 'text-slate-400'
                                        }`}>
                                            {day}
                                        </span>
                                        {events.length > 0 && <span className="w-2 h-2 bg-cad-accent rounded-full lg:hidden animate-pulse"></span>}
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-end gap-1.5">
                                        {events.map((ev, idx) => (
                                            <div key={idx} className={`hidden lg:block text-[10px] px-2 py-1 rounded-md truncate text-white font-bold ${getTypeColor(ev.type)} shadow-sm`}>
                                                {ev.time} {ev.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Day Detail Sidebar */}
                <div className="w-full lg:w-[400px] bg-black/20 backdrop-blur-md p-8 overflow-y-auto custom-scrollbar border-l border-white/5">
                    <h3 className="text-xl font-bold text-white mb-8">
                        {selectedDate ? `${selectedDate} ${currentDate.toLocaleDateString('default', { month: 'long' })}` : 'Select a date'}
                    </h3>

                    {selectedDate ? (
                        <div className="space-y-4">
                            {getEventsForDay(selectedDate).length > 0 ? (
                                getEventsForDay(selectedDate).map(event => (
                                    <div 
                                        key={event.id} 
                                        onClick={() => setSelectedEvent(event)}
                                        className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-cad-accent/30 transition-all group hover:bg-white/10 shadow-lg cursor-pointer hover:-translate-y-1"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg text-white ${getTypeColor(event.type)} shadow-sm`}>
                                                {event.type}
                                            </span>
                                            <div className="text-slate-500 group-hover:text-cad-accent transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-white text-lg mb-4 leading-tight">{event.title}</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <Clock className="w-4 h-4 text-cad-muted" /> 
                                                <span className="font-medium">{event.time} ({event.duration})</span>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                                    <MapPin className="w-4 h-4 text-cad-muted" /> 
                                                    <span className="font-medium">{event.location}</span>
                                                </div>
                                            )}
                                            {event.attendees && (
                                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                                    <Users className="w-4 h-4 text-cad-muted" /> 
                                                    <span className="font-medium">with {event.attendees.length} people</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 text-slate-500">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                        <CalendarIcon className="w-8 h-8 opacity-30" />
                                    </div>
                                    <p className="text-lg font-medium mb-1">No events scheduled</p>
                                    <p className="text-sm">Enjoy your free time!</p>
                                    <button className="mt-6 text-cad-accent hover:text-white transition-colors text-sm font-bold uppercase tracking-wider border-b border-cad-accent/30 hover:border-white pb-0.5">Add Event</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-500">
                            Select a date on the calendar to view details.
                        </div>
                    )}
                </div>

                {/* Event Detail Modal */}
                {selectedEvent && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-6 border-b border-white/5 flex justify-between items-start bg-gradient-to-r from-slate-900 via-slate-900 to-[#1e293b]">
                                <div>
                                    <span className={`inline-block mb-3 px-3 py-1 rounded-lg text-xs font-bold text-white uppercase tracking-wider ${getTypeColor(selectedEvent.type)}`}>
                                        {selectedEvent.type}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white leading-tight">{selectedEvent.title}</h3>
                                </div>
                                <button 
                                    onClick={() => setSelectedEvent(null)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                                            <Clock className="w-3.5 h-3.5" /> Time
                                        </div>
                                        <p className="text-white font-bold">{selectedEvent.time}</p>
                                        <p className="text-slate-500 text-sm">{selectedEvent.duration}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                                            <CalendarIcon className="w-3.5 h-3.5" /> Date
                                        </div>
                                        <p className="text-white font-bold">{selectedEvent.day} {currentDate.toLocaleDateString('default', { month: 'short' })}</p>
                                        <p className="text-slate-500 text-sm">{currentDate.getFullYear()}</p>
                                    </div>
                                </div>

                                {selectedEvent.description && (
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-300 mb-2">Description</h4>
                                        <p className="text-slate-400 leading-relaxed text-sm">{selectedEvent.description}</p>
                                    </div>
                                )}

                                {selectedEvent.location && (
                                    <div className="flex items-start gap-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                        <MapPin className="w-5 h-5 text-cad-accent shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Location</h4>
                                            <p className="text-slate-400 text-sm">{selectedEvent.location}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Attendees
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedEvent.attendees.map(uid => (
                                                <div key={uid} className="flex items-center gap-2 bg-white/5 pr-3 rounded-full border border-white/5">
                                                    <img 
                                                        src={`https://picsum.photos/200/200?random=${uid}`} 
                                                        className="w-8 h-8 rounded-full border border-white/10" 
                                                        alt="Attendee"
                                                    />
                                                    <span className="text-xs font-bold text-slate-300">User {uid}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                                    {selectedEvent.meetingLink && (
                                        <button className="flex-1 bg-cad-accent text-cad-dark py-3 rounded-xl font-bold hover:bg-sky-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cad-accent/20">
                                            <Video className="w-4 h-4" /> Join Meeting
                                        </button>
                                    )}
                                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors border border-white/10">
                                        Reschedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;