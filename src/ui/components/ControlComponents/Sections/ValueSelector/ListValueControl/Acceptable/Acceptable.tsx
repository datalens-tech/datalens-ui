import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import type {ListItemData} from '@gravity-ui/uikit';
import {Button, Icon, List, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import update from 'immutability-helper';
import {useDispatch, useSelector} from 'react-redux';
import {ControlQA} from 'shared';
import {DashboardDialogControl} from 'shared/constants/qa/dash';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';
import type {AcceptableValue} from 'ui/store/typings/controlDialog';

import Dialog from '../../../../Dialog/Dialog';

import './Acceptable.scss';

const b = block('control-select-acceptable');

const convertFromDefaultValue = (values: AcceptableValue[]) => {
    return values ? values.map(({value}) => value) : values;
};

export const Acceptable = () => {
    const {acceptableValues = []} = useSelector(selectSelectorDialog);
    const dispatch = useDispatch();

    const [showDialog, setShowDialog] = React.useState(false);
    const [newValue, setNewValue] = React.useState('');
    const [currentAcceptableValues, setCurrentAcceptableValues] = React.useState(
        convertFromDefaultValue(acceptableValues),
    );

    const inputRef = React.useRef<HTMLInputElement>(null);

    const addItem = () => {
        if (newValue.trim() !== '' && !currentAcceptableValues.includes(newValue)) {
            setNewValue('');
            setCurrentAcceptableValues([newValue, ...currentAcceptableValues]);
        }
    };

    const onApply = () => {
        dispatch(
            setSelectorDialogItem({
                acceptableValues: currentAcceptableValues.map(
                    (value: string): AcceptableValue => ({value, title: value}),
                ),
            }),
        );
    };

    const handleRemoveItemClick = (index: number, acceptableValues: string[]) => {
        setCurrentAcceptableValues([
            ...acceptableValues.slice(0, index),
            ...acceptableValues.slice(index + 1),
        ]);
    };

    const handleOnSortEnd = ({
        oldIndex,
        newIndex,
        acceptableValues,
    }: {
        oldIndex: number;
        newIndex: number;
        acceptableValues: string[];
    }) => {
        if (oldIndex === newIndex) {
            return;
        }
        const newItems = update(acceptableValues, {
            $splice: [
                [oldIndex, 1],
                [newIndex, 0, acceptableValues[oldIndex]],
            ],
        });

        setCurrentAcceptableValues(newItems);
    };

    const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.code === 'Enter') {
            addItem();
        }
    };

    const renderListItem = (args: {
        item: ListItemData<string>;
        itemIndex: number;
        acceptableValues: string[];
    }) => {
        const {item, itemIndex, acceptableValues} = args;
        return (
            <div className={b('item')} key={item} data-qa={ControlQA.controlSelectAcceptableItem}>
                <span title={item}>{item}</span>
                <Button
                    onClick={() => handleRemoveItemClick(itemIndex, acceptableValues)}
                    className={b('remove')}
                    qa={ControlQA.controlSelectAcceptableRemoveButton}
                    view="flat"
                    size="s"
                >
                    <Icon data={Xmark} width="16" />
                </Button>
            </div>
        );
    };

    const handleUpdate = (updatedValue: string) => {
        setNewValue(updatedValue);
    };

    const renderBody = () => {
        const isEmpty = !currentAcceptableValues.length;
        return (
            <React.Fragment>
                <div className={b('header')} data-qa={ControlQA.controlSelectAcceptable}>
                    <TextInput
                        size="m"
                        qa={ControlQA.controlSelectAcceptableInput}
                        placeholder={i18n('dash.control-dialog.edit', 'context_add-value')}
                        onUpdate={handleUpdate}
                        value={newValue}
                        onKeyDown={handleKeyPress}
                        controlRef={inputRef}
                    />
                    <Button
                        view="normal"
                        size="m"
                        qa={ControlQA.controlSelectAcceptableButton}
                        onClick={addItem}
                    >
                        {i18n('dash.control-dialog.edit', 'button_add')}
                    </Button>
                </div>
                <div className={b('items', {empty: isEmpty})}>
                    {isEmpty ? (
                        i18n('dash.control-dialog.edit', 'label_empty-list')
                    ) : (
                        <List
                            filterable={false}
                            virtualized={false}
                            sortable={true}
                            items={currentAcceptableValues}
                            itemClassName={b('list-item')}
                            onSortEnd={(args) =>
                                handleOnSortEnd({
                                    ...args,
                                    acceptableValues: currentAcceptableValues,
                                })
                            }
                            renderItem={(
                                item: ListItemData<string>,
                                _isItemActive: boolean,
                                itemIndex: number,
                            ) =>
                                renderListItem({
                                    item,
                                    itemIndex,
                                    acceptableValues: currentAcceptableValues,
                                })
                            }
                        />
                    )}
                </div>
            </React.Fragment>
        );
    };

    const handleApply = () => {
        onApply();
        setShowDialog(false);
        setNewValue('');
    };

    const handleClose = () => {
        setShowDialog(false);
        setNewValue('');
        setCurrentAcceptableValues(convertFromDefaultValue(acceptableValues));
    };

    const handleDialogTransitionEntered = () => {
        // delay is needed so that the autofocus of the dialog does not interrupt the focus on the input
        setTimeout(() => {
            inputRef.current?.focus();
        });
    };

    const renderDialog = () => {
        return (
            <Dialog
                visible={showDialog}
                caption={i18n('dash.control-dialog.edit', 'label_acceptable-values')}
                onApply={handleApply}
                onClose={handleClose}
                onTransitionEntered={handleDialogTransitionEntered}
            >
                {renderBody()}
            </Dialog>
        );
    };

    const handleOpenDialog = () => {
        setShowDialog(!showDialog);
        setCurrentAcceptableValues(convertFromDefaultValue(acceptableValues));
    };

    return (
        <React.Fragment>
            <Button onClick={handleOpenDialog} qa={ControlQA.acceptableDialogButton} size="m">
                {currentAcceptableValues.length ? (
                    <span
                        data-qa={`${DashboardDialogControl.AcceptableValues}${acceptableValues.length}`}
                    >
                        {i18n('dash.control-dialog.edit', 'value_select-values', {
                            count: acceptableValues.length,
                        })}
                    </span>
                ) : (
                    <span>{i18n('dash.control-dialog.edit', 'button_add')}</span>
                )}
            </Button>
            {renderDialog()}
        </React.Fragment>
    );
};
