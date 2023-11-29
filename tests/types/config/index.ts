import {ConnectionsParametrizationConfig} from './connections';
import {DashParametrizationConfig} from './dash';
import {QlParametrizationConfig} from './ql';
import type {WizardParametrizationConfig} from './wizard';

export type TestParametrizationConfig = {
    wizard: WizardParametrizationConfig;
    connections: ConnectionsParametrizationConfig;
    ql: QlParametrizationConfig;
    dash: DashParametrizationConfig;
};
