import moment from 'moment';
import {slct} from '../../utils';
import {BasePageProps} from '../BasePage';
import {ChartPage} from '../ChartPage';
import ChartKit from '../wizard/ChartKit';

interface EditorPageProps extends BasePageProps {}

class EditorPage extends ChartPage {
    chartkit: ChartKit;

    constructor({page}: EditorPageProps) {
        super({page});

        this.chartkit = new ChartKit(page);
    }

    async clickTemplate(templateQa: string) {
        await this.page.click(`${slct('node-templates-list')} ${slct(templateQa)}`);
    }

    async drawPreview() {
        await this.page.click(slct('button-draw-preview'));
    }

    async saveEditorEntry(entryName?: string) {
        const chartName = `${entryName}__${moment(moment.now()).format('DD.MM.YYYY HH:mm:ss.SS')}`;
        await this.saveEntry({
            entryName: chartName,
            customUrlsForValidation: ['/createEditorChart', '/getEntry'],
        });
    }
}

export default EditorPage;
