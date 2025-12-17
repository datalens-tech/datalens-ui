import {useCallback} from 'react';

import {useDispatch} from 'react-redux';
import {updateControlsValidation} from 'ui/store/actions/controlDialog/controlDialog';
import type {SelectorDialogState, SelectorsGroupDialogState} from 'ui/store/typings/controlDialog';
import type {IsWidgetVisibleOnTabArgs} from 'ui/units/dash/utils/selectors';
import {isWidgetVisibleOnTab} from 'ui/units/dash/utils/selectors';

// TODO (global selectors): Add translations
const i18n = (key: string) => {
    const values: Record<string, string> = {
        'validation_need-current-tab-impact':
            'Должен быть хотя бы один селектор, видимый на текущей вкладке',
    };

    return values[key];
};

interface UseTabVisibilityValidationParams {
    hasMultipleSelectors?: boolean;
    isGroupSettings?: boolean;
    currentTabId: string;
    impactTabsIds: string[];
    selectorsGroup: SelectorsGroupDialogState;
    selectorDialog: SelectorDialogState;
}

export const useTabVisibilityValidation = ({
    hasMultipleSelectors,
    isGroupSettings,
    currentTabId,
    impactTabsIds,
    selectorsGroup,
    selectorDialog,
}: UseTabVisibilityValidationParams) => {
    const dispatch = useDispatch();

    const validateTabVisibility = useCallback(
        (value: string[]) => {
            if (impactTabsIds.includes(currentTabId) && !value.includes(currentTabId)) {
                let itemData: IsWidgetVisibleOnTabArgs['itemData'];

                if (hasMultipleSelectors && isGroupSettings) {
                    itemData = {...selectorsGroup, impactTabsIds: value};
                } else if (hasMultipleSelectors) {
                    itemData = {
                        ...selectorsGroup,
                        group: selectorsGroup.group.map((item) => {
                            if (
                                item.id === selectorDialog.id ||
                                item.draftId === selectorDialog.draftId
                            ) {
                                return {...item, impactTabsIds: value};
                            }
                            return item;
                        }),
                    };
                } else {
                    itemData = {...selectorDialog, impactTabsIds: value};
                }
                if (
                    !isWidgetVisibleOnTab({
                        tabId: currentTabId,
                        itemData,
                    })
                ) {
                    const validationError = i18n('validation_need-current-tab-impact');
                    dispatch(
                        updateControlsValidation({
                            groupValidation:
                                hasMultipleSelectors &&
                                // check selectorsGroup.impactTabsIds in case all selectors in the group have a setting that differs from the group
                                // in this case, the group may have the correct impactTabsIds and it does not need to be highlighted.
                                (!selectorsGroup.impactTabsIds?.includes(currentTabId) ||
                                    isGroupSettings)
                                    ? {currentTabVisibility: validationError}
                                    : undefined,
                            itemsValidation: {currentTabVisibility: validationError},
                        }),
                    );
                }
            }
        },
        [
            hasMultipleSelectors,
            impactTabsIds,
            currentTabId,
            isGroupSettings,
            selectorsGroup,
            selectorDialog,
            dispatch,
        ],
    );

    return {validateTabVisibility};
};
