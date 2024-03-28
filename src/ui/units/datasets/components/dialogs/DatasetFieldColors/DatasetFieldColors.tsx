import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';
import {DatasetField} from 'shared';
import DialogManager from 'ui/components/DialogManager/DialogManager';
import {closeDialog} from 'ui/store/actions/dialog';

import './DatasetFieldColors.scss';

export const DIALOG_DS_FIELD_COLORS = Symbol('DIALOG_DS_FIELD_COLORS');
const b = block('ds-field-colors');

type Props = {
    field: DatasetField;
};

export type OpenDialogDatasetFieldColorsArgs = {
    id: typeof DIALOG_DS_FIELD_COLORS;
    props: Props;
};

export const DialogFieldColors = (props: Props) => {
    const {field} = props;
    // const fieldText = JSON.stringify(props.field, undefined, 4);

    const dispatch = useDispatch();
    const handleCloseDialog = () => {
        dispatch(closeDialog());
    };

    return (
        <Dialog open={true} onClose={handleCloseDialog} size="m">
            <div className={b()}>
                <Dialog.Header caption={`Field Inspector (${field.title})`} />
                <Dialog.Body>
                    <div className={b('body')}>123</div>
                </Dialog.Body>
            </div>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_DS_FIELD_COLORS, DialogFieldColors);
