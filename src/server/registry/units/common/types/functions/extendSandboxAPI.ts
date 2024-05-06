import type {AppContext} from '@gravity-ui/nodekit';

import type {IChartEditor} from '../../../../../../shared/types';

export type ExtendSandboxAPI = (args: {
    appContext: AppContext;
    api: IChartEditor;
    context: {ChartEditor: IChartEditor; __runtimeMetadata: any};
    tabName: string;
}) => void;
