import React from 'react';

import {Magnifier} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import {ICON_PANE_DEFAULT_SIZE} from '../PaneView/PaneView';

import './ButtonEditorSearch.scss';

const b = block('btn-editor-search');

function ButtonEditorSearch({onClick, className, active}) {
    return (
        <Button
            view="flat-secondary"
            size="s"
            className={b({active}, className)}
            onClick={onClick}
            title="Search"
        >
            <Icon data={Magnifier} size={ICON_PANE_DEFAULT_SIZE} className={b('icon')} />
        </Button>
    );
}

ButtonEditorSearch.propTypes = {
    onClick: PropTypes.func,
    className: PropTypes.string,
    active: PropTypes.bool,
};

export default ButtonEditorSearch;
