

import { Job, JobType, Software, UserProfile, Course, ServiceGig, ExperienceLevel, CalendarEvent, ForumPost, GalleryItem, ProjectContract, Conversation, CloudFile, Dispute } from './types';

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'HVAC Ductwork Design for Commercial Complex',
    client: 'BuildTech Solutions',
    type: JobType.FREELANCE,
    experienceLevel: ExperienceLevel.INTERMEDIATE,
    budget: '$500 - $1000',
    software: [Software.REVIT, Software.AUTOCAD],
    description: 'Need a detailed HVAC layout for a 3-story office building. Must comply with ASHRAE standards.',
    postedAt: '2h ago'
  },
  {
    id: '2',
    title: 'Senior Mechanical Design Engineer',
    client: 'Tesla Dynamics',
    type: JobType.PERMANENT,
    experienceLevel: ExperienceLevel.EXPERT,
    budget: '$110k - $140k/yr',
    software: [Software.SOLIDWORKS, Software.FUSION360],
    description: 'Looking for an experienced engineer to lead our chassis design team. 5+ years experience required.',
    postedAt: '1d ago'
  },
  {
    id: '3',
    title: '3D Rendering of Modern Villa',
    client: 'ArchViz Studio',
    type: JobType.FREELANCE,
    experienceLevel: ExperienceLevel.INTERMEDIATE,
    budget: '$300 fixed',
    software: [Software.SKETCHUP, Software.BLENDER],
    description: 'Need photorealistic exterior renders for a client presentation this Friday.',
    postedAt: '4h ago'
  },
  {
    id: '4',
    title: 'Parametric Modeling for Jewelry',
    client: 'GoldSmiths & Co',
    type: JobType.CONTRACT,
    experienceLevel: ExperienceLevel.EXPERT,
    budget: '$45/hr',
    software: [Software.RHINO],
    description: 'Creating complex grasshopper scripts for customizable jewelry designs.',
    postedAt: '6h ago'
  },
  {
    id: '5',
    title: 'Junior Drafter - Floor Plans',
    client: 'FastPlans Inc',
    type: JobType.FREELANCE,
    experienceLevel: ExperienceLevel.ENTRY,
    budget: '$20/hr',
    software: [Software.AUTOCAD],
    description: 'Converting hand sketches of residential floor plans into clean CAD drawings.',
    postedAt: '1h ago'
  }
];

export const MOCK_SERVICES: ServiceGig[] = [
  {
    id: 's1',
    title: 'I will create photorealistic 3D renders from your plans',
    freelancerName: 'Elena Silva',
    freelancerAvatar: 'https://picsum.photos/200/200?random=3',
    price: 150,
    deliveryTime: '2 Days',
    software: [Software.BLENDER, Software.SKETCHUP],
    description: 'High-quality exterior and interior renders for architects and real estate developers. I include 3 revisions.',
    rating: 5.0,
    reviewsCount: 42,
    coverImage: 'https://picsum.photos/600/400?random=20',
    responseRate: 98
  },
  {
    id: 's2',
    title: 'Professional PDF to AutoCAD Conversion',
    freelancerName: 'Sarah Chen',
    freelancerAvatar: 'https://picsum.photos/200/200?random=1',
    price: 40,
    deliveryTime: '24 Hours',
    software: [Software.AUTOCAD],
    description: 'Manual redrafting of your PDF sketches into layered, clean DWG files. No auto-tracing software used.',
    rating: 4.9,
    reviewsCount: 128,
    coverImage: 'https://picsum.photos/600/400?random=21',
    responseRate: 100
  },
  {
    id: 's3',
    title: 'SolidWorks 3D Modeling & Enclosure Design',
    freelancerName: 'Mike Ross',
    freelancerAvatar: 'https://picsum.photos/200/200?random=2',
    price: 200,
    deliveryTime: '4 Days',
    software: [Software.SOLIDWORKS],
    description: 'I will design injection-mold ready plastic enclosures for your electronics projects.',
    rating: 4.8,
    reviewsCount: 15,
    coverImage: 'https://picsum.photos/600/400?random=22',
    responseRate: 85
  }
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u1',
    name: 'Sarah Chen',
    role: 'BIM Specialist',
    hourlyRate: 65,
    skills: [Software.REVIT, Software.AUTOCAD],
    rating: 4.9,
    avatar: 'https://picsum.photos/200/200?random=1',
    bio: 'Expert in BIM coordination and clash detection for large scale infrastructure.',
    isOnline: true
  },
  {
    id: 'u2',
    name: 'Mike Ross',
    role: 'Product Designer',
    hourlyRate: 50,
    skills: [Software.SOLIDWORKS, Software.FUSION360],
    rating: 4.7,
    avatar: 'https://picsum.photos/200/200?random=2',
    bio: 'Passionate about DFM and rapid prototyping.',
    isOnline: false
  },
  {
    id: 'u3',
    name: 'Elena Silva',
    role: 'Architectural Visualizer',
    hourlyRate: 40,
    skills: [Software.BLENDER, Software.SKETCHUP],
    rating: 5.0,
    avatar: 'https://picsum.photos/200/200?random=3',
    bio: 'Bringing blueprints to life with high-end rendering.',
    isOnline: true
  }
];

