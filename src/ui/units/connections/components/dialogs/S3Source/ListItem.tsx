import React from 'react';

import {Checkbox, Radio} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {DialogS3SourceItem} from './types';

const b = block('conn-dialog-s3-source');

type ListItemProps = {
    item: DialogS3SourceItem;
    batch?: boolean;
};

const ListItemComponent = ({item, batch}: ListItemProps) => {
    const {title, source_id, disabled, selected = false} = item;

    return (
        <div className={b('list-row', {disabled, selected})}>
            {batch ? (
                <Checkbox size="l" checked={selected} disabled={disabled} />
            ) : (
                <Radio size="l" value={source_id} checked={selected} />
            )}
            <span>{title}</span>
        </div>
    );
};

export const ListItem = React.memo(ListItemComponent);
