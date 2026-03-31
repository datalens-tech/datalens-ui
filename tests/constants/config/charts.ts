import type {ChartParametrizationConfig} from '../../types/config/charts';
import {QLChartUrls, PreviewUrls, WizardChartUrls} from '../test-entities/charts';

export const charts: ChartParametrizationConfig = {
    urls: {
        FlatTableWithOneColumn: PreviewUrls.FlatTableWithOneColumn,
        WizardWithForbiddenOnConnectionExport:
            WizardChartUrls.WizardWithForbiddenOnConnectionExport,
        WizardWithForbiddenOnDatasetExport: WizardChartUrls.WizardWithForbiddenOnDatasetExport,
        WizardWithEnabledExport: WizardChartUrls.WizardWithEnabledExport,
        QLWithForbiddenOnConnectionExport: QLChartUrls.QLWithForbiddenOnConnectionExport,
        QLColumnChart: QLChartUrls.QLColumnChart,
        PreviewWizardWithForbiddenOnConnectionExport:
            PreviewUrls.PreviewWizardWithForbiddenOnConnectionExport,
        PreviewWizardWithForbiddenOnDatasetExport:
            PreviewUrls.PreviewWizardWithForbiddenOnDatasetExport,
        PreviewQLWithForbiddenExport: PreviewUrls.PreviewQLWithForbiddenExport,
        PreviewQLColumnChart: PreviewUrls.PreviewQLColumnChart,
        PreviewWizardWithEnabledExport: PreviewUrls.PreviewWizardWithEnabledExport,
    },
};
