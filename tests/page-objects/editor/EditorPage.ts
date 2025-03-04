import {slct} from '../../utils';
import {BasePage, BasePageProps} from '../BasePage';
import ChartKit from '../wizard/ChartKit';

interface EditorPageProps extends BasePageProps {}

class EditorPage extends BasePage {
    chartkit: ChartKit;

    constructor({page}: EditorPageProps) {
        super({page});

        this.chartkit = new ChartKit(page);
    }

    async clickTemplate(templateQa: string) {
        await this.page.click(`${slct(templateQa)}`);
    }

    async drawPreview() {
        await this.page.click(slct('button-draw-preview'));
    }
}

export default EditorPage;
