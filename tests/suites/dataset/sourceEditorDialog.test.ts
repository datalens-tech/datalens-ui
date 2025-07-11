import {Page, expect} from '@playwright/test';

import {CommonSelectors} from '../../page-objects/constants/common-selectors';
import {openTestPage, slct} from '../../utils';
import datalensTest from '../../utils/playwright/globalTestDefinition';
import {RobotChartsDatasetUrls} from '../../utils/constants';

const checkSourceType = async (page: Page, expectedSourceType: string) => {
    const promise = page.waitForRequest(/validateDataset/, {
        timeout: 2000,
    });
    await page.click('.g-dialog-footer__button_action_apply');
    await page.waitForTimeout(1000);

    const request = await promise;
    expect(request.postDataJSON().updates[0].source.source_type).toEqual(expectedSourceType);
};

const YT_PATH = process.env.E2E_YT_PATH as string;

datalensTest.describe('Datasets - source editor dialog', () => {
    datalensTest.beforeEach(async ({page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.NewDataset, {
            tab: 'sources',
            id: '1di43d901khiv',
        });
    });

    datalensTest('Saving name of editing source', async ({page}: {page: Page}) => {
        const ytPath = YT_PATH;
        const inputLocator = page.locator(`${slct('source-editor-path')} input`);

        await inputLocator.fill(ytPath);
        await page.click('.g-dialog-footer__button_action_apply');
        await page.click(`${slct('ds-source')} .g-button`);
        await page.click(`${slct('ds-source-menu')} .g-menu__list-item`);

        const titleInputLocator = page.locator(`${slct('source-editor-title')} input`);

        await expect(titleInputLocator).toHaveValue('bi_2132_one_col_sorting');
    });

    datalensTest('Possible to save same name of existing source', async ({page}: {page: Page}) => {
        const ytPath = YT_PATH;
        const inputLocator = page.locator(`${slct('source-editor-path')} input`);
        const titleInputLocator = page.locator(`${slct('source-editor-title')} input`);

        await inputLocator.fill(ytPath);
        await titleInputLocator.fill('test name');

        await page.click('.g-dialog-footer__button_action_apply');
        await page.click(`${slct('ds-source')} .g-button`);
        await page.click(`${slct('ds-source-menu')} .g-menu__list-item`);

        await page.waitForSelector(slct('source-editor-title'));

        // return same name to title
        await titleInputLocator.fill('new name');
        await expect(titleInputLocator).toHaveValue('new name');

        await page.click('.g-dialog-footer__button_action_apply');

        await page.waitForTimeout(1000);

        const error = page.locator(slct('source-editor-dialog'));
        await expect(error).toHaveCount(0);
    });

    datalensTest('Possible to change source name', async ({page}: {page: Page}) => {
        const titleInputLocator = page.locator(`${slct('source-editor-title')} input`);
        await titleInputLocator.fill('Example1');

        await expect(titleInputLocator).toHaveValue('Example1');
    });

    datalensTest('Correct change of source type', async ({page}) => {
        const ytPath = 'test';
        const inputSelector = `.source-editor-dialog__params ${CommonSelectors.TextInput}`;
        const areaSelector = `.source-editor-dialog__params ${CommonSelectors.TextArea}`;
        const inputLocator = page.locator(inputSelector).first();

        const tableTab = page
            .locator(`${slct('datasets-source-switcher')} .g-segmented-radio-group__option`)
            .nth(0);
        const listTab = page
            .locator(`${slct('datasets-source-switcher')} .g-segmented-radio-group__option`)
            .nth(1);
        const rangeTab = page
            .locator(`${slct('datasets-source-switcher')} .g-segmented-radio-group__option`)
            .nth(2);

        await tableTab.check();
        await inputLocator.fill(ytPath);
        await checkSourceType(page, 'CHYT_USER_AUTH_TABLE');

        await page.click(
            `${CommonSelectors.RadioButtonOptionControl}[value=CHYT_USER_AUTH_TABLE_LIST]`,
            {force: true},
        );
        await listTab.check();
        const areaLocator = page.locator(areaSelector).first();
        await areaLocator.fill(ytPath);
        await checkSourceType(page, 'CHYT_USER_AUTH_TABLE_LIST');

        await page.click(
            `${CommonSelectors.RadioButtonOptionControl}[value=CHYT_USER_AUTH_TABLE_RANGE]`,
            {force: true},
        );
        await rangeTab.check();
        await inputLocator.fill('test2');
        await checkSourceType(page, 'CHYT_USER_AUTH_TABLE_RANGE');
    });
});
