//next-i18next.config.js
/**
 * @type {import('next-i18next').UserConfig}
 */

export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'zh-CN', 'zh-Hant'],
  localeDetection: false
};
export const localePath = typeof window === 'undefined' ? require('path').resolve('../../packages/web/i18n') : '/i18n';
export const reloadOnPrerender = process.env.NODE_ENV === 'development';
