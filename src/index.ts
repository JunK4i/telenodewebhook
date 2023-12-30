import { Telegraf, Markup } from 'telegraf';
import { link } from 'telegraf/format';
import dotenv from 'dotenv';
import express from 'express';
import { createHmac } from 'node:crypto';
import cors from 'cors';
import HmacSHA256 from "crypto-js/hmac-sha256";
import Hex from "crypto-js/enc-hex";


dotenv.config();

const expressApp = express();
// expressApp.use(cors(corsOptions));
expressApp.use(cors({
    origin: 'https://react-frontend-production-bb97.up.railway.app',
    credentials: true
  }));
  
// expressApp.use(credentials);
expressApp.use(express.json()); // for parsing application/json
expressApp.use(express.urlencoded({ extended: false })); 
expressApp.use(express.text({ type: "text/html" }));


// app.use(credentials);
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.raw({ type: "application/vnd.custom-type" }));
// app.use(express.text({ type: "text/html" }));
// app.use(express.urlencoded({ extended: false }));

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

// Calculate check string - all data excluding hash
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
    console.log("hash", data.get('hash'))
    const dataCheckString = getCheckString(data);
    const secretKey = HMAC_SHA256('WebAppData', process.env.BOT_TOKEN!).digest();
    const hash = HMAC_SHA256(secretKey, dataCheckString).digest('hex');
    console.log("Data check string", dataCheckString)
    console.log("Secret key", secretKey)
    if (hash === data.get('hash')) {
		console.log("Validated init", data)
        return res.json(Object.fromEntries(data.entries()));
    }
	console.log("Invalid init", data)
    return res.status(401).json({});
});

// expressApp.post('test-hash', (req, res) => {
//     const data = new URLSearchParams(req.body);
//     const dataCheckString = getCheckString(data);
//     console.log("Data check string", dataCheckString)
//     const secretKey = HMAC_SHA256('WebAppData', process.env.BOT_TOKEN!).digest();
//     console.log("Secret key", secretKey)
// });  


expressApp.post('/validate-init2', (req, res) => {
    checkWebAppSignature(process.env.BOT_TOKEN, req.body)
})

function checkWebAppSignature(token, initData) {
  // It is not clear from the documentation weather is URL
  // escaped or not, maybe you will need to uncomment this
  // initData = decodeURIComponent(initData)
  // Parse URL Query
  const q = new URLSearchParams(initData);
  // Extract the hash
  const hash = q.get("hash");

  // Re encode in accordance to the documentation. Remember
  // to remove hash before.
  q.delete("hash");
  const v = Array.from(q.entries());
  v.sort(([aN, aV], [bN, bV]) => aN.localeCompare(bN));
  const data_chack_string = v.map(([n, v]) => `${n}=${v}`).join("\n");

  // Perform the algorithm provided with the documentation
  var secret_key = HmacSHA256(token, "WebAppData").toString(Hex);
  var key = HmacSHA256(data_chack_string, secret_key).toString(Hex);

  console.log(key)
  console.log(hash)
  return key === hash;
}