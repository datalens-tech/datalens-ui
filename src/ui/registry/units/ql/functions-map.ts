import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

export const qlFunctionsMap = {
    getDefaultMonitoringQLConnectionId: makeFunctionTemplate<(env: string) => string>(),
} as const;
