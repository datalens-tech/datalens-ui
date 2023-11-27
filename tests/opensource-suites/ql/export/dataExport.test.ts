import {expect} from '@playwright/test';
import QLPage from '../../../page-objects/ql/QLPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {openTestPage} from '../../../utils';

datalensTest.describe('QL - export', () => {
    datalensTest('Exporting flat table data', async ({page, config}) => {
        const qlPage = new QLPage({page});

        await openTestPage(page, config.ql.urls.NewQLChartWithConnection);
        await qlPage.setVisualization(WizardVisualizationId.FlatTable);

        await qlPage.setScript(config.ql.queries.citySales);

        await qlPage.runScript();

        await qlPage.chartkit.waitForSuccessfulRender();
        const download = await qlPage.chartkit.exportCsv();

        expect(download).toBeTruthy();
    });
});
