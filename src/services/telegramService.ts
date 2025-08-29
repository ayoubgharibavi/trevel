import type { TelegramBotConfig } from '../types';

export const sendTelegramMessage = async (config: TelegramBotConfig, message: string): Promise<boolean> => {
    if (!config.isEnabled || !config.botToken || !config.chatId) {
        console.log("[Telegram Bot] Disabled or not configured. Message not sent.");
        return false;
    }

    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const params = {
        chat_id: config.chatId,
        text: message,
        parse_mode: 'Markdown',
    };

    console.log(`[Telegram Bot] Simulating sending message to chat ${config.chatId}:\n${message}`);
    
    // In a real application, you would use fetch:
    /*
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });
        const data = await response.json();
        if (!data.ok) {
            console.error('[Telegram Bot] API Error:', data.description);
            return false;
        }
        return true;
    } catch (error) {
        console.error('[Telegram Bot] Network Error:', error);
        return false;
    }
    */
    
    // For this simulation, we'll just return true after a short delay.
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
};
