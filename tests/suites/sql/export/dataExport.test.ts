import {expect} from '@playwright/test';
import QLPage from '../../../page-objects/ql/QLPage';
import {RobotChartsSQLEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {openTestPage} from '../../../utils';

const sqlScript = `
select built_year, AVG(iznos::float)
from public.sample
group by built_year, iznos
limit 10
`;

datalensTest.describe('QL - export', () => {
    datalensTest('Exporting flat table data', async ({page}) => {
        const qlPage = new QLPage({page});

        await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForPostgresDemo);
        await qlPage.setVisualization(WizardVisualizationId.FlatTable);

        await qlPage.setScript(sqlScript);

        await qlPage.runScript();

        await qlPage.chartkit.waitForSuccessfulRender();
        const download = await qlPage.chartkit.exportCsv();

        expect(download).toBeTruthy();
    });
});
