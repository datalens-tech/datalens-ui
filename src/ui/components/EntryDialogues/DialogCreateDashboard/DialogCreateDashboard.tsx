import React from 'react';

import {I18n} from 'i18n';
import {ResolveThunks, connect} from 'react-redux';
import {Feature} from 'shared';
import {DashData} from 'shared/types/dash';
import {showToast} from 'store/actions/toaster';
import {DataLensApiError} from 'typings';
import Utils from 'ui/utils';
import {isEntryAlreadyExists} from 'utils/errors/errorByCode';

import {Entry} from '../../../typings/common';
import {DialogCreateWorkbookEntry} from '../DialogCreateWorkbookEntry/DialogCreateWorkbookEntry';
import {EntryDialogBase} from '../EntryDialogBase/EntryDialogBase';
import {EntryDialogResolveStatus} from '../constants';
import {EntryDialogProps} from '../types';

export interface DialogCreateDashboardProps extends EntryDialogProps {
    initDestination?: string;
    workbookId?: string;
    data?: DashData;
}

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = DialogCreateDashboardProps & DispatchProps;

const i18n = I18n.keyset('component.dialog-create-dashboard.view');

class DialogCreateDashboard extends React.Component<Props> {
    render() {
        const {workbookId} = this.props;

        if (workbookId) {
            return (
                <DialogCreateWorkbookEntry
                    name={i18n('label_default-name')}
                    defaultName={i18n('label_default-name')}
                    caption={i18n('section_caption')}
                    textButtonApply={i18n('button_apply')}
                    textButtonCancel={i18n('button_cancel')}
                    visible={this.props.visible}
                    onClose={this.onClose}
                    onApply={this.onWorkbookApply}
                    onSuccess={this.onSuccess}
                    onError={this.onError}
                />
            );
        }

        const foldersInitName = Utils.isEnabledFeature(Feature.SaveDashWithFakeEntry)
            ? i18n('label_default-name')
            : '';

        return (
            <EntryDialogBase
                withInput
                onClose={this.onClose}
                onApply={this.onApply}
                onSuccess={this.onSuccess}
                onError={this.onError}
                visible={this.props.visible}
                path={this.props.initDestination}
                name={foldersInitName}
                defaultName={i18n('label_default-name')}
                caption={i18n('section_caption')}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_apply')}
                placeholder={i18n('label_placeholder')}
            />
        );
    }

    private onWorkbookApply = ({name}: {name: string}) => {
        const {workbookId, data} = this.props;
        return this.props.sdk.charts.createDash({
            data: {
                workbookId,
                name,
                data,
            },
        });
    };

    private onApply = async (key: string) => {
        const {data} = this.props;
        const response = await this.props.sdk.charts.createDash({
            data: {key, data},
        });

        return response;
    };

    private onError = (error: DataLensApiError) => {
        if (isEntryAlreadyExists(error)) {
            return {
                inputError: i18n('label_entry-name-already-exists'),
            };
        }
        this.props.showToast({
            title: i18n('toast_create-dashboard-failed'),
            name: 'DialogCreateDashboardFailed',
            error: error,
            withReport: true,
        });
        return null;
    };

    private onClose = () => {
        this.props.onClose({status: EntryDialogResolveStatus.Close});
    };

    private onSuccess = (data: Entry) => {
        this.props.onClose({status: EntryDialogResolveStatus.Success, data});
    };
}

const mapDispatchToProps = {
    showToast,
};

export default connect(null, mapDispatchToProps)(DialogCreateDashboard);
