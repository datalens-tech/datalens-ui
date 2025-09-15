import React from 'react';

import type {TextInputProps} from '@gravity-ui/uikit';
import {TextInput} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {showToast} from 'store/actions/toaster';
import {isEntryAlreadyExists} from 'utils/errors/errorByCode';

import type {RenameEntryResponse} from '../../../../shared/schema';
import {getSdk} from '../../../libs/schematic-sdk';
import type {DataLensApiError} from '../../../typings';
import {EntryDialogBase} from '../EntryDialogBase/EntryDialogBase';
import {EntryDialogResolveStatus} from '../constants';
import type {EntryDialogProps} from '../types';

export interface DialogRenameEntryProps extends EntryDialogProps {
    entryId: string;
    initName: string;
}

interface DialogRenameEntryState {
    name: string;
    visible: boolean;
    inputError: TextInputProps['error'];
}

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = DialogRenameEntryProps & DispatchProps;

const i18n = I18n.keyset('component.dialog-rename-entry.view');

class DialogRenameEntry extends React.Component<Props, DialogRenameEntryState> {
    static getDerivedStateFromProps(props: DialogRenameEntryProps, state: DialogRenameEntryState) {
        if (props.visible !== state.visible) {
            return {
                visible: props.visible,
                name: props.initName,
                inputError: false,
            };
        }
        return null;
    }

    state: DialogRenameEntryState = {
        visible: this.props.visible,
        name: this.props.initName,
        inputError: false,
    };

    render() {
        return (
            <EntryDialogBase
                onClose={this.onClose}
                onApply={this.onApply}
                onSuccess={this.onSuccess}
                onError={this.onError}
                visible={this.props.visible}
                caption={i18n('section_caption')}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_apply')}
                initialFocus={0}
            >
                <TextInput
                    autoFocus={true}
                    size="l"
                    onUpdate={this.onChangeInput}
                    placeholder={i18n('label_placeholder')}
                    value={this.state.name}
                    hasClear={true}
                    error={this.state.inputError}
                />
            </EntryDialogBase>
        );
    }

    private onChangeInput = (value: string) => {
        this.setState({name: value, inputError: false});
    };

    private onApply = async () => {
        const data = await getSdk().sdk.us.renameEntry({
            entryId: this.props.entryId,
            name: this.state.name.trim(),
        });
        return data;
    };

    private onError = (error: DataLensApiError) => {
        if (isEntryAlreadyExists(error)) {
            this.setState({inputError: i18n('label_entry-name-already-exists')});
            return null;
        }
        this.props.showToast({
            title: i18n('toast_rename-failed'),
            name: 'DialogRenameEntryFailed',
            error,
            withReport: true,
        });
        return null;
    };

    private onClose = () => {
        this.props.onClose({status: EntryDialogResolveStatus.Close});
    };

    private onSuccess = (data: RenameEntryResponse) => {
        this.props.onClose({status: EntryDialogResolveStatus.Success, data});
    };
}

const mapDispatchToProps = {
    showToast,
};

export default connect(null, mapDispatchToProps)(DialogRenameEntry);
