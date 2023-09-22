import path from 'path';

import dotenv from 'dotenv';

export const ROOT_ENV_PATH = path.resolve(__dirname, '..', '.env');

dotenv.config({path: ROOT_ENV_PATH});

export const telegramBotToken = process.env.E2E_TELEGRAM_BOT_TOKEN || '';

export const buildVersion = process.env.E2E_BUILD_VERSION || 'unknown';

export const shouldRunYTConnectionTest = ['1', 'true', true].includes(
    process.env.E2E_ENABLE_YT_TEST || '',
);
