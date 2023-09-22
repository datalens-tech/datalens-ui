import urlUtils from 'url';

import {Page} from '@playwright/test';

import {goToWithRetry} from '../utils';

export async function isAuthenticated(page: Page, baseUrl: string, passportUrl: string) {
    const updateAuthUrl = `${passportUrl}/auth/update?retpath=${baseUrl}`;
    const response = await page.goto(updateAuthUrl, {waitUntil: 'networkidle'});

    if (!response) {
        return false;
    }

    const {hostname: targetHostname} = urlUtils.parse(updateAuthUrl);
    const {hostname: actualHostname} = urlUtils.parse(response.url());
    // if we have been redirected away from passport, most likely we're already authenticated
    return targetHostname !== actualHostname;
}

type AuthenticateRobotArgs = {
    page: Page;
    baseUrl: string;
    passportUrl: string;
    login: string;
    password: string;
    retryCount: number;
    afterAuth?: (args: {page: Page}) => Promise<void>;
};

export async function authenticate(args: AuthenticateRobotArgs) {
    const {page, baseUrl, passportUrl, login, password, afterAuth, retryCount} = args;
    try {
        const authenticated = await isAuthenticated(page, baseUrl, passportUrl);
        if (!authenticated) {
            const authUrl = `${passportUrl}/auth?mode=password&retpath=${encodeURIComponent(
                baseUrl,
            )}?skipPromo=true`;

            const timestamp = Math.round(new Date().getTime() / 1000);
            const html = `
                <html>
                    <form method="POST" id="authForm" action="${authUrl}">
                        <input name="login" value="${login}">
                        <input type="password" name="passwd" value="${password}">
                        <input type="checkbox" name="twoweeks" value="no">
                        <input type="hidden" name="timestamp" value="${timestamp}">
                        <button type="submit">Login</button>
                    </form>
                <html>
            `;
            await page.setContent(html);
            await page.waitForSelector('#authForm');
            await page.click('button');

            await page.waitForResponse((response) => response.ok());

            await page.context().storageState({path: 'artifacts/storageState.json'});

            await goToWithRetry(page, `${baseUrl}?skipPromo=true`);

            if (afterAuth) {
                await afterAuth({page});
            }
        }
    } catch (error) {
        if (retryCount > 0) {
            console.log('Auth retry');
            await authenticate({...args, retryCount: retryCount - 1});
        } else {
            // first of all, check for holes before baseUrl, if it falls in this place
            console.error('AUTHENTICATION_FAILED', error);
            throw error;
        }
    }
}
