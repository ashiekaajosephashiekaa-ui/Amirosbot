import type { Bot } from 'grammy';
import { config } from '../config/config';
import {
  contactKeyboard,
  mainInlineKeyboard,
  matchesKeyboard,
  predictionsKeyboard,
  premiumKeyboard,
  statsKeyboard,
} from './keyboards';

/**
 * Handles inline-button callbacks and reply-keyboard button presses.
 * Text messages sent from the persistent reply keyboard are routed here too.
 */
export function registerHandlers(bot: Bot): void {
  // Inline callback buttons -------------------------------------------
  bot.callbackQuery('cmd:home', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText('Open the Mini App or tap a section below 👇', {
      reply_markup: mainInlineKeyboard(),
    });
  });

  bot.callbackQuery('cmd:matches', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `🏆 *Today's Matches*\n\nOpen the Mini App to see today's fixtures with recent form, predictions and full analysis.`,
      { parse_mode: 'Markdown', reply_markup: matchesKeyboard() },
    );
  });

  bot.callbackQuery('cmd:predictions', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `🔥 *Today's Predictions*\n\nOpen the Mini App to browse selections with reasoning and confidence.\n\n_No outcome is guaranteed._`,
      { parse_mode: 'Markdown', reply_markup: predictionsKeyboard() },
    );
  });

  bot.callbackQuery('cmd:stats', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `📊 *Statistics*\n\nOpen the Mini App to view form, goals, possession, xG and trend metrics.`,
      { parse_mode: 'Markdown', reply_markup: statsKeyboard() },
    );
  });

  bot.callbackQuery('cmd:premium', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `⭐ *Premium Analysis*\n\nAccess deeper analysis and premium prediction content.\n\nContact @${config.adminUsername} for access.`,
      { parse_mode: 'Markdown', reply_markup: premiumKeyboard() },
    );
  });

  bot.callbackQuery('cmd:contact', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `📞 *Contact Admin*\n\nAdministrator: @${config.adminUsername}`,
      { parse_mode: 'Markdown', reply_markup: contactKeyboard() },
    );
  });

  // Reply-keyboard button text ----------------------------------------
  bot.hears("🏆 Today's Matches", async (ctx) => {
    await ctx.reply(
      `🏆 *Today's Matches*\n\nOpen the Mini App to see today's fixtures with recent form, predictions and full analysis.`,
      { parse_mode: 'Markdown', reply_markup: matchesKeyboard() },
    );
  });

  bot.hears('🔥 Predictions', async (ctx) => {
    await ctx.reply(
      `🔥 *Today's Predictions*\n\nOpen the Mini App to browse selections with reasoning and confidence.`,
      { parse_mode: 'Markdown', reply_markup: predictionsKeyboard() },
    );
  });

  bot.hears('📊 Statistics', async (ctx) => {
    await ctx.reply(
      `📊 *Statistics*\n\nOpen the Mini App to view the statistics section.`,
      { parse_mode: 'Markdown', reply_markup: statsKeyboard() },
    );
  });

  bot.hears('⭐ Premium Analysis', async (ctx) => {
    await ctx.reply(
      `⭐ *Premium Analysis*\n\nAccess deeper analysis and premium content. Contact @${config.adminUsername} for details.`,
      { parse_mode: 'Markdown', reply_markup: premiumKeyboard() },
    );
  });

  bot.hears('📢 Join Channel', async (ctx) => {
    await ctx.reply(
      `📢 *Join our channel*\n\nhttps://t.me/${config.channelUsername}`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📢 Join Channel', url: `https://t.me/${config.channelUsername}` }],
          ],
        },
      },
    );
  });

  bot.hears('📞 Contact Admin', async (ctx) => {
    await ctx.reply(
      `📞 *Contact Admin*\n\nAdministrator: @${config.adminUsername}`,
      { parse_mode: 'Markdown', reply_markup: contactKeyboard() },
    );
  });

  // Fallback ----------------------------------------------------------
  bot.on('message:text', async (ctx) => {
    await ctx.reply('Use the buttons below to explore the Mini App 👇', {
      reply_markup: mainInlineKeyboard(),
    });
  });
}
