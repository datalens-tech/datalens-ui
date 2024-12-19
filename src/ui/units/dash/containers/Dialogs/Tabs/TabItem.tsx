import {DL} from 'constants/common';

import React from 'react';

import {DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import type {DashTab, DashTabItem} from 'shared';
import {DialogTabsQA, ENABLE, SUPERUSER_SWITCH_MODE_COOKIE_NAME} from 'shared';
import Utils from 'ui/utils';
import type {Optional} from 'utility-types';

import {setInitialPageTabsItems} from '../../../store/actions/dashTyped';

import EditedTabItem from './EditedTabItem';
import {PopupWidgetsOrder} from './PopupWidgetsOrder/PopupWidgetsOrder';

import './TabItem.scss';

const b = block('dialog-tab-item');

export type DashTabChanged = Optional<DashTab, 'id' | 'connections'> & {
    tempId?: string;
    duplicatedFrom?: string;
    ignores?: unknown;
};

type OwnProps = {
    id: string;
    noRemoveOption: boolean;
    isActive: boolean;
    title: string;
    onCommit: (text: string, id: string) => void;
    onDuplicateTab: (tab: DashTabChanged) => void;
    onRemoveTab: (id: string) => void;
    onRemoveOtherTabs: (id: string) => void;
    onChangeItemOrder: ({tabId, items}: {tabId: string; items: Array<DashTabItem>}) => void;
    setExpandedItem: (id: string) => void;
    tab: DashTabChanged;
    dashTabs: Array<DashTabChanged>;
    selectedDashTabId: string | null;
};

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = OwnProps & DispatchProps;
class TabItem extends React.PureComponent<Props> {
    state = {
        editMode: false,
        showWidgetsOrderPopup: false,
        widgetOrderPopupOnceOpened: false,
    };

    optionOrder = {
        action: () => this.handleWidgetsOrderPopup(),
        text: i18n('dash.tabs-dialog.edit', 'menu_order'),
        qa: DialogTabsQA.TabItemMenuOrder,
    };

    optionsWithoutRemove = [
        {
            action: () => this.setEditMode(),
            text: i18n('dash.tabs-dialog.edit', 'menu_rename'),
        },
        {
            action: () => this.handleDuplicateTab(),
            text: i18n('dash.tabs-dialog.edit', 'menu_duplicate'),
        },
    ];

    optionsWithSuperuser = [
        {
            action: () => this.handleRemoveOtherTabs(),
            text: i18n('dash.tabs-dialog.edit', 'menu_delete_other'),
        },
    ];

    optionsWithRemove = [
        {
            action: () => this.handleRemoveTab(),
            text: i18n('dash.tabs-dialog.edit', 'menu_delete'),
        },
    ];

    superUserEnabled =
        DL.DISPLAY_SUPERUSER_SWITCH &&
        Utils.getCookie(SUPERUSER_SWITCH_MODE_COOKIE_NAME) === ENABLE;

    dropDownMenuRef = React.createRef<HTMLDivElement>();

    render() {
        const {id, isActive, title, dashTabs, selectedDashTabId} = this.props;
        const {editMode} = this.state;
        const dashTab = dashTabs.find((item) => item.id === id);
        const dashTabItems = dashTab?.items || [];
        const dashTabLayout = dashTab?.layout || [];
        const options = this.getMenuOptions();

        return editMode ? (
            <EditedTabItem
                id={id}
                title={title}
                className={b('row', {input: true})}
                onCommit={this.handleCommit}
            />
        ) : (
            <div
                className={b('row', {
                    active: isActive || this.state.showWidgetsOrderPopup,
                    selected: selectedDashTabId === id,
                })}
                onDoubleClick={this.setEditMode}
                data-qa={DialogTabsQA.ReadOnlyTabItem}
            >
                <div title={title} className={b('title')}>
                    {title}
                </div>
                <div className={b('controls')} ref={this.dropDownMenuRef}>
                    <DropdownMenu
                        size="s"
                        onOpenToggle={this.handleMenuToggle}
                        defaultSwitcherProps={{qa: DialogTabsQA.TabItemMenu}}
                        items={options}
                    />
                    {this.state.showWidgetsOrderPopup && (
                        <PopupWidgetsOrder
                            anchorRef={this.dropDownMenuRef}
                            onClose={this.handleWidgetsOrderCloseCb}
                            onApply={this.handleWidgetsOrderApplyCb}
                            items={dashTabItems}
                            layout={dashTabLayout}
                            tabId={id}
                        />
                    )}
                </div>
            </div>
        );
    }

    private getMenuOptions() {
        const options = [...this.optionsWithoutRemove, this.optionOrder];
        if (!this.props.noRemoveOption) {
            if (this.superUserEnabled) {
                options.push(...this.optionsWithSuperuser);
            }
            options.push(...this.optionsWithRemove);
        }
        return options;
    }

    private setEditMode = () => {
        this.setState({editMode: true});
    };

    private handleCommit = (text: string) => {
        const {id, onCommit} = this.props;
        this.setState({editMode: false});
        onCommit(text, id);
    };

    private handleDuplicateTab = () => {
        const {tab, onDuplicateTab} = this.props;
        onDuplicateTab(tab);
    };

    private handleMenuToggle = () => {
        const {id, setExpandedItem} = this.props;
        setExpandedItem(id);
    };

    private handleRemoveTab = () => {
        const {id, onRemoveTab} = this.props;
        onRemoveTab(id);
    };

    private handleRemoveOtherTabs = () => {
        const {id, onRemoveOtherTabs} = this.props;
        onRemoveOtherTabs(id);
    };

    private handleWidgetsOrderPopup = () => {
        if (!this.state.widgetOrderPopupOnceOpened) {
            this.setState({widgetOrderPopupOnceOpened: true});
            this.props.setInitialPageTabsItems();
        }
        this.setState({showWidgetsOrderPopup: !this.state.showWidgetsOrderPopup});
    };

    private handleWidgetsOrderCloseCb = () => {
        this.setState({showWidgetsOrderPopup: false});
    };

    private handleWidgetsOrderApplyCb = ({
        tabId,
        items,
    }: {
        tabId: string;
        items: Array<DashTabItem>;
    }) => {
        this.props.onChangeItemOrder({
            tabId,
            items,
        });
        this.setState({showWidgetsOrderPopup: false});
    };
}

const mapDispatchToProps = {
    setInitialPageTabsItems,
};

export default connect(null, mapDispatchToProps)(TabItem);
