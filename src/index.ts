import { Telegraf, Markup } from 'telegraf';
import { link } from 'telegraf/format';
import dotenv from 'dotenv';
import express from 'express';
import { createHmac } from 'node:crypto';

dotenv.config();

const expressApp = express();
const bot = new Telegraf(process.env.BOT_TOKEN!);
const WEB_APP_URL = 'https://react-frontend-production-bb97.up.railway.app/';
const PORT = process.env.PORT || 3000; // Fallback to 3000 if PORT is not in environment

// Define bot commands
bot.command('start', (ctx) => {
    ctx.reply(
        'Launch mini app from inline keyboard!',
        Markup.inlineKeyboard([Markup.button.webApp('Launch', WEB_APP_URL)]),
    );
});

bot.on('inline_query', (ctx) => {
    ctx.answerInlineQuery([], {
        button: { text: 'Launch', web_app: { url: WEB_APP_URL } },
    });
});

bot.command('link', (ctx) => {
    ctx.reply(link('chat_link', 'https://t.me/secret_message_game_bot/miniapp?startapp=secret_message_game'));
});

bot.command('setmenu', (ctx) => {
    ctx.setChatMenuButton({
        text: 'Launch',
        type: 'web_app',
        web_app: { url: WEB_APP_URL },
    });
});

bot.command('keyboard', (ctx) => {
    ctx.reply(
        'Launch mini app from keyboard!',
        Markup.keyboard([Markup.button.webApp('Launch', WEB_APP_URL)]).resize(),
    );
});

// Setup webhook
async function setupWebhook() {
    expressApp.use(await bot.createWebhook({ domain: process.env.WEBHOOK_DOMAIN!, path: process.env.BOT_API_PATH! }));
}
setupWebhook();

// Listen on the defined port
expressApp.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Root endpoint
expressApp.get('/', (req, res) => {
    res.send('Hello World!');
});
 
// HMAC SHA256 function
function HMAC_SHA256(key:Buffer|string, secret:Buffer|string) {
    return createHmac('sha256', key).update(secret);
}

// Calculate check string
function getCheckString(data:URLSearchParams) {
    const items = [];
    for (const [k, v] of data.entries()) {
        if (k !== 'hash') items.push([k, v]);
    }
    return items.sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
}

// Validate initialization
expressApp.post('/validate-init', (req, res) => {
    const data = new URLSearchParams(req.body);
    const dataCheckString = getCheckString(data);
    const secretKey = HMAC_SHA256('WebAppData', process.env.BOT_TOKEN!).digest();
    const hash = HMAC_SHA256(secretKey, dataCheckString).digest('hex');

    if (hash === data.get('hash')) {
        return res.json(Object.fromEntries(data.entries()));
    }

    return res.status(401).json({});
});