export const CURRENT_USER: UserProfile = {
  id: 'me',
  name: 'Alex Drafter',
  role: 'Senior Mechanical Engineer',
  hourlyRate: 85,
  skills: [Software.SOLIDWORKS, Software.AUTOCAD, Software.FUSION360],
  rating: 4.9,
  avatar: 'https://picsum.photos/200/200?random=100',
  bio: 'Specialized in mechanical design and FEA analysis. Over 10 years of experience in automotive and aerospace components.',
  isOnline: true,
  portfolio: [
     { id: 'p1', title: 'Jet Engine Turbine', category: 'Aerospace', image: 'https://picsum.photos/600/400?random=50' },
     { id: 'p2', title: 'Car Chassis Frame', category: 'Automotive', image: 'https://picsum.photos/600/400?random=51' },
     { id: 'p3', title: 'Robotic Arm Assembly', category: 'Robotics', image: 'https://picsum.photos/600/400?random=52' },
  ]
};

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Mastering Revit Families',
    level: 'Advanced',
    instructor: 'Autodesk Certified Pro',
    thumbnail: 'https://picsum.photos/400/225?random=10',
    software: Software.REVIT,
    description: 'Learn to create complex parametric families in Revit from scratch. This course covers nested families, formulas, and shared parameters.',
    progress: 45,
    totalDuration: '8h 30m',
    modules: [
        { id: 'm1', title: 'Introduction to Family Editor', duration: '45m', isCompleted: true },
        { id: 'm2', title: 'Reference Planes & Parameters', duration: '1h 15m', isCompleted: true },
        { id: 'm3', title: 'Nested Families', duration: '1h 30m', isCompleted: false },
        { id: 'm4', title: 'Advanced Formulas', duration: '2h 00m', isCompleted: false },
    ],
    resources: [
        { id: 'r1', title: 'Parametric_Table_Start.rfa', type: 'rvt', size: '12 MB' },
        { id: 'r2', title: 'Shared_Parameters.txt', type: 'pdf', size: '45 KB' },
        { id: 'r3', title: 'Formula_Cheat_Sheet.pdf', type: 'pdf', size: '1.2 MB' }
    ]
  },
  {
    id: 'c2',
    title: 'SolidWorks Simulation Basics',
    level: 'Beginner',
    instructor: 'Eng. John Doe',
    thumbnail: 'https://picsum.photos/400/225?random=11',
    software: Software.SOLIDWORKS,
    description: 'A complete guide to FEA analysis using SolidWorks Simulation. Learn static stress, thermal analysis, and fatigue studies.',
    progress: 100, // Completed for demo of certificate
    totalDuration: '6h 15m',
    modules: [
        { id: 'm1', title: 'Getting Started with FEA', duration: '30m', isCompleted: true },
        { id: 'm2', title: 'Material Properties & Meshing', duration: '1h 00m', isCompleted: true },
        { id: 'm3', title: 'Running Static Studies', duration: '1h 45m', isCompleted: true },
    ],
    resources: [
        { id: 'r1', title: 'Bracket_Model.sldprt', type: 'zip', size: '8 MB' },
        { id: 'r2', title: 'Material_Library_Custom.sldmat', type: 'zip', size: '2 MB' }
    ]
  },
  {
    id: 'c3',
    title: 'Blender 4.0 for ArchViz',
    level: 'Intermediate',
    instructor: 'Creative Shrimp',
    thumbnail: 'https://picsum.photos/400/225?random=12',
    software: Software.BLENDER,
    description: 'Create photorealistic architectural visualizations using Blender 4.0 and Cycles. Covers modeling, texturing, lighting, and post-processing.',
    progress: 80,
    totalDuration: '12h 00m',
    modules: [
        { id: 'm1', title: 'UI & Navigation', duration: '30m', isCompleted: true },
        { id: 'm2', title: 'Modeling the Structure', duration: '3h 00m', isCompleted: true },
        { id: 'm3', title: 'Lighting with HDRI', duration: '1h 30m', isCompleted: true },
        { id: 'm4', title: 'Advanced Materials', duration: '2h 15m', isCompleted: false },
    ],
    resources: [
        { id: 'r1', title: 'Modern_Villa_Blueprint.dwg', type: 'dwg', size: '4 MB' },
        { id: 'r2', title: 'Texture_Pack_Vol1.zip', type: 'zip', size: '150 MB' },
        { id: 'r3', title: 'Lighting_Setup.blend', type: 'blend', size: '45 MB' }
    ]
  }
];

