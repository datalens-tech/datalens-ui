import React from 'react';

import type {DashKitProps} from '@gravity-ui/dashkit';
import {i18n} from 'i18n';
import {getSdk} from 'libs/schematic-sdk';
import debounce from 'lodash/debounce';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import {UPDATE_STATE_DEBOUNCE_TIME} from 'shared';
import type {DashTab} from 'shared';
import {showToast} from 'ui/store/actions/toaster';

import {setHashState, setStateHashId} from '../../../../../store/actions/dashTyped';
import type {TabsHashStates} from '../../../../../store/actions/dashTyped';
import {
    selectCurrentTabId,
    selectEntryId,
    selectTabHashState,
} from '../../../../../store/selectors/dashTypedSelectors';

type Args = {disableUrlState?: boolean};

export const useHashStates = ({
    disableUrlState,
}: Args): {
    hashStates: DashKitProps['itemsStateAndParams'];
    onStateChange: (tabsHashStates: TabsHashStates, config: DashTab) => void;
} => {
    const dispatch = useDispatch();

    const history = useHistory();
    const location = useLocation();

    const hashStates = useSelector(selectTabHashState);
    const entryId = useSelector(selectEntryId);
    const currentTabId = useSelector(selectCurrentTabId);

    const updateUrlHashStateParamsRef = React.useRef({entryId, currentTabId, location, history});

    React.useEffect(() => {
        updateUrlHashStateParamsRef.current = {entryId, currentTabId, location, history};
    }, [entryId, currentTabId, location, history]);

    const updateUrlHashState = React.useMemo(
        () =>
            debounce(async (data, tabId) => {
                const updateUrlHashStateParams = updateUrlHashStateParamsRef.current;
                if (!updateUrlHashStateParams.entryId) {
                    return;
                }

                try {
                    const {hash} = await getSdk().sdk.us.createDashState({
                        entryId: updateUrlHashStateParams.entryId,
                        data,
                    });
                    // check if we are still on the same tab (user could switch to another when request is still in progress)
                    if (tabId !== updateUrlHashStateParams.currentTabId) {
                        dispatch(setStateHashId({hash, tabId}));
                        return;
                    }

                    const searchParams = new URLSearchParams(
                        updateUrlHashStateParams.location.search,
                    );

                    if (hash) {
                        searchParams.set('state', hash);
                    } else {
                        searchParams.delete('state');
                    }

                    dispatch(setStateHashId({hash, tabId}));

                    updateUrlHashStateParams.history.push({
                        ...updateUrlHashStateParams.location,
                        search: `?${searchParams.toString()}`,
                    });
                } catch (error) {
                    const details = error?.details?.details;
                    const isStateLimitError = details?.some(
                        ({params, path}: {path?: string[]; params?: {code?: string}}) =>
                            path?.length === 1 &&
                            path[0] === 'data' &&
                            params?.code === 'OBJECT_SIZE_LIMIT_EXCEEDED',
                    );

                    const title = isStateLimitError
                        ? i18n('dash.main.view', 'value_state-limit-error')
                        : error.message;

                    const message = isStateLimitError
                        ? i18n('dash.main.view', 'value_state-limit-error-message')
                        : error.message;

                    dispatch(
                        showToast({
                            title,
                            content: message,
                            error: {...error, message},
                            withReport: true,
                        }),
                    );
                    throw error;
                }
            }, UPDATE_STATE_DEBOUNCE_TIME),
        [dispatch],
    );

    const onStateChange = React.useCallback(
        (tabsHashStates: TabsHashStates, config: DashTab) => {
            dispatch(setHashState(tabsHashStates, config));
            if (disableUrlState) {
                return;
            }
            updateUrlHashState(tabsHashStates, currentTabId);
        },
        [dispatch, currentTabId, disableUrlState, updateUrlHashState],
    );

    React.useEffect(() => {
        return () => updateUrlHashState.cancel();
    }, []);

    return {
        hashStates: hashStates as DashKitProps['itemsStateAndParams'],
        onStateChange,
    };
};
