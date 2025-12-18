import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Flex, HelpMark, List, Switch, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {CONTROLS_PLACEMENT_MODE, DialogGroupControlQa, TitlePlacementOption} from 'shared';
import {ImpactTypeSelect} from 'ui/components/ControlComponents/Sections/CommonSettingsSection/ImpactTypeSelect/ImpactTypeSelect';
import {FormSection} from 'ui/components/FormSection/FormSection';
import {
    updateControlsValidation,
    updateSelectorsGroup,
} from 'ui/store/actions/controlDialog/controlDialog';
import {selectSelectorValidation, selectSelectorsGroup} from 'ui/store/selectors/controlDialog';
import type {SelectorDialogState} from 'ui/store/typings/controlDialog';
import {selectTabId} from 'ui/units/dash/store/selectors/dashTypedSelectors';
import {isWidgetVisibleOnTab} from 'ui/units/dash/utils/selectors';

import {ControlPlacementRow} from './ControlPlacementRow';

import './GroupExtendedSettings.scss';

export type ExtendedSettingsDialogProps = {
    selectorsGroupTitlePlaceholder?: string;
    enableAutoheightDefault?: boolean;
    showSelectorsGroupTitle?: boolean;
    enableGlobalSelectors?: boolean;
    showErrors: boolean;
    errorsIndexes: number[];
    updateErrorsIndexes: (args: (indexes: number[]) => number[]) => void;
};

const b = block('group-extended-settings');

const i18n = I18n.keyset('dash.extended-settings-dialog.edit');

const SELECTOR_WIDTH = 336;

const resetAutoValues = (group: SelectorDialogState[]) =>
    group.map((item) =>
        item.placementMode === CONTROLS_PLACEMENT_MODE.AUTO ? {...item, width: ''} : item,
    );

