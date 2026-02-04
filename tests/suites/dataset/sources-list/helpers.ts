import {Page} from '@playwright/test';

export const mockResponseBody = async <T extends Record<string, any>>({
    page,
    url,
    body,
    times,
    reauestDelay = 300,
}: {
    page: Page;
    url: string;
    body: T | (() => T);
    times?: number;
    reauestDelay?: number;
}) => {
    await page.route(
        url,
        async (route) => {
            await new Promise((resolve) => setTimeout(resolve, reauestDelay));
            const payload = typeof body === 'function' ? body() : body;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(payload),
            });
        },
        {times},
    );
};
