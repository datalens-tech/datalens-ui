import {SelectQa} from '@gravity-ui/uikit';
import {ElementHandle, Page, expect} from '@playwright/test';
import dotenv from 'dotenv';
import moment from 'moment';
import path from 'path';

import {ActionPanelQA, EntryDialogQA} from '../../src/shared';
import {ActionPanelEntryContextMenuQa} from '../../src/shared/constants/qa/action-panel';
export * from './helpers';

export const ROOT_ENV_PATH = path.resolve(__dirname, '..', '..', '.env');

dotenv.config({path: ROOT_ENV_PATH});

// A method to simplify writing playwright selectors (see https://playwright.dev/docs/api/class-selectors /)
// Example to click on a node:
// <div data-qa="node-key">
// in the test, using the slct helper, it is enough to write page.click(slct('node-key'))
// If the second argument is passed, the selection takes place not only by the selector, but also by the text content
// nodes. Example:
// <div data-qa="node-key">foo</div>
// <div data-qa="node-key">bar</div>
// <div data-qa="node-key">baz</div>
// To click on a node with the text "bar", write page.click(slct('node-key', 'bar'))
export const slct = (nodeAnchorKey: string, text?: string) => {
    if (text) {
        return `[data-qa="${nodeAnchorKey}"] >> text="${text}"`;
    } else {
        return `[data-qa="${nodeAnchorKey}"]`;
    }
};

// A method to simplify writing playwright selectors (see https://playwright.dev/docs/api/class-selectors /)
// <div className="node-key">
// in the test, using the slct helper, it is enough to write page.click(cssSlct('node-key'))
// If the second argument is passed, the selection takes place not only by the selector, but also by the text content
// nodes. Example:
// <div className="node-key">foo</div>
// <div className="node-key">bar</div>
// <div className="node-key">baz</div>
// To click on a node with the text "bar", write page.click(cssSlct('node-key', 'bar'))
export const cssSlct = (nodeAnchorKey: string, text?: string) => {
    if (text) {
        return `.data-qa-${nodeAnchorKey} >> text="${text}"`;
    } else {
        return `.data-qa-${nodeAnchorKey}`;
    }
};

// Delete the entity on the page where the test is being performed. You need to delete the entities created by the tests so that they do not block navigation.
export async function deleteEntity(page: Page, url?: string) {
    const moreButton = page.locator(slct(ActionPanelQA.MoreBtn));
    await expect(moreButton).toBeVisible();
    await moreButton.click();

    const menuItemRemove = page
        .locator(slct(ActionPanelEntryContextMenuQa.Menu))
        .locator(slct(ActionPanelEntryContextMenuQa.Remove));
    await expect(menuItemRemove).toBeVisible();
    await menuItemRemove.click();

    const applyButton = page.locator(slct(EntryDialogQA.Apply));
    await expect(applyButton).toBeVisible();

    if (url) {
        await Promise.all([page.waitForURL(() => page.url().includes(url)), applyButton.click()]);
    } else {
        await Promise.all([page.waitForNavigation(), applyButton.click()]);
    }
}

export async function copyEntity(page: Page, entryName: string) {
    await page.waitForSelector(slct(ActionPanelQA.MoreBtn));
    await page.click(slct(ActionPanelQA.MoreBtn));
    await page.waitForSelector(
        `${slct(ActionPanelEntryContextMenuQa.Menu)} ${slct(ActionPanelEntryContextMenuQa.Copy)}`,
    );
    await page.click(
        `${slct(ActionPanelEntryContextMenuQa.Menu)} ${slct(ActionPanelEntryContextMenuQa.Copy)}`,
    );
    await page.waitForSelector(slct(EntryDialogQA.Apply));

    await page.fill('.dl-entry-dialog-base__content .yc-text-input__control_type_input', entryName);

    await Promise.all([page.waitForNavigation(), page.click(slct(EntryDialogQA.Apply))]);
}

// Log in after redirecting the passport page, the second argument = true if with the rights of a superuser
export async function makeLogIn(page: Page, asSuperuser?: boolean) {
    await page.waitForSelector('input[name=login]');
    await page.type('input[name=login]', process.env.E2E_USER_LOGIN as string);

    await page.waitForSelector('input[name=passwd]');
    await page.type('input[name=passwd]', process.env.E2E_USER_PASSWORD as string);

    await Promise.all([page.waitForNavigation(), page.click('button[type=submit]')]);

    if (asSuperuser) {
        // installing a super-user mod
        await setSuperUserMode(page);
    }
}

