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
	/*
		Go to @Botfather and create a new app for your bot first, using /newapp
		Then modify this link appropriately.
	
		startapp is optional.
		If provided, it will be passed as start_param in initData
		and as ?tgWebAppStartParam=$command in the Web App URL
	*/
	ctx.reply(link("Launch", "https://t.me/$botname/$appname?startapp=$command")),
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

// bot
// 	.launch({ webhook: { domain: process.env.WEBHOOK_DOMAIN!, port: Number(process.env.PORT), hookPath: process.env.BOT_API_PATH!} })
// 	.then(() => console.log("Webhook bot listening on port", Number(process.env.PORT)));

expressApp.use(bot.webhookCallback(process.env.BOT_API_PATH));
bot.telegram.setWebhook(`${process.env.WEBHOOK_DOMAIN}:${process.env.PORT}/${process.env.BOT_API_PATH}`)
expressApp.get('/', (req, res) => {
	res.send('Hello World!')
	})
expressApp.listen(3000, () => {
console.log('Example app listening on port 3000')
	})