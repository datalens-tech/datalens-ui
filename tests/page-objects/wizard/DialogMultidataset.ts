import {Page} from '@playwright/test';

import {slct} from '../../utils';
import {DialogMultiDatasetQa, SectionDatasetQA} from '../../../src/shared';

class DatasetSelector {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async clickToSaveButton() {
        await this.page.click(slct(DialogMultiDatasetQa.ApplyButton));
    }

    async open() {
        await this.page.hover('.dataset-select');

        await this.page.click(slct(SectionDatasetQA.DatasetSelectMore));

        await this.page.click(slct(SectionDatasetQA.SettingsDatasetButton));
    }

    async openLink(fieldTitle: string) {
        await this.page.click(
            `${slct(
                DialogMultiDatasetQa.DialogMultiDatasetRoot,
            )} .dialog-multidataset__right-link-formula >> text=${fieldTitle}`,
        );
    }

    async removeDataset(datasetName: string) {
        await this.page.click(slct(`dataset-${datasetName}`));

        await this.page.click(slct(DialogMultiDatasetQa.RemoveDatasetButton));
    }

    async getLinksLength() {
        const links = await this.page.$$(slct('link'));

        return links.length;
    }
}

export default DatasetSelector;
