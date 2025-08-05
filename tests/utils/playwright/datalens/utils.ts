import {URL} from 'url';

import type {AuthenticateArgs, AuthenticateCheckArgs} from './types';
import {AUTH_TYPE} from '../constants';

import {SignInQa} from '../../../../src/shared/constants';

import {slct} from '../..';

export async function isAuthenticated(args: AuthenticateCheckArgs) {
    const {page, baseUrl, authUrl, authType} = args;

    let updateAuthUrl = `${baseUrl}/auth/signin`;
    if (authType !== AUTH_TYPE.DATALENS) {
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

export async function authenticate(args: AuthenticateArgs) {
    const {
        page,
        baseUrl,
        authUrl,
        authType,
        storageState,
        login,
        password,
        afterAuth,
        retryCount,
        force,
    } = args;

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

        const url = `${baseUrl}/auth/signin`;

        await page.goto(url);

        await page.waitForSelector(slct(SignInQa.SIGN_IN_FORM));
        await page.fill(`${slct(SignInQa.INPUT_LOGIN)} input`, login);
        await page.fill(`${slct(SignInQa.INPUT_PASSWORD)} input`, password);

        const promiseResponse = page.waitForResponse((response) => response.ok(), {
            timeout: 10 * 1000,
        });
        await page.click('button[type=submit]');

        await promiseResponse;

        await page.context().storageState({path: storageState || 'artifacts/storageState.json'});

        await page.goto(baseUrl, {waitUntil: 'load'});

        expect(page.url()).toContain(baseUrl);

        if (afterAuth) {
            await afterAuth({page});
        }
    }
}
