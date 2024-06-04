import React from 'react';

import {Checkbox, Dialog, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {i18n} from 'i18n';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import type {DashTabItemTitle} from 'shared';
import {
    DashTabItemTitleSize,
    DialogDashTitleQA,
    DialogDashWidgetItemQA,
    DialogDashWidgetQA,
} from 'shared';
import type {DatalensGlobalState} from 'ui';

import {DIALOG_TYPE} from '../../../containers/Dialogs/constants';
import {setItemData} from '../../../store/actions/dashTyped';
import {closeDialog} from '../../../store/actions/dialogs/actions';
import {
    selectIsDialogVisible,
    selectOpenedItemData,
} from '../../../store/selectors/dashTypedSelectors';
import {PaletteBackground} from '../components/PaletteBackground/PaletteBackground';

import HoverRadioButton from './HoverRadioButton/HoverRadioButton';

import './Title.scss';

const SIZES = [
    DashTabItemTitleSize.L,
    DashTabItemTitleSize.M,
    DashTabItemTitleSize.S,
    DashTabItemTitleSize.XS,
];
const RADIO_TEXT = ['Large', 'Medium', 'Small', 'XSmall'];

const b = block('dialog-title');

export interface OwnProps {}

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type State = {
    prevVisible?: boolean;
    validation?: {text?: string};
    text?: string;
    size?: DashTabItemTitleSize;
    showInTOC?: boolean;
    autoHeight?: boolean;
    hasBackground?: boolean;
    backgroundColor?: string;
};

type Props = OwnProps & StateProps & DispatchProps;

class TitleComponent extends React.PureComponent<Props, State> {
    static defaultProps = {
        data: {
            text: i18n('dash.title-dialog.edit', 'value_default'),
            size: SIZES[0],
            showInTOC: true,
            autoHeight: false,
            hasBackground: false,
            backgroundColor: 'transparent',
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
            autoHeight: Boolean(nextProps.data.autoHeight),
            hasBackground: Boolean(nextProps.data.background?.enabled),
            backgroundColor: nextProps.data.background?.color || '',
        };
    }

    state: State = {};

    render() {
        const {id, visible} = this.props;
        const {text, size, showInTOC, validation, autoHeight, hasBackground, backgroundColor} =
            this.state;

        return (
            <Dialog
                open={visible}
                onClose={this.props.closeDialog}
                onEnterKeyDown={this.onApply}
                qa={DialogDashWidgetItemQA.Title}
            >
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
                            qa={DialogDashTitleQA.Input}
                        />
                    </FieldWrapper>
                    <HoverRadioButton
                        value={size}
                        values={SIZES}
                        radioText={RADIO_TEXT}
                        onChange={this.onSizeChange}
                    />
                    <div className={b('setting-row')}>
                        <Checkbox
                            checked={showInTOC}
                            onChange={() =>
                                this.setState((prevState) => ({showInTOC: !prevState.showInTOC}))
                            }
                            className={b('checkbox')}
                        >
                            {i18n('dash.title-dialog.edit', 'field_show-in-toc')}
                        </Checkbox>
                    </div>
                    <div className={b('setting-row')}>
                        <Checkbox
                            checked={Boolean(autoHeight)}
                            onChange={this.handleAutoHeightChanged}
                        >
                            {i18n('dash.dashkit-plugin-common.view', 'label_autoheight-checkbox')}
                        </Checkbox>
                    </div>
                    <div className={b('setting-row')}>
                        <Checkbox
                            checked={Boolean(hasBackground)}
                            onChange={this.handleHasBackgroundChanged}
                        >
                            {i18n('dash.dashkit-plugin-common.view', 'label_background-checkbox')}
                        </Checkbox>
                        {Boolean(hasBackground) && (
                            <PaletteBackground
                                color={backgroundColor}
                                onSelect={this.handleHasBackgroundSelected}
                            />
                        )}
                    </div>
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
                    propsButtonApply={{qa: DialogDashWidgetQA.Apply}}
                    propsButtonCancel={{qa: DialogDashWidgetQA.Cancel}}
                />
            </Dialog>
        );
    }

    onTextUpdate = (text: string) =>
        this.setState({
            text,
            validation: {},
        });

    onSizeChange = (size?: string) => this.setState({size: size as DashTabItemTitleSize});

    onApply = () => {
        const {text, size, showInTOC, autoHeight, hasBackground, backgroundColor} = this.state;
        if (text?.trim()) {
            this.props.setItemData({
                data: {
                    text,
                    size,
                    showInTOC,
                    autoHeight,
                    background: {
                        enabled: hasBackground,
                        color: backgroundColor,
                    },
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

    handleAutoHeightChanged = () => {
        this.setState({autoHeight: !this.state.autoHeight});
    };

    handleHasBackgroundChanged = () => {
        this.setState({hasBackground: !this.state.hasBackground});
    };

    handleHasBackgroundSelected = (color: string) => {
        this.setState({backgroundColor: color});
    };
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    id: state.dash.openedItemId,
    data: selectOpenedItemData(state) as DashTabItemTitle['data'],
    visible: selectIsDialogVisible(state, DIALOG_TYPE.TITLE),
});

const mapDispatchToProps = {
    closeDialog,
    setItemData,
};

export const Title = connect(mapStateToProps, mapDispatchToProps)(TitleComponent);
