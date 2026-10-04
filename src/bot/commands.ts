import type { Bot } from 'grammy';
import { config } from '../config/config';
import {
  mainInlineKeyboard,
  mainMenuKeyboard,
  matchesKeyboard,
  predictionsKeyboard,
  statsKeyboard,
  premiumKeyboard,
  contactKeyboard,
} from './keyboards';

/**
 * Safely formats a match time string for display.
 */
function formatTime(time: string): string {
  return time.length >= 5 ? time.slice(0, 5) : time;
}

export function registerCommands(bot: Bot): void {
  // /start -------------------------------------------------------------
  bot.command('start', async (ctx) => {
    const firstName = ctx.from?.first_name ?? 'there';

    const text =
      `🔥 *Welcome to Amiros Football Analytics*, ${firstName}!\n\n` +
      `Professional football match analysis, statistical insights and daily prediction content.\n\n` +
      `🏆 Today's Matches\n` +
      `📊 Match Analysis\n` +
      `🔥 Predictions\n` +
      `📈 Statistics\n\n` +
      `Use the buttons below to explore today's content.\n\n` +
      `_All content is statistical analysis only — no outcome is guaranteed._`;

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: mainMenuKeyboard(),
    });

    await ctx.reply('Open the Mini App or tap a section below 👇', {
      reply_markup: mainInlineKeyboard(),
    });
  });

  // /help --------------------------------------------------------------
  bot.command('help', async (ctx) => {
    const text =
      `*Amiros Football Analytics — Help*\n\n` +
      `Available features:\n\n` +
      `🏆 /matches — Today's available matches\n` +
      `🔥 /predictions — Prediction categories and selections\n` +
      `📊 /stats — Statistical information\n` +
      `⭐ /premium — Premium analysis details\n` +
      `📢 /channel — Join our Telegram channel\n` +
      `📞 /contact — Contact the administrator (@${config.adminUsername})\n\n` +
      `Everything is served inside the Mini App — tap the 🚀 button to open it.`;

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: mainInlineKeyboard(),
    });
  });

  // /matches -----------------------------------------------------------
  bot.command('matches', async (ctx) => {
    const text =
      `🏆 *Today's Matches*\n\n` +
      `Open the Mini App to see today's fixtures, recent form, predictions and full analysis.`;

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: matchesKeyboard(),
    });
  });

  // /predictions -------------------------------------------------------
  bot.command('predictions', async (ctx) => {
    const text =
      `🔥 *Today's Predictions*\n\n` +
      `Available categories:\n` +
      `• Match Result\n` +
      `• Double Chance\n` +
      `• Over / Under\n` +
      `• Both Teams To Score\n\n` +
      `Open the Mini App to browse today's selections with reasoning and confidence levels.\n\n` +
      `_Analysis only — no outcome is guaranteed._`;

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: predictionsKeyboard(),
    });
  });

  // /stats -------------------------------------------------------------
  bot.command('stats', async (ctx) => {
    const text =
      `📊 *Statistics*\n\n` +
      `Access recent form, goals scored & conceded, average goals, home/away performance, ` +
      `BTTS trends, Over/Under trends, expected goals and possession.\n\n` +
      `Open the Mini App to view the statistics section.`;

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: statsKeyboard(),
    });
  });

  // /premium -----------------------------------------------------------
  bot.command('premium', async (ctx) => {
    const text =
      `⭐ *Premium Analysis*\n\n` +
      `Access deeper match analysis, additional statistical insights and premium prediction content.\n\n` +
      `Contact the administrator (@${config.adminUsername}) to request access.\n\n` +
      `_Analysis only — no guaranteed wins, no guaranteed income, no guaranteed returns._`;

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: premiumKeyboard(),
    });
  });

  // /channel -----------------------------------------------------------
  bot.command('channel', async (ctx) => {
    const text =
      `📢 *Join our Telegram channel*\n\n` +
      `Get daily updates, notifications and additional football insight content.\n\n` +
      `https://t.me/${config.channelUsername}`;

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📢 Join Channel', url: `https://t.me/${config.channelUsername}` }],
        ],
      },
    });
  });

  // /contact -----------------------------------------------------------
  bot.command('contact', async (ctx) => {
    const text =
      `📞 *Contact Admin*\n\n` +
      `For questions, support or premium analysis access, contact our administrator.\n\n` +
      `Username: @${config.adminUsername}`;

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: contactKeyboard(),
    });
  });
}

export { formatTime };
