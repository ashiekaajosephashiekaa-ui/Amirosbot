import { InlineKeyboard } from 'grammy';
import type { ReplyKeyboardMarkup } from 'grammy/types';
import { adminChatUrl, channelUrl, config, isMiniAppUrlConfigured } from '../config/config';

/**
 * Persistent reply keyboard shown under the message input field.
 * Return type is explicit and mutable so grammY accepts it.
 */
export function mainMenuKeyboard(): ReplyKeyboardMarkup {
  return {
    keyboard: [
      [{ text: "🏆 Today's Matches" }, { text: '🔥 Predictions' }],
      [{ text: '📊 Statistics' }, { text: '⭐ Premium Analysis' }],
      [{ text: '📢 Join Channel' }, { text: '📞 Contact Admin' }],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

/**
 * Inline keyboard with the primary "Open Mini App" button plus quick actions.
 * The Mini App button is only added when WEB_APP_URL is a valid HTTPS URL.
 */
export function mainInlineKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();

  if (isMiniAppUrlConfigured) {
    kb.webApp('🚀 Open Mini App', config.webAppUrl).row();
  }

  kb.text("🏆 Today's Matches", 'cmd:matches').row();
  kb.text('🔥 Predictions', 'cmd:predictions')
    .text('📊 Statistics', 'cmd:stats')
    .row();
  kb.text('⭐ Premium Analysis', 'cmd:premium').row();
  kb.url('📢 Join Channel', channelUrl).row();
  kb.url('📞 Contact Admin', adminChatUrl);

  return kb;
}

export function matchesKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🔥 View Predictions', 'cmd:predictions')
    .row()
    .url('📢 Join Channel', channelUrl)
    .text('📞 Contact Admin', 'cmd:contact');
}

export function predictionsKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🏆 View Matches', 'cmd:matches')
    .row()
    .url('📢 Join Channel', channelUrl)
    .text('📞 Contact Admin', 'cmd:contact');
}

export function statsKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🏆 Today's Matches", 'cmd:matches')
    .row()
    .url('📢 Join Channel', channelUrl)
    .text('📞 Contact Admin', 'cmd:contact');
}

export function premiumKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (isMiniAppUrlConfigured) {
    kb.webApp('⭐ View Premium in Mini App', config.webAppUrl).row();
  }
  kb.url('📞 Contact Admin', adminChatUrl)
    .url('📢 Join Channel', channelUrl);
  return kb;
}

export function contactKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .url('💬 Message @' + config.adminUsername, adminChatUrl)
    .row()
    .url('📢 Join Channel', channelUrl)
    .text('🏠 Main Menu', 'cmd:home');
}

export function backToMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('🏠 Main Menu', 'cmd:home');
}
