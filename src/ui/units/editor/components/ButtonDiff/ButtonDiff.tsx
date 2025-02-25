import React from 'react';

import {LayoutColumns} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {ICON_PANE_DEFAULT_SIZE} from '../PaneView/PaneView';

import './ButtonDiff.scss';

const i18n = I18n.keyset('component.editor-controls');

const b = block('btn-diff');
interface ButtonDiffProps {
    onClick: () => void;
    active: boolean;
    className?: string;
}

export function ButtonDiff({onClick, className, active}: ButtonDiffProps) {
    return (
        <Button
            view="flat-secondary"
            size="l"
            className={b({active}, className)}
            onClick={onClick}
            title={i18n('button_diff')}
        >
            <Icon data={LayoutColumns} size={ICON_PANE_DEFAULT_SIZE} className={b('icon')} />
        </Button>
    );
}
