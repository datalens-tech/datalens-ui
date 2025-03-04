import moment from 'moment';
import {slct} from '../../utils';
import {BasePageProps} from '../BasePage';
import {ChartPage} from '../ChartPage';
import ChartKit from '../wizard/ChartKit';
import {EditorActionPanelQA, SaveChartControlsQa} from '../../../src/shared/constants/qa';
import {CommonUrls} from '../constants/common-urls';

interface EditorPageProps extends BasePageProps {}

class EditorPage extends ChartPage {
    chartkit: ChartKit;

    editorUrls = {
        updateEditorChart: '/updateEditorChart',
        getEntry: '/getEntry',
        createEditorChart: '/createEditorChart',
    };

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

    async saveEditorEntry(entryName?: string) {
        const chartName = `${entryName}__${moment(moment.now()).format('DD.MM.YYYY HH:mm:ss.SS')}`;
        await this.saveEntry({
            entryName: chartName,
            customUrlsForValidation: [this.editorUrls.getEntry, this.editorUrls.createEditorChart],
        });
    }

    async makeDraft() {
        await this.waitForChartUpdate(async () => {
            await this.page.locator(slct(EditorActionPanelQA.MoreSwitcher)).click();
            await this.page.locator(slct(EditorActionPanelQA.SaveAsDraftButton)).click();
        });
    }

    async waitForChartUpdate(action: () => void) {
        const promise = Promise.all(
            [this.editorUrls.updateEditorChart, CommonUrls.ApiRun].map((url) =>
                this.waitForSuccessfulResponse(url),
            ),
        );
        action();
        await promise;
    }

    async saveExistingEntry() {
        await this.waitForChartUpdate(async () => {
            await this.page.locator(slct(SaveChartControlsQa.SaveButton)).click();
        });
    }

    async openActualRevision() {
        const promise = Promise.all(
            [this.editorUrls.getEntry, CommonUrls.ApiRun].map((url) =>
                this.waitForSuccessfulResponse(url),
            ),
        );
        await this.revisions.openActualRevision();
        await promise;
    }

    async makeRevisionActual() {
        await this.waitForChartUpdate(async () => {
            await this.revisions.makeRevisionActual();
        });
    }
}

export default EditorPage;
