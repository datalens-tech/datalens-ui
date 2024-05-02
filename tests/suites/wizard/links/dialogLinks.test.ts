import {Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsDatasets, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Dialog for working with links in multi-datasets', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.addAdditionalDataset(RobotChartsDatasets.SampleCHDataset);
    });

    datalensTest('Dialog changes must be saved', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.dialogMultidataset.open();

        await wizardPage.dialogMultidataset.openLink('City');

        await wizardPage.linkDialog.selectFieldForLink('sample-csv-dataset', 'Category');

        await wizardPage.linkDialog.apply();

        await wizardPage.dialogMultidataset.openLink('City');
        let firstLinkValue: string | null;
        let secondLinkValue: string | null;
        await waitForCondition(async () => {
            firstLinkValue = await wizardPage.linkDialog.getValueFromSelector('cities-dataset');
            secondLinkValue =
                await wizardPage.linkDialog.getValueFromSelector('sample-csv-dataset');

            return firstLinkValue === 'City' && secondLinkValue === 'Category';
        }).catch(() => {
            throw new Error(
                `First link = ${firstLinkValue}, instead of City; second link = ${secondLinkValue}, instead of Category`,
            );
        });
    });

    datalensTest(
        'Deleting a dataset inside a multi-dataset dialog should clean the links',
        async ({page}: {page: Page}) => {
            // We accept the alert that appears after deleting the dataset
            page.on('dialog', async (dialog) => {
                await dialog.accept();
            });

            const wizardPage = new WizardPage({page});

            await wizardPage.dialogMultidataset.open();

            await waitForCondition(async () => {
                const linksBeforeRemove = await wizardPage.dialogMultidataset.getLinksLength();

                return linksBeforeRemove === 1;
            });

            await wizardPage.dialogMultidataset.removeDataset(RobotChartsDatasets.SampleCHDataset);

            await waitForCondition(async () => {
                const links = await wizardPage.dialogMultidataset.getLinksLength();

                return links === 0;
            }).catch(() => {
                throw new Error('Connections have not been deleted');
            });
        },
    );
});
