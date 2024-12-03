import {slct, waitForCondition, fillDatePicker} from '../../utils';
import {BasePageProps} from '../BasePage';
import {ChartPage, ChartType} from '../ChartPage';
import ChartKit from '../wizard/ChartKit';
import ChartSettings from '../wizard/ChartSettings';
import NavigationMinimal, {Ownership} from '../wizard/NavigationMinimal';
import VisualizationItemDialog from '../wizard/VisualizationItemDialog';
import {CommonSelectors} from '../constants/common-selectors';

import PreviewTable from './PreviewTable';
import {
    ViewSetupQA,
    TabQueryQA,
    TabParamsQA,
    DialogQLParameterQA,
    ScreenEditorQA,
    NavigationMinimalPlaceSelectQa,
} from '../../../src/shared';
import SectionVisualization from '../wizard/SectionVisualization';
import {ColumnSettings} from '../wizard/ColumnSettings';
import PlaceholderDialog from '../wizard/PlaceholderDialog';

interface QLPageProps extends BasePageProps {}

class QLPage extends ChartPage {
    previewTable: PreviewTable;
    chartkit: ChartKit;
    chartSettings: ChartSettings;
    visualizationItemDialog: VisualizationItemDialog;
    placeholderDialog: PlaceholderDialog;
    sectionVisualization: SectionVisualization;
    columnSettings: ColumnSettings;

    private selectConnectionButtonSelector = slct(TabQueryQA.SelectConnection);
    private navigationMinimal: NavigationMinimal;

    constructor({page}: QLPageProps) {
        super({page});
        this.navigationMinimal = new NavigationMinimal(page);
        this.chartkit = new ChartKit(page);
        this.chartSettings = new ChartSettings(page);
        this.previewTable = new PreviewTable(page);
        this.visualizationItemDialog = new VisualizationItemDialog(page);
        this.placeholderDialog = new PlaceholderDialog(page);
        this.sectionVisualization = new SectionVisualization(page);
        this.columnSettings = new ColumnSettings(page);
    }

    async clickCreate() {
        await this.page.click(slct(ViewSetupQA.ViewSetupCreate));
    }

    async selectConnection(connectionName: string) {
        await this.page.click(this.selectConnectionButtonSelector);

        await this.navigationMinimal.selectNamespace(NavigationMinimalPlaceSelectQa.Connections);

        await this.navigationMinimal.typeToSearch(connectionName);

        await this.navigationMinimal.selectOwnership(Ownership.All);

        await this.navigationMinimal.clickToItem(connectionName);
    }

    async waitForConnectionName(expectedName: string) {
        let actualName = '';

        await waitForCondition(async () => {
            actualName = await this.page.innerText(this.selectConnectionButtonSelector);

            return expectedName === actualName;
        }).catch((error) => {
            console.error(error);
            throw new Error(`expectedName: ${expectedName} !== actualName: ${actualName}`);
        });
    }

    async selectChartType(chartType: string) {
        await this.page.click(`.ql-view-setup__chart-type-select >> text=${chartType}`, {
            force: true,
        });
    }

    async setScript(sqlScript: string) {
        await this.page.click('.react-monaco-editor-container');

        await this.page.keyboard.insertText(sqlScript);
    }

    async clearScript() {
        await waitForCondition(async () => {
            await this.page.click('.react-monaco-editor-container');

            // for Windows/Linux select all text
            await this.page.keyboard.press('Control+A');

            await this.page.keyboard.press('Backspace');

            const script: string | null = await this.getScript();

            const isEditorEmpty = this.compareScripts('', script);

            if (isEditorEmpty) {
                return true;
            } else {
                // for mac os select all text
                await this.page.keyboard.press('Meta+A');

                await this.page.keyboard.press('Backspace');

                const scriptAfterRetry = await this.getScript();

                return this.compareScripts('', scriptAfterRetry);
            }
        }).catch(() => {
            throw new Error('Could not clear the editor');
        });
    }

    async runScript() {
        await this.page.click(slct('run-ql-script'));
    }

