import type {PreparedCopyItemOptions} from '@gravity-ui/dashkit';
import type {ConfigItemGroup} from '@gravity-ui/dashkit/helpers';
import isEmpty from 'lodash/isEmpty';
import type {DashTabItemControlData, DashTabItemGroupControlData} from 'shared/types';
import {DashTabItemType} from 'shared/types';
import {DEFAULT_CONTROL_LAYOUT} from 'ui/components/DashKit/constants';
import {COPIED_WIDGET_STORAGE_KEY, type DatalensGlobalState} from 'ui/index';
import type {AppDispatch} from 'ui/store';
import {CONTROLS_PLACEMENT_MODE} from 'ui/units/dash/containers/Dialogs/constants';
import type {CopiedConfigContext} from 'ui/units/dash/modules/helpers';
import {getPreparedCopyItemOptions} from 'ui/units/dash/modules/helpers';

import {getGroupSelectorDialogInitialState} from '../../reducers/dash';
import {selectOpenedItem, selectOpenedItemData} from '../../selectors/dashTypedSelectors';
import type {SetSelectorDialogItemArgs} from '../dashTyped';
import {setItemData, setSelectorDialogItem} from '../dashTyped';
import {closeDialog as closeDashDialog} from '../dialogs/actions';
import {getExtendedItemDataAction} from '../helpers';

import {getControlDefaultsForField, getControlValidation, getItemDataSource} from './helpers';
import type {SelectorsGroupDialogState} from './types';

export const ADD_SELECTOR_TO_GROUP = Symbol('dash/ADD_SELECTOR_TO_GROUP');

export const addSelectorToGroup = (payload: SetSelectorDialogItemArgs) => {
    return {
        type: ADD_SELECTOR_TO_GROUP,
        payload,
    };
};

export type AddSelectorToGroupAction = {
    type: typeof ADD_SELECTOR_TO_GROUP;
    payload: SetSelectorDialogItemArgs;
};

export const UPDATE_SELECTORS_GROUP = Symbol('dash/UPDATE_SELECTORS_GROUP');

export type UpdateSelectorsGroupAction = {
    type: typeof UPDATE_SELECTORS_GROUP;
    payload: SelectorsGroupDialogState;
};

export const updateSelectorsGroup = (payload: UpdateSelectorsGroupAction['payload']) => {
    return {
        type: UPDATE_SELECTORS_GROUP,
        payload,
    };
};

export const SET_ACTIVE_SELECTOR_INDEX = Symbol('dash/SET_ACTIVE_SELECTOR_INDEX');

export type SetActiveSelectorIndexAction = {
    type: typeof SET_ACTIVE_SELECTOR_INDEX;
    payload: {
        activeSelectorIndex: number;
    };
};

export const setActiveSelectorIndex = (payload: SetActiveSelectorIndexAction['payload']) => {
    return {
        type: SET_ACTIVE_SELECTOR_INDEX,
        payload,
    };
};

export const validateAndCopyControl = (controlIndex: number) => {
    return (dispatch: AppDispatch, getState: () => DatalensGlobalState) => {
        const state = getState();
        const {
            selectorsGroup,
            activeSelectorIndex,
            entry: {workbookId},
        } = state.dash;
        const openedItem = selectOpenedItem(state);

        const validation = getControlValidation(selectorsGroup.group[controlIndex]);

        if (!isEmpty(validation)) {
            if (activeSelectorIndex !== controlIndex) {
                dispatch(setActiveSelectorIndex({activeSelectorIndex: controlIndex}));
            }

            setSelectorDialogItem({
                validation,
            });

            return;
        }

        // logic is copied from dashkit
        const selectorToCopy = selectorsGroup.group[controlIndex];

        const copiedItem = {
            title: selectorToCopy.title,
            sourceType: selectorToCopy.sourceType,
            source: getItemDataSource(selectorToCopy) as DashTabItemControlData['source'],
            defaults: getControlDefaultsForField(selectorToCopy),
            namespace: openedItem?.namespace,
            width: '',
            placementMode: CONTROLS_PLACEMENT_MODE.AUTO,
        };

        const options: PreparedCopyItemOptions<CopiedConfigContext> = {
            timestamp: Date.now(),
            data: {
                ...getGroupSelectorDialogInitialState(),
                group: [copiedItem as unknown as ConfigItemGroup],
            },
            type: DashTabItemType.GroupControl,
            defaults: copiedItem.defaults,
            namespace: copiedItem.namespace,
            layout: DEFAULT_CONTROL_LAYOUT,
        };

        const preparedOptions = getPreparedCopyItemOptions(options, null, {
            workbookId: workbookId ?? null,
        });

        localStorage.setItem(COPIED_WIDGET_STORAGE_KEY, JSON.stringify(preparedOptions));
        // https://stackoverflow.com/questions/35865481/storage-event-not-firing
        window.dispatchEvent(new Event('storage'));
    };
};

