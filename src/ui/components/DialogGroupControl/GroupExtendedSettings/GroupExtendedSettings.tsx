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
};

const b = block('group-extended-settings');

const i18n = I18n.keyset('dash.extended-settings-dialog.edit');

// const dialogI18n = I18n.keyset('dash.control-dialog.edit');

// TODO (global selectors): Add translations
const dialogI18n = (key: string) => {
    const values: Record<string, string> = {
        'validation_need-current-tab-impact':
            'Должен быть хотя бы один селектор, видимый на текущей вкладке',
    };

    return values[key];
};

const resetAutoValues = (group: SelectorDialogState[]) =>
    group.map((item) =>
        item.placementMode === CONTROLS_PLACEMENT_MODE.AUTO ? {...item, width: ''} : item,
    );

export const GroupExtendedSettings: React.FC<ExtendedSettingsDialogProps> = ({
    selectorsGroupTitlePlaceholder,
    enableAutoheightDefault,
    showSelectorsGroupTitle,
    enableGlobalSelectors,
}) => {
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const selectorValidation = useSelector(selectSelectorValidation);
    const tabId = useSelector(selectTabId);

    const [itemsState, setItemsState] = React.useState(selectorsGroup.group);
    const [errorsIndexes, setErrorsIndexes] = React.useState<number[]>([]);
    const [showErrors, setShowErrors] = React.useState(false);
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (!errorsIndexes.length) {
            setShowErrors(false);
        }
    }, [errorsIndexes.length]);

    const moveItem = React.useCallback((oldIndex: number, newIndex: number) => {
        setItemsState((prevItemsState) => {
            const dragItem = prevItemsState[oldIndex];
            const newItemsState = prevItemsState.filter((_, index) => index !== oldIndex);
            newItemsState.splice(newIndex, 0, dragItem);
            return newItemsState;
        });
    }, []);

    // TODO - вынести
    const _handleApplyClick = React.useCallback(() => {
        if (errorsIndexes.length) {
            setShowErrors(true);
            return;
        }
        const updatedItemsState = resetAutoValues(itemsState);
        dispatch(
            updateSelectorsGroup({
                ...selectorsGroup,
                group: updatedItemsState,
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
    }, [errorsIndexes.length, itemsState, dispatch, selectorsGroup, tabId, selectorValidation]);

    const handlePlacementModeUpdate = React.useCallback(
        (targetIndex: number, newType: SelectorDialogState['placementMode']) => {
            setItemsState((prevItemsState) => {
                return prevItemsState.map((item, index) => {
                    if (index !== targetIndex) {
                        return item;
                    }
                    return {...item, placementMode: newType};
                });
            });
        },
        [],
    );

    const handlePlacementValueUpdate = React.useCallback(
        (targetIndex: number, newValue: string) => {
            setItemsState((prevItemsState) => {
                return prevItemsState.map((item, index) => {
                    if (index !== targetIndex) {
                        return item;
                    }
                    return {...item, width: newValue};
                });
            });
        },
        [],
    );

    const handleError = React.useCallback((index: number, isError: boolean) => {
        if (!isError) {
            setErrorsIndexes((prevErrors) => prevErrors.filter((error) => error !== index));
            return;
        }

        setErrorsIndexes((prevErrors) => {
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
        [handleError, handlePlacementModeUpdate, handlePlacementValueUpdate, showErrors],
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

    const handleCurrentTabVisibilityProblem = React.useCallback(() => {
        const validationError = dialogI18n('validation_need-current-tab-impact');
        dispatch(
            updateControlsValidation({
                groupValidation: {currentTabVisibility: validationError},
            }),
        );

        setItemsState((prevItemsState) => {
            return prevItemsState.map((item) => ({
                ...item,
                validation: {...item.validation, currentTabVisibility: validationError},
            }));
        });
    }, [dispatch]);

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
                        qa={DialogGroupControlQa.applyButtonCheckbox}
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
                        qa={DialogGroupControlQa.resetButtonCheckbox}
                    />
                </FormRow>
                {showAutoHeight && (
                    <FormRow className={b('row')} label={i18n('label_autoheight-checkbox')}>
                        <Switch
                            checked={selectorsGroup.autoHeight}
                            onUpdate={handleChangeAutoHeight}
                            qa={DialogGroupControlQa.autoHeightCheckbox}
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
                        />
                    </FormRow>
                )}

                {showImpactTypeSelect && (
                    <ImpactTypeSelect
                        isGroupSettings={true}
                        groupImpactType={selectorsGroup.impactType}
                        groupImpactTabsIds={selectorsGroup.impactTabsIds}
                        onRaiseTabVisibilityProblem={handleCurrentTabVisibilityProblem}
                    />
                )}
            </FormSection>
            {isMultipleSelectors && (
                <FormSection title={i18n('label_selectors-representation')}>
                    <div className={b('note')}>{i18n('label_note')}</div>
                    <div className={b('selectors')}>
                        <List
                            qa={DialogGroupControlQa.placementControlList}
                            items={itemsState}
                            filterable={false}
                            sortable={true}
                            virtualized={false}
                            onSortEnd={({oldIndex, newIndex}) => moveItem(oldIndex, newIndex)}
                            itemClassName={b('list-item-container')}
                            renderItem={renderControlPlacementRow}
                        />
                    </div>
                    {showErrors && (
                        <div className={b('error')}>{i18n('label_field-validation')}</div>
                    )}
                </FormSection>
            )}
        </React.Fragment>
    );
};