export const MOCK_EVENTS: CalendarEvent[] = [
  { 
      id: 'e1', 
      title: 'Design Review: HVAC Layout', 
      day: new Date().getDate(), 
      time: '10:00 AM', 
      duration: '1h', 
      type: 'Meeting', 
      attendees: ['u1', 'u3'],
      description: 'Reviewing the latest ductwork clashes for the commercial complex project. Please have Navisworks models ready.',
      location: 'Zoom Meeting',
      meetingLink: 'https://zoom.us/j/123456789'
  },
  { 
      id: 'e2', 
      title: 'Submit Preliminary Sketches', 
      day: new Date().getDate() + 2, 
      time: '02:00 PM', 
      duration: 'Deadline', 
      type: 'Deadline',
      description: 'Submission deadline for the concept phase of the Tesla Chassis project. Ensure all exports are in PDF and STEP formats.'
  },
  { 
      id: 'e3', 
      title: 'Client Sync: Tesla Dynamics', 
      day: new Date().getDate() - 1, 
      time: '04:30 PM', 
      duration: '30m', 
      type: 'Meeting', 
      attendees: ['u2'],
      description: 'Weekly sync to discuss progress on the suspension system simulation.',
      location: 'Google Meet'
  },
  { 
      id: 'e4', 
      title: 'Site Visit: Downtown Complex', 
      day: new Date().getDate() + 5, 
      time: '09:00 AM', 
      duration: '3h', 
      type: 'Site',
      location: '123 Innovation Blvd, Tech District',
      description: 'On-site verification of existing mechanical risers and shaft dimensions.'
  },
];

export const MOCK_POSTS: ForumPost[] = [
    {
        id: 'fp1',
        authorName: 'Mike Ross',
        authorAvatar: 'https://picsum.photos/200/200?random=2',
        title: 'How to fix non-manifold geometry in Blender for 3D printing?',
        content: 'I keep getting errors when trying to slice my model. The mesh looks clean in edit mode, but Cura says it is non-manifold. Any quick fixes?',
        tags: ['Blender', '3D Printing'],
        upvotes: 24,
        comments: 8,
        postedAt: '2h ago',
        isSolved: false
    },
    {
        id: 'fp2',
        authorName: 'Sarah Chen',
        authorAvatar: 'https://picsum.photos/200/200?random=1',
        title: 'Best practices for Revit Shared Coordinates?',
        content: 'Working on a large campus project. Should we use the site plan as the origin or the main building grid A1?',
        tags: ['Revit', 'BIM'],
        upvotes: 45,
        comments: 12,
        postedAt: '5h ago',
        isSolved: true
    }
];

