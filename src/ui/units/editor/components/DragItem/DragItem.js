import React from 'react';

import {Grip} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {ICON_PANE_DEFAULT_SIZE} from '../PaneView/PaneView';

import './DragItem.scss';

const b = block('drag-item');

export default function DragItem() {
    return (
        <div className={b()} title="Drag pane">
            <Icon data={Grip} size={ICON_PANE_DEFAULT_SIZE} />
        </div>
    );
}
