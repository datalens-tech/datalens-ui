import React from 'react';

import {Popup, Sheet, useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {POPUP_VERTICAL_OFFSET} from '../../../SimpleDatepicker/constants';
import {Action} from '../../store';

const b = block('yc-range-datepicker');

interface ContainerProps {
    dispatch: React.Dispatch<Action>;
    popupClassName?: string;
    active?: boolean;
    withTime?: boolean;
    controlRef?: React.RefObject<HTMLElement>;
    children?: React.ReactNode;
}

export function Container(props: ContainerProps) {
    const {popupClassName, active = false, withTime, controlRef, dispatch} = props;
    const mobile = useMobile();

    const onClose = () => dispatch({type: 'SET_UPDATE', payload: {callOnUpdate: true}});

    return mobile ? (
        <Sheet
            id="yc-range-datepicker"
            className={b('sheet')}
            visible={active}
            allowHideOnContentScroll={false}
            onClose={onClose}
        >
            {props.children}
        </Sheet>
    ) : (
        <Popup
            contentClassName={b('popup', {'with-time': withTime}, popupClassName)}
            open={active}
            anchorRef={controlRef}
            offset={[0, POPUP_VERTICAL_OFFSET]}
            placement={['bottom-start', 'top-start']}
            onClose={onClose}
        >
            {props.children}
        </Popup>
    );
}
