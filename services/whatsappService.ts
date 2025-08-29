import type { WhatsAppBotConfig } from '../types';

export const sendWhatsAppMessage = async (config: WhatsAppBotConfig, to: string, message: string): Promise<boolean> => {
    if (!config.isEnabled || !config.apiKey || !config.phoneNumberId) {
        console.log("[WhatsApp Bot] Disabled or not configured. Message not sent.");
        return false;
    }

    console.log(`[WhatsApp Bot] Simulating sending message to ${to}:\n${message}`);

    // Real implementation would use the WhatsApp Business API (Meta Graph API)
    /*
    const url = `https://graph.facebook.com/v19.0/${config.phoneNumberId}/messages`;
    const payload = {
        messaging_product: "whatsapp",
        to: to, // Should be in E.164 format
        type: "text",
        text: { body: message }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.error) {
            console.error('[WhatsApp Bot] API Error:', data.error.message);
            return false;
        }
        return true;
    } catch (error) {
        console.error('[WhatsApp Bot] Network Error:', error);
        return false;
    }
    */

    // For this simulation, we'll just return true after a short delay.
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
};
