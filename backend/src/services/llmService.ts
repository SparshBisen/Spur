import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getStoreKnowledgePrompt } from '../data/storeKnowledge';

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error('WARNING: GOOGLE_API_KEY is not set in environment variables!');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

const SYSTEM_PROMPT = `You are a helpful and friendly customer support agent for TechGadgets Store, a small e-commerce store that sells tech accessories and gadgets.

Your job is to:
1. Answer customer questions about products, shipping, returns, and policies
2. Be polite, helpful, and concise
3. If you don't know something, admit it and suggest contacting human support
4. Keep responses brief (2-4 sentences usually) unless more detail is needed
5. Never make up information about orders or tracking - ask them to provide order details

${getStoreKnowledgePrompt()}

Remember: Be helpful but keep responses concise. If a question is outside your knowledge, politely direct them to contact support via email at support@techgadgets.com.`;

interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

const MAX_USER_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 10;

export async function generateReply(
    conversationHistory: { sender: string; text: string }[],
    userMessage: string
): Promise<string> {
    try {
        if (!apiKey) {
            throw new Error('API key not configured');
        }

        let truncatedMessage = userMessage;
        if (userMessage.length > MAX_USER_MESSAGE_LENGTH) {
            truncatedMessage = userMessage.substring(0, MAX_USER_MESSAGE_LENGTH) + '... (message truncated)';
            console.log('User message truncated due to length');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const recentHistory = conversationHistory.slice(-MAX_HISTORY_MESSAGES);
        
        const formattedHistory: ChatMessage[] = recentHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        let fullPrompt = SYSTEM_PROMPT + '\n\n';
        
        if (recentHistory.length > 0) {
            fullPrompt += 'Previous conversation:\n';
            for (const msg of recentHistory) {
                fullPrompt += `${msg.sender === 'user' ? 'Customer' : 'Agent'}: ${msg.text}\n`;
            }
            fullPrompt += '\n';
        }
        
        fullPrompt += `Customer: ${truncatedMessage}\nAgent:`;

        console.log('Sending prompt to Gemini API...');

        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();
        
        console.log('Received response from Gemini API');

        return text;

    } catch (error: any) {
        console.error('LLM API Error:', error);

        if (error.message?.includes('API key')) {
            return "I'm having trouble connecting to my brain right now. Please try again in a moment or contact support at support@techgadgets.com.";
        }
        
        if (error.message?.includes('rate limit') || error.status === 429) {
            return "I'm a bit overwhelmed with requests right now. Please wait a moment and try again!";
        }
        
        if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
            return "Sorry, I took too long to think! Please try asking your question again.";
        }

        return "I'm sorry, I encountered an issue processing your request. Please try again or contact our support team at support@techgadgets.com for assistance.";
    }
}
