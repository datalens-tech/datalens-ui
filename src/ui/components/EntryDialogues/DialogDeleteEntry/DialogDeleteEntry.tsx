import React from 'react';

import block from 'bem-cn-lite';
import {EntryTitle} from 'components/EntryTitle';
import {I18n} from 'i18n';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {EntryScope} from 'shared';
import {showToast} from 'store/actions/toaster';
import type {DatalensGlobalState} from 'ui';
import {CounterName, GoalId, reachMetricaGoal} from 'ui/libs/metrica';
import {selectLockToken} from 'ui/store/selectors/entryContent';
// For now only dash is using lock if any other locks appear change it to entry action
import {cleanLock} from 'units/dash/store/actions/dashTyped';

import type {EntryFields} from '../../../../shared/schema';
import {getSdk} from '../../../libs/schematic-sdk';
import type {DataLensApiError} from '../../../typings';
import {EntryDialogBase} from '../EntryDialogBase/EntryDialogBase';
import {EntryDialogResolveStatus} from '../constants';
import type {EntryDialogProps} from '../types';

import './DialogDeleteEntry.scss';

export interface DialogDeleteEntryProps extends EntryDialogProps {
    entry: Pick<EntryFields, 'entryId' | 'scope' | 'key' | 'workbookId'> & {
        type?: string;
    };
    lockToken?: ReturnType<typeof selectLockToken>;
}

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = DialogDeleteEntryProps & DispatchProps;

const i18n = I18n.keyset('component.dialog-delete-entry.view');
const b = block('dl-dialog-delete-entry');

class DialogDeleteEntry extends React.Component<Props> {
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
                textButtonApply={i18n('button_delete')}
                confirmButtonView="outlined-danger"
            >
                {Boolean(this.props.entry) && (
                    <span className={b('entry')}>
                        <span className={b('entry-text')}>{i18n('label_delete')}</span>
                        <EntryTitle entry={this.props.entry} theme="inline" />
                    </span>
                )}
            </EntryDialogBase>
        );
    }

    private onApply = async () => {
        const {entry, cleanLock, lockToken} = this.props;
        await getSdk().sdk.mix.deleteEntry({
            entryId: entry.entryId,
            scope: entry.scope,
            ...(lockToken ? {lockToken} : {}),
        });
        if (lockToken) {
            cleanLock();
        }

        const workbookId = entry?.workbookId;
        return {entryId: entry.entryId, workbookId};
    };

    private onError = (error: DataLensApiError) => {
        this.props.showToast({
            title: i18n('toast_delete-failed'),
            name: 'DialogDeleteEntryFailed',
            error,
            withReport: true,
        });
        return null;
    };

    private onClose = () => {
        this.props.onClose({status: EntryDialogResolveStatus.Close});
    };

    private onSuccess = (data: {entryId: string}) => {
        const {entry} = this.props;
        this.props.onClose({status: EntryDialogResolveStatus.Success, data});
        if (entry.scope === EntryScope.Connection) {
            reachMetricaGoal(CounterName.Main, GoalId.ConnectionDeleteSubmit, {type: entry.type});
        }
    };
}

const mapDispatchToProps = {
    showToast,
    cleanLock,
};

const mapStateToProps = (state: DatalensGlobalState) => ({
    lockToken: selectLockToken(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(DialogDeleteEntry);
