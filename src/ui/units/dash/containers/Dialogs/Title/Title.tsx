import React from 'react';

import {Checkbox, Dialog, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {i18n} from 'i18n';
import {ResolveThunks, connect} from 'react-redux';
import {DatalensGlobalState} from 'ui';

import {DIALOG_TYPE} from '../../../containers/Dialogs/constants';
import {closeDialog} from '../../../store/actions/dash';
import {setItemData} from '../../../store/actions/dashTyped';
import {getOpenedItemData} from '../../../store/selectors/dash';
import {selectIsDialogVisible} from '../../../store/selectors/dashTypedSelectors';

import HoverRadioButton from './HoverRadioButton/HoverRadioButton';

import './Title.scss';

const SIZES = ['l', 'm', 's', 'xs'];
const RADIO_TEXT = ['Large', 'Medium', 'Small', 'XSmall'];

const b = block('dialog-title');

export interface OwnProps {}

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

interface State {
    prevVisible?: boolean;
    validation?: {text?: string};
    text?: string;
    size?: string;
    showInTOC?: boolean;
}

type Props = OwnProps & StateProps & DispatchProps;

class Title extends React.PureComponent<Props, State> {
    static defaultProps = {
        data: {
            text: i18n('dash.title-dialog.edit', 'value_default'),
            size: SIZES[0],
            showInTOC: true,
        },
    };

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        if (nextProps.visible === prevState.prevVisible) {
            return null;
        }

        return {
            prevVisible: nextProps.visible,
            validation: {},
            text: nextProps.data.text,
            size: nextProps.data.size,
            showInTOC: nextProps.data.showInTOC,
        };
    }

    state: State = {};

    render() {
        const {id, visible} = this.props;
        const {text, size, showInTOC, validation} = this.state;
        return (
            <Dialog open={visible} onClose={this.props.closeDialog}>
                <Dialog.Header caption={i18n('dash.title-dialog.edit', 'label_title')} />
                <Dialog.Body className={b()}>
                    <FieldWrapper error={validation?.text}>
                        <TextInput
                            size="l"
                            value={text}
                            autoFocus
                            placeholder={i18n('dash.title-dialog.edit', 'context_fill-title')}
                            onUpdate={this.onTextUpdate}
                            className={b('input', {size: this.state.size})}
                        />
                    </FieldWrapper>
                    <HoverRadioButton
                        value={size}
                        values={SIZES}
                        radioText={RADIO_TEXT}
                        onChange={this.onSizeChange}
                    />
                    <Checkbox
                        size="l"
                        checked={showInTOC}
                        onChange={() =>
                            this.setState((prevState) => ({showInTOC: !prevState.showInTOC}))
                        }
                        className={b('checkbox')}
                    >
                        {i18n('dash.title-dialog.edit', 'field_show-in-toc')}
                    </Checkbox>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonApply={this.onApply}
                    textButtonApply={
                        id
                            ? i18n('dash.title-dialog.edit', 'button_save')
                            : i18n('dash.title-dialog.edit', 'button_add')
                    }
                    onClickButtonCancel={this.props.closeDialog}
                    textButtonCancel={i18n('dash.title-dialog.edit', 'button_cancel')}
                />
            </Dialog>
        );
    }

    onTextUpdate = (text: string) =>
        this.setState({
            text,
            validation: {},
        });

    onSizeChange = (size?: string) => this.setState({size});

    onApply = () => {
        const {text, size, showInTOC} = this.state;
        if (text?.trim()) {
            this.props.setItemData({
                data: {
                    text,
                    size,
                    showInTOC,
                },
            });
            this.props.closeDialog();
        } else {
            this.setState({
                validation: {
                    text: i18n('dash.title-dialog.edit', 'toast_required-field'),
                },
            });
        }
    };
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    id: state.dash.openedItemId,
    data: getOpenedItemData(state),
    visible: selectIsDialogVisible(state, DIALOG_TYPE.TITLE),
});

const mapDispatchToProps = {
    closeDialog,
    setItemData,
};

export default connect(mapStateToProps, mapDispatchToProps)(Title);
