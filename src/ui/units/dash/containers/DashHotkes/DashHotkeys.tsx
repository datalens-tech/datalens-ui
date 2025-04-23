import React from 'react';

import type {HotkeysContextType} from 'react-hotkeys-hook/dist/HotkeysProvider';
import {useDispatch, useSelector} from 'react-redux';
import {Feature} from 'shared';
import {HOTKEYS_SCOPES, REDO_HOTKEY, UNDO_HOTKEY} from 'ui/constants/misc';
import {withHotkeysContext} from 'ui/hoc/withHotkeysContext';
import {useBindHotkey} from 'ui/hooks/useBindHotkey';
import type {DatalensGlobalState} from 'ui/index';
import {goBack, goForward} from 'ui/store/actions/editHistory';
import {selectCanGoBack, selectCanGoForward} from 'ui/store/selectors/editHistory';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {DASH_EDIT_HISTORY_UNIT_ID} from '../../store/constants';
import {selectHasOpenedDialog} from '../../store/selectors/dashTypedSelectors';

export const DashHotkeysWrapper = function DashHotkeys(props: {
    hotkeysContext?: HotkeysContextType;
    children: React.ReactNode;
}) {
    const dispatch = useDispatch();
    const hasOpenedDialog = useSelector(selectHasOpenedDialog);

    React.useEffect(() => {
        props.hotkeysContext?.enableScope(HOTKEYS_SCOPES.DASH);

        return () => {
            props.hotkeysContext?.disableScope(HOTKEYS_SCOPES.DASH);
        };
    }, []);

    const canGoBack = useSelector<DatalensGlobalState, ReturnType<typeof selectCanGoBack>>(
        (state) => selectCanGoBack(state, {unitId: DASH_EDIT_HISTORY_UNIT_ID}),
    );

    const canGoForward = useSelector<DatalensGlobalState, ReturnType<typeof selectCanGoForward>>(
        (state) => selectCanGoForward(state, {unitId: DASH_EDIT_HISTORY_UNIT_ID}),
    );

    const onClickGoBack = React.useCallback(() => {
        if (canGoBack) {
            dispatch(goBack({unitId: DASH_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoBack, dispatch]);

    const onClickGoForward = React.useCallback(() => {
        if (canGoForward) {
            dispatch(goForward({unitId: DASH_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoForward, dispatch]);

    useBindHotkey({
        key: UNDO_HOTKEY,
        handler: onClickGoBack,
        options: {
            scopes: HOTKEYS_SCOPES.DASH,
            enabled: !hasOpenedDialog && isEnabledFeature(Feature.EnableDashUndoRedo),
        },
    });

    useBindHotkey({
        key: REDO_HOTKEY,
        handler: onClickGoForward,
        options: {
            scopes: HOTKEYS_SCOPES.DASH,
            enabled: !hasOpenedDialog && isEnabledFeature(Feature.EnableDashUndoRedo),
        },
    });

    return <React.Fragment>{props.children}</React.Fragment>;
};

export const DashHotkeys = withHotkeysContext(DashHotkeysWrapper);
