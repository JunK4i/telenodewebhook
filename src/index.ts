import { Telegraf } from "telegraf";
import dotenv from "dotenv";
dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.on("text", ctx => ctx.reply("Hello"));

// Start webhook via launch method (preferred)
bot
	.launch({ webhook: { domain: process.env.WEBHOOK_DOMAIN!, port: Number(process.env.PORT) } })
	.then(() => console.log("Webhook bot listening on port", Number(process.env.PORT)));