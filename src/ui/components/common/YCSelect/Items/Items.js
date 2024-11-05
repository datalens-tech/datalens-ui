import React from 'react';

import {Button, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';
import AutoSizer from 'react-virtualized-auto-sizer';
import {VariableSizeList as List} from 'react-window';

import {Item} from '../Item/Item';
import {checkBrowser} from '../utils';

import './Items.scss';

const trans = I18n.keyset('components.common.YCSelect');

const b = block('yc-select-items');
const ITEM_HEIGHT = 28;
const MOBILE_ITEM_HEIGHT = 40;
const ITEM_WITH_META_HEIGHT = 48;
const MOBILE_ITEM_WITH_META_HEIGHT = 60;
const GROUP_TITLE_HEIGHT = 21;
const MARGIN_OFFSET = 4;

export class ItemsWrapper extends React.PureComponent {
    static propTypes = {
        virtualizeThreshold: PropTypes.number,
        items: PropTypes.array,
        inputValue: PropTypes.string,
        innerValue: PropTypes.object,
        isFetchingItems: PropTypes.bool,
        isDynamic: PropTypes.bool,
        isItemsGrouped: PropTypes.bool,
        showItemMeta: PropTypes.bool,
        showMoreItems: PropTypes.bool,
        showSearch: PropTypes.bool,
        showApply: PropTypes.bool,
        selectedItemsPopup: PropTypes.bool,
        mobile: PropTypes.bool,
        fetchError: PropTypes.any,
        onFetchErrorDetails: PropTypes.func,
        fetchErrorDetailsTitle: PropTypes.string,
        visible: PropTypes.bool,
        fetchItems: PropTypes.func,
        addNewItem: PropTypes.func,
        setPopupWidth: PropTypes.func,
        setAllowHideOnContentScroll: PropTypes.func,
        errorContent: PropTypes.node,
    };

    static defaultProps = {
        showMoreItems: false,
    };

    static getDerivedStateFromProps(props, state) {
        const changedState = {};

        if (props.visible) {
            changedState.items = props.selectedItemsPopup
                ? props.items
                : props.items.filter(({missing}) => !missing);

            if (!state.hasItems) {
                changedState.hasItems = true;
            }
        }

        return Object.keys(changedState).length > 0 ? changedState : null;
    }

    state = {
        items: [],
        touchedItem: {},
        minHeight: undefined,
        isAddingUserItem: false,
        isFetchingNextItems: false,
        hasItems: false,
    };

    componentDidMount() {
        this.addedItemsCount = this.state.items.length;

        this._setPopupWidth();
    }

    componentDidUpdate(prevProps, prevState) {
        const {isDynamic} = this.props;
        const {isFetchingNextItems} = this.state;
        const listRef = this.listRef.current;
        const isSelectedItemsChanged = prevProps.innerValue !== this.props.innerValue;

        if ((isSelectedItemsChanged && listRef) || (isFetchingNextItems && listRef)) {
            listRef.forceUpdate();
        }

        if (prevProps.inputValue && !this.props.inputValue && isDynamic && listRef) {
            listRef.scrollTo(0);
        }

        if (prevState.items.length !== this.state.items.length) {
            this.addedItemsCount =
                prevState.items.length > this.state.items.length
                    ? this.state.items.length
                    : this.state.items.length - prevState.items.length;
        }

        if (prevProps.showItemMeta !== this.props.showItemMeta && listRef) {
            listRef.resetAfterIndex(0);
        }

        if (prevProps.errorContent && !this.props.errorContent) {
            this._setPopupWidth();
        }
    }

    componentWillUnmount() {
        this._removeObserver();
    }

    addedItemsCount = 0;

    ref = React.createRef();

    listRef = React.createRef();

    observer = null;

    get items() {
        const {isItemsGrouped} = this.props;

        let items = this.state.items;

        if (isItemsGrouped) {
            items = [];

            this.state.items.forEach((group) => {
                items.push({groupTitle: group.groupTitle});
                items = items.concat(group.items);
            });
        }

        return items;
    }

    getTouchedItem = () => {
        return this.state.touchedItem;
    };

    setTouchedItem = (touchedItem) => {
        this.setState({touchedItem});
    };

    _onResize = () => {
        if (!this.ref.current) {
            return;
        }

        const {minHeight} = this.state;
        const height = this.ref.current.getBoundingClientRect().height;

        if (height > minHeight) {
            this.setState({minHeight: height});
        }
    };

    _addObserver() {
        const config = {subtree: true, childList: true};
        this.observer = new MutationObserver(this._onResize);
        this.observer.observe(this.ref.current, config);
    }

    _setPopupWidth() {
        if (!this.ref.current) {
            return;
        }
        const {width} = this.ref.current.getBoundingClientRect();

        this.props.setPopupWidth(width + this._getScrollbarWidth());

        if (this.props.mobile) {
            this._addObserver();
        }
    }

    _removeObserver() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    _getScrollbarWidth() {
        if (!this.ref.current) {
            return 0;
        }

        const browser = checkBrowser();
        let offset = 0;

        if (browser === 'Firefox' || browser === 'Safari') {
            offset = this.ref.current.offsetWidth - this.ref.current.clientWidth;
        }

        return offset;
    }

    _getItemHeight = () => {
        const {showItemMeta, mobile} = this.props;

        if (mobile) {
            return showItemMeta ? MOBILE_ITEM_WITH_META_HEIGHT : MOBILE_ITEM_HEIGHT;
        }

        return showItemMeta ? ITEM_WITH_META_HEIGHT : ITEM_HEIGHT;
    };

    _getItemSize = (index) => {
        const items = this.items;
        const itemHeight = this._getItemHeight();

        if (!items[index]) {
            return itemHeight;
        }

        return items[index].groupTitle ? GROUP_TITLE_HEIGHT : itemHeight;
    };

    _fetchNextItems = async () => {
        const {fetchItems} = this.props;

        this.setState({isFetchingNextItems: true});
        await fetchItems();
        this.setState({isFetchingNextItems: false});
    };

    _addUserItem = async () => {
        const {inputValue, addNewItem} = this.props;
        this.setState({isAddingUserItem: true});
        await addNewItem(inputValue);
        this.setState({isAddingUserItem: false});
    };

    _onAddButtonClick = (e) => {
        e.stopPropagation();
        this._addUserItem();
    };

    _renderItem = (item, style = {}) => {
        const {innerValue} = this.props;
        const isSelected = innerValue.has(item.value);

        if (style.left) {
            delete style.left;
        }

        return (
            <Item
                {...this.props}
                key={item.key || item.value}
                style={style}
                item={item}
                isSelected={isSelected}
                getTouchedItem={this.getTouchedItem}
                setTouchedItem={this.setTouchedItem}
            />
        );
    };

    _renderGroupTitle = (title, style = {}) => {
        return (
            <div style={style} key={title} className={b('group-title')}>
                {title}
            </div>
        );
    };

    _itemRenderer = ({index, style}) => {
        const {isFetchingNextItems} = this.state;
        const items = this.items;
        const item = items[index];

        if (index === items.length && isFetchingNextItems) {
            return (
                <div className={b('loader')} style={style}>
                    <Loader size="s" />
                </div>
            );
        }

        if (!item) {
            return null;
        }

        if (item.groupTitle) {
            return this._renderGroupTitle(item.groupTitle, style);
        }

        return this._renderItem(item, style);
    };

    _onItemsRendered = ({visibleStopIndex}) => {
        const {showMoreItems} = this.props;
        const {items, isFetchingNextItems} = this.state;

        const threshold = Math.round(this.addedItemsCount / 3);
        const needFetch =
            showMoreItems && !isFetchingNextItems && items.length - visibleStopIndex < threshold;

        if (needFetch) {
            this._fetchNextItems();
        }
    };

    _renderItemsWithoutVirtualized() {
        const {isItemsGrouped} = this.props;
        const {items} = this.state;

        if (isItemsGrouped) {
            return items.map((item) => {
                const {groupTitle, items} = item;

                if (!groupTitle && !items) {
                    return this._renderItem(item);
                }

                const groupTitleNode = this._renderGroupTitle(groupTitle);
                const groupItems = items.map((item) => this._renderItem(item));

                return groupItems.length ? [groupTitleNode, ...groupItems] : null;
            });
        }

        return items.map((item) => this._renderItem(item));
    }

    // eslint-disable-next-line complexity
    render() {
        const {
            virtualizeThreshold,
            inputValue,
            showSearch,
            showApply,
            isDynamic,
            showMoreItems,
            selectedItemsPopup,
            mobile,
            addNewItem,
            fetchItems,
            isFetchingItems,
            isItemsGrouped,
            fetchError,
            itemsListTestAnchor,
            errorContent,
        } = this.props;
        const {minHeight, hasItems, isAddingUserItem, isFetchingNextItems} = this.state;

        const items = this.items;

        if (!hasItems) {
            return null;
        }

        if (isFetchingItems && !isFetchingNextItems) {
            return (
                <div ref={this.ref} className={b('loader')} style={{minHeight}}>
                    <Loader size="s" />
                </div>
            );
        }
        if (fetchError || errorContent) {
            const {onFetchErrorDetails, fetchErrorDetailsTitle} = this.props;

            return (
                <div ref={this.ref} className={b('prompt')} style={{minHeight}}>
                    {errorContent ? (
                        errorContent
                    ) : (
                        <React.Fragment>
                            <span>{trans('items_fetch_error')}</span>
                            <div className={b('buttons')}>
                                <Button
                                    disabled={isAddingUserItem}
                                    className={b('prompt-button', {retry: true})}
                                    onClick={fetchItems}
                                >
                                    {trans('refresh_button_text')}
                                </Button>
                                {onFetchErrorDetails && (
                                    <Button
                                        view="flat"
                                        className={b('prompt-button')}
                                        onClick={() => onFetchErrorDetails(fetchError)}
                                    >
                                        {fetchErrorDetailsTitle ||
                                            trans('error_details_button_text')}
                                    </Button>
                                )}
                            </div>
                        </React.Fragment>
                    )}
                </div>
            );
        }

        if (isDynamic && !inputValue && !items.length) {
            return (
                <div ref={this.ref} className={b('prompt')} style={{minHeight}}>
                    <span>{trans('items_prompt')}</span>
                </div>
            );
        }

        const isNotFound =
            !items.length ||
            (isItemsGrouped && items.every((group) => group.items && !group.items.length));

        if (isNotFound) {
            return (
                <div ref={this.ref} className={b('prompt')} style={{minHeight}}>
                    <span>{trans('items_not_found', {inputValue})}</span>
                    {addNewItem && !isItemsGrouped && (
                        <Button
                            disabled={isAddingUserItem}
                            className={b('prompt-button')}
                            onClick={this._onAddButtonClick}
                        >
                            {trans('items_add_new')}
                        </Button>
                    )}
                </div>
            );
        }

        const wrapperMods = {
            'with-search': !selectedItemsPopup && showSearch,
            'with-selected-title': selectedItemsPopup,
            'with-apply-button': showApply,
            grouped: isItemsGrouped,
            mobile: mobile,
        };

        if (!isDynamic && items.length < virtualizeThreshold) {
            wrapperMods['without-virtualized'] = true;

            return (
                <div
                    ref={this.ref}
                    className={b(wrapperMods)}
                    style={{minHeight}}
                    data-qa={itemsListTestAnchor}
                >
                    {this._renderItemsWithoutVirtualized()}
                </div>
            );
        }

        const itemHeight = this._getItemHeight();
        const itemCount = showMoreItems ? items.length + 1 : items.length;
        const marginOffset = items.length === 1 ? MARGIN_OFFSET * 2 : MARGIN_OFFSET;

        return (
            <div
                ref={this.ref}
                className={b(wrapperMods)}
                style={{
                    minHeight,
                    height: itemCount * itemHeight + marginOffset,
                }}
                data-qa={itemsListTestAnchor}
            >
                <AutoSizer>
                    {({width, height}) => (
                        <List
                            ref={this.listRef}
                            style={{overflowX: 'hidden'}}
                            width={width}
                            height={height}
                            itemSize={this._getItemSize}
                            itemData={items}
                            itemCount={itemCount}
                            overscanCount={5}
                            estimatedItemSize={itemHeight}
                            onItemsRendered={this._onItemsRendered}
                        >
                            {this._itemRenderer}
                        </List>
                    )}
                </AutoSizer>
            </div>
        );
    }
}
