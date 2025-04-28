import React from 'react';

import {Dialog, TextArea} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DatasetField} from 'shared';

import './RLSDialog.scss';

const b = block('rls-dialog');
const i18n = I18n.keyset('dataset.rls.modify');

export interface RLSDialogUser {
    /**
     * User identifier string that should consist of two parts separated by a colon
     * Example: "groupId:userName"
     */
    name?: string;
    title?: string;
}

export interface RLSDialogProps<T1 = string, T2 extends RLSDialogUser = RLSDialogUser> {
    visible: boolean;
    onClose: () => void;
    onSave: (args: any) => void;
    rlsField: T1;
    field?: DatasetField;
    getUsers?: (searchText: string) => Promise<T2[]>;
    getInitialUsers?: (args: {
        /**
         * @deprecated use `rules` property instead
         */
        ids: string[];
        rules?: T1;
    }) => Promise<T2[]>;
    renderUser?: (props: {user: T2}) => React.ReactNode;
}

interface State {
    visible: boolean;
    rlsField: string;
}

class RLSDialog extends React.Component<RLSDialogProps<string>, State> {
    static defaultProps = {
        visible: false,
    };

    static getDerivedStateFromProps(nextProps: RLSDialogProps<string>, nextState: State) {
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

    get isSaveBtnDisabled() {
        const {rlsField} = this.props;
        const {rlsField: rlsFieldState} = this.state;

        return rlsField === rlsFieldState;
    }

    private saveRls = () => {
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

    private changeRlsSettings = (rlsField: string) => {
        this.setState({rlsField});
    };
}

export const renderRLSDialog = (props: RLSDialogProps<any, any>) => {
    return <RLSDialog {...props} />;
};

export default RLSDialog;
