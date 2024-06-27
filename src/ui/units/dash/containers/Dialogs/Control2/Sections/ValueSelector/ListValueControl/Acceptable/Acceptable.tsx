import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import type {ListItemData} from '@gravity-ui/uikit';
import {Button as CommonButton, Icon, List, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import update from 'immutability-helper';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {ControlQA} from 'shared';
import {DashboardDialogControl} from 'shared/constants/qa/dash';
import type {DatalensGlobalState} from 'ui/index';
import type {AcceptableValue} from 'ui/units/dash/store/actions/dashTyped';
import {setSelectorDialogItem} from 'ui/units/dash/store/actions/dashTyped';
import {selectSelectorDialog} from 'ui/units/dash/store/selectors/dashTypedSelectors';

import Dialog from '../../../../../Control/Dialog/Dialog';

import './Acceptable.scss';

const b = block('control-select-acceptable');

type AcceptableProps = ReturnType<typeof mapStateToProps> &
    ResolveThunks<typeof mapDispatchToProps>;

type AcceptableState = {
    showDialog: boolean;
    newValue: string;
    acceptableValues: string[];
};

const convertFromDefaultValue = (values: AcceptableValue[]) => {
    return values ? values.map(({value}) => value) : values;
};

class Acceptable extends React.PureComponent<AcceptableProps, AcceptableState> {
    state: AcceptableState = {
        showDialog: false,
        newValue: '',
        acceptableValues: convertFromDefaultValue(this.props.acceptableValues),
    };

    addItem = () => {
        const {newValue, acceptableValues} = this.state;
        if (newValue.trim() !== '' && !acceptableValues.includes(newValue)) {
            this.setState({newValue: '', acceptableValues: [newValue, ...acceptableValues]});
        }
    };

    onApply() {
        const {acceptableValues} = this.state;
        this.props.setSelectorDialogItem({
            acceptableValues: acceptableValues.map(
                (value: string): AcceptableValue => ({value, title: value}),
            ),
        });
    }

    handleRemoveItemClick(index: number, acceptableValues: string[]) {
        this.setState({
            acceptableValues: [
                ...acceptableValues.slice(0, index),
                ...acceptableValues.slice(index + 1),
            ],
        });
    }

    handleOnSortEnd({
        oldIndex,
        newIndex,
        acceptableValues,
    }: {
        oldIndex: number;
        newIndex: number;
        acceptableValues: string[];
    }) {
        if (oldIndex === newIndex) {
            return;
        }
        const newItems = update(acceptableValues, {
            $splice: [
                [oldIndex, 1],
                [newIndex, 0, acceptableValues[oldIndex]],
            ],
        });

        this.setState({
            acceptableValues: newItems,
        });
    }
    renderListItem(args: {
        item: ListItemData<string>;
        itemIndex: number;
        acceptableValues: string[];
    }) {
        const {item, itemIndex, acceptableValues} = args;
        return (
            <div className={b('item')} key={item} data-qa={ControlQA.controlSelectAcceptableItem}>
                <span title={item}>{item}</span>
                <span
                    onClick={() => this.handleRemoveItemClick(itemIndex, acceptableValues)}
                    className={b('remove')}
                    data-qa={ControlQA.controlSelectAcceptableRemoveButton}
                >
                    <Icon data={Xmark} width="16" />
                </span>
            </div>
        );
    }
    renderBody() {
        const {newValue, acceptableValues} = this.state;
        const isEmpty = !acceptableValues.length;
        return (
            <React.Fragment>
                <div className={b('header')} data-qa={ControlQA.controlSelectAcceptable}>
                    <TextInput
                        size="m"
                        qa={ControlQA.controlSelectAcceptableInput}
                        placeholder={i18n('dash.control-dialog.edit', 'context_add-value')}
                        onUpdate={(newValue) => this.setState({newValue})}
                        value={newValue}
                        controlProps={{
                            onBlur: this.addItem,
                            onKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) =>
                                event.charCode === 13 && this.addItem(),
                        }}
                    />
                    <CommonButton
                        view="normal"
                        size="m"
                        qa={ControlQA.controlSelectAcceptableButton}
                        onClick={this.addItem}
                    >
                        {i18n('dash.control-dialog.edit', 'button_add')}
                    </CommonButton>
                </div>
                <div className={b('items', {empty: isEmpty})}>
                    {isEmpty ? (
                        i18n('dash.control-dialog.edit', 'label_empty-list')
                    ) : (
                        <List
                            filterable={false}
                            virtualized={false}
                            sortable={true}
                            items={acceptableValues}
                            itemClassName={b('list-item')}
                            onSortEnd={(args) => this.handleOnSortEnd({...args, acceptableValues})}
                            renderItem={(
                                item: ListItemData<string>,
                                _isItemActive: boolean,
                                itemIndex: number,
                            ) => this.renderListItem({item, itemIndex, acceptableValues})}
                        />
                    )}
                </div>
            </React.Fragment>
        );
    }

    renderDialog() {
        const {showDialog} = this.state;
        return (
            <Dialog
                visible={showDialog}
                caption={i18n('dash.control-dialog.edit', 'label_acceptable-values')}
                onApply={() => {
                    this.onApply();
                    this.setState({
                        showDialog: false,
                        newValue: '',
                    });
                }}
                onClose={() =>
                    this.setState({
                        showDialog: false,
                        newValue: '',
                        acceptableValues: convertFromDefaultValue(this.props.acceptableValues),
                    })
                }
            >
                {this.renderBody()}
            </Dialog>
        );
    }

    render() {
        const {acceptableValues} = this.props;
        return (
            <React.Fragment>
                <CommonButton
                    onClick={this.handleOpenDialog}
                    qa={ControlQA.acceptableDialogButton}
                    size="m"
                >
                    {acceptableValues.length ? (
                        <span
                            data-qa={`${DashboardDialogControl.AcceptableValues}${acceptableValues.length}`}
                        >
                            {i18n('dash.control-dialog.edit', 'value_select-values', {
                                count: acceptableValues.length,
                            })}
                        </span>
                    ) : (
                        <span>{i18n('dash.control-dialog.edit', 'button_add')}</span>
                    )}
                </CommonButton>

                {this.renderDialog()}
            </React.Fragment>
        );
    }

    private handleOpenDialog = () => {
        this.setState({
            showDialog: !this.state.showDialog,
            acceptableValues: convertFromDefaultValue(this.props.acceptableValues),
        });
    };
}

const mapDispatchToProps = {setSelectorDialogItem};

const mapStateToProps = (state: DatalensGlobalState) => {
    const {sourceType, acceptableValues = []} = selectSelectorDialog(state);
    return {
        sourceType,
        acceptableValues,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Acceptable);
