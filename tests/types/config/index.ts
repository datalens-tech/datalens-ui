import type {ChartParametrizationConfig} from './charts';
import type {ConnectionsParametrizationConfig} from './connections';
import type {DashParametrizationConfig} from './dash';
import type {DatasetsParametrizationConfig} from './datasets';
import type {QlParametrizationConfig} from './ql';
import type {WizardParametrizationConfig} from './wizard';

export type TestParametrizationConfig = {
    wizard: WizardParametrizationConfig;
    connections: ConnectionsParametrizationConfig;
    ql: QlParametrizationConfig;
    dash: DashParametrizationConfig;
    datasets: DatasetsParametrizationConfig;
    charts: ChartParametrizationConfig;
    workbookId?: string;
};
