import React from 'react';

import {I18n} from 'i18n';
import {ResolveThunks, connect} from 'react-redux';
import {EntryScope, WorkbookId} from 'shared';
import {showToast} from 'store/actions/toaster';
import {DataLensApiError} from 'typings';
import {DialogCreateWorkbookEntry} from 'ui';
import {isEntryAlreadyExists} from 'utils/errors/errorByCode';

import {getSdk} from '../../../libs/schematic-sdk';
import {EntryDialogBase} from '../EntryDialogBase/EntryDialogBase';
import {EntryDialogResolveStatus} from '../constants';
import {EntryDialogProps} from '../types';

interface CopiedEntry {
    entryId: string;
    key: string;
    scope: string;
    type?: string;
}

export interface DialogCopyEntryProps extends EntryDialogProps {
    entryId: string;
    initDestination: string;
    initName?: string;
    scope: string;
    workbookId?: WorkbookId;
}

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = DialogCopyEntryProps & DispatchProps;

const i18n = I18n.keyset('component.dialog-copy-entry.view');

const getCaption = (scope: string) => {
    switch (scope) {
        case EntryScope.Dash:
            return i18n('section_caption-dashboard');
        case EntryScope.Widget:
            return i18n('section_caption-widget');
        default:
            return i18n('section_caption');
    }
};

class DialogCopyEntry extends React.Component<Props> {
    render() {
        const {workbookId, scope} = this.props;

        if (workbookId) {
            const name = `${this.props.initName} - ${i18n('label_copy')}`;
            const defaultName = `${i18n('label_default-name')} - ${i18n('label_copy')}`;

            return (
                <DialogCreateWorkbookEntry
                    name={name || defaultName}
                    defaultName={defaultName}
                    caption={getCaption(scope)}
                    textButtonApply={i18n('button_apply')}
                    textButtonCancel={i18n('button_cancel')}
                    visible={this.props.visible}
                    onClose={this.onClose}
                    onApply={this.onApplyCreateWorkbookEntry}
                    onSuccess={this.onSuccess}
                    onError={this.onError}
                    placeholder={i18n('label_placeholder')}
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
                name={this.props.initName}
                defaultName={i18n('label_default-name')}
                caption={i18n('section_caption')}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_apply')}
                placeholder={i18n('label_placeholder')}
            />
        );
    }

    private onApply = async (_: string, name: string, path: string) => {
        let copiedEntry: CopiedEntry;
        const {scope} = this.props;
        if (scope === EntryScope.Dataset) {
            const new_key = path + name;
            const {id} = await getSdk().bi.copyDataset({
                datasetId: this.props.entryId,
                new_key,
            });
            copiedEntry = {
                entryId: id,
                scope,
                key: new_key,
            };
        } else {
            const data = await getSdk().us.copyEntry({
                entryId: this.props.entryId,
                name,
                destination: path,
            });
            const entry = data[0];
            copiedEntry = {
                entryId: entry.entryId,
                scope,
                key: entry.key,
                type: entry.type,
            };
        }
        return copiedEntry;
    };

    private onApplyCreateWorkbookEntry = async ({name}: {name: string}) => {
        const {scope, entryId} = this.props;
        const newEntry = await getSdk().us.copyWorkbookEntry({
            entryId,
            name,
        });

        return {
            entryId: newEntry.entryId,
            scope,
            key: newEntry.key,
            type: newEntry.type,
        };
    };

    private onError = (error: DataLensApiError) => {
        if (isEntryAlreadyExists(error)) {
            return {
                inputError: i18n('label_entry-name-already-exists'),
            };
        }
        this.props.showToast({
            title: i18n('toast_copy-failed'),
            name: 'DialogCopyEntryFailed',
            error,
            withReport: true,
        });
        return null;
    };

    private onClose = () => {
        this.props.onClose({status: EntryDialogResolveStatus.Close});
    };

    private onSuccess = (data: CopiedEntry) => {
        this.props.onClose({status: EntryDialogResolveStatus.Success, data});
    };
}

const mapDispatchToProps = {
    showToast,
};

export default connect(null, mapDispatchToProps)(DialogCopyEntry);
