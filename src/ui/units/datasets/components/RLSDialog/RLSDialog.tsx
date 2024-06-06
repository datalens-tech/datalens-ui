import React from 'react';

import {Dialog, TextArea} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatasetField} from 'shared';

import './RLSDialog.scss';

const b = block('rls-dialog');
const i18n = I18n.keyset('dataset.rls.modify');

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (args: any) => void;
    rlsField: string;
    field?: DatasetField;
}

interface State {
    visible: boolean;
    rlsField: string;
}

class RLSDialog extends React.Component<Props, State> {
    static defaultProps = {
        visible: false,
    };

    static getDerivedStateFromProps(nextProps: Props, nextState: State) {
        const {rlsField, visible} = nextProps;
        const {visible: visibleState} = nextState;

        if (visible === visibleState) {
            return null;
        }

        return {
            rlsField,
            visible,
        };
    }

    state = {
        visible: false,
        rlsField: '',
    };

    get isSaveBtnDisabled() {
        const {rlsField} = this.props;
        const {rlsField: rlsFieldState} = this.state;

        return rlsField === rlsFieldState;
    }

    saveRls = () => {
        const {field, onSave, onClose} = this.props;
        const {rlsField} = this.state;

        if (field) {
            const {guid} = field;

            onSave({
                [guid]: rlsField,
            });
            onClose();
        }
    };

    changeRlsSettings = (rlsField: string) => {
        this.setState({rlsField});
    };

    render() {
        const {visible, onClose, field} = this.props;
        const {rlsField} = this.state;

        if (!field) {
            return null;
        }

        const {title} = field;

        return (
            <Dialog open={visible} onClose={onClose}>
                <Dialog.Header caption={i18n('label_row-level-security')} />
                <Dialog.Body className={b()}>
                    <div className={b('field-name')}>
                        <span>{title}</span>
                    </div>
                    <TextArea
                        rows={5}
                        placeholder={i18n('field_placeholder-row-level-security')}
                        value={rlsField}
                        autoFocus={true}
                        onUpdate={this.changeRlsSettings}
                    />
                </Dialog.Body>
                <Dialog.Footer
                    preset="default"
                    onClickButtonCancel={onClose}
                    onClickButtonApply={this.saveRls}
                    textButtonCancel={i18n('button_cancel')}
                    textButtonApply={i18n('button_save')}
                    propsButtonApply={{
                        disabled: this.isSaveBtnDisabled,
                    }}
                />
            </Dialog>
        );
    }
}

export default RLSDialog;
