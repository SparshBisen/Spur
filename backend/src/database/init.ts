import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createConversationsTable = `
    CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(36) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        metadata JSON
    )
`;

const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,
        conversation_id VARCHAR(36) NOT NULL,
        sender ENUM('user', 'ai') NOT NULL,
        text TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
`;

const createIndex = `
    CREATE INDEX IF NOT EXISTS idx_messages_conversation 
    ON messages(conversation_id)
`;

export async function initDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'spur_chat';

    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`Database '${dbName}' created or already exists.`);

        await connection.query(`USE ${dbName}`);

        await connection.query(createConversationsTable);
        console.log('Conversations table created or already exists.');

        await connection.query(createMessagesTable);
        console.log('Messages table created or already exists.');

        try {
            await connection.query(createIndex);
            console.log('Index created or already exists.');
        } catch (indexError) {
            console.log('Index already exists or could not be created.');
        }

        console.log('Database initialization complete!');
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    } finally {
        await connection.end();
    }
}
