import {Page} from '@playwright/test';

import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {RobotChartsDatasetUrls} from '../../../utils/constants';
import {AvatarQA, DatasetSourcesTableQa} from '../../../../src/shared';

datalensTest.describe('Datasets - working with avatars', () => {
    datalensTest('Adding Avatar CH', async ({page}: {page: Page}) => {
        const datasetPage = new DatasetPage({page});

        await openTestPage(page, RobotChartsDatasetUrls.NewDataset, {id: 'jbconcutsv1if'});

        await datasetPage.waitForSelector(slct(DatasetSourcesTableQa.Source));

        await datasetPage.addAvatarByDragAndDrop();

        await datasetPage.waitForSelector(slct(AvatarQA.Avatar));

        const avatarsCount = (await datasetPage.page.$$(slct(AvatarQA.Avatar))).length;

        if (!avatarsCount) {
            throw new Error('Avatar not added');
        } else if (avatarsCount > 1) {
            throw new Error('More than one avatar added');
        }
    });
});
