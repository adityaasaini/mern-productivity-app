import { GoogleGenerativeAI } from '@google/generative-ai';
import TaskModel from '../models/Task.js';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/ai
 * Agreed JSON payload (Agent 1 ↔ Agent 3 contract):
 *   Request : { message: string }
 *   Response: { success: boolean, response: string }
 * userId is extracted ONLY from the verified JWT (req.user.userId) — never from body.
 */
const generateResponse = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const userId = req.user.userId; // from verifyToken middleware
    const contextTasks = await TaskModel.find({ userId }).sort({ createdAt: -1 }).limit(20);

    const taskSummary = contextTasks.length
      ? contextTasks.map((t, i) =>
          `${i + 1}. [${t.isCompleted ? 'Done' : 'Pending'}] ${t.title}: ${t.description}`
        ).join('\n')
      : 'No tasks yet.';

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Mock mode — graceful fallback when no API key
      const lower = message.toLowerCase();
      let reply = 'I am Jarvis, your AI task assistant. How can I help you today?';
      if (lower.includes('task') || lower.includes('todo') || lower.includes('list')) {
        reply = `You currently have ${contextTasks.length} task${contextTasks.length !== 1 ? 's' : ''}. ${contextTasks.filter(t => !t.isCompleted).length} pending, ${contextTasks.filter(t => t.isCompleted).length} completed. Need help prioritizing? (Mock AI Mode — add a GEMINI_API_KEY for full intelligence)`;
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        reply = `Hello! I'm Jarvis, connected in mock mode. Add your GEMINI_API_KEY to .env for real AI responses. You have ${contextTasks.length} tasks tracked.`;
      } else if (lower.includes('help')) {
        reply = 'I can help you manage tasks, set priorities, summarize your workload, and suggest next steps. What would you like to know?';
      }
      return res.status(200).json({ success: true, response: reply });
    }

    const systemPrompt = `You are Jarvis, a sharp and empathetic AI task management assistant embedded in a productivity app called Task Nexus.
You have access to the user's current task list:
---
${taskSummary}
---
Your job: help the user manage, prioritize, and reflect on their tasks. Be concise, actionable, and supportive. Never invent tasks. If asked about tasks, use only the list above.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`);
    const response = result.response.text();

    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ success: false, error: 'AI service temporarily unavailable. Please try again.' });
  }
};

export { generateResponse };
