import React from 'react';

import {Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import './PopupMessage.scss';

const b = block('popup-message');

const mapLegoDirectionsToCommonPlacement = {
    'bottom-left': 'bottom-start',
    'bottom-center': 'bottom',
    'bottom-right': 'bottom-end',
    'top-left': 'top-start',
    'top-center': 'top',
    'top-right': 'top-end',
    'right-top': 'right-start',
    'right-center': 'right',
    'right-bottom': 'right-end',
    'left-top': 'left-start',
    'left-center': 'left',
    'left-bottom': 'left-end',
};

export default function PopupMessage(props) {
    const {anchor, visible, children, to, toSide, tail, onOutsideClick} = props;

    return (
        <Popup
            {...{
                hasArrow: tail,
                onOpenChange: (open) => {
                    if (!open) {
                        onOutsideClick();
                    }
                },
                open: visible,
                placement: []
                    .concat(to)
                    .map((dir) => mapLegoDirectionsToCommonPlacement[`${dir}-${toSide}`]),
                anchorElement: anchor.current,
            }}
        >
            <div className={b('content')}>{children}</div>
        </Popup>
    );
}

PopupMessage.propTypes = {
    anchor: PropTypes.object,
    autoclosable: PropTypes.bool,
    visible: PropTypes.bool,
    offset: PropTypes.number,
    to: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    toSide: PropTypes.oneOf(['left', 'center', 'right', 'top', 'bottom']),
    mainOffset: PropTypes.number,
    size: PropTypes.oneOf(['s']),
    theme: PropTypes.oneOf(['normal', 'error', 'hint']),
    tail: PropTypes.bool,
    onOutsideClick: PropTypes.func,
};

PopupMessage.defaultProps = {
    to: ['right', 'bottom', 'top', 'left'],
    toSide: 'center',
    tail: true,
};
