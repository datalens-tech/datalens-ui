import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ControlQA} from 'shared';
import {DashboardDialogControl} from 'shared/constants/qa/dash';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';
import type {AcceptableValue} from 'ui/store/typings/controlDialog';

import Dialog from '../../../../Dialog/Dialog';

import {SelectorValuesDialogBody} from './SelectorValuesDialogBody';

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

    const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.code === 'Enter') {
            addItem();
        }
    };

    const handleUpdate = (updatedValue: string) => {
        setNewValue(updatedValue);
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
                onTransitionInComplete={handleDialogTransitionEntered}
            >
                <SelectorValuesDialogBody
                    currentAcceptableValues={currentAcceptableValues}
                    handleUpdate={handleUpdate}
                    newValue={newValue}
                    handleKeyPress={handleKeyPress}
                    inputRef={inputRef}
                    addItem={addItem}
                    setCurrentAcceptableValues={setCurrentAcceptableValues}
                    setNewValue={setNewValue}
                />
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
