import React from 'react';

import type History from 'history';
import {i18n} from 'i18n';
import {useSelector} from 'react-redux';
import {Prompt, useLocation} from 'react-router-dom';
import {selectIsRenameWithoutReload} from 'ui/store/selectors/entryContent';
import {
    isDatasetChangedDatasetSelector,
    isDatasetRevisionMismatchSelector,
    isSavingDatasetDisabledSelector,
} from 'ui/units/datasets/store/selectors';

export const UnloadConfirmation = () => {
    const currentLocation = useLocation();
    const isRenameWithoutReload = useSelector(selectIsRenameWithoutReload);
    const isSavingDatasetDisabled = useSelector(isSavingDatasetDisabledSelector);
    const isDatasetRevisionMismatch = useSelector(isDatasetRevisionMismatchSelector);
    const isDatasetChangedDataset = useSelector(isDatasetChangedDatasetSelector);
    const [isAlreadyConfirmed, setIsAlreadyConfirmed] = React.useState(false);
    const isConfirmationAvailable =
        !isAlreadyConfirmed &&
        (!isSavingDatasetDisabled || isDatasetChangedDataset) &&
        !isRenameWithoutReload &&
        !isDatasetRevisionMismatch;

    const message = React.useCallback(
        (location: History.Location<unknown>) => {
            setIsAlreadyConfirmed(true);
            setTimeout(() => setIsAlreadyConfirmed(false), 0);
            if (location.pathname !== currentLocation.pathname) {
                return i18n('component.navigation-prompt', 'label_prompt-message');
            }

            return true;
        },
        [currentLocation.pathname],
    );

    React.useEffect(() => {
        const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
            if (isConfirmationAvailable) {
                // eslint-disable-next-line no-param-reassign
                event.returnValue = true;
            }
        };

        window.addEventListener('beforeunload', beforeUnloadHandler);

        return () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
        };
    }, [isConfirmationAvailable]);

    return <Prompt when={isConfirmationAvailable} message={message} />;
};
