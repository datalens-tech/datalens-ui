import React from 'react';

import type {ListItemData} from '@gravity-ui/uikit';

import type {ListItemProps} from '../../../../../store';

import {FileItem} from './FileItem';
import {SourceItem} from './SourceItem';

export const ListItem = (props: ListItemData<ListItemProps>) => {
    if ('file' in props) {
        return <FileItem {...props} />;
    }

    return <SourceItem {...props} />;
};
