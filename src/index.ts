import { Telegraf, Markup } from "telegraf";
import { link } from "telegraf/format";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const expressApp = express();
const bot = new Telegraf(process.env.BOT_TOKEN!)

const WEB_APP_URL = "https://react-frontend-production-bb97.up.railway.app/";

bot.command("start", ctx =>
	ctx.reply(
		"Launch mini app from inline keyboard!",
		Markup.inlineKeyboard([Markup.button.webApp("Launch", WEB_APP_URL)]),
	),
);

bot.on("inline_query", ctx =>
	ctx.answerInlineQuery([], {
		button: { text: "Launch", web_app: { url: WEB_APP_URL } },
	}),
);

bot.command("link", ctx =>
	ctx.reply(link("chat_link", "https://t.me/secret_message_game_bot/miniapp?startapp=secret_message_game")),
);

bot.command("setmenu", ctx =>
	// sets Web App as the menu button for current chat
	ctx.setChatMenuButton({
		text: "Launch",
		type: "web_app",
		web_app: { url: WEB_APP_URL },
	}),
);

bot.command("keyboard", ctx =>
	ctx.reply(
		"Launch mini app from keyboard!",
		Markup.keyboard([Markup.button.webApp("Launch", WEB_APP_URL)]).resize(),
	),
);

async function setupWebhook(){
	expressApp.use(await bot.createWebhook({ domain: process.env.WEBHOOK_DOMAIN!, path: process.env.BOT_API_PATH! }));
}
setupWebhook();

const port = process.env.PORT || 3000; // Fallback to 3000 if PORT is not in environment
expressApp.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

expressApp.get('/', (req, res) => {
	res.send('Hello World!')
	})



