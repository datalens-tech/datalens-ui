import {Page, Response} from '@playwright/test';

import {AvatarQA, DatasetPanelQA} from '../../../../src/shared/constants';
import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {RobotChartsDatasetUrls} from '../../../utils/constants';

const waitForNetworlRequests = (page: Page, timeout: number): Promise<void> => {
    return new Promise((resolve: any) => {
        const timerId = setTimeout(() => {
            page.off('response', onResponse);
            resolve();
        }, timeout);

        let requests = [
            'getFieldTypes',
            'getDatasetByVersion',
            'getEntry',
            'getPreview',
            'getSources',
            'validateDataset',
        ];

        async function onResponse(response: Response) {
            requests = requests.filter((request) => !response.url().match(request));

            if (requests.length > 0) {
                return;
            }

            clearTimeout(timerId);
            resolve();
        }

        page.on('response', onResponse);
    });
};

datalensTest.describe('Datasets - working with avatars', () => {
    datalensTest('Rendering links between avatars', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({page});
        // We set a small width to ensure that we get a horizontal scroll on the canvas with links
        await page.setViewportSize({width: 1000, height: 1080});
        await openTestPage(page, RobotChartsDatasetUrls.DatasetAvatars);
        // Waiting for the completion of all network requests that change the state of the dataset editor
        await waitForNetworlRequests(page, 3000);
        // Switch to the sources tab
        await datasetPage.page.click(`${slct(DatasetPanelQA.TabRadio)} [value="sources"]`);
        const container = page.locator(slct(AvatarQA.RelationsMapContainer));
        const canvas = page.locator(slct(AvatarQA.RelationsMapCanvas));
        const {width: containerWidth} = (await container.boundingBox()) || {};
        const {width: canvasWidth} = (await canvas.boundingBox()) || {};

        // If the dimensions are not equal, it means that part of the links has not been drawn
        if (containerWidth !== canvasWidth) {
            throw new Error(
                `The dimensions of the container (${containerWidth}px) and canvas (${canvasWidth}px) do not correspond to each other`,
            );
        }
    });
});
