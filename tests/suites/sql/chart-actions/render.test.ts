import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {Page} from '@playwright/test';
import QLPage from '../../../page-objects/ql/QLPage';
import {openTestPage} from '../../../utils';
import {RobotChartsSQLEditorUrls} from '../../../utils/constants';
import {QlVisualizationId, VisualizationsQa} from '../../../../src/shared';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';

const getIsRequestTriggered = (page: Page) => {
    return (matcher: string) => {
        let requestTriggered = false;
        page.on('request', (request) => {
            if (new URL(request.url()).pathname === matcher) {
                requestTriggered = true;
            }
        });
        return async () => {
            await page.waitForLoadState('networkidle');
            return requestTriggered;
        };
    };
};

datalensTest.describe('QL - rendering the chart', () => {
    datalensTest('Chart should not render when sql query is empty', async ({page}) => {
        const qlPage = new QLPage({page});

        await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForPostgresDemo);

        const subscribeToRequest = getIsRequestTriggered(page);

        await qlPage.checkSelectedVisualization(VisualizationsQa.Column);

        const isRequestTriggered = subscribeToRequest('/api/run');

        await qlPage.setVisualization(QlVisualizationId.Line);

        expect(await isRequestTriggered()).toEqual(false);
    });

    datalensTest(
        'Chart should not render when monitoring/prometheus queries are not added',
        async ({page}) => {
            const qlPage = new QLPage({page});

            await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForMonitoring);

            const subscribeToRequest = getIsRequestTriggered(page);

            await qlPage.checkSelectedVisualization(VisualizationsQa.Column);

            const isRequestTriggered = subscribeToRequest('/api/run');

            await qlPage.setVisualization(QlVisualizationId.Line);

            expect(await isRequestTriggered()).toEqual(false);
        },
    );

    datalensTest(
        'Chart should not render when monitoring/prometheus has all queries empty',
        async ({page}) => {
            const qlPage = new QLPage({page});

            await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForMonitoring);

            const subscribeToRequest = getIsRequestTriggered(page);

            await qlPage.checkSelectedVisualization(VisualizationsQa.Column);

            await qlPage.addEmptyPromQlQuery();

            const isRequestTriggered = subscribeToRequest('/api/run');

            await qlPage.setVisualization(QlVisualizationId.Line);

            expect(await isRequestTriggered()).toEqual(false);
        },
    );

    datalensTest(
        'Monitoring/Prometheus chart should re-render when user delete field',
        async ({page}) => {
            const qlPage = new QLPage({page});

            await openTestPage(page, RobotChartsSQLEditorUrls.QLMonitoringChart);

            const subscribeToRequest = getIsRequestTriggered(page);

            const isRequestTriggered = subscribeToRequest('/api/run');

            await qlPage.sectionVisualization.removeFieldByClick(PlaceholderName.Colors, 'query #');

            expect(await isRequestTriggered()).toEqual(true);
        },
    );

    datalensTest('SQL chart should re-render when user delete field', async ({page}) => {
        const qlPage = new QLPage({page});

        await openTestPage(page, RobotChartsSQLEditorUrls.QLChartWithStringParameter);

        const subscribeToRequest = getIsRequestTriggered(page);

        const isRequestTriggered = subscribeToRequest('/api/run');

        await qlPage.sectionVisualization.removeFieldByClick(
            PlaceholderName.FlatTableColumns,
            'round',
        );

        expect(await isRequestTriggered()).toEqual(true);
    });
});
