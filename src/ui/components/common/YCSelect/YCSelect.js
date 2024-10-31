import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import {Button, Icon, Loader, MobileContext, Popup, Sheet, eventBroker} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import _debounce from 'lodash/debounce';
import _filter from 'lodash/filter';
import _flatMap from 'lodash/flatMap';
import _isEqual from 'lodash/isEqual';
import _isUndefined from 'lodash/isUndefined';
import _max from 'lodash/max';
import _throttle from 'lodash/throttle';
import _uniq from 'lodash/uniq';
import _uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';

import {ItemsWrapper as Items} from './Items/Items';
import {Search} from './Search/Search';
import {MAX_CONTROL_WIDTH_WITH_ANIMATION, MIN_VIRTUALIZED_POPUP_WIDTH} from './constants';
import {isBothEmpty} from './isBothEmpty';
import {getEscapedRegExp, getPossiblePopupMinWidth, getTitleValue, isFalsy} from './utils';

import './YCSelect.scss';

const trans = I18n.keyset('components.common.YCSelect');

const b = block('yc-select');
const bControl = block('yc-select-control');
const bAction = block('yc-select-action');
const bPopup = block('yc-select-popup');
const bSheet = block('yc-select-sheet');

const DEBOUNCE_DELAY = 350;
const THROTTLE_DELAY = 33;
const EMPTY_VALUE = '—';
const AVAILABLE_POPUP_DIRECTIONS = ['bottom-start', 'bottom-end', 'top-start', 'top-end'];

const getModifier = (name) => b({[name]: true}).split(' ')[1];

const ItemShape = PropTypes.shape({
    value: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    key: PropTypes.string,
    meta: PropTypes.string,
    icon: PropTypes.node,
    disabled: PropTypes.bool,
    url: PropTypes.string,
});
const ItemsGroupShape = PropTypes.shape({
    groupTitle: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(ItemShape),
});
const ItemsShape = PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.arrayOf(ItemShape),
    PropTypes.arrayOf(ItemsGroupShape),
]);

const getFlattenItems = ({items, isItemsGrouped, innerValue}) => {
    return isItemsGrouped
        ? _flatMap(items, ({items: groupedItems}) =>
              groupedItems.filter((item) => innerValue.has(item.value)),
          )
        : items.filter((item) => innerValue.has(item.value));
};

function getInnerValueLength(value) {
    if (value === undefined || value === null) {
        return 0;
    }
    return Array.isArray(value) ? value.length : 1;
}

/**
 * Props that is of `Array` or `Set` type
 * @type {string[]}
 */
const arrayProps = ['items', 'titles', 'innerValue', 'prevPropsItems', 'shownItems'];

/**
 * Updates state with new values, and prevents replacing empty `Array`s and `Set`s with empty one
 * @param {Object} currentState
 * @param {Object} nextPartialState
 * @return {Object}
 */
function safeStateUpdater(currentState, nextPartialState) {
    let nextState = currentState;
    const entries = Object.entries(nextPartialState);

    for (const [key, nextValue] of entries) {
        const currentValue = nextState[key];

        if (
            (arrayProps.includes(key) && !isBothEmpty(currentValue, nextValue)) ||
            currentValue !== nextValue
        ) {
            nextState = {...nextState, [key]: nextValue};
        }
    }

    return nextState;
}

export class YCSelect extends React.PureComponent {
    static SINGLE = 'single';

    static MULTIPLE = 'multiple';

    static INIT_ITEMS_PLACEHOLDER = 'Fetching initial items...';

    static getInnerValue(value, allowNullableValues) {
        const checkFunction = allowNullableValues ? _isUndefined : isFalsy;

        if (checkFunction(value)) {
            return new Set();
        }

        return Array.isArray(value)
            ? new Set(value.filter((val) => !checkFunction(val)))
            : new Set([value]);
    }

    static getMissingItems(items = [], value, showMissingItems) {
        if (!showMissingItems) {
            return [];
        }

        const itemsSet = new Set(items.map((item) => item.value));

        return (Array.isArray(value) ? value : [value])
            .filter((valueItem) => {
                return !itemsSet.has(valueItem);
            })
            .map((missingValue) => ({
                value: missingValue,
                title: missingValue,
                missing: true,
            }));
    }

    static getDerivedStateFromProps(props, state) {
        const changedState = {};

        const isPropsItemsChange = props.items !== state.prevPropsItems && !props.getItems;

        if (isPropsItemsChange) {
            const missingItems = YCSelect.getMissingItems(
                props.items,
                props.value,
                props.showMissingItems,
            );
            const items = missingItems.concat(props.items);
            changedState.prevPropsItems = props.items;
            changedState.items = items;
            changedState.isItemsGrouped = YCSelect.isItemsGrouped(props.items);

            if (state.inputValue) {
                const regExp = getEscapedRegExp(state.inputValue);

                if (changedState.isItemsGrouped) {
                    changedState.shownItems = props.items
                        .map((group) => {
                            const groupItems = group.items.filter((item) =>
                                regExp.test(item.title),
                            );
                            return {
                                groupTitle: group.groupTitle,
                                items: groupItems,
                            };
                        })
                        .filter((group) => group.items.length);
                } else {
                    changedState.shownItems = items.filter((item) => regExp.test(item.title));
                }
            } else {
                changedState.shownItems = items;
            }
        }

        if (props.value !== state.prevPropsValue || isPropsItemsChange) {
            const missingItems = YCSelect.getMissingItems(
                props.getItems ? state.items.concat(state.selectItems) : props.items,
                props.value,
                props.showMissingItems,
            );
            let items = YCSelect.isItemsGrouped(props.items)
                ? props.items
                : missingItems.concat(props.getItems ? state.items : props.items);

            if (props.getItems) {
                items = _uniqBy(items.concat(state.selectItems), 'value');
            }

            changedState.prevPropsValue = props.value;

            const {innerValue, singleSelectItem, titles} = YCSelect.getInnerValueState(
                props,
                items,
            );

            Object.assign(changedState, {innerValue, singleSelectItem, titles});

            if (props.getItems) {
                const length = getInnerValueLength(props.value);

                if (length !== 0 && titles.length !== length) {
                    changedState.isInitPending = true;
                } else {
                    changedState.selectItems = _filter(state.selectItems, (item) =>
                        innerValue.has(item.value),
                    );
                }
            }

            if (props.showMissingItems) {
                changedState.items = items;
            }
        }

        return Object.keys(changedState).length > 0 ? changedState : null;
    }

