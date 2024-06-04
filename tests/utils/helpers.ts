import {Page} from '@playwright/test';

import {slct, waitForCondition} from './index';

export const getStylesFromString = (string = '') => {
    return string
        .split(';')
        .filter(Boolean)
        .reduce(
            (acc, pair) => {
                const [key, value] = pair.split(':').map((val) => val.trim());
                acc[key.trim()] = value;
                return acc;
            },
            {} as Record<string, string>,
        );
};

export const mapColorsAndShapes = (colors: string[], shapes: string[]) => {
    return colors.map((color, index) => ({
        color,
        shape: shapes[index],
    }));
};

export const getXAxisValues = async (page: Page): Promise<(string | null)[]> => {
    return await page.evaluate(() => {
        const xAxisValues = document.querySelector('.highcharts-xaxis-labels');
        if (xAxisValues) {
            const childrenElements = Array.from(xAxisValues.children);
            return childrenElements
                .sort((a, b) => {
                    const firstElAttributes = a.attributes;
                    const secondElAttributes = b.attributes;

                    const firstElValue = firstElAttributes.getNamedItem('x')?.value || '';
                    const secondElValue = secondElAttributes.getNamedItem('x')?.value || '';

                    const parsedFirstValue = parseFloat(firstElValue);
                    const parsedSecondValue = parseFloat(secondElValue);

                    return parsedFirstValue - parsedSecondValue;
                })
                .map((el) => el.textContent);
        }
        return [];
    });
};

type WaitForValidSearchParamsArgs = {
    page: Page;
    error: string;
    shouldIncludeParam: boolean;
    param: string;
};

export async function waitForValidSearchParams({
    page,
    error,
    param,
    shouldIncludeParam,
}: WaitForValidSearchParamsArgs) {
    await waitForCondition(async () => {
        const search = (await page.evaluate('document.location.search')) as string;
        const searchParams = new URLSearchParams(search);
        if (shouldIncludeParam) {
            return searchParams.get(param);
        } else {
            return !searchParams.get(param);
        }
    }).catch(() => {
        throw new Error(error);
    });
}

export const hoverTooltip = async (page: Page, chartId: string) => {
    const chartkitBody = slct(`chartkit-body-entry-${chartId}`);

    await page.hover(chartkitBody);

    const plot = (await page.$(chartkitBody))!;
    const plotBox = (await plot.boundingBox())!;

    await page.mouse.move(plotBox.x + plotBox.width / 4, plotBox.y + plotBox.height / 4);
    await page.hover(chartkitBody);
};

export async function isEnabledFeature(page: Page, featureName: string) {
    // problems with fair DL imports, that's why using evaluate window
    const isDynamicFeature = await page.evaluate(`window.DL.dynamicFeatures?.${featureName}`);
    const isFeature = await page.evaluate(`window.DL.features?.${featureName}`);
    return Boolean(typeof isDynamicFeature === 'undefined' ? isFeature : isDynamicFeature);
}
