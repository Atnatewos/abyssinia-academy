/**
 * @fileoverview Telegram Bot Helper Library
 * Sends messages, formats text, builds inline keyboards.
 * Path: apps/web/lib/telegram.js
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Send a text message to a Telegram chat
 */
const sendMessage = async (chatId, text, options = {}) => {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...options,
    }),
  });
  return response.json();
};

/**
 * Send a message with inline keyboard buttons
 */
const sendMessageWithKeyboard = async (chatId, text, buttons) => {
  return sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: buttons,
    },
  });
};

/**
 * Answer a callback query (inline button press)
 */
const answerCallback = async (callbackQueryId, text) => {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    }),
  });
};

/**
 * Format currency in ETB
 */
const formatCurrency = (amount) => {
  return `${(amount || 0).toLocaleString()} ETB`;
};

/**
 * Escape HTML characters for Telegram
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

module.exports = {
  sendMessage,
  sendMessageWithKeyboard,
  answerCallback,
  formatCurrency,
  escapeHtml,
};
