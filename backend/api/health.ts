// filepath: /Users/sparsh_bisen/Desktop/assessment/backend/api/health.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ status: 'ok', message: 'Server is running!' });
}