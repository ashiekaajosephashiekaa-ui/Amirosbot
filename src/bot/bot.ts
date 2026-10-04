import { Bot } from 'grammy';
import { config, isBotConfigured } from '../config/config';
import { registerCommands } from './commands';
import { registerHandlers } from './handlers';

let botInstance: Bot | null = null;
let started = false;

export function createBot(): Bot | null {
  if (!isBotConfigured) {
    console.warn('[bot] BOT_TOKEN is not set — Telegram bot will not start.');
    return null;
  }
  if (botInstance) return botInstance;

  const bot = new Bot(config.botToken);

  bot.catch((error) => {
    console.error('[bot] handler error:', error.error);
  });

  registerCommands(bot);
  registerHandlers(bot);

  botInstance = bot;
  return bot;
}

/**
 * Starts long polling. Safe to call once.
 * If WEB_APP_URL is set, we also register the persistent Mini App menu button
 * so users can open the Mini App from any chat with the bot.
 */
export async function startBot(): Promise<void> {
  if (started) return;
  const bot = createBot();
  if (!bot) return;

  try {
    // Best-effort: register the persistent menu button for Mini App access.
    if (config.webAppUrl) {
      try {
        await bot.api.setChatMenuButton({
          menu_button: {
            type: 'web_app',
            text: 'Open Mini App',
            web_app: { url: config.webAppUrl },
          },
        });
      } catch (error) {
        console.warn('[bot] could not set chat menu button:', error);
      }
    }

    // Best-effort: register commands so they appear in the Telegram UI.
    try {
      await bot.api.setMyCommands([
        { command: 'start', description: 'Start / open the Mini App' },
        { command: 'help', description: 'Show available features' },
        { command: 'matches', description: "Today's matches" },
        { command: 'predictions', description: "Today's predictions" },
        { command: 'stats', description: 'Statistics' },
        { command: 'premium', description: 'Premium analysis' },
        { command: 'channel', description: 'Join our Telegram channel' },
        { command: 'contact', description: 'Contact the administrator' },
      ]);
    } catch (error) {
      console.warn('[bot] could not set commands:', error);
    }

    // Do not await — long polling runs forever.
    bot.start({
      onStart: () => {
        console.log('[bot] Telegram bot is running (long polling).');
      },
    });
    started = true;
  } catch (error) {
    console.error('[bot] failed to start:', error);
  }
}

export function stopBot(): void {
  if (!botInstance) return;
  try {
    botInstance.stop();
  } catch (error) {
    console.error('[bot] failed to stop cleanly:', error);
  } finally {
    botInstance = null;
    started = false;
  }
}
