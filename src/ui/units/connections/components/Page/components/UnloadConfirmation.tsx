import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {Prompt} from 'react-router';
import {selectIsRenameWithoutReload} from 'ui/store/selectors/entryContent';

import {formChangedSelector} from '../../../store';
import {isListPageOpened} from '../utils';

const i18n = I18n.keyset('connections.form');

export const UnloadConfirmation = () => {
    const formChanged = useSelector(formChangedSelector);
    const isRenameWithoutReload = useSelector(selectIsRenameWithoutReload);
    const listPageOpened = isListPageOpened(location.pathname);

    const beforeUnloadHandler = React.useCallback(
        (event: BeforeUnloadEvent) => {
            if (formChanged && !listPageOpened) {
                event.returnValue = true;
            }
        },
        [formChanged, listPageOpened],
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
