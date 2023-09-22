import {Page} from '@playwright/test';

import {getParentByQARole, slct} from '../../utils';
import {RobotChartsDatasets} from '../../utils/constants';
import {SectionDatasetQA} from '../../../src/shared';

class DatasetSelector {
    errorIconSelector = slct('dataset-error-icon');

    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async click() {
        await this.page.click(slct('dataset-select'));
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

    async openActionMenu(dataset: string) {
        await this.page.waitForSelector(slct('dataset-select-item', dataset));

        const datasetSelectorNode = (await this.page.$(slct('dataset-select-item', dataset)))!;

        await datasetSelectorNode.hover();

        const parent = (await getParentByQARole(datasetSelectorNode, 'dataset-select-item'))!;

        const button = (await parent.$(slct('dataset-select-more')))!;

        await button.click();
    }

    async clickToDatasetAction(
        dataset: RobotChartsDatasets,
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

export default DatasetSelector;
