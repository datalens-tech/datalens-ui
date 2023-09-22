import React from 'react';

import {ListItemData} from '@gravity-ui/uikit';

import {ListItemProps} from '../../../../../store';

import {FileItem} from './FileItem';
import {SourceItem} from './SourceItem';

export const ListItem = (props: ListItemData<ListItemProps>) => {
    if ('file' in props) {
        return <FileItem {...props} />;
    }

    return <SourceItem {...props} />;
};
