import React from 'react';

import type {ListItemData} from '@gravity-ui/uikit';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {UploadedGSheet} from '../../../../../store';

const b = block('conn-form-gsheets');

type GSheetWorkspaceProps = {
    item: ListItemData<UploadedGSheet>;
};

export const GSheetWorkspace = ({item}: GSheetWorkspaceProps) => {
    if (item.status === 'in_progress') {
        return <Loader className={b('workspace-loader')} size="m" />;
    }

    return null;
};
