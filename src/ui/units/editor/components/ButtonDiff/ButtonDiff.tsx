import React from 'react';

import {LayoutColumns} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {ICON_PANE_DEFAULT_SIZE} from '../PaneView/PaneView';

import './ButtonDiff.scss';

const b = block('btn-diff');

interface ButtonDiffProps {
    onClick: () => void;
    active: boolean;
    className?: string;
}

function ButtonDiff({onClick, className, active}: ButtonDiffProps) {
    return (
        <Button
            view="flat-secondary"
            size="l"
            className={b({active}, className)}
            onClick={onClick}
            title="View diff"
        >
            <Icon data={LayoutColumns} size={ICON_PANE_DEFAULT_SIZE} className={b('icon')} />
        </Button>
    );
}

export default ButtonDiff;
