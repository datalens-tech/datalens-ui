import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {DatasetField} from 'shared';

import DialogManager from '../../../../../components/DialogManager/DialogManager';
import {closeDialog} from '../../../../../store/actions/dialog';

import './DatasetFieldInspector.scss';

export const DIALOG_DS_FIELD_INSPECTOR = Symbol('DIALOG_DS_FIELD_INSPECTOR');

const b = block('ds-field-inspector');

type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type OwnProps = {
    field: DatasetField;
};

export type OpenDialogDatasetFieldInspectorArgs = {
    id: typeof DIALOG_DS_FIELD_INSPECTOR;
    props: OwnProps;
};

const DialogFieldInspector = (props: DispatchProps & OwnProps) => {
    const fieldText = JSON.stringify(props.field, undefined, 4);

    return (
        <Dialog open={true} onClose={props.closeDialog} size="m">
            <div className={b()}>
                <Dialog.Header caption={`Field Inspector (${props.field.title})`} />
                <Dialog.Body>
                    <div className={b('body')}>
                        <pre>{fieldText}</pre>
                    </div>
                </Dialog.Body>
            </div>
        </Dialog>
    );
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            closeDialog,
        },
        dispatch,
    );
};

DialogManager.registerDialog(
    DIALOG_DS_FIELD_INSPECTOR,
    connect(null, mapDispatchToProps)(DialogFieldInspector),
);
