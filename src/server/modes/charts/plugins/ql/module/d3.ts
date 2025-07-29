import type {IChartEditor, QlConfig} from '../../../../../../shared';
import {mapQlConfigToLatestVersion} from '../../../../../../shared/modules/config/ql';
import {buildD3Config as buildD3CommonConfig} from '../../datalens/gravity-charts';

export function buildD3Config({
    shared,
    ChartEditor,
}: {
    shared: QlConfig;
    ChartEditor: IChartEditor;
}) {
    const config = mapQlConfigToLatestVersion(shared, {i18n: ChartEditor.getTranslation});
    return buildD3CommonConfig(config);
}
