import React from 'react';

import {I18n} from 'i18n';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {showToast} from 'store/actions/toaster';
import type {DataLensApiError} from 'typings';
import {isEntryAlreadyExists} from 'utils/errors/errorByCode';

import type {CreateFolderResponse} from '../../../../shared/schema';
import {getSdk} from '../../../libs/schematic-sdk';
import {EntryDialogBase} from '../EntryDialogBase/EntryDialogBase';
import {EntryDialogResolveStatus} from '../constants';
import type {EntryDialogProps} from '../types';

export interface DialogCreateFolderProps extends EntryDialogProps {
    initDestination: string;
    initName?: string;
}

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = DialogCreateFolderProps & DispatchProps;

const i18n = I18n.keyset('component.dialog-create-folder.view');

class DialogCreateFolder extends React.Component<Props> {
    render() {
        return (
            <EntryDialogBase
                withInput={true}
                onClose={this.onClose}
                onApply={this.onApply}
                onSuccess={this.onSuccess}
                onError={this.onError}
                visible={this.props.visible}
                path={this.props.initDestination}
                name={this.props.initName}
                defaultName={i18n('label_default-name')}
                caption={i18n('section_caption')}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_apply')}
                placeholder={i18n('label_placeholder')}
            />
        );
    }

    private onApply = async (key: string) => {
        const data = await getSdk().sdk.us.createFolder({key});
        return data;
    };

    private onError = (error: DataLensApiError) => {
        if (isEntryAlreadyExists(error)) {
            return {
                inputError: i18n('label_folder-already-exists'),
            };
        }
        this.props.showToast({
            title: i18n('toast_create-folder-failed'),
            name: 'DialogCreateFolderFailed',
            error,
            withReport: true,
        });
        return null;
    };

    private onClose = () => {
        this.props.onClose({status: EntryDialogResolveStatus.Close});
    };

    private onSuccess = (data: CreateFolderResponse) => {
        this.props.onClose({status: EntryDialogResolveStatus.Success, data});
    };
}

const mapDispatchToProps = {
    showToast,
};

export default connect(null, mapDispatchToProps)(DialogCreateFolder);
