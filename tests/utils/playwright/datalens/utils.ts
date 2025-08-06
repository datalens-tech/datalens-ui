import {URL} from 'url';

import type {AuthenticateArgs, AuthenticateCheckArgs} from '../types';
import {AUTH_TYPE} from '../constants';

import {SignInQa} from '../../../../src/shared/constants';

import {slct} from '../..';

export async function isAuthenticated(args: AuthenticateCheckArgs) {
    const {page, baseUrl, authUrl, authType} = args;

    let updateAuthUrl = `${baseUrl}/auth/signin`;
    if (authType === AUTH_TYPE.PASSPORT) {
        updateAuthUrl = `${authUrl}/auth/update?retpath=${baseUrl}`;
    }

    const response = await page.goto(updateAuthUrl, {waitUntil: 'networkidle'});

    if (!response) {
        return false;
    }

    const {hostname: targetHostname} = new URL(updateAuthUrl);
    const {hostname: actualHostname} = new URL(response.url());

    // if we have been redirected away from auth, most likely we're already authenticated
    return targetHostname !== actualHostname;
}

const authenticatePassport = async (args: AuthenticateArgs) => {
    const {page, baseUrl, authUrl, login, password, storageState} = args;

    const retPath = encodeURIComponent(baseUrl);
    if (!authUrl) {
        throw new Error(
            'Environment variable [E2E_PASSPORT_URL] is required for passport authentication',
        );
    }
    const url = `${authUrl}/auth?mode=password&retpath=${retPath}?skipPromo=true`;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const html = `
                <html>
                    <form method="POST" id="authForm" action="${url}">
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

    const promiseResponse = page.waitForResponse(
        async (response) => {
            // wait for a 200 ok response after all redirects and check the url
            // if we have been redirected away from the auth page, most likely we're already authenticated
            // if we are still on the auth page, it means there is an authentication credential error
            if (response.url().startsWith(authUrl) && response.status() === 200) {
                // eslint-disable-next-line no-console
                console.log('Auth error, check credentials...');
                throw new Error(
                    JSON.stringify(
                        {
                            url: response.url(),
                        },
                        null,
                        2,
                    ),
                );
            }
            return response.ok();
        },
        {
            timeout: 15 * 1000,
        },
    );
    await page.click('button');

    await promiseResponse;

    // eslint-disable-next-line no-console
    console.log('Auth check: ok');

    await page.context().storageState({path: storageState || 'artifacts/storageState.json'});

    await page.waitForLoadState(); // need for prevent fast double goto

    await Promise.all([page.goto(baseUrl), page.waitForURL(baseUrl)]);
};

const authenticateDataLens = async (args: AuthenticateArgs) => {
    const {page, baseUrl, login, password, storageState} = args;

    const url = `${baseUrl}/auth/signin`;

    await page.goto(url);

    await page.waitForSelector(slct(SignInQa.SIGN_IN_FORM));
    await page.fill(`${slct(SignInQa.INPUT_LOGIN)} input`, login);
    await page.fill(`${slct(SignInQa.INPUT_PASSWORD)} input`, password);

    const promiseResponse = page.waitForResponse(
        async (response) => {
            if (response.url().endsWith('/auth/signin') && response.status() === 403) {
                // eslint-disable-next-line no-console
                console.log('Auth error, check credentials...');
                const error = await response.json();
                throw new Error(JSON.stringify(error, null, 2));
            }
            return response.ok();
        },
        {
            timeout: 10 * 1000,
        },
    );
    await page.click('button[type=submit]');

    await promiseResponse;

    // eslint-disable-next-line no-console
    console.log('Auth check: ok');

    await page.context().storageState({path: storageState || 'artifacts/storageState.json'});

    await page.waitForURL((u) => u.href !== url);
};

export async function authenticate(args: AuthenticateArgs) {
    const {page, baseUrl, authUrl, authType, afterAuth, customAuth, retryCount, force} = args;

    for (let retry = 0; retry < retryCount; retry += 1) {
        const authenticated = await isAuthenticated({
            page,
            baseUrl,
            authUrl,
            authType,
        });

        if (authenticated && !force) {
            return;
        }

        if (authType === AUTH_TYPE.PASSPORT) {
            await authenticatePassport(args);
        } else if (authType === AUTH_TYPE.DATALENS) {
            await authenticateDataLens(args);
        } else if (authType === AUTH_TYPE.CUSTOM && customAuth) {
            await customAuth(args);
        }

        if (afterAuth) {
            await afterAuth({page});
        }
    }
}