    async saveQlEntry(entryName: string) {
        await this.saveEntry({entryName, chartType: ChartType.QL});
    }

    async saveExistentQlEntry() {
        await this.saveExistentEntry();
    }

    async switchToQlInitialRevision(initialState: string): Promise<void> {
        const waitForConditionPromise = waitForCondition(async () => {
            const currentState = await this.getScript();
            if (currentState) {
                return this.compareScripts(initialState, currentState);
            }

            return false;
        }).catch(() => {
            throw new Error('There should be another script in the editor');
        });

        await this.switchToSecondRevision({waitForConditionPromise});
    }

    async getScript(): Promise<string | null> {
        const editor = await this.page.$('.ql-screen-sql__query-editor .lines-content');

        if (!editor) {
            return null;
        }

        return editor.textContent();
    }

    async saveQlChartAsNew(entryName: string) {
        await this.saveAsNewChart(entryName);
    }

    async openParamsTab() {
        await this.page.click(slct(ScreenEditorQA.ParamsTab));
    }

    async addParam() {
        await this.page.click(slct(TabParamsQA.AddParamBtn));
    }

    async selectParamType(type: string) {
        await this.page.click(slct(TabParamsQA.ParamType));

        await this.page.click(`${CommonSelectors.SelectItem} >> text=${type}`);
    }

    async setParamName(name: string) {
        const inputLocator = this.page.locator(
            `${slct(TabParamsQA.ParamName)} ${CommonSelectors.TextInput}`,
        );

        await inputLocator.fill(name);
    }

    async openParamDialog() {
        await this.page.click(slct(TabParamsQA.OpenParamDialogBtn));
    }

    async applyParamDialog() {
        await this.page.click('.g-dialog-footer__button_action_apply');
    }

    async selectDate(dateValue: string) {
        await fillDatePicker({
            page: this.page,
            selector: `${slct(DialogQLParameterQA.Dialog)} .g-text-input__control`,
            value: dateValue,
        });
    }

    async selectRangeDate(dateValue: [string | null, string]) {
        const startDate = dateValue[0];
        const endDate = dateValue[1];

        if (startDate) {
            await fillDatePicker({
                page: this.page,
                selector: `${slct(DialogQLParameterQA.Dialog)} ${slct(
                    DialogQLParameterQA.DatepickerStart,
                )} .g-text-input__control`,
                value: startDate,
            });
        }

        await fillDatePicker({
            page: this.page,
            selector: `${slct(DialogQLParameterQA.Dialog)} ${slct(
                DialogQLParameterQA.DatepickerEnd,
            )} .g-text-input__control`,
            value: endDate,
        });
    }

    waitForSomeSuccessfulRender() {
        return new Promise((resolve, reject) => {
            this.page.waitForSelector('.chartkit .gcharts-d3').then(resolve, () => undefined);
            this.page.waitForSelector('.chartkit .chartkit-graph').then(resolve, () => undefined);

            const metricLocators = [
                '.chartkit .chartkit-markup',
                '.chartkit .chartkit-indicator',
            ].join();
            this.page.waitForSelector(metricLocators).then(resolve, () => undefined);

            this.chartkit
                .getTableLocator()
                .waitFor()
                .then(resolve, () => undefined);

            setTimeout(reject, 30 * 1000);
        });
    }

    compareScripts(s1: string | null, s2: string | null) {
        if (s1 === null || s2 === null) {
            return false;
        }
        const s1WithoutFormatting = s1
            .split('')
            .filter((s) => s.trim())
            .join('');
        const s2WithoutFormatting = s2
            .split('')
            .filter((s) => s.trim())
            .join('');

        return s1WithoutFormatting === s2WithoutFormatting;
    }

    async addEmptyPromQlQuery() {
        await this.page.click(slct(TabQueryQA.AddPromQLQueryBtn));
    }

    async clickConnectionButton() {
        await this.page.click(this.selectConnectionButtonSelector);
    }
}

export default QLPage;
