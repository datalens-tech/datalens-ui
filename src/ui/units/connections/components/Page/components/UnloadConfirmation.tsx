import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {Prompt} from 'react-router';
import {useLocation} from 'react-router-dom';
import {selectIsRenameWithoutReload} from 'ui/store/selectors/entryContent';

import {formChangedSelector} from '../../../store';
import {isListPageOpened} from '../utils';

const i18n = I18n.keyset('connections.form');

export const UnloadConfirmation = () => {
    const {pathname} = useLocation();
    const formChanged = useSelector(formChangedSelector);
    const isRenameWithoutReload = useSelector(selectIsRenameWithoutReload);

    const beforeUnloadHandler = React.useCallback(
        (event: BeforeUnloadEvent) => {
            if (formChanged && !isListPageOpened(pathname)) {
                event.returnValue = true;
            }
        },
        [formChanged, pathname],
    );

    // Used when closing/refreshing the page
    React.useEffect(() => {
        window.addEventListener('beforeunload', beforeUnloadHandler);
        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
        };
    }, [beforeUnloadHandler]);

    // Used for SPA transitions
    return <Prompt when={formChanged && !isRenameWithoutReload} message={i18n('toast_unsaved')} />;
};
