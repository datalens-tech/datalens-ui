import type {ConfigItem} from '@gravity-ui/dashkit';
import {AnyAction} from 'redux';

import {AppDispatch} from '../../../../store';

export type BeforeOpenDialogItemAction = <T>(
    data: ConfigItem,
) => (dispatch: AppDispatch<AnyAction, T>, getState: () => T) => void;
