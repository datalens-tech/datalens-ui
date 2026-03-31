import type {FormSchema} from 'shared/schema';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import {EXAMPLE_FUNCTION} from '../common/constants/functions';

import type {BeforeConnectorFormUnmount} from './types/beforeConnectorFormUnmount';
import type {GetFakeEntry} from './types/getFakeEntry';
import type {GetMockedFormArgs} from './types/getMockedForm';
import type {GetNewConnectionDestination} from './types/getNewConnectionDestination';
import type {GetRenderConnectionSettingsPopup} from './types/getRenderConnectionSettingsPopup';

export const connectionsFunctionsMap = {
    [EXAMPLE_FUNCTION]: makeFunctionTemplate<(arg: number) => string>(),
    getMockedForm: makeFunctionTemplate<(args: GetMockedFormArgs) => FormSchema | undefined>(),
    getConnectionsWithForceSkippedCopyTemplateInWorkbooks: makeFunctionTemplate<() => string[]>(),
    getNewConnectionDestination: makeFunctionTemplate<GetNewConnectionDestination>(),
    getFakeEntry: makeFunctionTemplate<GetFakeEntry>(),
    beforeConnectorFormUnmount: makeFunctionTemplate<BeforeConnectorFormUnmount>(),
    getRenderConnectionSettingsPopup: makeFunctionTemplate<GetRenderConnectionSettingsPopup>(),
} as const;
