import React from 'react';

import {I18n} from 'i18n';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {showToast} from 'store/actions/toaster';
import type {DataLensApiError} from 'typings';
import {isEntryAlreadyExists} from 'utils/errors/errorByCode';

import type {Entry} from '../../../typings/common';
import {DialogCreateWorkbookEntry} from '../DialogCreateWorkbookEntry/DialogCreateWorkbookEntry';
import {EntryDialogBase} from '../EntryDialogBase/EntryDialogBase';
import {EntryDialogResolveStatus} from '../constants';
import type {EntryDialogProps} from '../types';

export interface DialogCreateWizardChartProps extends EntryDialogProps {
    initDestination: string;
    initName: string;
    data: {
        convert?: boolean;
        [key: string]: any;
    };
    workbookId?: string;
    description?: string;
}

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = DialogCreateWizardChartProps & DispatchProps;

const i18n = I18n.keyset('component.dialog-save-widget.view');

class DialogCreateWizardChart extends React.Component<Props> {
    render() {
        const {workbookId} = this.props;

        if (workbookId) {
            return (
                <DialogCreateWorkbookEntry
                    name={this.props.initName || i18n('label_widget-name-default')}
                    defaultName={i18n('label_widget-name-default')}
                    caption={i18n('section_caption')}
                    textButtonApply={i18n('button_apply')}
                    textButtonCancel={i18n('button_cancel')}
                    visible={this.props.visible}
                    onClose={this.onClose}
                    onApply={this.onWorkbookApply}
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
                defaultName={i18n('label_widget-name-default')}
                caption={i18n('section_caption')}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_apply')}
                placeholder={i18n('label_placeholder')}
            />
        );
    }

    private onWorkbookApply = async ({name}: {name: string}) => {
        const {workbookId, description} = this.props;

        const data = await this.props.sdk.charts.createWidget({
            name,
            workbookId: workbookId as string,
            data: this.props.data,
            template: 'datalens',
            description,
        });
        return data;
    };

    private onApply = async (key: string) => {
        const data = await this.props.sdk.charts.createWidget({
            key,
            data: this.props.data,
            template: 'datalens',
            description: this.props.description,
        });
        return data;
    };

    private onError = (error: DataLensApiError) => {
        if (isEntryAlreadyExists(error)) {
            return {
                inputError: i18n('label_entry-name-already-exists'),
            };
        }
        this.props.showToast({
            title: i18n('toast_save-widget-failed'),
            name: 'DialogCreateWizardChartFailed',
            error,
            withReport: true,
        });
        return null;
    };

    private onClose = () => {
        this.props.onClose({status: EntryDialogResolveStatus.Close});
    };

    private onSuccess = (data: Entry) => {
        this.props.onClose({
            status: EntryDialogResolveStatus.Success,
            data,
        });
    };
}

const mapDispatchToProps = {
    showToast,
};

export default connect(null, mapDispatchToProps)(DialogCreateWizardChart);
