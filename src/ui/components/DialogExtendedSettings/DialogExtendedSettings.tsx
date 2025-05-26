import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Checkbox, Dialog, Flex, HelpMark, List, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DialogGroupControlQa, TitlePlacementOption} from 'shared';
import {BackButton} from 'ui/components/ControlComponents/BackButton/BackButton';
import {updateSelectorsGroup} from 'ui/store/actions/controlDialog';
import {selectSelectorsGroup} from 'ui/store/selectors/controlDialog';
import type {SelectorDialogState} from 'ui/store/typings/controlDialog';

import {CONTROLS_PLACEMENT_MODE} from '../../constants/dialogs';
import {FormSection} from '../FormSection/FormSection';

import {ControlPlacementRow} from './ControlPlacementRow/ControlPlacementRow';

import './DialogExtendedSettings.scss';

export const DIALOG_EXTENDED_SETTINGS = Symbol('DIALOG_EXTENDED_SETTINGS');

export type ExtendedSettingsDialogProps = {
    onClose: () => void;

    selectorsGroupTitlePlaceholder?: string;
    enableAutoheightDefault?: boolean;
    showSelectorsGroupTitle?: boolean;
};

export type OpenDialogExtendedSettingsArgs = {
    id: typeof DIALOG_EXTENDED_SETTINGS;
    props: ExtendedSettingsDialogProps;
};

const b = block('extended-settings-dialog');

const i18n = I18n.keyset('dash.extended-settings-dialog.edit');

const resetAutoValues = (group: SelectorDialogState[]) =>
    group.map((item) =>
        item.placementMode === CONTROLS_PLACEMENT_MODE.AUTO ? {...item, width: ''} : item,
    );

const DialogExtendedSettings: React.FC<ExtendedSettingsDialogProps> = ({
    onClose,
    selectorsGroupTitlePlaceholder,
    enableAutoheightDefault,
    showSelectorsGroupTitle,
}) => {
    const selectorsGroup = useSelector(selectSelectorsGroup);
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

    const handleApplyClick = React.useCallback(() => {
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
        onClose();
    }, [selectorsGroup, itemsState, dispatch, onClose, errorsIndexes.length]);

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

    const showAutoHeight =
        !enableAutoheightDefault &&
        (isMultipleSelectors ||
            selectorsGroup.buttonApply ||
            selectorsGroup.buttonReset ||
            // until we have supported automatic height adjustment for case with top title placement,
            // we allow to enable autoheight
            selectorsGroup.group[0].titlePlacement === TitlePlacementOption.Top);
    const showUpdateControlsOnChange = selectorsGroup.buttonApply && isMultipleSelectors;

    return (
        <Dialog onClose={onClose} open={true} className={b()}>
            <Dialog.Header
                className={b('header')}
                caption={i18n('label_title')}
                insertBefore={<BackButton onClose={onClose} />}
            />
            <Dialog.Body className={b('body')}>
                <FormSection title={i18n('label_group-parameters')}>
                    {showSelectorsGroupTitle && (
                        <FormRow className={b('row')} label={i18n('label_group-name')}>
                            <Flex gap={2}>
                                <Checkbox
                                    className={b('checkbox')}
                                    checked={selectorsGroup.showGroupName}
                                    onUpdate={handleChangeShowGroupName}
                                    size="l"
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
                        <Checkbox
                            className={b('checkbox')}
                            checked={selectorsGroup.buttonApply}
                            onUpdate={handleChangeButtonApply}
                            size="l"
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
                        <Checkbox
                            className={b('checkbox')}
                            checked={selectorsGroup.buttonReset}
                            onUpdate={handleChangeButtonReset}
                            size="l"
                            qa={DialogGroupControlQa.resetButtonCheckbox}
                        />
                    </FormRow>
                    {showAutoHeight && (
                        <FormRow className={b('row')} label={i18n('label_autoheight-checkbox')}>
                            <Checkbox
                                className={b('checkbox')}
                                checked={selectorsGroup.autoHeight}
                                onUpdate={handleChangeAutoHeight}
                                size="l"
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
                            <Checkbox
                                className={b('checkbox')}
                                checked={selectorsGroup.updateControlsOnChange}
                                onUpdate={handleChangeUpdateControls}
                                size="l"
                                qa={DialogGroupControlQa.updateControlOnChangeCheckbox}
                            />
                        </FormRow>
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
            </Dialog.Body>
            <Dialog.Footer
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_save')}
                propsButtonCancel={{view: 'flat'}}
                propsButtonApply={{qa: DialogGroupControlQa.extendedSettingsApplyButton}}
                onClickButtonApply={handleApplyClick}
                onClickButtonCancel={onClose}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_EXTENDED_SETTINGS, DialogExtendedSettings);