export const MOCK_GALLERY: GalleryItem[] = [
    { id: 'g1', authorName: 'Elena Silva', authorAvatar: 'https://picsum.photos/200/200?random=3', title: 'Cyberpunk City Block', image: 'https://picsum.photos/600/600?random=200', likes: 156, software: Software.BLENDER },
    { id: 'g2', authorName: 'Mike Ross', authorAvatar: 'https://picsum.photos/200/200?random=2', title: 'V8 Engine Assembly', image: 'https://picsum.photos/600/600?random=201', likes: 89, software: Software.SOLIDWORKS },
    { id: 'g3', authorName: 'Alex Drafter', authorAvatar: 'https://picsum.photos/200/200?random=100', title: 'Minimalist Interior', image: 'https://picsum.photos/600/600?random=202', likes: 230, software: Software.SKETCHUP },
    { id: 'g4', authorName: 'Sarah Chen', authorAvatar: 'https://picsum.photos/200/200?random=1', title: 'High-Rise Structure', image: 'https://picsum.photos/600/600?random=203', likes: 112, software: Software.REVIT },
];

export const MOCK_CONTRACTS: ProjectContract[] = [
    {
        id: 'pc1',
        jobTitle: 'Commercial Complex HVAC',
        clientName: 'BuildTech Solutions',
        clientAvatar: 'https://picsum.photos/200/200?random=90',
        totalBudget: 1500,
        escrowAmount: 500,
        paidAmount: 500,
        startDate: 'Oct 10, 2023',
        deadline: 'Nov 01, 2023',
        status: 'Active',
        milestones: [
            { id: 'm1', title: 'Initial Load Calculation', amount: 500, dueDate: 'Oct 15, 2023', status: 'Paid' },
            { id: 'm2', title: 'Draft Ductwork Layout', amount: 500, dueDate: 'Oct 22, 2023', status: 'In Review' },
            { id: 'm3', title: 'Final Construction Docs', amount: 500, dueDate: 'Nov 01, 2023', status: 'Pending' }
        ]
    },
    {
        id: 'pc2',
        jobTitle: 'Tesla Chassis Design',
        clientName: 'Tesla Dynamics',
        clientAvatar: 'https://picsum.photos/200/200?random=91',
        totalBudget: 4500,
        escrowAmount: 1500,
        paidAmount: 1500,
        startDate: 'Sep 15, 2023',
        deadline: 'Dec 01, 2023',
        status: 'Active',
        milestones: [
            { id: 'm1', title: 'Concept Phase', amount: 1500, dueDate: 'Oct 01, 2023', status: 'Paid' },
            { id: 'm2', title: 'Detailed 3D Modeling', amount: 1500, dueDate: 'Nov 01, 2023', status: 'In Progress' },
            { id: 'm3', title: 'Simulation & FEA', amount: 1500, dueDate: 'Dec 01, 2023', status: 'Pending' }
        ]
    }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv1',
        userId: 'u1',
        userName: 'Sarah Chen',
        userAvatar: 'https://picsum.photos/200/200?random=1',
        userRole: 'BIM Specialist',
        isOnline: true,
        lastMessage: 'Sure, I can send over the Revit families by 5 PM.',
        lastMessageTime: '10m ago',
        unreadCount: 2,
        messages: [
            { id: 'm1', text: 'Hi Sarah, are you available for a quick consult?', sender: 'me', timestamp: '10:00 AM', isRead: true },
            { id: 'm2', text: 'Hey Alex! Yes, absolutely. What do you need?', sender: 'them', timestamp: '10:05 AM', isRead: true },
            { id: 'm3', text: 'I need some custom HVAC families for the new project.', sender: 'me', timestamp: '10:06 AM', isRead: true },
            { id: 'm4', text: 'Sure, I can send over the Revit families by 5 PM.', sender: 'them', timestamp: '10:15 AM', isRead: false },
        ]
    },
    {
        id: 'conv2',
        userId: 'u2',
        userName: 'Mike Ross',
        userAvatar: 'https://picsum.photos/200/200?random=2',
        userRole: 'Product Designer',
        isOnline: false,
        lastMessage: 'The STL files are ready for printing.',
        lastMessageTime: '2h ago',
        unreadCount: 0,
        messages: [
            { id: 'm1', text: 'Mike, how is the enclosure design coming along?', sender: 'me', timestamp: 'Yesterday', isRead: true },
            { id: 'm2', text: 'Almost done. Just refining the snap-fits.', sender: 'them', timestamp: 'Yesterday', isRead: true },
            { id: 'm3', text: 'The STL files are ready for printing.', sender: 'them', timestamp: '2h ago', isRead: true },
        ]
    },
    {
        id: 'conv3',
        userId: 'client1',
        userName: 'BuildTech HR',
        userAvatar: 'https://picsum.photos/200/200?random=90',
        userRole: 'Client',
        isOnline: true,
        lastMessage: 'When can you start on the commercial complex?',
        lastMessageTime: '1d ago',
        unreadCount: 0,
        messages: [
            { id: 'm1', text: 'We reviewed your proposal. It looks great.', sender: 'them', timestamp: '2d ago', isRead: true },
            { id: 'm2', text: 'Thanks! I am excited to work with you.', sender: 'me', timestamp: '1d ago', isRead: true },
            { id: 'm3', text: 'When can you start on the commercial complex?', sender: 'them', timestamp: '1d ago', isRead: true },
        ]
    }
];

