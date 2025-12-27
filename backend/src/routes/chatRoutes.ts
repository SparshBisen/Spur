import { Router, Request, Response } from 'express';
import { 
    createConversation, 
    conversationExists, 
    saveMessage, 
    getMessagesByConversation 
} from '../services/chatService';
import { generateReply } from '../services/llmService';

const router = Router();

const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 1;

router.post('/message', async (req: Request, res: Response) => {
    try {
        let { message, sessionId } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ 
                error: 'Message is required and must be a string' 
            });
        }

        message = message.trim();

        if (message.length < MIN_MESSAGE_LENGTH) {
            return res.status(400).json({ 
                error: 'Message cannot be empty' 
            });
        }

        if (message.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ 
                error: `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` 
            });
        }

        let conversationId = sessionId;

        if (sessionId) {
            const exists = await conversationExists(sessionId);
            if (!exists) {
                console.log('Session not found, creating new one');
                conversationId = await createConversation();
            }
        } else {
            conversationId = await createConversation();
        }

        await saveMessage(conversationId, 'user', message);

        const history = await getMessagesByConversation(conversationId);
        
        const previousMessages = history.slice(0, -1);

        const reply = await generateReply(
            previousMessages.map(m => ({ sender: m.sender, text: m.text })),
            message
        );

        await saveMessage(conversationId, 'ai', reply);

        return res.json({
            reply: reply,
            sessionId: conversationId
        });

    } catch (error) {
        console.error('Error in /chat/message:', error);
        return res.status(500).json({ 
            error: 'Failed to process your message. Please try again.' 
        });
    }
});

router.get('/history/:sessionId', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const exists = await conversationExists(sessionId);
        if (!exists) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await getMessagesByConversation(sessionId);

        return res.json({
            sessionId: sessionId,
            messages: messages.map(m => ({
                id: m.id,
                sender: m.sender,
                text: m.text,
                timestamp: m.timestamp
            }))
        });

    } catch (error) {
        console.error('Error in /chat/history:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch conversation history' 
        });
    }
});

export default router;
