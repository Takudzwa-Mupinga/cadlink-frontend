import { GoogleGenAI, Type } from "@google/genai";
import { Recommendation, Task, PrioritySuggestion, QuizQuestion } from "../types";

// Ensure API key is present
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Generic Chat Helper
export const generateAIResponse = async (prompt: string, context: string = ''): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure process.env.API_KEY.";
  }

  try {
    const fullPrompt = `${context}\n\nUser Query: ${prompt}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: "You are CADLink AI, a helpful assistant for CAD professionals. You can help with resume tips, software shortcuts, project planning, and learning paths for AutoCAD, SolidWorks, Revit, etc. Keep answers concise and professional.",
      }
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error communicating with the AI services.";
  }
};

// Course Syllabus Generator
export const generateCourseOutline = async (topic: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a brief 5-module course outline for learning "${topic}". Return it as a simple bulleted list.`,
        });
        return response.text || "No outline generated.";
    } catch (e) {
        console.error(e);
        return "Failed to generate outline.";
    }
}

// AI Proposal Writer
export const generateCoverLetter = async (jobTitle: string, clientName: string, skills: string[]): Promise<string> => {
    if (!apiKey) return "I am a passionate CAD designer with experience in...";
    try {
        const prompt = `Write a professional, persuasive freelance cover letter for a job titled "${jobTitle}" posted by "${clientName}". 
        Mention that I am proficient in ${skills.join(', ')}. 
        Keep it under 150 words. Tone: Professional, confident, and eager to help.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() || "Could not generate proposal.";
    } catch (e) {
        console.error(e);
        return "Error generating proposal. Please try again.";
    }
}

// AI Description Enhancer
export const enhanceServiceDescription = async (title: string, currentDesc: string): Promise<string> => {
    if (!apiKey) return currentDesc;
    try {
        const prompt = `Rewrite the following service description for a CAD Freelance Marketplace to be more marketing-focused, professional, and persuasive.
        Service Title: "${title}"
        Draft Description: "${currentDesc}"
        
        Keep it clear, use bullet points if necessary, and highlight value. Max 100 words.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() || currentDesc;
    } catch (e) {
        console.error(e);
        return currentDesc;
    }
}

// AI Job Recommender (Advanced)
export const recommendJobs = async (userSkills: string[], userRole: string, pastActivity: string, allJobs: any[]): Promise<Recommendation[]> => {
    if (!apiKey) return [];
    try {
        // Simplify job list for token efficiency
        const jobSummaries = allJobs.map((j: any) => ({id: j.id, title: j.title, skills: j.software, description: j.description}));
        
        const prompt = `
            Act as a smart technical recruiter for CAD professionals.
            User Profile: Role: ${userRole}, Skills: ${userSkills.join(', ')}.
            Past Activity: ${pastActivity}.
            Available Jobs: ${JSON.stringify(jobSummaries)}.
            
            Task: Analyze the jobs and identify the top 3 best matches for this user.
            Consider skill overlap, role relevance, and past activity.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            jobId: { type: Type.STRING },
                            score: { type: Type.NUMBER, description: "Match percentage 0-100" },
                            reason: { type: Type.STRING, description: "Brief explanation (max 1 sentence) of why this is a good match." }
                        }
                    }
                }
            }
        });
        
        const jsonStr = response.text || '[]';
        const result = JSON.parse(jsonStr) as Recommendation[];
        return result;
    } catch (e) {
        console.error("Recommendation Error:", e);
        return [];
    }
}

// AI Technical Troubleshooter
export const solveTechnicalQuestion = async (title: string, content: string, software: string[]): Promise<string> => {
    if (!apiKey) return "AI services unavailable.";
    try {
        const prompt = `
            You are an expert technical support engineer for CAD software (AutoCAD, Blender, Revit, etc.).
            Question Title: "${title}"
            Context: "${content}"
            Related Tags: ${software.join(', ')}

            Provide a concise, step-by-step solution to solve this specific technical problem.
            Format with clear bullet points. If there are multiple ways to fix it, list the most common one first.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text?.trim() || "Could not generate solution.";
    } catch (e) {
        console.error(e);
        return "Failed to process request.";
    }
}

// AI Image Generator (DreamCanvas)
export const generateDesignImage = async (prompt: string): Promise<string | null> => {
    if (!apiKey) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: { aspectRatio: "16:9" }
            }
        });

        // Iterate through parts to find the image
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Image Generation Error:", e);
        return null;
    }
}

