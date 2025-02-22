import React from 'react';

import {Magnifier} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {ICON_PANE_DEFAULT_SIZE} from '../PaneView/PaneView';

import './ButtonEditorSearch.scss';

const b = block('btn-editor-search');

const i18n = I18n.keyset('component.editor-controls');

type ButtonSearchProps = {
    onClick: () => void;
    active: boolean;
    className?: string;
}

export function ButtonEditorSearch({onClick, className, active}: ButtonSearchProps) {
    return (
        <Button
            view="flat-secondary"
            size="s"
            className={b({active}, className)}
            onClick={onClick}
            title={i18n('button_search')}
        >
            <Icon data={Magnifier} size={ICON_PANE_DEFAULT_SIZE} className={b('icon')} />
        </Button>
    );
}
