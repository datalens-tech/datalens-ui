import controlModule from './../../../../modes/charts/plugins/control';
import {datalensModule} from './../../../../modes/charts/plugins/datalens/module';
import datasetModuleV2 from './../../../../modes/charts/plugins/dataset/v2';
import qlModule from './../../../../modes/charts/plugins/ql/module';
import type {NativeModulesType} from './types';

export const nativeModules: Record<NativeModulesType, Record<string, unknown>> = {
    BASE_NATIVE_MODULES: {
        'libs/datalens/v3': datalensModule,
        'libs/dataset/v2': datasetModuleV2,
        'libs/qlchart/v1': qlModule,
        'libs/control/v1': controlModule,
    },
};
