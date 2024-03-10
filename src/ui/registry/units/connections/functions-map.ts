import {FormSchema} from 'shared/schema';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import {EXAMPLE_FUNCTION} from '../common/constants/functions';

import {GetMockedFormArgs} from './types/getMockedForm';

export const connectionsFunctionsMap = {
    [EXAMPLE_FUNCTION]: makeFunctionTemplate<(arg: number) => string>(),
    getMockedForm: makeFunctionTemplate<(args: GetMockedFormArgs) => FormSchema | undefined>(),
    getConnectionsWithForceSkippedCopyTemplateInWorkbooks: makeFunctionTemplate<() => string[]>(),
} as const;
