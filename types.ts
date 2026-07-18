

export enum JobType {
  FREELANCE = 'Freelance',
  PERMANENT = 'Permanent',
  CONTRACT = 'Contract'
}

export enum ExperienceLevel {
  ENTRY = 'Entry Level',
  INTERMEDIATE = 'Intermediate',
  EXPERT = 'Expert'
}

export enum Software {
  AUTOCAD = 'AutoCAD',
  SOLIDWORKS = 'SolidWorks',
  REVIT = 'Revit',
  FUSION360 = 'Fusion 360',
  BLENDER = 'Blender',
  RHINO = 'Rhino',
  SKETCHUP = 'SketchUp'
}

export interface Job {
  id: string;
  title: string;
  client: string;
  type: JobType;
  experienceLevel: ExperienceLevel;
  budget: string;
  software: Software[];
  description: string;
  postedAt: string;
  requirements?: string[];
  discipline?: string;
  deliverables?: string[];
  duration?: string;
}

export interface ServiceGig {
  id: string;
  title: string;
  freelancerName: string;
  freelancerAvatar: string;
  price: number;
  deliveryTime: string; // e.g. "3 days"
  software: Software[];
  description: string;
  rating: number;
  reviewsCount: number;
  coverImage: string;
  responseRate: number; // Percentage 0-100
}

export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  category: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
  skills: Software[];
  rating: number;
  avatar: string;
  bio: string;
  isOnline: boolean;
  portfolio?: PortfolioItem[]; // Added portfolio
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
}

export interface CourseResource {
  id: string;
  title: string;
  type: 'pdf' | 'dwg' | 'blend' | 'zip' | 'rvt';
  size: string;
}

export interface Note {
  id: string;
  timestamp: string;
  text: string;
}

export interface Course {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: string;
  thumbnail: string;
  software: Software;
  description: string;
  progress: number; // 0-100
  totalDuration: string;
  modules: CourseModule[];
  resources?: CourseResource[];
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // index of correct option
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other' | 'system' | 'ai';
  text: string;
  timestamp: Date;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  assignee: string; // url to avatar
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string; // ISO Date string or human readable
  dependencies?: string[]; // IDs of tasks that must be completed before this one
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Processing';
  type: 'Credit' | 'Debit';
}

export interface CalendarEvent {
  id: string;
  title: string;
  day: number; // Day of the current month
  time: string;
  duration: string;
  type: 'Meeting' | 'Deadline' | 'Site' | 'Block';
  attendees?: string[];
  description?: string;
  location?: string;
  meetingLink?: string;
}

export interface Recommendation {
  jobId: string;
  score: number;
  reason: string;
}

export interface ForumPost {
    id: string;
    authorName: string;
    authorAvatar: string;
    title: string;
    content: string;
    tags: string[];
    upvotes: number;
    comments: number;
    postedAt: string;
    isSolved: boolean;
}

export interface GalleryItem {
    id: string;
    authorName: string;
    authorAvatar: string;
    title: string;
    image: string;
    likes: number;
    software: Software;
}

export interface PrioritySuggestion {
    taskId: string;
    newPriority: TaskPriority;
    reason: string;
}

export interface Milestone {
    id: string;
    title: string;
    amount: number;
    dueDate: string;
    status: 'Pending' | 'In Progress' | 'In Review' | 'Approved' | 'Paid';
}

export interface ProjectContract {
    id: string;
    jobTitle: string;
    clientName: string;
    clientAvatar: string;
    totalBudget: number;
    escrowAmount: number;
    paidAmount: number;
    startDate: string;
    deadline: string;
    status: 'Active' | 'Completed' | 'On Hold';
    milestones: Milestone[];
}

export interface InterviewMessage {
    id: string;
    sender: 'ai' | 'user';
    text: string;
    feedback?: string; // AI feedback on the previous user answer
}

export interface ToastNotification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

export interface DirectMessage {
    id: string;
    text: string;
    sender: 'me' | 'them';
    timestamp: string;
    isRead: boolean;
}

export interface Conversation {
    id: string;
    userId: string; // ID of the other person
    userName: string;
    userAvatar: string;
    userRole: string;
    isOnline: boolean;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: DirectMessage[];
}

export interface CloudFile {
    id: string;
    name: string;
    type: 'folder' | 'dwg' | 'rvt' | 'pdf' | 'img' | 'blend';
    size: string;
    modified: string;
    shared: boolean;
}

export interface ResumeData {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    experience: {
        id: string;
        role: string;
        company: string;
        period: string;
        description: string;
    }[];
    skills: string[];
    education: {
        id: string;
        degree: string;
        school: string;
        year: string;
    }[];
}

export interface Dispute {
    id: string;
    contract: string;
    client: string;
    freelancer: string;
    amount: number;
    reason: string;
    status: 'Open' | 'Resolved';
    evidence: {
        user: string;
        time: string;
        text?: string;
        name?: string;
        size?: string;
    }[];
}