import React from 'react';

import {CircleInfo} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {ICON_PANE_DEFAULT_SIZE} from '../PaneView/PaneView';

import './ButtonDocs.scss';

const i18n = I18n.keyset('component.editor-controls');

const b = block('btn-docs');

interface ButtonDocsProps {
    onClick: () => void;
    active: boolean;
    className?: string;
}

export function ButtonDocs({onClick, className, active}: ButtonDocsProps) {
    return (
        <Button
            view="flat-secondary"
            size="l"
            className={b({active}, className)}
            onClick={onClick}
            title={i18n('button_docs')}
        >
            <Icon data={CircleInfo} size={ICON_PANE_DEFAULT_SIZE} className={b('icon')} />
        </Button>
    );
}
