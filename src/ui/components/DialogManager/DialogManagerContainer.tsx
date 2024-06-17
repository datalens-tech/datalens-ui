import React, {useEffect} from 'react';

import {useHotkeysContext} from 'react-hotkeys-hook';
import {useDispatch, useSelector} from 'react-redux';

import type {DatalensGlobalState} from '../../';
import {useEffectOnce} from '../../';
import {useSetHotkeysScope} from '../../hooks/useSetHotkeysScope';
import {closeDialog} from '../../store/actions/dialog';
import history from '../../utils/history';

import DialogManager from './DialogManager';

export const DialogManagerContainer = () => {
    const dispatch = useDispatch();
    const dialogs = useSelector((state: DatalensGlobalState) => state.dialog.dialogs);

    const hotkeysContext = useHotkeysContext();

    const {setHotkeysScope, unsetHotkeysScope} = useSetHotkeysScope({
        hotkeysContext,
        componentScope: 'dialog-manager',
    });

    useEffectOnce(() => {
        const unregister = history.listen(() => {
            dispatch(closeDialog());
        });

        return () => {
            unregister();
        };
    });

    useEffect(() => {
        // If at least 1 dialog is opened
        if (dialogs.length > 0) {
            setHotkeysScope();
        } else {
            unsetHotkeysScope();
        }
    }, [dialogs]);

    return (
        <>
            {dialogs.map((el, index) => {
                const DialogComponent = (DialogManager.dialogs as any)[el.id];

                if (!DialogComponent) {
                    return null;
                }

                return <DialogComponent {...el.props} key={index} />;
            })}
        </>
    );
};

export default DialogManagerContainer;
