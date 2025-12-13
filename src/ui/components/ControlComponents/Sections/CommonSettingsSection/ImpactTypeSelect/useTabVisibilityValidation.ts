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
    isGroupControl: boolean;
    isGroupSettings?: boolean;
    currentTabId: string;
    impactTabsIds: string[];
    selectorsGroup: SelectorsGroupDialogState;
    selectorDialog: SelectorDialogState;
    onRaiseTabVisibilityProblem?: () => void;
}

export const useTabVisibilityValidation = ({
    isGroupControl,
    isGroupSettings,
    currentTabId,
    impactTabsIds,
    selectorsGroup,
    selectorDialog,
    onRaiseTabVisibilityProblem,
}: UseTabVisibilityValidationParams) => {
    const dispatch = useDispatch();

    const validateTabVisibility = useCallback(
        (value: string[]) => {
            if (
                isGroupControl &&
                impactTabsIds.includes(currentTabId) &&
                !value.includes(currentTabId)
            ) {
                let itemData: IsWidgetVisibleOnTabArgs['itemData'];

                if (isGroupControl && isGroupSettings) {
                    itemData = {...selectorsGroup, impactTabsIds: value};
                } else if (isGroupControl) {
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
                    if (onRaiseTabVisibilityProblem) {
                        onRaiseTabVisibilityProblem?.();
                        return;
                    }

                    const validationError = i18n('validation_need-current-tab-impact');
                    dispatch(
                        updateControlsValidation({
                            groupValidation:
                                isGroupControl &&
                                !selectorsGroup.impactTabsIds?.includes(currentTabId)
                                    ? {currentTabVisibility: validationError}
                                    : undefined,
                            itemsValidation: {currentTabVisibility: validationError},
                        }),
                    );
                }
            }
        },
        [
            isGroupControl,
            impactTabsIds,
            currentTabId,
            isGroupSettings,
            selectorsGroup,
            selectorDialog,
            onRaiseTabVisibilityProblem,
            dispatch,
        ],
    );

    return {validateTabVisibility};
};