// AI Task Prioritizer
export const analyzeTaskPriorities = async (tasks: Task[]): Promise<PrioritySuggestion[]> => {
    if (!apiKey) return [];
    try {
        // Simplify task objects for prompt
        const taskList = tasks.map(t => ({
            id: t.id,
            title: t.title,
            currentPriority: t.priority,
            deadline: t.deadline || 'No deadline',
            dependencies: t.dependencies || []
        }));

        const prompt = `
            You are a Project Management AI for an engineering team.
            Analyze the following tasks. Based on their deadlines and dependencies, suggest priority updates.
            
            Rules:
            1. Tasks with imminent deadlines (within 2 days) should be 'High'.
            2. Tasks that block other tasks (appear in dependencies of others) should be higher priority.
            3. Tasks with far deadlines and no dependents should be 'Low' or 'Medium'.
            4. Only return suggestions where the priority SHOULD CHANGE. If the current priority is correct, do not include it.
            
            Tasks: ${JSON.stringify(taskList)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            taskId: { type: Type.STRING },
                            newPriority: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                            reason: { type: Type.STRING, description: "Short explanation of why the priority should change." }
                        }
                    }
                }
            }
        });

        const jsonStr = response.text || '[]';
        return JSON.parse(jsonStr) as PrioritySuggestion[];
    } catch (e) {
        console.error("Task Priority Analysis Error:", e);
        return [];
    }
}

// Generate Quiz for Course
export const generateCourseQuiz = async (courseTitle: string, description: string): Promise<QuizQuestion[]> => {
    if (!apiKey) return [];
    try {
        const prompt = `
            Create a short 3-question multiple choice quiz for the CAD course titled: "${courseTitle}".
            Context: ${description}.
            Return JSON only.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING } 
                            },
                            correctAnswer: { type: Type.INTEGER, description: "Index of correct option (0-3)" }
                        }
                    }
                }
            }
        });

        const jsonStr = response.text || '[]';
        return JSON.parse(jsonStr) as QuizQuestion[];
    } catch (e) {
        console.error("Quiz Gen Error:", e);
        return [];
    }
}

// Ask Tutor (Context Aware Chat)
export const askCourseTutor = async (question: string, courseTitle: string): Promise<string> => {
    if (!apiKey) return "I can't access my knowledge base right now.";
    try {
        const prompt = `
            You are an expert AI Tutor for the course "${courseTitle}". 
            A student asks: "${question}".
            Provide a helpful, educational answer. Keep it concise.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text?.trim() || "I couldn't generate an answer.";
    } catch (e) {
        console.error(e);
        return "Error reaching tutor.";
    }
}

// AI Interview Coach
export const conductInterviewTurn = async (
    jobTitle: string, 
    jobDescription: string, 
    conversationHistory: {role: string, content: string}[] 
): Promise<{ question: string; feedback?: string }> => {
    if (!apiKey) return { question: "Can you tell me about your experience?" };
    
    try {
        const prompt = `
            You are an expert technical Hiring Manager for the job "${jobTitle}".
            Job Desc: "${jobDescription}".
            
            Conduct a job interview.
            1. Analyze the candidate's last answer (if any) and provide brief, constructive feedback (did they mention keywords, was it structured?).
            2. Ask the NEXT question. Start with general intro, then technical skills, then behavioral.
            3. Keep questions professional but challenging.
            
            History: ${JSON.stringify(conversationHistory)}
            
            Return JSON with:
            {
                "feedback": "Feedback on previous answer (or null if first turn)",
                "question": "The next interview question"
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        feedback: { type: Type.STRING, nullable: true },
                        question: { type: Type.STRING }
                    }
                }
            }
        });

        const jsonStr = response.text || '{}';
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Interview Error:", e);
        return { question: "Tell me about a challenging project you worked on." };
    }
}

// Resume Optimizer
export const optimizeResumeSection = async (section: string, currentText: string): Promise<string> => {
    if (!apiKey) return currentText;
    try {
        const prompt = `
            You are an expert Resume Writer for Engineering and CAD professionals.
            Rewrite the following "${section}" to be more impactful, action-oriented, and optimized for ATS (Applicant Tracking Systems).
            Use strong verbs and quantify achievements where possible.
            
            Original Text: "${currentText}"
            
            Return only the rewritten text. Keep it professional.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() || currentText;
    } catch (e) {
        console.error(e);
        return currentText;
    }
}