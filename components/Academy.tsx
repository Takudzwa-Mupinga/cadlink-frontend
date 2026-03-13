

import React, { useState, useRef, useEffect } from 'react';
import { PlayCircle, Clock, BarChart, Sparkles, ChevronLeft, Search, CheckCircle2, Circle, GraduationCap, MessageSquare, Bot, Send, BrainCircuit, Play, Pause, SkipForward, Maximize, Award, ChevronRight, Loader2, FileText, Download, BookOpen, Plus, Crown, Star, StickyNote } from 'lucide-react';
import { MOCK_COURSES } from '../constants';
import { Course, QuizQuestion, ChatMessage, Note } from '../types';
import { generateCourseOutline, generateCourseQuiz, askCourseTutor } from '../services/geminiService';

const Academy: React.FC = () => {
  // Main View State
  const [viewMode, setViewMode] = useState<'browse' | 'player'>('browse');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // AI Generator State
  const [generatedOutline, setGeneratedOutline] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [loadingGen, setLoadingGen] = useState(false);

  // Browse State
  const [searchTerm, setSearchTerm] = useState('');

  // Player State
  const [activeTab, setActiveTab] = useState<'curriculum' | 'tutor' | 'quiz' | 'resources' | 'notes'>('curriculum');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Tutor Chat State
  const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorTyping, setTutorTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState('');

  // Generate Syllabus Handler
  const handleGenerate = async () => {
    if(!topic) return;
    setLoadingGen(true);
    const result = await generateCourseOutline(topic);
    setGeneratedOutline(result);
    setLoadingGen(false);
  };

  // Open Course Player
  const openCourse = (course: Course) => {
      setSelectedCourse(course);
      setActiveModuleId(course.modules[0].id);
      setViewMode('player');
      // Reset states
      setTutorMessages([{id: 'init', sender: 'ai', text: `Hi! I'm your AI Tutor for ${course.title}. Ask me anything about the lessons!`, timestamp: new Date()}]);
      setQuizQuestions([]);
      setQuizSubmitted(false);
      setUserAnswers([]);
      setNotes([]);
      setShowCertificate(false);
  };

  // AI Tutor Handler
  const handleTutorSend = async () => {
      if (!tutorInput.trim() || !selectedCourse) return;
      
      const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'me', text: tutorInput, timestamp: new Date() };
      setTutorMessages(prev => [...prev, userMsg]);
      setTutorInput('');
      setTutorTyping(true);

      const response = await askCourseTutor(userMsg.text, selectedCourse.title);
      
      setTutorMessages(prev => [...prev, { id: (Date.now()+1).toString(), sender: 'ai', text: response, timestamp: new Date() }]);
      setTutorTyping(false);
  };

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorMessages, activeTab]);

  // Quiz Handler
  const handleGenerateQuiz = async () => {
      if (!selectedCourse) return;
      setLoadingQuiz(true);
      const questions = await generateCourseQuiz(selectedCourse.title, selectedCourse.description);
      setQuizQuestions(questions);
      setUserAnswers(new Array(questions.length).fill(-1));
      setLoadingQuiz(false);
      setQuizSubmitted(false);
  };

  const handleQuizSubmit = () => {
      setQuizSubmitted(true);
  };

  const calculateScore = () => {
      let score = 0;
      quizQuestions.forEach((q, i) => {
          if (userAnswers[i] === q.correctAnswer) score++;
      });
      return score;
  };

  const handleAddNote = () => {
      if(!noteInput.trim()) return;
      const timestamp = new Date().toISOString().substr(14, 5); // Fake timestamp 00:00
      const newNote: Note = {
          id: Date.now().toString(),
          text: noteInput,
          timestamp: "12:45" // In a real app, use video player ref current time
      };
      setNotes([newNote, ...notes]);
      setNoteInput('');
  };

  const filteredCourses = MOCK_COURSES.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.software.toLowerCase().includes(searchTerm.toLowerCase()));

  // ----------------------------------------------------------------------------------
  // VIEW: COURSE PLAYER
  // ----------------------------------------------------------------------------------
  if (viewMode === 'player' && selectedCourse) {
      return (
          <div className="h-full flex flex-col bg-black animate-in fade-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="h-18 border-b border-white/10 bg-[#0B1121] flex items-center justify-between px-6 z-20 shrink-0">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setViewMode('browse')} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                          <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div>
                          <h2 className="text-lg font-bold text-white leading-tight">{selectedCourse.title}</h2>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                               <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{selectedCourse.instructor}</span>
                               <span className="text-slate-600">/</span>
                               <span className="text-cad-accent">{selectedCourse.modules.find(m => m.id === activeModuleId)?.title}</span>
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-6">
                      {selectedCourse.progress === 100 && (
                          <button 
                            onClick={() => setShowCertificate(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-amber-900/20 hover:scale-105 transition-transform"
                          >
                              <Award className="w-3.5 h-3.5" /> Claim Certificate
                          </button>
                      )}
                      <div className="hidden md:flex flex-col items-end mr-4">
                          <span className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-bold">Course Progress</span>
                          <div className="w-40 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cad-accent rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: `${selectedCourse.progress}%` }}></div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Main Player Area */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                  {/* Left: Video Player */}
                  <div className="flex-1 bg-black relative group flex flex-col justify-center">
                       {/* Mock Video Container */}
                       <div className="w-full h-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
                           {/* Cinematic Glow */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col justify-end p-8">
                                {/* Controls */}
                                <div className="flex items-center gap-6 text-white">
                                    <button className="hover:text-cad-accent hover:scale-110 transition-all"><Play className="w-8 h-8 fill-white" /></button>
                                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer group/slider">
                                        <div className="w-1/3 h-full bg-cad-accent relative">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-mono font-medium">12:45 / 45:00</span>
                                    <button className="hover:text-cad-accent transition-colors"><Maximize className="w-5 h-5" /></button>
                                </div>
                           </div>
                           <img src={selectedCourse.thumbnail} className="w-full h-full object-cover opacity-60 blur-sm" alt="Video Placeholder"/>
                           
                           <button className="absolute z-0 w-24 h-24 bg-cad-accent/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_40px_rgba(56,189,248,0.5)] backdrop-blur-md">
                               <Play className="w-10 h-10 fill-cad-dark ml-1 text-cad-dark" />
                           </button>
                       </div>
                  </div>

                  {/* Right: Sidebar (Curriculum/Tutor/Quiz/Resources/Notes) */}
                  <div className="w-full lg:w-[400px] bg-[#0f172a] border-l border-white/5 flex flex-col shadow-2xl z-10">
                      {/* Tabs */}
                      <div className="flex border-b border-white/5 bg-slate-900/50 overflow-x-auto custom-scrollbar">
                          <button onClick={() => setActiveTab('curriculum')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'curriculum' ? 'text-white border-cad-accent bg-white/5' : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'}`}>Lessons</button>
                          <button onClick={() => setActiveTab('resources')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'resources' ? 'text-blue-300 border-blue-500 bg-blue-500/10' : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'}`}>Files</button>
                          <button onClick={() => setActiveTab('notes')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'notes' ? 'text-yellow-300 border-yellow-500 bg-yellow-500/10' : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'}`}>Notes</button>
                          <button onClick={() => setActiveTab('tutor')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'tutor' ? 'text-purple-300 border-purple-500 bg-purple-500/10' : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'}`}>AI Tutor</button>
                          <button onClick={() => setActiveTab('quiz')} className={`flex-1 min-w-[80px] py-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'quiz' ? 'text-green-300 border-green-500 bg-green-500/10' : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'}`}>Quiz</button>
                      </div>

                      {/* Tab Content */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f172a]">
                          {/* 1. CURRICULUM */}
                          {activeTab === 'curriculum' && (
                              <div className="p-4 space-y-2">
                                  {selectedCourse.modules.map((module, idx) => (
                                      <div 
                                        key={module.id}
                                        onClick={() => setActiveModuleId(module.id)}
                                        className={`p-4 rounded-xl cursor-pointer flex items-start gap-4 transition-all border ${
                                            activeModuleId === module.id 
                                            ? 'bg-cad-accent/10 border-cad-accent/30 shadow-lg' 
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                      >
                                          <div className={`mt-0.5 ${module.isCompleted ? 'text-green-400' : 'text-slate-600'}`}>
                                              {module.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                          </div>
                                          <div>
                                              <p className={`text-sm font-bold mb-1 ${activeModuleId === module.id ? 'text-white' : 'text-slate-300'}`}>
                                                  {idx + 1}. {module.title}
                                              </p>
                                              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                                  <Clock className="w-3 h-3" /> {module.duration}
                                              </p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}

                          {/* 2. RESOURCES */}
                          {activeTab === 'resources' && (
                              <div className="p-6 space-y-6">
                                  <div className="text-center mb-6">
                                      <h3 className="text-white font-bold text-lg mb-2">Course Files</h3>
                                      <p className="text-sm text-slate-400">Download assets to follow along.</p>
                                  </div>
                                  <div className="space-y-3">
                                      {selectedCourse.resources && selectedCourse.resources.length > 0 ? (
                                          selectedCourse.resources.map((res) => (
                                              <div key={res.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                                                  <div className="flex items-center gap-3">
                                                      <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400 group-hover:text-blue-300">
                                                          <FileText className="w-5 h-5" />
                                                      </div>
                                                      <div>
                                                          <p className="text-sm font-bold text-white">{res.title}</p>
                                                          <p className="text-xs text-slate-500 uppercase">{res.type} • {res.size}</p>
                                                      </div>
                                                  </div>
                                                  <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                      <Download className="w-5 h-5" />
                                                  </button>
                                              </div>
                                          ))
                                      ) : (
                                          <div className="text-center py-10 text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                                              No resources available for this course.
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}

                          {/* 3. NOTES */}
                          {activeTab === 'notes' && (
                              <div className="flex flex-col h-full">
                                  <div className="p-4 border-b border-white/5 bg-slate-900/30">
                                      <div className="relative">
                                          <input 
                                            type="text" 
                                            className="w-full bg-black/30 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                                            placeholder="Type a note at current time..."
                                            value={noteInput}
                                            onChange={(e) => setNoteInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                          />
                                          <button onClick={handleAddNote} className="absolute right-2 top-2 p-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors">
                                              <Plus className="w-3.5 h-3.5" />
                                          </button>
                                      </div>
                                  </div>
                                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                      {notes.length > 0 ? (
                                          notes.map((note) => (
                                              <div key={note.id} className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl hover:bg-yellow-500/10 transition-colors cursor-pointer group">
                                                  <div className="flex justify-between items-start mb-1">
                                                      <span className="text-xs font-bold text-yellow-500 font-mono bg-yellow-500/10 px-1.5 py-0.5 rounded group-hover:bg-yellow-500/20">{note.timestamp}</span>
                                                  </div>
                                                  <p className="text-sm text-slate-300">{note.text}</p>
                                              </div>
                                          ))
                                      ) : (
                                          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                                              <StickyNote className="w-12 h-12 opacity-20 mb-3" />
                                              <p className="text-sm">No notes yet.</p>
                                              <p className="text-xs opacity-60">Notes are saved with video timestamp.</p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}

                          {/* 4. AI TUTOR */}
                          {activeTab === 'tutor' && (
                              <div className="flex flex-col h-full">
                                  <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar">
                                      {tutorMessages.map(msg => (
                                          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                                  msg.sender === 'me' 
                                                  ? 'bg-purple-600 text-white rounded-br-none' 
                                                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                                              }`}>
                                                  {msg.sender === 'ai' && <div className="text-xs font-bold text-purple-300 mb-2 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5"/> AI Tutor</div>}
                                                  {msg.text}
                                              </div>
                                          </div>
                                      ))}
                                      {tutorTyping && (
                                          <div className="flex justify-start"><div className="bg-slate-800 text-purple-400 text-xs px-3 py-2 rounded-lg animate-pulse border border-slate-700">Thinking...</div></div>
                                      )}
                                      <div ref={chatEndRef}></div>
                                  </div>
                                  <div className="p-4 bg-slate-900 border-t border-white/5 flex gap-3">
                                      <input 
                                        type="text" 
                                        value={tutorInput}
                                        onChange={(e) => setTutorInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTutorSend()}
                                        placeholder="Ask a question..."
                                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                                      />
                                      <button onClick={handleTutorSend} className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-lg shadow-purple-900/20 active:scale-95">
                                          <Send className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                          )}

                          {/* 5. QUIZ */}
                          {activeTab === 'quiz' && (
                              <div className="p-6 h-full flex flex-col justify-center">
                                  {quizQuestions.length === 0 ? (
                                      <div className="text-center">
                                          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                            <BrainCircuit className="w-10 h-10 text-slate-500" />
                                          </div>
                                          <h3 className="text-white font-bold text-xl mb-2">Knowledge Check</h3>
                                          <p className="text-sm text-slate-400 mb-8 leading-relaxed">Generate a personalized 3-question quiz based on the course content to verify your understanding.</p>
                                          <button 
                                            onClick={handleGenerateQuiz}
                                            disabled={loadingQuiz}
                                            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-900/30 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                                          >
                                              {loadingQuiz ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5 text-yellow-200" />} 
                                              Generate AI Quiz
                                          </button>
                                      </div>
                                  ) : (
                                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                          {quizSubmitted && (
                                              <div className="bg-slate-800/50 border border-white/10 p-6 rounded-2xl text-center backdrop-blur-sm">
                                                  <div className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">Result</div>
                                                  <div className="text-5xl font-bold text-white flex items-center justify-center gap-3">
                                                      {calculateScore()}/{quizQuestions.length}
                                                      {calculateScore() === quizQuestions.length && <Award className="w-8 h-8 text-yellow-400 animate-bounce" />}
                                                  </div>
                                              </div>
                                          )}
                                          
                                          {quizQuestions.map((q, qIdx) => (
                                              <div key={qIdx} className="space-y-4">
                                                  <p className="text-white font-bold text-base leading-snug">
                                                      <span className="text-green-400 mr-2">Q{qIdx+1}.</span>
                                                      {q.question}
                                                  </p>
                                                  <div className="space-y-2.5">
                                                      {q.options.map((opt, oIdx) => {
                                                          let optionClass = "border-white/5 bg-white/5 hover:bg-white/10 text-slate-300";
                                                          if (quizSubmitted) {
                                                              if (oIdx === q.correctAnswer) optionClass = "border-green-500/50 bg-green-500/20 text-green-200";
                                                              else if (userAnswers[qIdx] === oIdx && oIdx !== q.correctAnswer) optionClass = "border-red-500/50 bg-red-500/20 text-red-200";
                                                              else optionClass = "border-transparent opacity-40";
                                                          } else if (userAnswers[qIdx] === oIdx) {
                                                              optionClass = "border-green-500 bg-green-500/10 text-white shadow-[0_0_10px_rgba(74,222,128,0.1)]";
                                                          }

                                                          return (
                                                              <button
                                                                  key={oIdx}
                                                                  disabled={quizSubmitted}
                                                                  onClick={() => {
                                                                      const newAnswers = [...userAnswers];
                                                                      newAnswers[qIdx] = oIdx;
                                                                      setUserAnswers(newAnswers);
                                                                  }}
                                                                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${optionClass}`}
                                                              >
                                                                  {opt}
                                                              </button>
                                                          )
                                                      })}
                                                  </div>
                                              </div>
                                          ))}

                                          {!quizSubmitted && (
                                              <button 
                                                  onClick={handleQuizSubmit}
                                                  disabled={userAnswers.includes(-1)}
                                                  className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                                              >
                                                  Submit Answers
                                              </button>
                                          )}
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* Certificate Modal */}
              {showCertificate && (
                  <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in duration-500">
                      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-1 rounded-3xl shadow-[0_0_100px_rgba(245,158,11,0.2)] max-w-3xl w-full relative overflow-hidden animate-in zoom-in-95 duration-500">
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                          
                          <div className="bg-[#0B1121] rounded-[20px] p-12 text-center relative z-10 border border-white/5">
                              <button onClick={() => setShowCertificate(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><ChevronLeft className="w-6 h-6 rotate-180" /></button>
                              
                              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(245,158,11,0.4)]">
                                  <Award className="w-12 h-12 text-white" />
                              </div>
                              
                              <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Certificate of Completion</h2>
                              <p className="text-slate-400 mb-10">This certifies that</p>
                              
                              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 mb-4 font-serif italic">
                                  Alex Drafter
                              </div>
                              
                              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                  Has successfully demonstrated proficiency in <strong className="text-white">{selectedCourse.title}</strong> on the CADLink Academy platform.
                              </p>
                              
                              <div className="flex items-center justify-center gap-8 text-xs text-slate-500 uppercase tracking-widest font-bold mb-10">
                                  <div>
                                      <div className="mb-2 text-white">Nov 24, 2023</div>
                                      <div className="border-t border-slate-700 pt-2 w-32 mx-auto">Date</div>
                                  </div>
                                  <div>
                                      <div className="mb-2 text-white">CADLink Inc.</div>
                                      <div className="border-t border-slate-700 pt-2 w-32 mx-auto">Issuer</div>
                                  </div>
                              </div>
                              
                              <button className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg flex items-center gap-2 mx-auto">
                                  <Download className="w-4 h-4" /> Download PDF
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // ----------------------------------------------------------------------------------
  // VIEW: BROWSE (DEFAULT)
  // ----------------------------------------------------------------------------------
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-cad-accent" /> Academy
          </h2>
          <p className="text-cad-muted mt-1">Master new software with AI-powered courses.</p>
        </div>
      </div>

      {/* AI Course Generator */}
      <div className="glass-panel p-1 rounded-3xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
         
         <div className="bg-[#0f172a]/90 backdrop-blur-xl rounded-[20px] p-8 relative z-10 overflow-hidden">
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <BrainCircuit className="w-64 h-64 text-purple-400" />
            </div>

            <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 max-w-2xl space-y-4">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">AI Course Generator</h3>
                        <p className="text-slate-300 leading-relaxed">Can't find a specific topic? Enter a subject, and our AI will instantly generate a comprehensive syllabus and learning path tailored for you.</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-3">
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="E.g., Advanced Surface Modeling in Rhino..."
                            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-purple-500 placeholder-slate-500 transition-colors"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={loadingGen}
                            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-900/30 hover:shadow-purple-600/40 active:scale-95"
                        >
                            {loadingGen ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5 text-yellow-200" />}
                            Generate
                        </button>
                    </div>

                    {generatedOutline && (
                        <div className="mt-6 bg-black/40 rounded-xl p-6 text-slate-200 text-sm border border-purple-500/20 whitespace-pre-wrap shadow-inner animate-in fade-in slide-in-from-top-4">
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/5">
                                 <h4 className="font-bold text-purple-400 uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Bot className="w-4 h-4"/> Generated Syllabus
                                 </h4>
                                 <button onClick={() => setGeneratedOutline(null)} className="text-slate-500 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4 rotate-90" /></button>
                            </div>
                            <div className="leading-relaxed font-mono text-xs opacity-90">
                                {generatedOutline}
                            </div>
                        </div>
                    )}
                </div>
            </div>
         </div>
      </div>

      {/* Course List */}
      <div className="space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-xl">Available Courses</h3>
              <div className="relative w-72 group">
                  <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4 group-focus-within:text-cad-accent transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-cad-accent outline-none backdrop-blur-sm transition-colors"
                  />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <div key={course.id} onClick={() => openCourse(course)} className="glass-card rounded-2xl overflow-hidden hover:border-cad-accent/40 hover:shadow-glow transition-all duration-300 group cursor-pointer flex flex-col h-full hover:-translate-y-1">
                <div className="relative aspect-video overflow-hidden">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                        <div className="bg-cad-accent text-cad-dark px-5 py-2.5 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-[0_0_20px_rgba(56,189,248,0.6)]">
                            <PlayCircle className="w-5 h-5 fill-cad-dark" /> Resume Learning
                        </div>
                    </div>
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white border border-white/10 shadow-lg">
                        {course.software}
                    </div>
                    {course.progress === 100 && (
                        <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md p-1.5 rounded-full text-white shadow-lg border border-amber-400/50 animate-in zoom-in duration-300">
                            <Award className="w-4 h-4" />
                        </div>
                    )}
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                        <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${course.progress}%` }}></div>
                    </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cad-accent transition-colors line-clamp-2 leading-tight">{course.title}</h3>
                    <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed">{course.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                            <img src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`} className="w-5 h-5 rounded-full ring-2 ring-[#0B1121]" alt="Inst"/>
                            <span className="text-slate-300">{course.instructor}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><BarChart className="w-3.5 h-3.5" /> {course.level}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.totalDuration}</span>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
      </div>
      </div>
    </div>
  );
};

export default Academy;