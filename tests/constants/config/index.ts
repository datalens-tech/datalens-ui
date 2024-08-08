import type {TestParametrizationConfig} from '../../types/config';
import {connections} from './connections';
import {ql} from './ql';
import {wizard} from './wizard';
import {dash} from './dash';
import {datasets} from './datasets';
import {charts} from './charts';

export const config: TestParametrizationConfig = {
    wizard,
    connections,
    ql,
    dash,
    datasets,
    charts,
};
