import {expect} from '@playwright/test';

import QLPage from '../../../page-objects/ql/QLPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsSQLEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ActionPanelQA, SaveChartControlsQa} from '../../../../src/shared';

const sqlScript = `
select built_year, AVG(iznos::float)
from public.sample
where iznos::float > 0
group by built_year, iznos
order by built_year, iznos
`;

const sqlScript2 = `
select built_year, AVG(iznos::float)
from public.sample
where iznos::float > 0 AND built_year > '1900'
group by built_year, iznos
order by built_year, iznos
`;

datalensTest.describe('QL - saving the chart', () => {
    datalensTest.beforeEach(async ({page}) => {
        await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForPostgresDemo);
    });

    datalensTest.afterEach(async ({page}) => {
        const isRemoveMenuExists = await page.locator(slct(ActionPanelQA.MoreBtn)).isVisible();
        if (!isRemoveMenuExists) {
            return;
        }
        const qlPage = new QLPage({page});

        await qlPage.deleteEntry();
    });

    datalensTest('Saving a new ql chart', async ({page}) => {
        const qlPage = new QLPage({page});

        await qlPage.setScript(sqlScript);

        await qlPage.runScript();

        await qlPage.waitForSuccessfulResponse('/api/run');

        await qlPage.saveQlEntry(qlPage.getUniqueEntryName('ql-e2e-save-test'));

        const saveButtonLocator = await qlPage.page.locator(slct(SaveChartControlsQa.SaveButton));

        await expect(saveButtonLocator).toBeDisabled();
    });

    datalensTest('Saving an already created ql chart', async ({page}) => {
        const qlPage = new QLPage({page});

        await qlPage.setScript(sqlScript);

        await qlPage.runScript();

        await qlPage.waitForSuccessfulResponse('/api/run');

        await qlPage.saveQlEntry(qlPage.getUniqueEntryName('ql-e2e-save-test'));

        const saveButtonLocator = await qlPage.page.locator(slct(SaveChartControlsQa.SaveButton));

        await expect(saveButtonLocator).toBeDisabled();

        await qlPage.page.reload();

        await qlPage.clearScript();

        await qlPage.setScript(sqlScript2);

        await qlPage.runScript();

        await qlPage.waitForSuccessfulResponse('/api/run');

        await qlPage.saveExistentQlEntry();

        const saveButtonLocatorAfterReload = await qlPage.page.locator(
            slct(SaveChartControlsQa.SaveButton),
        );

        await expect(saveButtonLocatorAfterReload).toBeDisabled();
    });

    datalensTest('Saving ql Chart settings - Header', async ({page}) => {
        const qlPage = new QLPage({page});

        await qlPage.setScript(sqlScript);

        await qlPage.runScript();

        const entryName = qlPage.getUniqueEntryName('ql-e2e-save-test');
        const title = `${entryName} title`;

        await qlPage.waitForSuccessfulResponse('/api/run');
        await qlPage.chartSettings.open();
        await qlPage.chartSettings.waitForSettingsRender();
        await qlPage.chartSettings.setTitle(title);
        await qlPage.chartSettings.apply();

        await qlPage.saveQlEntry(entryName);

        await qlPage.page.reload();
        await qlPage.waitForSuccessfulResponse('/api/run');

        await qlPage.chartSettings.open();
        await qlPage.chartSettings.waitForSettingsRender();

        // after saving, the title should be displayed
        // in settings
        expect(await qlPage.chartSettings.getTitleValue()).toEqual(title);

        await qlPage.chartSettings.close();

        // and in the chart
        await expect(qlPage.page.locator(qlPage.chartkit.chartTitle)).toHaveText(title);

        await expect(qlPage.getSaveButtonLocator()).toBeDisabled({timeout: 5000});
    });

    datalensTest('Creating QL chart with error', async ({page}) => {
        const qlPage = new QLPage({page});

        const saveBtnLocator = page.locator(slct(SaveChartControlsQa.SaveButton));

        await expect(saveBtnLocator).toBeDisabled();

        await qlPage.setScript('wrong query');

        const responsePromise = page.waitForResponse((response) => {
            const responseUrl = new URL(response.url());
            return responseUrl.pathname === '/api/run';
        });

        await qlPage.runScript();

        await responsePromise;

        await expect(saveBtnLocator).not.toBeDisabled({timeout: 5000});

        await qlPage.saveQlEntry(qlPage.getUniqueEntryName('ql-e2e-create-chart-with-error-test'));
    });
});
