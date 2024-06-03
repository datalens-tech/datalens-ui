import React from 'react';

import {I18n} from 'i18n';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {showToast} from 'store/actions/toaster';
import type {SaveAsNewDashArgs} from 'ui/units/dash/store/actions/dashTyped';
import {isEntryAlreadyExists} from 'utils/errors/errorByCode';

import type {DataLensApiError} from '../../../typings';
import {DialogCreateWorkbookEntry} from '../DialogCreateWorkbookEntry/DialogCreateWorkbookEntry';
import {EntryDialogBase} from '../EntryDialogBase/EntryDialogBase';
import {EntryDialogResolveStatus} from '../constants';
import type {EntryDialogProps} from '../types';

export interface DialogEntrySaveAsNewProps extends EntryDialogProps {
    initDestination: string;
    initName?: string;
    onSaveAsNewCallback: ({key, workbookId, name}: SaveAsNewDashArgs) => void;
    workbookId?: string;
    warningMessage?: string | null;
}

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = DialogEntrySaveAsNewProps & DispatchProps;

const i18n = I18n.keyset('component.dialog-save-as-new-entry.view');

class DialogEntrySaveAsNew extends React.Component<Props> {
    render() {
        const {workbookId, warningMessage} = this.props;
        const name = `${this.props.initName} - ${i18n('label_copy')}`;
        const defaultName = `${i18n('label_default-name')} - ${i18n('label_copy')}`;

        if (workbookId) {
            return (
                <DialogCreateWorkbookEntry
                    name={name || defaultName}
                    defaultName={defaultName}
                    caption={i18n('section_caption')}
                    textButtonApply={i18n('button_apply')}
                    textButtonCancel={i18n('button_cancel')}
                    visible={this.props.visible}
                    onClose={this.onClose}
                    onApply={this.onWorkbookApply}
                    onSuccess={this.onSuccess}
                    onError={this.onError}
                    placeholder={i18n('label_placeholder')}
                    warningMessage={warningMessage}
                />
            );
        }

        return (
            <EntryDialogBase
                withInput={true}
                onClose={this.onClose}
                onApply={this.onApply}
                onSuccess={this.onSuccess}
                onError={this.onError}
                visible={this.props.visible}
                path={this.props.initDestination}
                name={name}
                defaultName={defaultName}
                caption={i18n('section_caption')}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_apply')}
                placeholder={i18n('label_placeholder')}
                warningMessage={warningMessage}
            />
        );
    }

    private onWorkbookApply = async ({name}: {name: string}) => {
        const {workbookId} = this.props;

        return this.props.onSaveAsNewCallback({name, workbookId});
    };

    private onApply = async (key: string) => {
        return this.props.onSaveAsNewCallback({key});
    };

    private onError = (error: DataLensApiError) => {
        if (isEntryAlreadyExists(error)) {
            return {
                inputError: i18n('label_entry-name-already-exists'),
            };
        }
        this.props.showToast({
            title: i18n('toast_save-as-new-failed'),
            name: 'DialogEntrySaveAsNewFailed',
            error,
            withReport: true,
        });
        return null;
    };

    private onClose = () => {
        this.props.onClose({status: EntryDialogResolveStatus.Close});
    };

    private onSuccess = (data: any) => {
        this.props.onClose({status: EntryDialogResolveStatus.Success, data});
    };
}

const mapDispatchToProps = {
    showToast,
};

export default connect(null, mapDispatchToProps)(DialogEntrySaveAsNew);