export const applyGroupControlDialog = () => {
    return (dispatch: AppDispatch, getState: () => DatalensGlobalState) => {
        const state = getState();
        const {selectorsGroup, openedItemId, activeSelectorIndex} = state.dash;

        let firstInvalidIndex: number | null = null;
        const groupFieldNames: Record<string, string[]> = {};
        selectorsGroup.group.forEach((groupItem) => {
            if (groupItem.fieldName) {
                const itemName = groupItem.title;
                if (groupFieldNames[groupItem.fieldName] && itemName) {
                    groupFieldNames[groupItem.fieldName].push(itemName);
                }

                if (!groupFieldNames[groupItem.fieldName] && itemName) {
                    groupFieldNames[groupItem.fieldName] = [itemName];
                }
            }
        });

        const validatedSelectorsGroup = Object.assign({}, selectorsGroup);

        // check validation for every control
        for (let i = 0; i < validatedSelectorsGroup.group.length; i += 1) {
            const validation = getControlValidation(
                validatedSelectorsGroup.group[i],
                groupFieldNames,
            );

            if (!isEmpty(validation) && firstInvalidIndex === null) {
                firstInvalidIndex = i;
            }

            validatedSelectorsGroup.group[i].validation = validation;
        }

        if (firstInvalidIndex !== null) {
            const activeSelectorValidation =
                validatedSelectorsGroup.group[activeSelectorIndex].validation;
            dispatch(updateSelectorsGroup(validatedSelectorsGroup));

            if (!isEmpty(activeSelectorValidation)) {
                dispatch(
                    setSelectorDialogItem({
                        validation: activeSelectorValidation,
                    }),
                );
                return;
            }
            dispatch(setActiveSelectorIndex({activeSelectorIndex: firstInvalidIndex}));
            return;
        }

        const isSingleControl = selectorsGroup.group.length === 1;
        const autoHeight =
            !isSingleControl || selectorsGroup.buttonApply || selectorsGroup.buttonReset
                ? selectorsGroup.autoHeight
                : false;
        const updateControlsOnChange =
            !isSingleControl && selectorsGroup.buttonApply
                ? selectorsGroup.updateControlsOnChange
                : false;

        const data = {
            autoHeight,
            buttonApply: selectorsGroup.buttonApply,
            buttonReset: selectorsGroup.buttonReset,
            updateControlsOnChange,
            group: selectorsGroup.group.map((selector) => {
                let hasChangedSourceType = false;
                if (openedItemId) {
                    const openedItemData = selectOpenedItemData(
                        state,
                    ) as DashTabItemGroupControlData;

                    const configSelectorItem = openedItemData.group?.find(
                        ({id}) => id === selector.id,
                    );

                    // we check changing of sourceType only if selector was already saved and it's not the old one
                    hasChangedSourceType = configSelectorItem
                        ? configSelectorItem.sourceType !== selector.sourceType
                        : false;
                }

                return {
                    id: selector.id,
                    title: selector.title,
                    sourceType: selector.sourceType,
                    source: getItemDataSource(selector) as DashTabItemControlData['source'],
                    placementMode: isSingleControl ? 'auto' : selector.placementMode,
                    width: isSingleControl ? '' : selector.width,
                    defaults: getControlDefaultsForField(selector, hasChangedSourceType),
                    namespace: selector.namespace,
                };
            }),
        };

        const getExtendedItemData = getExtendedItemDataAction();
        const itemData = dispatch(getExtendedItemData({data}));

        dispatch(
            setItemData({
                data: itemData.data,
                type: DashTabItemType.GroupControl,
            }),
        );

        dispatch(closeDashDialog());
    };
};