export const MOCK_FILES: CloudFile[] = [
    { id: 'f1', name: 'Project_Alpha_Plans', type: 'folder', size: '2 items', modified: '2 hours ago', shared: true },
    { id: 'f2', name: 'Design_Assets', type: 'folder', size: '15 items', modified: 'Yesterday', shared: false },
    { id: 'f3', name: 'Site_Layout_v2.dwg', type: 'dwg', size: '14.5 MB', modified: '4 hours ago', shared: true },
    { id: 'f4', name: 'Mechanical_Pump.step', type: 'rvt', size: '42.1 MB', modified: '1 day ago', shared: false },
    { id: 'f5', name: 'Client_Brief_Notes.pdf', type: 'pdf', size: '1.2 MB', modified: '2 days ago', shared: false },
    { id: 'f6', name: 'Render_Final_01.png', type: 'img', size: '8.4 MB', modified: '3 days ago', shared: true },
    { id: 'f7', name: 'Cyberpunk_Scene.blend', type: 'blend', size: '156 MB', modified: '1 week ago', shared: false },
];

export const MOCK_DISPUTES: Dispute[] = [
    {
        id: 'd1',
        contract: 'Commercial Complex HVAC',
        client: 'BuildTech Solutions',
        freelancer: 'Alex Drafter',
        amount: 500,
        reason: 'Client claims deliverables do not meet ASHRAE standards as specified in the contract.',
        status: 'Open',
        evidence: [
            { user: 'Client', time: '10:00 AM', text: 'The duct sizing in the main hall is incorrect.' },
            { user: 'Freelancer', time: '10:30 AM', text: 'I followed the architectural plans provided.' },
            { user: 'Freelancer', time: '10:32 AM', name: 'Specs.pdf', size: '1.2 MB' }
        ]
    },
    {
        id: 'd2',
        contract: 'Tesla Chassis Design',
        client: 'Tesla Dynamics',
        freelancer: 'Mike Ross',
        amount: 1500,
        reason: 'Freelancer missed final deadline by 3 days. Client requesting partial refund.',
        status: 'Open',
        evidence: [
            { user: 'System', time: 'Yesterday', text: 'Deadline missed.' },
            { user: 'Freelancer', time: 'Today', text: 'I had a family emergency, please check messages.' }
        ]
    }
];