export const GroupExtendedSettings: React.FC<ExtendedSettingsDialogProps> = ({
    selectorsGroupTitlePlaceholder,
    enableAutoheightDefault,
    showSelectorsGroupTitle,
    enableGlobalSelectors,
    showErrors,
    errorsIndexes,
    updateErrorsIndexes,
}) => {
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const selectorValidation = useSelector(selectSelectorValidation);
    const tabId = useSelector(selectTabId);

    const dispatch = useDispatch();

    const dispatchGroupUpdate = React.useCallback(
        (newGroup: SelectorDialogState[]) => {
            const updatedGroup = resetAutoValues(newGroup);
            dispatch(
                updateSelectorsGroup({
                    ...selectorsGroup,
                    group: updatedGroup,
                }),
            );

            if (
                tabId &&
                (selectorsGroup.validation.currentTabVisibility ||
                    selectorValidation.currentTabVisibility) &&
                isWidgetVisibleOnTab({itemData: selectorsGroup, tabId})
            ) {
                dispatch(
                    updateControlsValidation({
                        groupValidation: {
                            ...selectorsGroup.validation,
                            currentTabVisibility: undefined,
                        },
                        itemsValidation: {
                            ...selectorValidation,
                            currentTabVisibility: undefined,
                        },
                    }),
                );
            }
        },
        [dispatch, selectorsGroup, tabId, selectorValidation],
    );

    const moveItem = React.useCallback(
        (oldIndex: number, newIndex: number) => {
            const dragItem = selectorsGroup.group[oldIndex];
            const newGroup = selectorsGroup.group.filter((_, index) => index !== oldIndex);
            newGroup.splice(newIndex, 0, dragItem);
            dispatchGroupUpdate(newGroup);
        },
        [selectorsGroup.group, dispatchGroupUpdate],
    );

    const handlePlacementModeUpdate = React.useCallback(
        (targetIndex: number, newType: SelectorDialogState['placementMode']) => {
            const newGroup = selectorsGroup.group.map((item, index) => {
                if (index !== targetIndex) {
                    return item;
                }
                return {...item, placementMode: newType};
            });
            dispatchGroupUpdate(newGroup);
        },
        [selectorsGroup.group, dispatchGroupUpdate],
    );

    const handlePlacementValueUpdate = React.useCallback(
        (targetIndex: number, newValue: string) => {
            const newGroup = selectorsGroup.group.map((item, index) => {
                if (index !== targetIndex) {
                    return item;
                }
                return {...item, width: newValue};
            });
            dispatchGroupUpdate(newGroup);
        },
        [selectorsGroup.group, dispatchGroupUpdate],
    );

    const handleError = React.useCallback((index: number, isError: boolean) => {
        if (!isError) {
            updateErrorsIndexes((prevErrors) => prevErrors.filter((error) => error !== index));
            return;
        }

        updateErrorsIndexes((prevErrors) => {
            if (prevErrors.includes(index)) {
                return prevErrors;
            }
            return [...prevErrors, index];
        });
    }, []);

    const renderControlPlacementRow = React.useCallback(
        (item, _, index) => {
            return (
                <ControlPlacementRow
                    key={`${item.title}-${item.id}`}
                    title={item.title || ''}
                    value={item.width || ''}
                    mode={item.placementMode || CONTROLS_PLACEMENT_MODE.AUTO}
                    onPlacementModeUpdate={handlePlacementModeUpdate}
                    onPlacementValueUpdate={handlePlacementValueUpdate}
                    index={index}
                    onError={handleError}
                    showErrors={showErrors}
                />
            );
        },
        [handlePlacementModeUpdate, handlePlacementValueUpdate, handleError, showErrors],
    );

    const isMultipleSelectors = selectorsGroup.group?.length > 1;

    const handleChangeShowGroupName = React.useCallback(
        (value) => {
            dispatch(
                updateSelectorsGroup({
                    ...selectorsGroup,
                    showGroupName: value,
                }),
            );
        },
        [dispatch, selectorsGroup],
    );

    const handleChangeGroupName = React.useCallback(
        (value) => {
            dispatch(
                updateSelectorsGroup({
                    ...selectorsGroup,
                    groupName: value,
                }),
            );
        },
        [dispatch, selectorsGroup],
    );

    const handleChangeAutoHeight = React.useCallback(
        (value) => {
            dispatch(
                updateSelectorsGroup({
                    ...selectorsGroup,
                    autoHeight: value,
                }),
            );
        },
        [dispatch, selectorsGroup],
    );

    const handleChangeButtonApply = React.useCallback(
        (value) => {
            dispatch(
                updateSelectorsGroup({
                    ...selectorsGroup,
                    buttonApply: value,
                }),
            );
        },
        [dispatch, selectorsGroup],
    );

    const handleChangeButtonReset = React.useCallback(
        (value) => {
            dispatch(
                updateSelectorsGroup({
                    ...selectorsGroup,
                    buttonReset: value,
                }),
            );
        },
        [dispatch, selectorsGroup],
    );

    const handleChangeUpdateControls = React.useCallback(
        (value: boolean) => {
            dispatch(
                updateSelectorsGroup({
                    ...selectorsGroup,
                    updateControlsOnChange: value,
                }),
            );
        },
        [dispatch, selectorsGroup],
    );

    const showAutoHeight =
        !enableAutoheightDefault &&
        (isMultipleSelectors ||
            selectorsGroup.buttonApply ||
            selectorsGroup.buttonReset ||
            // until we have supported automatic height adjustment for case with top title placement,
            // we allow to enable autoheight
            selectorsGroup.group[0].titlePlacement === TitlePlacementOption.Top);
    const showUpdateControlsOnChange = selectorsGroup.buttonApply && isMultipleSelectors;
    const showImpactTypeSelect = isMultipleSelectors && enableGlobalSelectors;

    return (
        <React.Fragment>
            <FormSection title={i18n('label_group-display')}>
                {showSelectorsGroupTitle && (
                    <FormRow className={b('row')} label={i18n('label_group-name')}>
                        <Flex gap={2}>
                            <Switch
                                checked={selectorsGroup.showGroupName}
                                onUpdate={handleChangeShowGroupName}
                                className={b('switch')}
                            />
                            <TextInput
                                disabled={!selectorsGroup.showGroupName}
                                value={selectorsGroup.groupName}
                                onUpdate={handleChangeGroupName}
                                placeholder={selectorsGroupTitlePlaceholder}
                            />
                        </Flex>
                    </FormRow>
                )}
                <FormRow
                    className={b('row')}
                    label={
                        <React.Fragment>
                            {i18n('label_apply-button-checkbox')}
                            <HelpMark className={b('help-icon')}>
                                {i18n('context_apply-button')}
                            </HelpMark>
                        </React.Fragment>
                    }
                >
                    <Switch
                        checked={selectorsGroup.buttonApply}
                        onUpdate={handleChangeButtonApply}
                        qa={DialogGroupControlQa.applyButtonSwitch}
                        className={b('switch')}
                    />
                </FormRow>
                <FormRow
                    className={b('row')}
                    label={
                        <React.Fragment>
                            {i18n('label_reset-button-checkbox')}
                            <HelpMark className={b('help-icon')}>
                                {i18n('context_reset-button')}
                            </HelpMark>
                        </React.Fragment>
                    }
                >
                    <Switch
                        checked={selectorsGroup.buttonReset}
                        onUpdate={handleChangeButtonReset}
                        qa={DialogGroupControlQa.resetButtonSwitch}
                        className={b('switch')}
                    />
                </FormRow>
                {showAutoHeight && (
                    <FormRow className={b('row')} label={i18n('label_autoheight-checkbox')}>
                        <Switch
                            checked={selectorsGroup.autoHeight}
                            onUpdate={handleChangeAutoHeight}
                            qa={DialogGroupControlQa.autoHeightSwitch}
                            className={b('switch')}
                        />
                    </FormRow>
                )}
                {showUpdateControlsOnChange && (
                    <FormRow
                        className={b('row')}
                        label={
                            <React.Fragment>
                                {i18n('label_update-controls-on-change')}
                                <HelpMark className={b('help-icon')}>
                                    {i18n('context_update-controls-on-change')}
                                </HelpMark>
                            </React.Fragment>
                        }
                    >
                        <Switch
                            checked={selectorsGroup.updateControlsOnChange}
                            onUpdate={handleChangeUpdateControls}
                            qa={DialogGroupControlQa.updateControlOnChangeCheckbox}
                            className={b('switch')}
                        />
                    </FormRow>
                )}

                {showImpactTypeSelect && (
                    <ImpactTypeSelect
                        isGroupSettings={true}
                        groupImpactType={selectorsGroup.impactType}
                        groupImpactTabsIds={selectorsGroup.impactTabsIds}
                        selectorWidth={SELECTOR_WIDTH}
                        className={b('row')}
                        hasMultipleSelectors={isMultipleSelectors}
                    />
                )}
            </FormSection>
            {isMultipleSelectors && (
                <FormSection title={i18n('label_selectors-representation')}>
                    <div className={b('note')}>{i18n('label_note')}</div>
                    <div className={b('selectors')}>
                        <List
                            qa={DialogGroupControlQa.placementControlList}
                            items={selectorsGroup.group}
                            filterable={false}
                            sortable={true}
                            virtualized={false}
                            onSortEnd={({oldIndex, newIndex}) => moveItem(oldIndex, newIndex)}
                            itemClassName={b('list-item-container')}
                            renderItem={renderControlPlacementRow}
                        />
                    </div>
                    {showErrors && errorsIndexes.length > 0 && (
                        <div className={b('error')}>{i18n('label_field-validation')}</div>
                    )}
                </FormSection>
            )}
        </React.Fragment>
    );
};
