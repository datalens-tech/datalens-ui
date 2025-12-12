import React from 'react';

import type {DashKitProps} from '@gravity-ui/dashkit';
import {i18n} from 'i18n';
import {getSdk} from 'libs/schematic-sdk';
import debounce from 'lodash/debounce';
import {useDispatch, useSelector} from 'react-redux';
import type {RouteComponentProps} from 'react-router';
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

type Args = {disableUrlState?: boolean} & Pick<RouteComponentProps, 'history' | 'location'>;

export const useHashStates = ({
    disableUrlState,
    history,
    location,
}: Args): {
    hashStates: DashKitProps['itemsStateAndParams'];
    onStateChange: (tabsHashStates: TabsHashStates, config: DashTab) => void;
} => {
    const dispatch = useDispatch();

    const hashStates = useSelector(selectTabHashState);
    const entryId = useSelector(selectEntryId);
    const currentTabId = useSelector(selectCurrentTabId);

    const updateUrlHashState = React.useMemo(
        () =>
            debounce(async (data, tabId) => {
                if (!entryId) {
                    return;
                }

                try {
                    const {hash} = await getSdk().sdk.us.createDashState({
                        entryId,
                        data,
                    });
                    // check if we are still on the same tab (user could switch to another when request is still in progress)
                    if (tabId !== currentTabId) {
                        dispatch(setStateHashId({hash, tabId}));
                        return;
                    }

                    const searchParams = new URLSearchParams(location.search);

                    if (hash) {
                        searchParams.set('state', hash);
                    } else {
                        searchParams.delete('state');
                    }

                    dispatch(setStateHashId({hash, tabId}));

                    history.push({
                        ...location,
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
        [entryId, currentTabId, location, history, dispatch],
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
