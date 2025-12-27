// filepath: /Users/sparsh_bisen/Desktop/assessment/backend/api/chat/history.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    let connection;
    try {
        const sessionId = req.query.sessionId as string;
        if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

        connection = await mysql.createConnection(getDbConfig());

        const [convRows] = await connection.execute<any[]>(
            'SELECT id FROM conversations WHERE id = ?', [sessionId]
        );
        if (convRows.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const [messages] = await connection.execute<any[]>(
            'SELECT id, sender, text, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
            [sessionId]
        );

        await connection.end();
        return res.status(200).json({ sessionId, messages });

    } catch (error: any) {
        console.error('History error:', error);
        if (connection) await connection.end().catch(() => {});
        return res.status(500).json({ error: 'Failed to fetch history' });
    }
}