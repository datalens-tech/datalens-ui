import {Page} from '@playwright/test';

import {AvatarQA} from '../../../../src/shared/constants';
import DatasetPage, {
    waitForBiValidateDatasetResponses,
} from '../../../page-objects/dataset/DatasetPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {RobotChartsDatasetUrls} from '../../../utils/constants';

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
