import {Page} from '@playwright/test';
import {DialogParameterQA, SectionDatasetQA} from '../../../src/shared/constants';

import {slct} from '../../utils';
import DialogParameter from '../common/DialogParameter';

export default class ParameterEditor extends DialogParameter {
    async openCreateParameter() {
        await this.page.click(slct(SectionDatasetQA.AddField));

        await this.page.click(slct(SectionDatasetQA.CreateParameterButton));
    }

    async openEditParameter(parameterName: string) {
        const section = slct(SectionDatasetQA.SectionParameters);
        const field = slct(parameterName);
        const icon = slct(SectionDatasetQA.ItemIcon);
        await this.page.click(`${section} ${field} ${icon}`);
    }

    async getEditorInput(
        inputType:
            | DialogParameterQA.NameInput
            | DialogParameterQA.TypeSelector
            | DialogParameterQA.DefaultValueInput,
    ) {
        await this.waitForDialogParameter();

        // Since Select is not an honest input, we choose button
        const selector =
            inputType === DialogParameterQA.TypeSelector
                ? `${slct(inputType)}`
                : `${slct(inputType)} input`;

        return (this.page as Page).locator(selector);
    }

    async reset() {
        await this.page.click(slct(DialogParameterQA.Reset));
    }
}
