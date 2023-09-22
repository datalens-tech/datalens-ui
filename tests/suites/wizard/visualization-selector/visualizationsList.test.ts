import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {VisualizationsQa} from '../../../../src/shared/constants/qa/visualization';
import {openTestPage} from '../../../utils';

const expectedVisualizations = [
    VisualizationsQa.Line,
    VisualizationsQa.Area,
    VisualizationsQa.Area100p,
    VisualizationsQa.Column,
    VisualizationsQa.Column100p,
    VisualizationsQa.Bar,
    VisualizationsQa.Bar100p,
    VisualizationsQa.Scatter,
    VisualizationsQa.Pie,
    VisualizationsQa.Donut,
    VisualizationsQa.Metric,
    VisualizationsQa.Treemap,
    VisualizationsQa.FlatTable,
    VisualizationsQa.PivotTable,
    VisualizationsQa.Geolayer,
    VisualizationsQa.CombinedChart,
];

datalensTest.describe('Wizard - selector of visualizations', () => {
    datalensTest('The full list of visualizations should be displayed', async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        const selectorItems = await wizardPage.getVisualizationSelectorItems();

        expect(selectorItems).toEqual(expectedVisualizations);
    });
});
