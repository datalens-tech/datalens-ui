import {Page, Response} from '@playwright/test';

import {AvatarQA} from '../../../../src/shared/constants';
import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {RobotChartsDatasetUrls} from '../../../utils/constants';

const waitForBiValidateDatasetResponses = (page: Page, timeout: number): Promise<void> => {
    return new Promise((resolve: any) => {
        const timerId = setTimeout(() => {
            page.off('response', onResponse);
            resolve();
        }, timeout);

        async function onResponse(response: Response) {
            if (!response.url().match('validateDataset')) {
                return;
            }

            const request = await response.request();
            const requestData = JSON.parse(request.postData() || '');

            // When the page loads, the validation request with empty updates initially goes away
            // We are only interested in the one that leaves after the avatar is deleted
            if (!requestData.data.updates.length) {
                return;
            }

            clearTimeout(timerId);

            if (response.status() !== 200) {
                throw new Error(
                    'After deleting the avatar, the dataset validation returned an error',
                );
            }

            resolve();
        }

        page.on('response', onResponse);
    });
};

datalensTest.describe('Datasets - working with avatars', () => {
    datalensTest('Deleting an avatar with child elements', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({
            page,
        });

        await openTestPage(page, RobotChartsDatasetUrls.DatasetAvatars, {tab: 'sources'});
        await datasetPage.page.click(
            `#ae4e0690-90a7-11ec-a8f6-0b78c44ecbe0 ${slct(AvatarQA.DeleteButton)}`,
        );
        await waitForBiValidateDatasetResponses(page, 3000);
    });
});
