import React from 'react';

import type {ButtonProps} from '@gravity-ui/uikit';
import {Label} from '@gravity-ui/uikit';
import type {ButtonAttachProps} from 'components/ButtonAttach/ButtonAttach';
import {ButtonAttach} from 'components/ButtonAttach/ButtonAttach';
import {I18n} from 'i18n';
import {get} from 'lodash';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {FileInputItem} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import {showToast} from '../../../../../../store/actions/toaster';
import {changeForm, changeInnerForm, setValidationErrors} from '../../../../store';
import {getValidationError} from '../../../../utils';
import {withControlWrap} from '../withControlWrap/withControlWrap';

import {getBase64} from './utils';

const i18n = I18n.keyset('connections.form');

type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type FileInputProps = DispatchState & DispatchProps & Omit<FileInputItem, 'id'>;

export const FileInputComponent = (props: FileInputProps) => {
    const {actions, name, validationErrors, inner = false} = props;
    const [fileName, setFileName] = React.useState('');
    const controlProps = get(props, 'controlProps', {} as Partial<ButtonProps>);
    const error = getValidationError(name, validationErrors);

    const setFormValue = React.useCallback(
        (value: string) => {
            if (inner) {
                actions.changeInnerForm({[name]: value});
            } else {
                actions.changeForm({[name]: value});
            }
        },
        [actions, inner, name],
    );

    const handleSuccessUploading = React.useCallback(
        (fileInBase64: string) => {
            setFormValue(fileInBase64);

            if (error) {
                const errors = validationErrors.filter((err) => err.name !== error.name);
                actions.setValidationErrors({errors});
            }
        },
        [setFormValue, actions, validationErrors, error],
    );

    const handleUnsuccessUploading = React.useCallback(() => {
        actions.showToast({title: i18n('label_file-upload-failure'), type: 'danger'});
    }, [actions]);

    const handleFileUploding = React.useCallback<NonNullable<ButtonAttachProps['onUpdate']>>(
        (files) => {
            setFileName(files[0].name);

            getBase64({
                file: files[0],
                onSuccess: handleSuccessUploading,
                onFailure: handleUnsuccessUploading,
            });
        },
        [handleSuccessUploading, handleUnsuccessUploading],
    );

    const handleLabelCloseBtnClick = React.useCallback(() => {
        setFormValue('');
        setFileName('');
    }, [setFormValue]);

    return fileName ? (
        <Label size="m" type="close" onCloseClick={handleLabelCloseBtnClick}>
            {i18n('label_file-input-label', {fileName})}
        </Label>
    ) : (
        <ButtonAttach
            {...(controlProps as ButtonAttachProps)}
            multiple={false}
            onUpdate={handleFileUploding}
        >
            {i18n('button_attach-file')}
        </ButtonAttach>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        form: state.connections.form,
        innerForm: state.connections.innerForm,
        validationErrors: state.connections.validationErrors,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                changeForm,
                changeInnerForm,
                setValidationErrors,
                showToast,
            },
            dispatch,
        ),
    };
};

export const FileInput = connect(
    mapStateToProps,
    mapDispatchToProps,
)(withControlWrap(FileInputComponent));