    static getInnerValueState(props, items) {
        const {value, type, showItemIcon, allowNullableValues} = props;

        const res = {};
        res.innerValue = YCSelect.getInnerValue(value, allowNullableValues);
        if (type === YCSelect.SINGLE && showItemIcon) {
            res.singleSelectItem = YCSelect.getSingleSelectedItem(items, res.innerValue);
        }

        res.titles = YCSelect.getTitles(items, res.innerValue);

        return res;
    }

    static getTitles(items, innerValue) {
        if (!innerValue.size) {
            return [];
        }

        const isItemsGrouped = YCSelect.isItemsGrouped(items);

        if (isItemsGrouped) {
            return _flatMap(items, ({items: groupedItems}) =>
                groupedItems.filter((item) => innerValue.has(item.value)).map((item) => item.title),
            );
        }

        return items
            .filter((item) => innerValue.has(item.value))
            .map(({title}) => getTitleValue(title));
    }

    static getSingleSelectedItem(items, innerValue) {
        const isItemsGrouped = YCSelect.isItemsGrouped(items);

        if (isItemsGrouped) {
            const filteredList = items
                .map(({items: groupedItems}) =>
                    groupedItems.find((item) => innerValue.has(item.value)),
                )
                .filter(Boolean);

            return filteredList[0];
        }

        return items.find((item) => innerValue.has(item.value));
    }

    static isItemsGrouped(items) {
        if (!items || !items.length) {
            return false;
        }

        return Object.prototype.hasOwnProperty.call(items[0], 'groupTitle');
    }

