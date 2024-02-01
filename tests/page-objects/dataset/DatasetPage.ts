import uuid from 'uuid/v1';
import {DatasetActionQA, EntryDialogQA} from '../../../src/shared/constants';

import {slct} from '../../utils';
import {BasePage, BasePageProps} from '../BasePage';
import DialogParameter from '../common/DialogParameter';

import DatasetTabSection from './DatasetTabSection';

export interface DatasetPageProps extends BasePageProps {}

class DatasetPage extends BasePage {
    datasetTabSection: DatasetTabSection;
    dialogParameter: DialogParameter;

    constructor({page}: DatasetPageProps) {
        super({page});

        this.datasetTabSection = new DatasetTabSection(page);
        this.dialogParameter = new DialogParameter(page);
    }

    async addAvatarByDragAndDrop(sourceTitle?: string) {
        const selector = sourceTitle
            ? `${slct('ds-source')} span >> text=${sourceTitle}`
            : slct('ds-source');

        const source = await this.page.$(selector);

        if (!source) {
            throw new Error("Couldn't find the table");
        }

        const targetSelector = slct('ds-relations-map');
        const target = await this.page.$(targetSelector);

        if (!target) {
            throw new Error("Couldn't find an area to drag");
        }

        await this.page.dragAndDrop(selector, targetSelector);
    }

    async openSourcesPanel() {
        await this.page.click('.dataset-panel input[value=sources]');
    }

    async createDatasetInFolder({name = uuid()}: {name?: string} = {}) {
        const formSubmit = await this.page.waitForSelector(slct(DatasetActionQA.CreateButton));
        // open creation dialog
        await formSubmit.click();
        const textInput = await this.page.waitForSelector(slct('path-select'));
        // type dataset name
        await textInput.type(name);
        const dialogApplyButton = await this.page.waitForSelector(slct(EntryDialogQA.Apply));
        // create dataset
        await dialogApplyButton.click();
        try {
            await this.page.waitForURL(() => this.page.url().includes(name));
        } catch {
            throw new Error("Dataset wasn't created");
        }
    }
}

export default DatasetPage;
