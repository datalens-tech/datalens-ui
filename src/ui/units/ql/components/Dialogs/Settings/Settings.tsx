import React, {PureComponent} from 'react';

import {Dialog, SegmentedRadioGroup as RadioButton, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import _pick from 'lodash/pick';
import {withHiddenUnmount} from 'ui';

import type {CommonSharedExtraSettings} from '../../../../../../shared';
import type {QLEntry} from '../../../store/typings/ql';

import './Settings.scss';

const b = block('dl-dialog-settings');

interface DialogSettingsProps {
    onApply: ({extraSettings}: {extraSettings: CommonSharedExtraSettings}) => void;
    onCancel: () => void;
    extraSettings?: CommonSharedExtraSettings;
    entry: QLEntry;
    visible: boolean;
}

interface DialogSettingsState {
    titleMode?: 'show' | 'hide';
    title?: string;
}

class DialogSettings extends PureComponent<DialogSettingsProps, DialogSettingsState> {
    state: DialogSettingsState = {};

    constructor(props: DialogSettingsProps) {
        super(props);

        const {extraSettings = {}, entry} = this.props;

        const {titleMode = 'hide', title = entry?.key?.replace(/.+\//, '') || ''} = extraSettings;

        this.state = {
            titleMode,
            title,
        };
    }

    render() {
        return (
            <Dialog className={b()} open={this.props.visible} onClose={this.props.onCancel}>
                <div className={b()}>
                    <Dialog.Header caption={i18n('dl-dialog-settings', 'label_chart-settings')} />
                    <Dialog.Body>{this.renderModalBody()}</Dialog.Body>
                    <Dialog.Footer
                        preset="default"
                        onClickButtonCancel={() => {
                            this.props.onCancel();
                        }}
                        onClickButtonApply={this.onApply}
                        textButtonApply={i18n('dl-dialog-settings', 'button_apply')}
                        textButtonCancel={i18n('dl-dialog-settings', 'button_cancel')}
                    />
                </div>
            </Dialog>
        );
    }

    private renderModalBody() {
        return <div>{this.renderTitleMode()}</div>;
    }

    private renderTitleMode() {
        const {titleMode, title} = this.state;

        return (
            <div className={b('row')}>
                <span className={b('label')}>{i18n('dl-dialog-settings', 'label_header')}</span>
                <RadioButton
                    size="m"
                    value={titleMode}
                    onChange={(event) => {
                        this.setState({
                            titleMode: event.target.value as 'show' | 'hide',
                        });
                    }}
                >
                    <RadioButton.Option value={'hide'}>
                        {i18n('dl-dialog-settings', 'label_hide')}
                    </RadioButton.Option>
                    <RadioButton.Option value={'show'}>
                        {i18n('dl-dialog-settings', 'label_show')}
                    </RadioButton.Option>
                </RadioButton>
                <TextInput
                    className={b('title-input')}
                    type="text"
                    pin="round-round"
                    size="s"
                    value={title}
                    disabled={titleMode === 'hide'}
                    onUpdate={(newTitle) => {
                        this.setState({
                            title: newTitle,
                        });
                    }}
                />
            </div>
        );
    }

    private onApply = () => {
        const extraSettings = {...this.state};

        this.props.onApply({extraSettings});
    };
}

export default withHiddenUnmount(DialogSettings);
