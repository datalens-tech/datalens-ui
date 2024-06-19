import {deleteEntity, entryDialogFillAndSave, slct} from '../../utils';
import {BasePage, BasePageProps} from '../BasePage';
import ChartKit from '../wizard/ChartKit';
import {EditorPageQA} from '../../../../shared/constants/qa/editor';

interface EditorPageProps extends BasePageProps {}

class EditorPage extends BasePage {
    chartkit: ChartKit;

    constructor({page}: EditorPageProps) {
        super({page});

        this.chartkit = new ChartKit(page);
    }

    async clickTemplate(templateQa: string) {
        await this.page.click(`${slct('node-templates-list')} ${slct(templateQa)}`);
    }

    async drawPreview() {
        await this.page.click(slct(EditorPageQA.RunButton));
    }

    async saveChartEntry(entryName: string) {
        await this.page.locator(slct(EditorPageQA.SaveButton)).click();

        await entryDialogFillAndSave(this.page, entryName);
    }

    async deleteEntry() {
        await deleteEntity(this.page);
    }
}

export default EditorPage;