// Fill in the input with the name of the entity being created in the EntryDialog (the dialog that appears when saving entities) and click the "Create" button
export async function entryDialogFillAndSave(page: Page, entryName: string) {
    // waiting for the save dialog to open
    const entryDialog = await page.waitForSelector(slct('entry-dialog-content'));
    const entryDialogInput = await entryDialog!.waitForSelector('[data-qa=path-select] input');
    // filling in the input
    await entryDialogInput!.fill(entryName);

    // save
    await page.click(slct(EntryDialogQA.Apply));
}

function getFullUrl(url: string) {
    const formattedUrl = url.startsWith('/') ? url : `/${url}`;
    return new URL(`${process.env.E2E_DOMAIN}${formattedUrl}`);
}

// Go to url by passing only pathname
export async function goto(
    page: Page,
    url: string,
    options: {isRetry: boolean} = {
        isRetry: false,
    },
) {
    const fullUrl = getFullUrl(url);

    await page.goto(fullUrl.toString());

    const hostname = await page.evaluate(() => window.location.hostname);

    const CONTAINER_HOSTNAME = process.env.CONTAINER_HOSTNAME;

    if (typeof CONTAINER_HOSTNAME !== 'undefined' && hostname === CONTAINER_HOSTNAME) {
        if (options.isRetry) {
            throw new Error(`Datalens is unavailable: ${fullUrl.toString()}`);
        }

        await page.waitForTimeout(5 * 1000);
        await goto(page, url, {isRetry: true});
    }
}

// Get the full address by passing pathname, hostname will connect depending on the value of the environment variable
// toLowerCase is needed because E2E_DOMAIN can have capital letters if they are in the branch name
export function getAddress(url: string) {
    return `${process.env.E2E_DOMAIN}${url}`.toLowerCase();
}

export function getUniqueTimestamp() {
    const randomSuffix = Math.floor(Math.random() * 100);
    return `${moment(moment.now()).format('DD.MM.YYYY HH:mm:ss.SS')} ${randomSuffix}`;
}

export async function clickSelectOption(page: Page, key: string, optionText: string) {
    await page.click(slct(key));
    await page.click(`css=[data-qa=${key}-items] * >> text=${optionText}`);
}

export async function clickGSelectOption({
    page,
    key,
    ...args
}: {page: Page; key: string; optionText: string} | {page: Page; key: string; optionQa: string}) {
    await page.click(slct(key));
    if ('optionText' in args) {
        await page.click(`css=[data-qa=${SelectQa.LIST}] >> text=${args.optionText}`);
    } else {
        await page.click(slct(args.optionQa));
    }
}

export async function clickDropDownOption(page: Page, optionQa: string) {
    await page.click(slct(optionQa));
}

export async function setCookie(page: Page, name: string, value: string, days: number) {
    await page.evaluate(
        ({name, value, days}: {name: string; value: string; days: number}) => {
            let expires = '';
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

                expires = '; expires=' + date.toUTCString();
            }

            document.cookie = name + '=' + (value || '') + expires + '; path=/';
        },
        {
            name,
            value,
            days,
        },
    );
}

// Get a link to the control node from Chartkit by its title
export async function getControlByTitle(
    page: Page,
    controlTitle: string,
): Promise<ElementHandle<HTMLElement>> {
    const controlTitleElement = await page.$(slct('chartkit-control-title', controlTitle));
    const control = await controlTitleElement!.getProperty('parentNode');

    return control as ElementHandle<HTMLElement>;
}

export async function getParentByQARole(
    element: ElementHandle<SVGElement | HTMLElement> | null,
    qaRole: string,
): Promise<ElementHandle<SVGElement | HTMLElement> | null> {
    while (element) {
        element = await element.$('xpath=..');

        if (element) {
            const attribute = await element.getAttribute('data-qa');

            if (attribute === qaRole) {
                return element;
            }
        }
    }

    return element;
}

export async function setSuperUserMode(page: Page) {
    await setCookie(page, 'dl_superuser_switch_mode', 'enable', 0);
}

export const waitForCondition = async <T>(callback: () => Promise<T>) => {
    const attempts = 30;
    const attemptTimeout = 1000;

    for (let i = 0; i < attempts; i++) {
        const result = await callback();

        if (result) {
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, attemptTimeout));
    }

    throw new Error(`waitForCondition timeout, failedFunction is: ${callback.toString()}`);
};

export const generateQueryString = (queryMap: Record<string, string>) => {
    const searchParams = new URLSearchParams();

    Object.entries(queryMap).forEach(([key, value]) => {
        searchParams.set(key, value);
    });

    return searchParams.toString();
};

export const openTestPage = async (page: Page, url: string, queryMap?: Record<string, string>) => {
    const {pathname, searchParams} = getFullUrl(url);
    const query = generateQueryString({...Object.fromEntries(searchParams), ...queryMap});

    const fullUrl = query ? `${pathname}?${query}` : url;

    await goto(page, fullUrl, {isRetry: false});
};
