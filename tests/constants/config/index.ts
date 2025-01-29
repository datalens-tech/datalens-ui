import type {TestParametrizationConfig} from '../../types/config';
import {connections} from './connections';
import {ql} from './ql';
import {wizard} from './wizard';
import {dash} from './dash';
import {datasets} from './datasets';
import {charts} from './charts';
import {WorkbookIds} from '../constants';

export const config: TestParametrizationConfig = {
    workbookId: WorkbookIds.E2EWorkbook,
    wizard,
    connections,
    ql,
    dash,
    datasets,
    charts,
};
