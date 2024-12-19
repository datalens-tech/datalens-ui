import React from 'react';

import {Dialog, Icon, List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import update from 'immutability-helper';
import findIndex from 'lodash/findIndex';
import omit from 'lodash/omit';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import type {DashTabItem} from 'shared';
import {DialogTabsQA} from 'shared';
import type {DatalensGlobalState} from 'ui';

import {DIALOG_TYPE} from '../../../../../constants/dialogs';
import {setTabs} from '../../../store/actions/dashTyped';
import {closeDialog} from '../../../store/actions/dialogs/actions';
import {
    selectCurrentTabId,
    selectIsDialogVisible,
    selectTabs,
} from '../../../store/selectors/dashTypedSelectors';

import type {DashTabChanged} from './TabItem';
import TabItem from './TabItem';

import iconPlus from 'ui/assets/icons/plus.svg';

import './Tabs.scss';

const b = block('dialog-tabs');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = StateProps & DispatchProps;

type State = {
    prevVisible: boolean;
    tabs: Array<DashTabChanged>;
    expandedItemIndex?: number;
};

const ROW_HEIGHT = 40;
class Tabs extends React.PureComponent<Props, State> {
    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        if (nextProps.visible === prevState.prevVisible) {
            return null;
        }

        return {
            prevVisible: nextProps.visible,
            tabs: nextProps.tabs,
        };
    }

    state: State = {
        prevVisible: false,
        tabs: this.props.tabs,
        expandedItemIndex: undefined,
    };

    render() {
        const {visible, selectedDashTabId} = this.props;
        const {tabs, expandedItemIndex} = this.state;

        return tabs ? (
            <Dialog
                open={visible}
                onClose={this.props.closeDialog}
                qa={DialogTabsQA.Dialog}
                disableOutsideClick={true}
            >
                <Dialog.Header caption={i18n('dash.tabs-dialog.edit', 'label_tabs')} />
                <Dialog.Body className={b()}>
                    <List
                        filterable={false}
                        virtualized={false}
                        sortable={true}
                        items={tabs}
                        itemClassName={b('sortable-item', {
                            highlight: tabs.length > 1,
                        })}
                        // Fix in @gravity-ui 7
                        itemsHeight={ROW_HEIGHT * tabs.length}
                        itemHeight={ROW_HEIGHT}
                        activeItemIndex={expandedItemIndex}
                        onSortEnd={({oldIndex, newIndex}) => this.moveItem(oldIndex, newIndex)}
                        renderItem={(tab, isActive) => (
                            <TabItem
                                id={tab.id || tab.tempId || ''}
                                tab={tab}
                                dashTabs={tabs}
                                selectedDashTabId={selectedDashTabId}
                                title={tab.title}
                                isActive={isActive}
                                noRemoveOption={tabs.length === 1}
                                setExpandedItem={this.setExpandedItem}
                                onCommit={this.handleCommit}
                                onDuplicateTab={this.handleDuplicateTab}
                                onRemoveTab={this.handleRemoveTab}
                                onRemoveOtherTabs={this.handleRemoveOtherTabs}
                                onChangeItemOrder={this.handleChangeOrderItem}
                            />
                        )}
                    />
                    <div
                        className={b('row', {add: true})}
                        onClick={this.handleAddTab}
                        data-qa={DialogTabsQA.RowAdd}
                    >
                        <Icon className={b('icon')} data={iconPlus} width="18" height="18" />
                        {i18n('dash.tabs-dialog.edit', 'button_add-tab')}
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={this.props.closeDialog}
                    textButtonApply={i18n('dash.tabs-dialog.edit', 'button_save')}
                    propsButtonApply={{
                        qa: DialogTabsQA.Save,
                    }}
                    propsButtonCancel={{
                        qa: DialogTabsQA.Cancel,
                    }}
                    textButtonCancel={i18n('dash.tabs-dialog.edit', 'button_cancel')}
                    onClickButtonApply={this.handleSave}
                />
            </Dialog>
        ) : null;
    }

    private moveItem = (dragIndex: number, hoverIndex: number) => {
        const {tabs} = this.state;
        const dragItem = tabs[dragIndex];

        this.setState({
            tabs: update(tabs, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragItem],
                ],
            }),
        });
    };

    private getTempId = () => {
        return `tab${Math.floor(Math.random() * 10 ** 10)}`;
    };

    private omitTemp = (tabs: Array<DashTabChanged>) => {
        return tabs.map((t) => omit(t, ['tempId']));
    };

    private setExpandedItem = (id: string) => {
        const {expandedItemIndex, tabs} = this.state;
        const index = findIndex(tabs, function (tab) {
            return id === tab.id || id === tab.tempId;
        });

        this.setState({expandedItemIndex: index === expandedItemIndex ? undefined : index});
    };

    private handleCommit = (newTitle: string, editedItemId: string) => {
        const {tabs} = this.state;

        const editedTabIndex = findIndex(tabs, function (tab) {
            return editedItemId === tab.id || editedItemId === tab.tempId;
        });

        const title = newTitle.trim();

        this.setState({
            tabs: update(tabs, {
                [editedTabIndex]: {
                    $merge: {
                        title:
                            title ||
                            i18n('dash.tabs-dialog.edit', 'value_default', {
                                index: editedTabIndex + 1,
                            }),
                    },
                },
            }),
        });
    };

    private handleAddTab = () => {
        this.setState((state) => ({
            tabs: update(state.tabs, {
                $push: [
                    {
                        title: i18n('dash.tabs-dialog.edit', 'value_default', {
                            index: state.tabs.length + 1,
                        }),
                        // in order for react dnd to work without errors, the key must be constant,
                        // to do this, enter tempId, which will be deleted when saving
                        tempId: this.getTempId(),
                        items: [],
                        layout: [],
                        connections: [],
                        aliases: {},
                    },
                ],
            }),
        }));
    };

    private handleDuplicateTab = (duplicatedTab: DashTabChanged) => {
        const {tabs} = this.state;
        const tabIndex = tabs.findIndex(
            (tab) => (tab.id || tab.tempId) === (duplicatedTab.id || duplicatedTab.tempId),
        );

        this.setState({
            tabs: update(tabs, {
                $splice: [
                    [
                        tabIndex + 1,
                        0,
                        {
                            title: i18n('dash.tabs-dialog.edit', 'value_default-duplicated', {
                                title: duplicatedTab.title,
                            }),
                            // in order for react dnd to work without errors, the key must be constant,
                            // to do this, enter tempId, which will be deleted when saving
                            tempId: this.getTempId(),
                            duplicatedFrom: duplicatedTab.duplicatedFrom || duplicatedTab.id,
                            items: [],
                            layout: [],
                            ignores: [],
                            aliases: {},
                        },
                    ],
                ],
            }),
        });
    };

    private handleRemoveTab = (id: string) => {
        const {tabs} = this.state;
        const tabIndex = tabs.findIndex((tab) => (tab.id || tab.tempId) === id);
        this.setState({
            tabs: update(tabs, {$splice: [[tabIndex, 1]]}),
        });
    };

    private handleRemoveOtherTabs = (id: string) => {
        const {tabs} = this.state;
        const tabIndex = tabs.findIndex((tab) => (tab.id || tab.tempId) === id);
        this.setState({
            tabs: update(tabs, {$set: [tabs[tabIndex]]}),
        });
    };

    private handleChangeOrderItem = ({
        tabId,
        items,
    }: {
        tabId: string;
        items: Array<DashTabItem>;
    }) => {
        const {tabs} = this.state;
        const tabIndex = tabs.findIndex((tab) => (tab.id || tab.tempId) === tabId);

        const tabItem = {...tabs[tabIndex], items};

        this.setState({
            tabs: update(tabs, {$splice: [[tabIndex, 1, tabItem]]}),
        });
    };

    private handleSave = () => {
        // so that the onBlur of the input can be executed
        setTimeout(() => {
            this.props.setTabs(this.omitTemp(this.state.tabs));
            this.props.closeDialog();
        }, 0);
    };
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    tabs: selectTabs(state),
    visible: selectIsDialogVisible(state, DIALOG_TYPE.TABS),
    selectedDashTabId: selectCurrentTabId(state),
});

const mapDispatchToProps = {
    closeDialog,
    setTabs,
};

export default connect(mapStateToProps, mapDispatchToProps)(Tabs);
