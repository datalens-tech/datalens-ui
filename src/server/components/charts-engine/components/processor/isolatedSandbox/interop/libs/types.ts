import type IsolatedVM from 'isolated-vm';

import type {IChartEditor} from '../../../../../../../../shared';

export type LibsInterop = {
    prepareAdapter: string;
    setPrivateApi: ({
        jail,
        chartEditorApi,
    }: {
        jail: IsolatedVM.Reference;
        chartEditorApi: IChartEditor;
    }) => IsolatedVM.Reference;
};
