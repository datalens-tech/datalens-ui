import type {
    openDialogParameterCreate,
    openDialogParameterEdit,
} from '../../store/actions/creators';
import type {FreeformSource, StandaloneSource} from '../../store/types';

export type EditedSource = FreeformSource | StandaloneSource;

export type OnSourceUpdate = (updates: {[k: string]: string}) => void;

export type OnParamEdit = (args: Parameters<typeof openDialogParameterEdit>[0]) => void;
export type OnParamCreate = (args?: Parameters<typeof openDialogParameterCreate>[0]) => void;
