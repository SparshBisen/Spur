import { v4 as uuidv4 } from 'uuid';
import pool from '../database/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Conversation {
    id: string;
    created_at: Date;
    updated_at: Date;
    metadata?: any;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

export async function createConversation(): Promise<string> {
    const id = uuidv4();
    
    await pool.execute(
        'INSERT INTO conversations (id) VALUES (?)',
        [id]
    );
    
    return id;
}

export async function conversationExists(conversationId: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM conversations WHERE id = ?',
        [conversationId]
    );
    
    return rows.length > 0;
}

export async function saveMessage(
    conversationId: string,
    sender: 'user' | 'ai',
    text: string
): Promise<string> {
    const id = uuidv4();
    
    await pool.execute(
        'INSERT INTO messages (id, conversation_id, sender, text) VALUES (?, ?, ?, ?)',
        [id, conversationId, sender, text]
    );
    
    await pool.execute(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [conversationId]
    );
    
    return id;
}

export async function getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, conversation_id, sender, text, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
        [conversationId]
    );
    
    return rows as Message[];
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM conversations WHERE id = ?',
        [conversationId]
    );
    
    if (rows.length === 0) {
        return null;
    }
    
    return rows[0] as Conversation;
}
