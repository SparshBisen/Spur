// filepath: /Users/sparsh_bisen/Desktop/assessment/backend/scripts/initRemoteDb.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initRemoteDatabase() {
    console.log('🔗 Connecting to remote database...');
    console.log('   Host:', process.env.DB_HOST);
    console.log('   Database:', process.env.DB_NAME);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('\n📦 Creating tables...\n');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id VARCHAR(36) PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                metadata JSON
            )
        `);
        console.log('   ✅ conversations table ready');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id VARCHAR(36) PRIMARY KEY,
                conversation_id VARCHAR(36) NOT NULL,
                sender ENUM('user', 'ai') NOT NULL,
                text TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            )
        `);
        console.log('   ✅ messages table ready');

        console.log('\n🎉 Database initialization complete!\n');
    } finally {
        await connection.end();
    }
}

initRemoteDatabase().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});