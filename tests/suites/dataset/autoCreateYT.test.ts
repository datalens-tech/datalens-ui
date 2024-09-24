import {Page, Request} from '@playwright/test';

import datalensTest from '../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../utils';
import {RobotChartsDatasetUrls} from '../../utils/constants';
import WizardPage from '../../page-objects/wizard/WizardPage';
import {SectionDatasetQA} from '../../../src/shared';
import DatasetPage from '../../page-objects/dataset/DatasetPage';

const CURRENT_PATH = 'Users%2Frobot-charts%2FE2E_DS%2F';
const DECODED_CURRENT_PATH = decodeURIComponent(CURRENT_PATH);

const getErrorMessage = (dirPath?: string) => `
Query-the currentPath parameter was not set in the dirPath field
Expected value: "${DECODED_CURRENT_PATH}"
Received value: "${dirPath}"
`;

const YT_PATH = process.env.E2E_YT_PATH as string;

const waitForBiValidateDatasetResponses = (page: Page, timeout: number): Promise<void> => {
    return new Promise((resolve: any) => {
        const timerId = setTimeout(() => {
            page.off('request', onRequest);
            resolve();
        }, timeout);

        function onRequest(request: Request) {
            if (!request.url().match('createDataset')) {
                return;
            }

            const dirPath = JSON.parse(request.postData() || '').dir_path;

            clearTimeout(timerId);

            if (dirPath !== DECODED_CURRENT_PATH) {
                throw new Error(getErrorMessage(dirPath));
            }

            resolve();
        }

        page.on('request', onRequest);
    });
};

datalensTest.describe('Datasets - automatic creation from YT', () => {
    datalensTest.afterEach(async ({page}) => {
        const pageUrl = page.url();
        const datasetId = new URL(pageUrl).searchParams.get('__datasetId');

        if (datasetId) {
            const wizardPage = new WizardPage({page});
            const [childPage] = await Promise.all([
                page.waitForEvent('popup'),
                wizardPage.datasetSelector.clickToDatasetAction(
                    undefined, // If not specify a name, the first and only dataset will be selected
                    SectionDatasetQA.GoToDatasetButton,
                ),
            ]);

            if (!childPage) {
                return;
            }

            await childPage.waitForEvent('load');
            const datasetPage = new DatasetPage({page: childPage});
            await datasetPage.deleteEntry();
        }
    });

    datalensTest('Base Script', async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDatasetUrls.NewDataset, {
            id: 'CHYT_HAHN',
            action: 'autoCreate',
            ytPath: YT_PATH,
        });

        try {
            await page.waitForURL(() => page.url().includes('wizard'));
        } catch {
            throw new Error("There was no transition to the wizard's page");
        }
    });
    datalensTest(
        'Saving to the specified folder using currentPath',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDatasetUrls.NewDataset, {
                id: 'CHYT_HAHN',
                action: 'autoCreate',
                ytPath: YT_PATH,
                currentPath: CURRENT_PATH,
            });

            await waitForBiValidateDatasetResponses(page, 3000);
        },
    );
});
