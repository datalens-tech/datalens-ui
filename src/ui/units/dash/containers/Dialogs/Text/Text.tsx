import React from 'react';

import {Checkbox, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {ResolveThunks, connect} from 'react-redux';
import {DashTabItemText, DialogDashWidgetItemQA, DialogDashWidgetQA} from 'shared';
import {DatalensGlobalState} from 'ui';

import {TextEditor} from '../../../../../components/TextEditor/TextEditor';
import {DIALOG_TYPE} from '../../../containers/Dialogs/constants';
import {setItemData} from '../../../store/actions/dashTyped';
import {closeDialog} from '../../../store/actions/dialogs/actions';
import {
    selectIsDialogVisible,
    selectOpenedItemData,
} from '../../../store/selectors/dashTypedSelectors';

import './Text.scss';

const b = block('dialog-text');

export interface OwnProps {}

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

interface State {
    text?: string;
    prevVisible?: boolean;
    autoHeight?: boolean;
}

export type TextProps = OwnProps & StateProps & DispatchProps;

class Text extends React.PureComponent<TextProps, State> {
    static defaultProps = {
        data: {
            text: '',
            autoHeight: false,
        },
    };

    static getDerivedStateFromProps(nextProps: TextProps, prevState: State) {
        if (nextProps.visible === prevState.prevVisible) {
            return null;
        }

        return {
            prevVisible: nextProps.visible,
            text: nextProps.data.text,
            autoHeight: Boolean(nextProps.data.autoHeight),
        };
    }

    state: State = {};

    render() {
        const {id, visible} = this.props;
        const {text, autoHeight} = this.state;

        return (
            <Dialog
                open={visible}
                onClose={this.props.closeDialog}
                disableOutsideClick={true}
                disableFocusTrap={true}
                qa={DialogDashWidgetItemQA.Text}
            >
                <Dialog.Header caption={i18n('dash.text-dialog.edit', 'label_text')} />
                <Dialog.Body className={b()}>
                    <TextEditor autofocus onTextUpdate={this.onTextUpdate} text={text} />
                    <div className={b('setting-row')}>
                        <Checkbox
                            checked={Boolean(autoHeight)}
                            onChange={this.handleAutoHeightChanged}
                        >
                            {i18n('dash.dashkit-plugin-common.view', 'label_autoheight-checkbox')}
                        </Checkbox>
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonApply={this.onApply}
                    textButtonApply={
                        id
                            ? i18n('dash.text-dialog.edit', 'button_save')
                            : i18n('dash.text-dialog.edit', 'button_add')
                    }
                    onClickButtonCancel={this.props.closeDialog}
                    textButtonCancel={i18n('dash.text-dialog.edit', 'button_cancel')}
                    propsButtonApply={{qa: DialogDashWidgetQA.Apply}}
                    propsButtonCancel={{qa: DialogDashWidgetQA.Cancel}}
                />
            </Dialog>
        );
    }

    onTextUpdate = (text: string) => this.setState({text});

    onApply = () => {
        const {text, autoHeight} = this.state;

        this.props.setItemData({data: {text, autoHeight}});
        this.props.closeDialog();
    };

    handleAutoHeightChanged = () => {
        this.setState({autoHeight: !this.state.autoHeight});
    };
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    id: state.dash.openedItemId,
    data: selectOpenedItemData(state) as DashTabItemText['data'],
    visible: selectIsDialogVisible(state, DIALOG_TYPE.TEXT),
});

const mapDispatchToProps = {
    closeDialog,
    setItemData,
};

export default connect(mapStateToProps, mapDispatchToProps)(Text);
