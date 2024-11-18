import React from 'react';

import {Dialog, List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DialogGroupControlQa} from 'shared';
import {BackButton} from 'ui/components/ControlComponents/BackButton/BackButton';
import {updateSelectorsGroup} from 'ui/store/actions/controlDialog';
import {selectSelectorsGroup} from 'ui/store/selectors/controlDialog';
import type {SelectorDialogState} from 'ui/store/typings/controlDialog';

import {CONTROLS_PLACEMENT_MODE} from '../../constants/dialogs';

import {ControlPlacementRow} from './ControlPlacementRow/ControlPlacementRow';

import './DialogControlsPlacement.scss';

export const DIALOG_SELECTORS_PLACEMENT = Symbol('DIALOG_SELECTORS_PLACEMENT');

export type ControlsPlacementDialogProps = {
    onClose: () => void;
};

export type OpenDialogControlsPlacementArgs = {
    id: typeof DIALOG_SELECTORS_PLACEMENT;
    props: ControlsPlacementDialogProps;
};

const b = block('controls-placement-dialog');

const i18n = I18n.keyset('dash.controls-placement-dialog.edit');

const resetAutoValues = (group: SelectorDialogState[]) =>
    group.map((item) =>
        item.placementMode === CONTROLS_PLACEMENT_MODE.AUTO ? {...item, width: ''} : item,
    );

const DialogControlsPlacement = ({onClose}: ControlsPlacementDialogProps) => {
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

    return (
        <Dialog onClose={onClose} open={true} className={b()}>
            <Dialog.Header
                className={b('header')}
                caption={i18n('label_title')}
                insertBefore={<BackButton onClose={onClose} />}
            />
            <Dialog.Body className={b('body')}>
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
                {showErrors && <div className={b('error')}>{i18n('label_field-validation')}</div>}
            </Dialog.Body>
            <Dialog.Footer
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_save')}
                propsButtonCancel={{view: 'flat'}}
                propsButtonApply={{qa: DialogGroupControlQa.placementApplyButton}}
                onClickButtonApply={handleApplyClick}
                onClickButtonCancel={onClose}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_SELECTORS_PLACEMENT, DialogControlsPlacement);
