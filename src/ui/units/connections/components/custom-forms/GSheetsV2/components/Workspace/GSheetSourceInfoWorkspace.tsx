import React from 'react';

import type {ListItemData} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {GSheetSourceInfo} from '../../../../../store';

const b = block('conn-form-gsheets');

type GSheetSourceInfoWorkspaceProps = {
    item: ListItemData<GSheetSourceInfo>;
};

export const GSheetSourceInfoWorkspace = ({item}: GSheetSourceInfoWorkspaceProps) => {
    if (item.status === 'in_progress') {
        return <Loader className={b('workspace-loader')} size="m" />;
    }

    return null;
};
