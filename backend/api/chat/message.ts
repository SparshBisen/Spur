// filepath: /Users/sparsh_bisen/Desktop/assessment/backend/api/chat/message.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

const storeInfo = `
Store: TechGadgets Store

SHIPPING: FREE on orders $50+. Standard (5-7 days): $4.99. Express (2-3 days): $9.99. Ships to USA, Canada, UK, Australia.

RETURNS: 30-day returns. Items must be unused, original packaging. Email returns@techgadgets.com. Refunds in 5-7 days. Sale items final.

SUPPORT HOURS: Mon-Fri 9AM-6PM EST, Sat 10AM-4PM EST, Sun Closed. Email: support@techgadgets.com

PRODUCTS: Wireless Earbuds $49.99, Phone Charger 10000mAh $29.99, Smart Watch $79.99, Laptop Stand $34.99, USB-C Hub $44.99

PAYMENT: Visa, MasterCard, Amex, Discover, PayPal accepted.

CONTACT: support@techgadgets.com | 1-800-TECH-GAD | 123 Tech Street, San Francisco, CA 94102
`;

function getDbConfig() {
    return {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
        ssl: { rejectUnauthorized: false }
    };
}

async function getAIResponse(history: any[], userMsg: string): Promise<string> {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error('No API key');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const systemPrompt = `You are a helpful customer support agent for TechGadgets Store. Be polite, concise (2-4 sentences). Use this info:\n\n${storeInfo}\n\nIf unsure, suggest contacting support@techgadgets.com.`;

        let prompt = systemPrompt + '\n\nConversation:\n';
        const recentHistory = history.slice(-10);
        for (const msg of recentHistory) {
            prompt += `${msg.sender === 'user' ? 'Customer' : 'Agent'}: ${msg.text}\n`;
        }
        prompt += `Customer: ${userMsg}\nAgent:`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err: any) {
        console.error('AI Error:', err);
        if (err.message?.includes('quota')) {
            return "I'm currently busy. Please try again in a moment!";
        }
        return "Sorry, I had trouble processing that. Please try again or email support@techgadgets.com.";
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    let connection;
    try {
        let { message, sessionId } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }
        message = message.trim();
        if (!message) return res.status(400).json({ error: 'Message cannot be empty' });
        if (message.length > 2000) return res.status(400).json({ error: 'Message too long (max 2000 chars)' });

        connection = await mysql.createConnection(getDbConfig());

        let convId = sessionId;
        if (sessionId) {
            const [rows] = await connection.execute<any[]>('SELECT id FROM conversations WHERE id = ?', [sessionId]);
            if (rows.length === 0) convId = null;
        }
        if (!convId) {
            convId = uuidv4();
            await connection.execute('INSERT INTO conversations (id) VALUES (?)', [convId]);
        }

        const userMsgId = uuidv4();
        await connection.execute(
            'INSERT INTO messages (id, conversation_id, sender, text) VALUES (?, ?, ?, ?)',
            [userMsgId, convId, 'user', message]
        );

        const [historyRows] = await connection.execute<any[]>(
            'SELECT sender, text FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
            [convId]
        );
        const previousMsgs = historyRows.slice(0, -1);

        const reply = await getAIResponse(previousMsgs, message);

        const aiMsgId = uuidv4();
        await connection.execute(
            'INSERT INTO messages (id, conversation_id, sender, text) VALUES (?, ?, ?, ?)',
            [aiMsgId, convId, 'ai', reply]
        );

        await connection.end();
        return res.status(200).json({ reply, sessionId: convId });

    } catch (error: any) {
        console.error('Handler error:', error);
        console.error('DB Config used:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        if (connection) await connection.end().catch(() => {});
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}