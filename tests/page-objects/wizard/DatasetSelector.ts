import {Page} from '@playwright/test';

import {slct} from '../../utils';
import {RobotChartsDatasets} from '../../utils/constants';
import {SectionDatasetQA} from '../../../src/shared';

class DatasetSelectorSettings {
    errorIconSelector = slct('dataset-error-icon');

    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async click() {
        await this.page.click(slct(SectionDatasetQA.DatasetSelect));
    }

    async waitForSelectedValue(dataset: RobotChartsDatasets) {
        await this.page.waitForSelector(slct('current-dataset', dataset));
    }

    async clickToSelectDatasetItemWithText(item: string) {
        await this.page.click(slct('dataset-select-item', item));
    }

    async clickAddAdditionalDatasetButton() {
        await this.page.click(slct(SectionDatasetQA.AddDatasetButton));
    }

    async openActionMenu(dataset?: string) {
        const datasetSelectItem = dataset
            ? this.page.locator(slct('dataset-select-item'), {hasText: dataset}).first()
            : this.page.locator(slct('dataset-select-item')).first();
        await datasetSelectItem.hover();
        await datasetSelectItem.locator(slct(SectionDatasetQA.DatasetSelectMore)).click();
    }

    async clickToDatasetAction(
        dataset: RobotChartsDatasets | undefined,
        action:
            | SectionDatasetQA.RemoveDatasetButton
            | SectionDatasetQA.GoToDatasetButton
            | SectionDatasetQA.ReplaceDatasetButton
            | SectionDatasetQA.SettingsDatasetButton,
    ) {
        await this.openActionMenu(dataset);

        await this.page.click(`${slct(SectionDatasetQA.DatasetSelectMoreMenu)} ${slct(action)}`);
    }

    async changeDataset(datasetName: RobotChartsDatasets) {
        await this.page.click(`${slct('dataset-select-item')} >> text=${datasetName}`);
    }

    getDatasetsCount() {
        return this.page
            .$$(slct('dataset-select-item'))
            .then((datasetItems) => (datasetItems.length > 1 ? datasetItems.length - 2 : 1));
    }
}

export default DatasetSelectorSettings;
