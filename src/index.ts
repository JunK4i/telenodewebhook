import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN!)

const WEB_APP_URL = "https://feathers.studio/telegraf/webapp/example";
;

bot.command("inlinekb", ctx =>
	ctx.reply(
		"Launch mini app from inline keyboard!",
		Markup.inlineKeyboard([Markup.button.webApp("Launch", WEB_APP_URL)]),
	),
);

// Start webhook via launch method (preferred)
bot
	.launch({ webhook: { domain: process.env.WEBHOOK_DOMAIN!, port: Number(process.env.PORT) } })
	.then(() => console.log("Webhook bot listening on port", Number(process.env.PORT)));

