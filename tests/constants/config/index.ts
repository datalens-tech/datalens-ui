import type {TestParametrizationConfig} from '../../types/config';
import {connections} from './connections';
import {ql} from './ql';
import {wizard} from './wizard';

export const config: TestParametrizationConfig = {
    wizard,
    connections,
    ql,
};