    static propTypes = {
        onUpdate: PropTypes.func.isRequired,
        getItems: PropTypes.func,
        addItem: PropTypes.func,
        renderSwitcher: PropTypes.func,
        onOpenChange: PropTypes.func,
        size: PropTypes.oneOf(['xs', 's', 'm', 'n', 'promo']),
        type: PropTypes.oneOf([YCSelect.SINGLE, YCSelect.MULTIPLE]),
        className: PropTypes.string,
        popupClassName: PropTypes.string,
        controlTestAnchor: PropTypes.string,
        itemsListTestAnchor: PropTypes.string,
        switcherClassName: PropTypes.string,
        label: PropTypes.string,
        limitLabel: PropTypes.bool,
        itemsLoaderClassName: PropTypes.string,
        controlWidth: PropTypes.number,
        popupWidth: PropTypes.number,
        itemsPageSize: PropTypes.number,
        virtualizeThreshold: PropTypes.number,
        showSearch: PropTypes.bool,
        showArrow: PropTypes.bool,
        showApply: PropTypes.bool,
        showItemIcon: PropTypes.bool,
        showItemMeta: PropTypes.bool,
        showMissingItems: PropTypes.bool,
        showSelectAll: PropTypes.bool,
        allowEmptyValue: PropTypes.bool,
        allowNullableValues: PropTypes.bool,
        hiding: PropTypes.bool,
        disabled: PropTypes.bool,
        stretched: PropTypes.bool,
        loading: PropTypes.bool,
        loadingItems: PropTypes.bool,
        applyOnOutsideClick: PropTypes.bool,
        items: ItemsShape,
        initialItems: ItemsShape,
        value: (props, propName, componentName) => {
            const propTypeSpec =
                props['type'] === YCSelect.SINGLE
                    ? {[propName]: PropTypes.string}
                    : {[propName]: PropTypes.arrayOf(PropTypes.string)};
            PropTypes.checkPropTypes(propTypeSpec, props, propName, componentName);
        },
        placeholder: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                text: PropTypes.string.isRequired,
                icon: PropTypes.node.isRequired,
            }),
        ]),

        errorContent: PropTypes.node,
        onFetchErrorDetails: PropTypes.func,
        fetchErrorDetailsTitle: PropTypes.string,
        hasValidationError: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        const {
            type,
            value,
            showItemIcon,
            showMissingItems,
            allowNullableValues,
            getItems,
            initialItems,
            controlTestAnchor,
        } = this.props;

        this.controlRef = React.createRef();
        this.badgeRef = React.createRef();
        this.searchRef = React.createRef();
        this.popupRef = React.createRef();
        this.selectorRef = React.createRef();

        this._publishEvent = eventBroker.withEventPublisher('Select', controlTestAnchor);

        this.fetchCounter = 0;

        let items = [];
        let titles = [];
        let isInitPending = false;
        let innerValue = new Set();
        let singleSelectItem;

        if (getItems && (!this.isEmpty() || initialItems)) {
            const missingItems = YCSelect.getMissingItems(initialItems, value, showMissingItems);
            items = missingItems.concat(initialItems || []);
            isInitPending = true;
            innerValue = YCSelect.getInnerValue(value, allowNullableValues);
        } else if (!getItems) {
            const missingItems = YCSelect.getMissingItems(
                this.props.items,
                value,
                showMissingItems,
            );
            items = missingItems.concat(this.props.items || []);
            innerValue = YCSelect.getInnerValue(value, allowNullableValues);
            titles = YCSelect.getTitles(items, innerValue);
        }

        if (type === YCSelect.SINGLE && showItemIcon) {
            singleSelectItem = YCSelect.getSingleSelectedItem(items, innerValue);
        }

        this.state = {
            items,
            titles,
            innerValue,
            isInitPending,
            singleSelectItem,
            prevPropsItems: items,
            prevPropsValue: value,
            shownItems: items,
            selectedPopupItems: [],
            selectItems: [],
            inputValue: '',
            showMainPopup: false,
            showSelectedPopup: false,
            isFetchingItems: false,
            isControlClicked: false,
            isItemsGrouped: YCSelect.isItemsGrouped(items),
            fetchError: null,
        };
    }

    _updateControlWidth = _throttle(() => {
        if (!this._isMounted) {
            return;
        }

        const controlWidth = Math.ceil(this.controlRef.current.getBoundingClientRect().width);
        if (this.state.controlWidth !== controlWidth) {
            this.setState({controlWidth});
        }
    }, THROTTLE_DELAY);

    componentDidMount() {
        this._isMounted = true;
        setTimeout(() => {
            this._updateControlWidth();
        }, 0);

        if (this.state.isInitPending) {
            this._initItems();
        }
    }

    componentDidUpdate(prevProps) {
        const {controlWidth} = this.props;

        if (
            (!prevProps.getItems && this.props.getItems) ||
            (prevProps.getItems &&
                this.props.getItems &&
                !_isEqual(prevProps.initialItems, this.props.initialItems))
        ) {
            const {type, value, showItemIcon, showMissingItems, allowNullableValues, initialItems} =
                this.props;

            this.fetchCounter = 0;

            let items = [];
            let isInitPending = false;
            let innerValue = new Set();
            let singleSelectItem;

            if (!this.isEmpty() || initialItems) {
                const missingItems = YCSelect.getMissingItems(
                    initialItems,
                    value,
                    showMissingItems,
                );
                items = missingItems.concat(initialItems);
                isInitPending = true;
                innerValue = YCSelect.getInnerValue(value, allowNullableValues);
            }

            const titles = YCSelect.getTitles(items, innerValue);

            if (type === YCSelect.SINGLE && showItemIcon) {
                singleSelectItem = YCSelect.getSingleSelectedItem(items, innerValue);
            }

            this.setState(
                safeStateUpdater(this.state, {
                    items,
                    titles,
                    innerValue,
                    isInitPending,
                    singleSelectItem,
                    prevPropsItems: items,
                    prevPropsValue: value,
                    shownItems: items,
                    inputValue: '',
                }),
            );

            return;
        }

        if (this.state.showMainPopup && this.searchRef.current) {
            this.searchRef.current.focusInput();
        }

        if (this.state.isInitPending) {
            this._initItems();
        }

        if (controlWidth) {
            return;
        }

        this._updateControlWidth();

        if (this.selectorRef.current) {
            if (this.state.showMainPopup) {
                this.selectorRef.current.addEventListener(
                    'scroll',
                    this._handleSelectorScroll,
                    true,
                );
            } else {
                this.selectorRef.current.removeEventListener(
                    'scroll',
                    this._handleSelectorScroll,
                    true,
                );
            }
        }
    }

    componentWillUnmount() {
        this._isMounted = false;

        if (this.selectorRef.current) {
            this.selectorRef.current.removeEventListener(
                'scroll',
                this._handleSelectorScroll,
                true,
            );
        }
    }

    isEmpty() {
        const {type, value} = this.props;

        if (type === YCSelect.SINGLE) {
            return isFalsy(value);
        } else {
            return (value || []).filter((value) => !isFalsy(value)).length === 0;
        }
    }

    selectItem = (item) => {
        const {allowEmptyValue} = this.props;
        const prevInnerValue = new Set(this.state.innerValue);
        const innerValue =
            allowEmptyValue && prevInnerValue.has(item.value) ? new Set() : new Set([item.value]);
        const state = {
            innerValue,
            showMainPopup: false,
        };
        this.setState(safeStateUpdater(this.state, state), () => {
            this._onUpdate();
            this._onOpenChange({open: false});
        });
    };

    selectItems = (item) => {
        const {getItems} = this.props;
        const {items} = this.state;
        const innerValue = new Set(this.state.innerValue);

        if (innerValue.has(item.value)) {
            innerValue.delete(item.value);
        } else {
            innerValue.add(item.value);
        }

        const state = {
            innerValue,
            selectedCurrentItem: undefined,
        };

        if (getItems) {
            state.selectItems = [
                ...new Set([...this.state.selectItems, ...this.state.selectedPopupItems, ...items]),
            ].filter((item) => innerValue.has(item.value));
        }

        this.setState(safeStateUpdater(this.state, state), this._beforeOnUpdate);
    };

    onSingleSearchButtonClick = () => {
        this.setState(
            safeStateUpdater(this.state, {
                innerValue: new Set(),
                showMainPopup: false,
            }),
            this._onUpdate,
        );
    };

    onMultipleSearchButtonClick = () => {
        const {getItems} = this.props;
        const {items, shownItems, isItemsGrouped} = this.state;

        const state = {};
        let shownItemsValue;

        if (isItemsGrouped) {
            shownItemsValue = new Set(
                _flatMap(shownItems, ({items: groupedItems}) =>
                    groupedItems.filter((item) => !item.disabled).map((item) => item.value),
                ),
            );
        } else {
            shownItemsValue = new Set(
                shownItems
                    .filter((item) => !item.disabled && !item.missing)
                    .map((item) => item.value),
            );
        }

        let innerValue = new Set([...this.state.innerValue, ...shownItemsValue]);

        if (innerValue.size === this.state.innerValue.size) {
            innerValue = new Set(
                [...this.state.innerValue].filter((innerVal) => !shownItemsValue.has(innerVal)),
            );
        }

        state.innerValue = innerValue;

        if (getItems) {
            const allItems = new Set([
                ...items,
                ...this.state.selectedPopupItems,
                ...(this.state.selectItems || []),
            ]);
            state.selectItems = [...allItems].filter((item) => innerValue.has(item.value));
        }

        this.setState(safeStateUpdater(this.state, state), this._beforeOnUpdate);
    };

    selectOnlyCurrentItem = (selectedItem) => {
        const {getItems} = this.props;
        const {
            items,
            selectedCurrentItem: {value: prevSelectedItemValue} = {},
            shownItems,
            selectedPopupItems,
            showSelectedPopup,
            isItemsGrouped,
        } = this.state;

        const state = {selectedCurrentItem: undefined};

        if (selectedItem.value === prevSelectedItemValue) {
            const itemsToFilter = showSelectedPopup ? selectedPopupItems : shownItems;
            let innerValue;

            if (isItemsGrouped) {
                innerValue = new Set(
                    _flatMap(itemsToFilter, ({items: groupedItems}) =>
                        groupedItems
                            .filter((item) => !item.disabled && item.value !== selectedItem.value)
                            .map((item) => item.value),
                    ),
                );
            } else {
                innerValue = new Set(
                    itemsToFilter
                        .filter((item) => !item.disabled && item.value !== selectedItem.value)
                        .map((item) => item.value),
                );
            }

            state.innerValue = innerValue;

            if (getItems) {
                const allItems = new Set([...items, ...this.state.selectedPopupItems]);
                state.selectItems = [...allItems].filter((item) => innerValue.has(item.value));
            }
        } else {
            state.innerValue = new Set([selectedItem.value]);
            state.selectedCurrentItem = selectedItem;

            if (getItems) {
                state.selectItems = [selectedItem];
            }
        }

        this.setState(safeStateUpdater(this.state, state), this._beforeOnUpdate);
    };

    addNewItem = async (inputValue) => {
        const {getItems, addItem} = this.props;

        await addItem(inputValue);

        if (getItems) {
            this._onInputUpdateDynamic(inputValue);
        } else {
            this._onInputUpdateStatic(inputValue);
        }
    };

    setPopupWidth = (width) => {
        this.setState({popupWidth: width});
    };

    _handleSelectorScroll = _debounce((event) => {
        const {scrollTop} = event.target || {};
        this._publishEvent({eventId: 'selector-scroll', meta: {scrollTop}});
    }, 200);

    _initItems = async () => {
        const {value, initialItems, showMissingItems} = this.props;
        const {initialNextPageToken} = this.state;
        const exactKeys = new Set(Array.isArray(value) ? value.filter(Boolean) : [value]);

        const {items: fetchedItems, nextPageToken} = await this.props.getItems({
            exactKeys: [...exactKeys.values()],
        });

        let items = fetchedItems;
        let shownItems = fetchedItems;

        if (initialItems && (nextPageToken === initialNextPageToken || !initialNextPageToken)) {
            items = _uniq(this.state.items, fetchedItems);
            shownItems = items;
        }

        const missingItems = YCSelect.getMissingItems(fetchedItems, value, showMissingItems);
        const {innerValue, singleSelectItem, titles} = YCSelect.getInnerValueState(
            this.props,
            missingItems.length
                ? _uniqBy(fetchedItems.concat(missingItems), 'value')
                : fetchedItems,
        );

        this.setState(
            safeStateUpdater(this.state, {
                items,
                shownItems,
                selectItems: fetchedItems,
                innerValue,
                titles,
                singleSelectItem,
                nextPageToken,
                initialNextPageToken: nextPageToken,
                isInitPending: false,
            }),
        );
    };

    _fetchItems = async () => {
        const {getItems, itemsPageSize} = this.props;

        if (getItems) {
            const {inputValue, nextPageToken, selectItems = []} = this.state;

            this.setState(
                {isFetchingItems: true},
                this.popupRef.current && this.popupRef.current.forceUpdate,
            );

            try {
                this.fetchCounter += 1;
                const fetchData = await getItems({
                    searchPattern: inputValue,
                    itemsPageSize,
                    nextPageToken,
                });
                this.fetchCounter -= 1;

                if (this.fetchCounter > 0) {
                    this.setState(
                        {
                            fetchError: null,
                            isFetchingItems: true,
                        },
                        this.popupRef.current && this.popupRef.current.forceUpdate,
                    );

                    return;
                }

                const items = _uniq(
                    nextPageToken ? this.state.items.concat(fetchData.items) : fetchData.items,
                    selectItems,
                );

                this.setState(
                    safeStateUpdater(this.state, {
                        items: items,
                        shownItems: items,
                        nextPageToken: fetchData.nextPageToken,
                        fetchError: null,
                        isFetchingItems: false,
                    }),
                    this.popupRef.current && this.popupRef.current.forceUpdate,
                );
            } catch (error) {
                this.fetchCounter -= 1;
                if (this.fetchCounter > 0) {
                    this.setState({
                        fetchError: null,
                        isFetchingItems: true,
                    });

                    return;
                }

                this.setState({
                    fetchError: error,
                    isFetchingItems: false,
                });
            }
        }
    };

    _getSearchButtonSettings() {
        const {type, allowEmptyValue, showSelectAll} = this.props;
        const {shownItems = [], isItemsGrouped} = this.state;

        const settings = {
            isCleaning: true,
            visible: showSelectAll,
        };

        if (type === YCSelect.SINGLE) {
            settings.visible = Boolean(
                showSelectAll && this.state.innerValue.size && allowEmptyValue,
            );

            return settings;
        }

        if (!shownItems.length) {
            settings.visible = false;

            return settings;
        }

        let shownItemsValue;

        if (isItemsGrouped) {
            shownItemsValue = new Set(
                _flatMap(shownItems, ({items: groupedItems}) =>
                    groupedItems.filter((item) => !item.disabled).map((item) => item.value),
                ),
            );
        } else {
            shownItemsValue = new Set(
                shownItems.filter((item) => !item.disabled).map((item) => item.value),
            );
        }

        const innerValue = new Set([...this.state.innerValue, ...shownItemsValue]);

        settings.isCleaning = innerValue.size === this.state.innerValue.size;

        return settings;
    }

    _getOutputItems() {
        const {
            innerValue,
            items,
            selectItems,
            selectedPopupItems,
            showSelectedPopup,
            isItemsGrouped,
        } = this.state;

        if (showSelectedPopup) {
            return getFlattenItems({
                innerValue,
                isItemsGrouped,
                items: selectedPopupItems,
            });
        }

        const knownItems = _uniqBy(items.concat(selectItems), 'value');

        return getFlattenItems({
            innerValue,
            isItemsGrouped,
            items: knownItems,
        });
    }

    _getPreviousValue = () => {
        const {value, allowNullableValues} = this.props;
        const {items, selectItems} = this.state;
        const knownItems = _uniqBy(items.concat(selectItems), 'value');

        const innerValue = YCSelect.getInnerValue(value, allowNullableValues);
        const titles = YCSelect.getTitles(knownItems, innerValue);

        return {innerValue, titles};
    };

    _onInputUpdateStatic = (inputValue) => {
        const {showItemMeta} = this.props;
        const {items, isItemsGrouped} = this.state;

        let shownItems;

        if (inputValue) {
            const regExp = getEscapedRegExp(inputValue);

            if (isItemsGrouped) {
                shownItems = items
                    .map((group) => {
                        const groupItems = group.items.filter(
                            (item) =>
                                regExp.test(item.title) || (showItemMeta && regExp.test(item.meta)),
                        );
                        return {
                            groupTitle: group.groupTitle,
                            items: groupItems,
                        };
                    })
                    .filter((group) => group.items.length);
            } else {
                shownItems = items.filter(
                    (item) => regExp.test(item.title) || (showItemMeta && regExp.test(item.meta)),
                );
            }
        } else {
            shownItems = [...items];
        }

        const state = {
            shownItems,
            inputValue,
        };

        this.setState(safeStateUpdater(this.state, state));
    };

    _onInputUpdateDynamic = (inputValue) => {
        const {initialItems} = this.props;

        if (!inputValue) {
            this.setState(
                safeStateUpdater(this.state, {
                    items: initialItems || [],
                    shownItems: initialItems || [],
                    inputValue: '',
                    nextPageToken: this.state.initialNextPageToken,
                    fetchError: false,
                    isFetchingItems: false,
                }),
                () => {
                    if (this.popupRef.current) {
                        this.popupRef.current.forceUpdate();
                    }

                    if (this.debouncedFetchItems) {
                        this.debouncedFetchItems.cancel();
                    }
                },
            );

            return;
        }

        const {nextPageToken} = this.state;

        this.setState(
            safeStateUpdater(this.state, {
                inputValue,
                prevInputValue: this.state.inputValue,
                nextPageToken: inputValue === this.state.inputValue ? nextPageToken : undefined,
                isFetchingItems: true,
            }),
            () => {
                if (this.debouncedFetchItems) {
                    this.debouncedFetchItems.cancel();
                }

                this.debouncedFetchItems = _debounce(this._fetchItems, DEBOUNCE_DELAY);
                this.debouncedFetchItems();

                if (this.popupRef.current) {
                    this.popupRef.current.forceUpdate();
                }
            },
        );
    };

    _onBadgeClick = (e) => {
        const {getItems, showApply, applyOnOutsideClick, loadingItems} = this.props;
        const {
            items,
            innerValue,
            showSelectedPopup,
            selectItems,
            isItemsGrouped,
            isControlClicked,
            showMainPopup,
        } = this.state;

        if (e.target !== this.badgeRef.current) {
            return;
        }

        let state = {
            showSelectedPopup: !showSelectedPopup,
            showMainPopup: false,
        };
        if (loadingItems) {
            state = {
                showMainPopup: !showMainPopup,
                showSelectedPopup: false,
            };
            this.setState(state);
            return;
        }

        if (showApply && !applyOnOutsideClick) {
            state = {
                ...state,
                ...this._getPreviousValue(),
            };
        }

        if (getItems) {
            state.selectedPopupItems = _uniqBy(
                [
                    ...items.filter((item) => (state.innerValue || innerValue).has(item.value)),
                    ...selectItems,
                ],
                'value',
            );
        } else if (isItemsGrouped) {
            state.selectedPopupItems = items.map((group) => {
                const groupItems = group.items.filter((item) =>
                    (state.innerValue || innerValue).has(item.value),
                );
                return {
                    groupTitle: group.groupTitle,
                    items: groupItems,
                };
            });
        } else {
            state.selectedPopupItems = items.filter((item) =>
                (state.innerValue || innerValue).has(item.value),
            );
        }

        if (!isControlClicked) {
            state.isControlClicked = true;
        }

        if (!showMainPopup) {
            this._onOpenChange({open: state.showSelectedPopup});
        }

        this.setState(safeStateUpdater(this.state, state));
    };

    _onControlClick = (e) => {
        const {showMainPopup, isControlClicked, showSelectedPopup} = this.state;
        const {showApply, applyOnOutsideClick, disabled} = this.props;

        if (disabled || e.target === this.badgeRef.current) {
            return;
        }

        let state = {
            showMainPopup: !showMainPopup,
            showSelectedPopup: false,
        };

        if (showMainPopup && showApply) {
            if (applyOnOutsideClick) {
                this._onUpdate({isOutsideClick: true});
            } else {
                state = {
                    ...state,
                    ...this._getPreviousValue(),
                };
            }
        }

        if (!isControlClicked) {
            state.isControlClicked = true;
        }
        if (!showSelectedPopup) {
            this._onOpenChange({open: state.showMainPopup});
        }

        this.setState(safeStateUpdater(this.state, state));
    };

    _onControlClickCapture = (e) => {
        this._publishEvent({
            eventId: 'click',
            domEvent: e,
        });
    };

    _onControlKeyPress = (e) => {
        if (e.nativeEvent.code === 'Enter' || e.nativeEvent.code === 'Space') {
            this._onControlClick(e);
            e.preventDefault();
        }
    };

    _onControlKeyPressCapture = (e) => {
        if (e.nativeEvent.code === 'Enter' || e.nativeEvent.code === 'Space') {
            this._onControlClickCapture(e);
        }
    };

    _onApplyClick = () => {
        this._onUpdate();

        this.setState({
            showMainPopup: false,
            showSelectedPopup: false,
        });
    };

    _beforeOnUpdate() {
        const {getItems, showApply} = this.props;
        const {selectItems, innerValue} = this.state;

        let items = this.state.items;

        if (getItems) {
            items = [...new Set(items.concat(selectItems || []))];
        }

        if (showApply) {
            this.setState(
                safeStateUpdater(this.state, {
                    titles: YCSelect.getTitles(items, innerValue),
                }),
            );
        } else {
            this._onUpdate();
        }
    }

    _onUpdate = ({isOutsideClick} = {}) => {
        const {type, allowNullableValues, onUpdate} = this.props;
        const {innerValue} = this.state;
        const values = [...innerValue];
        let outputValues;
        let outputItems;

        if (onUpdate.length > 1) {
            outputItems = this._getOutputItems();
        }

        if (type === YCSelect.SINGLE) {
            const checkFunction = allowNullableValues ? _isUndefined : isFalsy;
            const nullableValue = allowNullableValues ? undefined : null;
            outputValues = checkFunction(values[0]) ? nullableValue : values[0];
            outputItems = outputItems ? outputItems[0] : nullableValue;
        } else {
            outputValues = values;
        }

        onUpdate(outputValues, {items: outputItems, isOutsideClick});
    };

    _onOutsideMainPopupClick = () => {
        const {showApply, applyOnOutsideClick} = this.props;
        const {shownItems, isItemsGrouped} = this.state;

        const isDisabled = isItemsGrouped
            ? shownItems.every((group) => group.items && !group.items.length)
            : !shownItems.length;

        let state = {showMainPopup: false};

        if (showApply && !isDisabled) {
            if (applyOnOutsideClick) {
                this._onUpdate({isOutsideClick: true});
            } else {
                state = {
                    ...state,
                    ...this._getPreviousValue(),
                };
            }
        }

        this.setState(safeStateUpdater(this.state, state));

        this._onOpenChange({open: state.showMainPopup});
    };

    _onOutsideSelectedItemsPopupClick = () => {
        const {showApply, applyOnOutsideClick} = this.props;
        const {selectedPopupItems, isItemsGrouped} = this.state;

        const isDisabled = isItemsGrouped
            ? selectedPopupItems.every((group) => group.items && !group.items.length)
            : !selectedPopupItems.length;

        let state = {showSelectedPopup: false};

        if (showApply && !isDisabled) {
            if (applyOnOutsideClick) {
                this._onUpdate({isOutsideClick: true});
            } else {
                state = {
                    ...state,
                    ...this._getPreviousValue(),
                };
            }
        }

        this.setState(safeStateUpdater(this.state, state));

        this._onOpenChange({open: state.showSelectedPopup});
    };

    _onOpenChange = (popupState) => {
        const {onOpenChange} = this.props;

        if (onOpenChange && typeof onOpenChange === 'function') {
            onOpenChange(popupState);
        }
    };

    _getPopupMinWidth() {
        const {controlWidth, type, showSearch, onFetchErrorDetails} = this.props;
        const {fetchError} = this.state;
        const errorDetailsMinWidth = fetchError && onFetchErrorDetails ? 250 : undefined;
        const possibleMinWidth = getPossiblePopupMinWidth({
            withSearch: showSearch,
            multiple: type === YCSelect.MULTIPLE,
        });

        return _max([
            errorDetailsMinWidth,
            possibleMinWidth,
            controlWidth || this.state.controlWidth,
        ]);
    }

    _getPopupClassNames() {
        const {popupClassName, type, showSearch} = this.props;

        const isMultiply = type === YCSelect.MULTIPLE;
        const mods = {
            search: showSearch,
            multi: isMultiply,
        };

        let mixins = getModifier('desktop');

        if (popupClassName) {
            mixins += ' ' + popupClassName;
        }

        return bPopup(mods, mixins);
    }

    _getPopupStyles() {
        const {controlWidth, virtualizeThreshold, getItems, errorContent} = this.props;
        const {shownItems = []} = this.state;

        const popupStyles = {minWidth: this._getPopupMinWidth()};

        if (!errorContent) {
            if (getItems || shownItems.length > virtualizeThreshold || this.props.popupWidth) {
                const width = this.props.popupWidth || controlWidth || this.state.controlWidth;
                popupStyles.width =
                    width > MIN_VIRTUALIZED_POPUP_WIDTH ? width : MIN_VIRTUALIZED_POPUP_WIDTH;
            } else if (this.state.popupWidth) {
                popupStyles.width = this.state.popupWidth;
            }
        }

        return popupStyles;
    }

    _renderTokens() {
        const {placeholder} = this.props;
        const {titles, isInitPending} = this.state;
        let placeholderIcon;
        let placeholderText;

        if (placeholder && typeof placeholder === 'object') {
            placeholderIcon = placeholder.icon;
            placeholderText = placeholder.text;
        } else if (placeholder) {
            placeholderText = placeholder;
        }

        placeholderText = isInitPending
            ? YCSelect.INIT_ITEMS_PLACEHOLDER
            : placeholderText || EMPTY_VALUE;

        const empty = !titles.length;

        return (
            <div className={bControl('tokens')}>
                {placeholderIcon && !titles.length && (
                    <div className={bControl('placeholder-icon')}>{placeholderIcon}</div>
                )}
                <span className={bControl('tokens-text', {empty})}>
                    {empty ? placeholderText : this._renderTitles(titles)}
                </span>
            </div>
        );
    }

    _renderTitles(titles) {
        return titles.map((title, index) => {
            return (
                <React.Fragment key={index}>
                    {title}
                    {index === titles.length - 1 ? '' : ', '}
                </React.Fragment>
            );
        });
    }

    _renderControl() {
        const {
            controlWidth,
            size,
            type,
            className,
            label,
            limitLabel,
            showArrow,
            showItemIcon,
            stretched,
            disabled,
            loading,
            renderSwitcher,
            switcherClassName,
            controlTestAnchor,
            errorContent,
            hasValidationError,
        } = this.props;

        const {
            showMainPopup,
            showSelectedPopup,
            innerValue,
            isInitPending,
            singleSelectItem: {icon} = {},
        } = this.state;

        if (renderSwitcher) {
            return (
                <div
                    ref={this.controlRef}
                    className={b('switcher', switcherClassName)}
                    onClick={this._onControlClick}
                    onClickCapture={this._onControlClickCapture}
                    data-qa={controlTestAnchor}
                >
                    {renderSwitcher()}
                </div>
            );
        }

        const controlMods = {
            size: size,
            focused: showMainPopup || showSelectedPopup,
            stretched: stretched,
            disabled: disabled || isInitPending || loading,
            'without-animation':
                (controlWidth || this.state.controlWidth) > MAX_CONTROL_WIDTH_WITH_ANIMATION,
            error: Boolean(errorContent) || hasValidationError,
        };

        const badgeMods = {
            clicked: showSelectedPopup,
            'without-arrow': !showArrow,
        };

        const isMultiply = type === YCSelect.MULTIPLE;

        const controlStyles = {};

        if (controlWidth) {
            controlStyles.width = controlWidth;
        }

        return (
            <div
                ref={this.controlRef}
                tabIndex={disabled ? -1 : 0}
                className={className ? bControl(controlMods, className) : bControl(controlMods)}
                style={controlStyles}
                onClick={this._onControlClick}
                onClickCapture={this._onControlClickCapture}
                onKeyPressCapture={this._onControlKeyPressCapture}
                onKeyPress={this._onControlKeyPress}
                data-qa={controlTestAnchor}
            >
                {loading ? (
                    <div className={bControl('loader')}>
                        <Loader size="s" />
                    </div>
                ) : (
                    <React.Fragment>
                        {label && (
                            <span className={bControl('label', {limited: limitLabel})}>
                                {label}
                            </span>
                        )}
                        {!isMultiply && showItemIcon && icon && (
                            <div className={bControl('selected-item-icon')}>{icon}</div>
                        )}
                        {this._renderTokens()}
                        {isMultiply && Boolean(innerValue.size) && (
                            <div
                                ref={this.badgeRef}
                                className={bControl('badge', badgeMods)}
                                onClick={this._onBadgeClick}
                            >
                                {innerValue.size}
                            </div>
                        )}
                    </React.Fragment>
                )}
                {showArrow && (
                    <div className={bControl('arrow', {loading})}>
                        <Icon data={ChevronDown} />
                    </div>
                )}
            </div>
        );
    }

    _renderSearch() {
        const {controlWidth, type, virtualizeThreshold, getItems} = this.props;
        const {inputValue, shownItems} = this.state;
        const inputUpdateHandler = getItems
            ? this._onInputUpdateDynamic
            : this._onInputUpdateStatic;

        let searchWidth;

        if (getItems || shownItems.length > virtualizeThreshold || this.props.popupWidth) {
            const width = this.props.popupWidth || controlWidth || this.state.controlWidth;
            searchWidth = width > MIN_VIRTUALIZED_POPUP_WIDTH ? width : MIN_VIRTUALIZED_POPUP_WIDTH;
        } else if (this.state.popupWidth) {
            searchWidth =
                this.state.popupWidth > this.state.controlWidth
                    ? this.state.popupWidth
                    : this.state.controlWidth;
        }

        return (
            <Search
                ref={this.searchRef}
                value={inputValue}
                width={this.props.popupWidth || searchWidth}
                minWidth={_max([this._getPopupMinWidth(), controlWidth || this.state.controlWidth])}
                searchButtonSettings={this._getSearchButtonSettings()}
                onInputUpdate={inputUpdateHandler}
                selectAllItems={
                    type === YCSelect.MULTIPLE
                        ? this.onMultipleSearchButtonClick
                        : this.onSingleSearchButtonClick
                }
                onClick={() => this._publishEvent({eventId: 'search-tap'})}
            />
        );
    }

    _renderItems({selectedPopup = false, mobile = false} = {}) {
        const {
            virtualizeThreshold,
            type,
            showSearch,
            showApply,
            showItemIcon,
            showItemMeta,
            getItems,
            addItem,
            onFetchErrorDetails,
            fetchErrorDetailsTitle,
            itemsListTestAnchor,
            errorContent,
        } = this.props;

        const {
            shownItems,
            selectedPopupItems,
            showMainPopup,
            showSelectedPopup,
            selectedCurrentItem,
            inputValue,
            isFetchingItems,
            isItemsGrouped,
            innerValue,
            nextPageToken,
            fetchError,
        } = this.state;

        let props = {
            innerValue,
            inputValue,
            virtualizeThreshold,
            selectedCurrentItem,
            selectType: type,
            showSearch,
            showApply,
            showItemIcon,
            showItemMeta,
            isItemsGrouped,
            mobile,
            itemsListTestAnchor,
            onItemClick: type === YCSelect.MULTIPLE ? this.selectItems : this.selectItem,
            selectOnlyCurrentItem: this.selectOnlyCurrentItem,
            setPopupWidth: this.setPopupWidth,
            errorContent,
        };

        if (selectedPopup) {
            props = {
                ...props,
                items: selectedPopupItems,
                visible: showSelectedPopup,
                selectedItemsPopup: true,
            };
        } else {
            props = {
                ...props,
                items: shownItems,
                visible: showMainPopup,
                showMoreItems: Boolean(nextPageToken),
                isDynamic: Boolean(getItems),
                isFetchingItems: isFetchingItems,
                fetchError: fetchError,
                onFetchErrorDetails: onFetchErrorDetails,
                fetchErrorDetailsTitle: fetchErrorDetailsTitle,
                fetchItems: this._fetchItems,
                addNewItem: addItem ? this.addNewItem : undefined,
            };
        }

        return <Items {...props} />;
    }

    _renderApplyButton() {
        const {type, showApply} = this.props;
        const {shownItems, selectedPopupItems, isItemsGrouped, showMainPopup, showSelectedPopup} =
            this.state;
        const isMultiply = type === YCSelect.MULTIPLE;

        if (!isMultiply || !showApply) {
            return null;
        }

        const isClosing = !showMainPopup && !showSelectedPopup;
        let isDisabled;

        if (showMainPopup) {
            isDisabled = isItemsGrouped
                ? shownItems.every((group) => group.items && !group.items.length)
                : !shownItems.length;
        } else {
            isDisabled = isItemsGrouped
                ? selectedPopupItems.every((group) => group.items && !group.items.length)
                : !selectedPopupItems.length;
        }

        return (
            <div className={bAction()}>
                <Button
                    view="action"
                    size="l"
                    width="max"
                    onClick={this._onApplyClick}
                    disabled={isDisabled || isClosing}
                >
                    {trans('apply_button_text')}
                </Button>
            </div>
        );
    }

    _renderPopupContent({isMobile}) {
        const {showSearch, errorContent, loadingItems, itemsLoaderClassName} = this.props;
        const shouldRenderSearch =
            showSearch && !errorContent && (isMobile || this.state.popupWidth);
        return loadingItems ? (
            <div className={bPopup('loader', {mobile: isMobile}, itemsLoaderClassName)}>
                <Loader size="s" />
            </div>
        ) : (
            <React.Fragment>
                {shouldRenderSearch && this._renderSearch()}
                <div ref={this.selectorRef}>{this._renderItems({mobile: isMobile})}</div>
                {this._renderApplyButton()}
            </React.Fragment>
        );
    }

    _renderDesktopContent() {
        const {showMainPopup, showSelectedPopup, isControlClicked} = this.state;

        if (!isControlClicked) {
            return null;
        }

        const popupStyles = this._getPopupStyles();

        return (
            <React.Fragment>
                <Popup
                    contentClassName={this._getPopupClassNames()}
                    style={popupStyles}
                    open={showMainPopup}
                    anchorRef={this.controlRef}
                    placement={AVAILABLE_POPUP_DIRECTIONS}
                    onClose={this._onOutsideMainPopupClick}
                >
                    {this._renderPopupContent({isMobile: false})}
                </Popup>
                <Popup
                    contentClassName={this._getPopupClassNames()}
                    style={popupStyles}
                    open={showSelectedPopup}
                    anchorRef={this.controlRef}
                    placement={AVAILABLE_POPUP_DIRECTIONS}
                    onClose={this._onOutsideSelectedItemsPopupClick}
                >
                    <div className={bPopup('select-title')}>{trans('selected_popup_title')}</div>
                    {this._renderItems({selectedPopup: true})}
                    {this._renderApplyButton()}
                </Popup>
            </React.Fragment>
        );
    }

    _renderMobileContent() {
        const {label} = this.props;
        const {showMainPopup, showSelectedPopup} = this.state;

        return (
            <React.Fragment>
                <Sheet
                    id="yc-select-main"
                    title={label}
                    visible={showMainPopup}
                    contentClassName={bSheet(null, getModifier('mobile'))}
                    allowHideOnContentScroll={false}
                    onClose={this._onOutsideMainPopupClick}
                >
                    {this._renderPopupContent({isMobile: true})}
                </Sheet>
                <Sheet
                    id="yc-select-selected"
                    title={label}
                    visible={showSelectedPopup}
                    contentClassName={bSheet(null, getModifier('mobile'))}
                    allowHideOnContentScroll={false}
                    onClose={this._onOutsideSelectedItemsPopupClick}
                >
                    <div className={bPopup('select-title')}>{trans('selected_popup_title')}</div>
                    {this._renderItems({selectedPopup: true, mobile: true})}
                    {this._renderApplyButton()}
                </Sheet>
            </React.Fragment>
        );
    }

    render() {
        return (
            <MobileContext.Consumer>
                {({mobile}) => {
                    return (
                        <React.Fragment>
                            {this._renderControl()}
                            {mobile ? this._renderMobileContent() : this._renderDesktopContent()}
                        </React.Fragment>
                    );
                }}
            </MobileContext.Consumer>
        );
    }
}

export const YCSelectDefaultProps = {
    size: 's',
    itemsPageSize: 100,
    virtualizeThreshold: 100,
    type: YCSelect.SINGLE,
    items: [],
    showSearch: true,
    showArrow: true,
    stretched: true,
    showApply: false,
    showItemIcon: false,
    showItemMeta: false,
    showMissingItems: false,
    allowEmptyValue: false,
    allowNullableValues: false,
    showSelectAll: true,
    hiding: false,
    disabled: false,
    loading: false,
    applyOnOutsideClick: true,
    loadingItems: false,
};

YCSelect.defaultProps = YCSelectDefaultProps;
