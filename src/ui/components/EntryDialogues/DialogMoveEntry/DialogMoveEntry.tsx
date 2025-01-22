import React from 'react';

import {I18n} from 'i18n';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {showToast} from 'store/actions/toaster';
import {isEntryAlreadyExists} from 'utils/errors/errorByCode';

import type {MoveEntryResponse} from '../../../../shared/schema';
import {getSdk} from '../../../libs/schematic-sdk';
import type {DataLensApiError} from '../../../typings';
import {EntryDialogBase} from '../EntryDialogBase/EntryDialogBase';
import {EntryDialogResolveStatus} from '../constants';
import type {EntryDialogProps} from '../types';

export interface DialogMoveEntryProps extends EntryDialogProps {
    entryId: string;
    initDestination: string;
    inactiveEntryKeys?: string[];
}

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = DialogMoveEntryProps & DispatchProps;

const i18n = I18n.keyset('component.dialog-move-entry.view');

class DialogMoveEntry extends React.Component<Props> {
    render() {
        return (
            <EntryDialogBase
                withInput={false}
                onClose={this.onClose}
                onApply={this.onApply}
                onSuccess={this.onSuccess}
                onError={this.onError}
                visible={this.props.visible}
                path={this.props.initDestination}
                inactiveEntryKeys={this.props.inactiveEntryKeys}
                caption={i18n('section_caption')}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_apply')}
            />
        );
    }

    private onApply = async (key: string) => {
        const result = await getSdk().sdk.us.moveEntry({
            entryId: this.props.entryId,
            destination: key,
        });
        return {
            entryId: this.props.entryId,
            destination: key,
            result,
        };
    };

    private onError = (error: DataLensApiError) => {
        const title = isEntryAlreadyExists(error)
            ? i18n('label_entry-name-already-exists')
            : i18n('toast_move-failed');
        this.props.showToast({
            title,
            name: 'DialogMoveEntryFailed',
            error,
            withReport: true,
        });
        return null;
    };

    private onClose = () => {
        this.props.onClose({status: EntryDialogResolveStatus.Close});
    };

    private onSuccess = (data: {
        result: MoveEntryResponse;
        destination: string;
        entryId: string;
    }) => {
        this.props.onClose({status: EntryDialogResolveStatus.Success, data});
    };
}

const mapDispatchToProps = {
    showToast,
};

export default connect(null, mapDispatchToProps)(DialogMoveEntry);
