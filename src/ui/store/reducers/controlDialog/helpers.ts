import type {
    SelectorDialogState,
    SelectorsGroupDialogState,
    SelectorsGroupValidation,
} from '../../typings/controlDialog';

export function getSelectorDialogValidation({
    selectorDialog,
    isSingleSelectorLeft,
    hasLengthChanged,
}: {
    selectorDialog: SelectorDialogState;
    isSingleSelectorLeft: boolean;
    hasLengthChanged: boolean;
}): Partial<SelectorDialogState['validation']> {
    return {
        impactType: isSingleSelectorLeft ? undefined : selectorDialog.validation.impactType,
        // reset the validation when the number of selectors changes
        currentTabVisibility: hasLengthChanged
            ? undefined
            : selectorDialog.validation.currentTabVisibility,
    };
}

export function getSelectorsGroupValidation({
    selectorsGroup,
    impactTabsIds,
    hasLengthChanged,
    payloadValidation,
}: {
    selectorsGroup: SelectorsGroupDialogState;
    impactTabsIds?: string[] | null;
    hasLengthChanged: boolean;
    payloadValidation: SelectorsGroupValidation;
}): SelectorsGroupValidation {
    return {
        impactTabsIds:
            impactTabsIds?.length === 0
                ? selectorsGroup.validation.impactTabsIds ?? payloadValidation.impactTabsIds
                : undefined,
        currentTabVisibility: hasLengthChanged
            ? undefined
            : selectorsGroup.validation.currentTabVisibility,
    };
}

export function getUpdatedAutoHeight({
    enableAutoheightDefault,
    hasLengthChanged,
    isSingleSelectorLeft,
    autoHeight,
}: {
    enableAutoheightDefault?: boolean;
    hasLengthChanged: boolean;
    isSingleSelectorLeft: boolean;
    autoHeight?: boolean;
}): boolean {
    if (enableAutoheightDefault) {
        return true;
    }

    if (isSingleSelectorLeft) {
        return false;
    }

    // if the number of selectors has increased from 1 to several, we enable autoHeight
    return hasLengthChanged && !isSingleSelectorLeft ? true : Boolean(autoHeight);
}
