import React from 'react';

import {ArrowUpRightFromSquare, Check} from '@gravity-ui/icons';
import {Button, Icon, eventBroker} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import md5 from 'blueimp-md5';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';

import {getTitleValue} from '../utils';

import './Item.scss';

const trans = I18n.keyset('components.common.YCSelect');

const b = block('yc-select-item');
const bWrap = block('yc-select-item-wrap');
const ACTION_WIDTH = 80;
const DESKTOP_TICK_ICON_SIZE = 16;
const MOBILE_TICK_ICON_SIZE = 14;
const SWIPE_DIR = {
    LEFT: 'left',
    RIGHT: 'right',
};

export class Item extends React.PureComponent {
    static propTypes = {
        onItemClick: PropTypes.func,
        selectOnlyCurrentItem: PropTypes.func,
        getTouchedItem: PropTypes.func,
        setTouchedItem: PropTypes.func,
        selectType: PropTypes.string,
        showItemIcon: PropTypes.bool,
        showItemMeta: PropTypes.bool,
        isSelected: PropTypes.bool,
        mobile: PropTypes.bool,
        item: PropTypes.object,
        selectedCurrentItem: PropTypes.object,
        style: PropTypes.object,
    };

    state = {
        startX: 0,
        deltaX: 0,
        actionNodes: [],
        swipeDirection: null,
        opening: false,
    };

    componentDidMount() {
        const actionNodes = [];

        if (this._linkButtonRef.current) {
            actionNodes.push(this._linkButtonRef.current);
        }

        if (this._onlyButtonRef.current) {
            actionNodes.push(this._onlyButtonRef.current);
        }

        this.setState({actionNodes});
    }

    _itemRef = React.createRef();
    _onlyButtonRef = React.createRef();
    _linkButtonRef = React.createRef();
    _publishEvent = eventBroker.withEventPublisher('Select');

    get height() {
        if (this._itemRef.current) {
            return this._itemRef.current.getBoundingClientRect().height;
        }

        return undefined;
    }

    get prevLeft() {
        if (this._itemRef.current && this._itemRef.current.style.left) {
            return parseFloat(this._itemRef.current.style.left);
        }

        return 0;
    }

    _handleTouchedItem = () => {
        const {item, actions} = this.props.getTouchedItem();

        if (item && item !== this._itemRef.current) {
            item.style.left = '0px';
            actions.forEach((node) => {
                node.style.right = `${-ACTION_WIDTH}px`;
            });
        }

        this.props.setTouchedItem({
            item: this._itemRef.current,
            actions: this.state.actionNodes,
        });
    };

    _handleItemMovement = (deltaX) => {
        const {actionNodes, opening} = this.state;
        const preparedDeltaX = deltaX * actionNodes.length;

        let left;

        if (opening) {
            left = preparedDeltaX;

            if (left > 0) {
                left = 0;
            } else if (Math.abs(left) > actionNodes.length * ACTION_WIDTH) {
                left = -actionNodes.length * ACTION_WIDTH;
            }
        } else {
            left = -actionNodes.length * ACTION_WIDTH + preparedDeltaX;

            if (left > 0) {
                left = 0;
            } else if (left < -actionNodes.length * ACTION_WIDTH) {
                left = -actionNodes.length * ACTION_WIDTH;
            }
        }

        this._itemRef.current.style.left = `${left}px`;
    };

    _handleActionsMovement = (deltaX) => {
        this.state.actionNodes.forEach((node, index) => {
            const preparedDeltaX = deltaX * (index + 1);
            const rightBound = ACTION_WIDTH * index;

            let right;

            if (this.state.opening) {
                right = Math.abs(preparedDeltaX) - ACTION_WIDTH;
            } else {
                right = rightBound - preparedDeltaX;
            }

            if (right > rightBound) {
                right = rightBound;
            } else if (right < -ACTION_WIDTH) {
                right = -ACTION_WIDTH;
            }

            node.style.right = `${right}px`;
        });
    };

    _setItemToExtremePosition = () => {
        const {actionNodes, swipeDirection} = this.state;

        if (!this._itemRef.current) {
            return;
        }

        const left = swipeDirection === SWIPE_DIR.LEFT ? -actionNodes.length * ACTION_WIDTH : 0;

        this._itemRef.current.style.left = `${left}px`;
    };

    _setActionsToExtremePosition = () => {
        const {actionNodes, swipeDirection} = this.state;

        actionNodes.forEach((node, index) => {
            const right = swipeDirection === SWIPE_DIR.LEFT ? ACTION_WIDTH * index : -ACTION_WIDTH;
            node.style.right = `${right}px`;
        });
    };

    _onOnlyButtonClick = (e) => {
        const {item, selectOnlyCurrentItem} = this.props;

        e.stopPropagation();

        selectOnlyCurrentItem(item);
    };

    _onItemClick = () => this.props.onItemClick(this.props.item);

    _onItemClickCapture = (e) => {
        const {
            item: {value},
        } = this.props;

        this._publishEvent({
            eventId: 'select',
            domEvent: e,
            meta: {
                valueHash: md5(value),
            },
        });
    };

    _onTouchStart = (e) => {
        this._handleTouchedItem();

        this.setState({
            startX: e.nativeEvent.touches[0].clientX,
            opening: this.prevLeft === 0,
        });
    };

    _onTouchMove = (e) => {
        const deltaX = e.nativeEvent.touches[0].clientX - this.state.startX;
        const swipeDirection = this.state.deltaX > deltaX ? SWIPE_DIR.LEFT : SWIPE_DIR.RIGHT;
        const handleMovement = !(this.state.opening && deltaX > 0);

        if (handleMovement) {
            this._handleItemMovement(deltaX);
            this._handleActionsMovement(deltaX);
        }

        this.setState({deltaX, swipeDirection});
    };

    _onTouchEnd = () => {
        const endDeltaX = this.state.deltaX;

        this.setState(
            {
                startX: 0,
                deltaX: 0,
                opening: false,
            },
            () => {
                if (endDeltaX === 0) {
                    return;
                }

                this._setItemToExtremePosition();
                this._setActionsToExtremePosition();
            },
        );
    };

    _renderItemIcon() {
        const {
            showItemIcon,
            showItemMeta,
            item: {icon},
        } = this.props;

        if (!showItemIcon || !icon) {
            return null;
        }

        const mods = {
            small: !showItemMeta,
            large: showItemMeta,
        };

        return <div className={b('icon', mods)}>{icon}</div>;
    }

    _renderItemInfo() {
        const {
            item: {title, meta, hint},
            showItemMeta,
        } = this.props;

        const titleValue = getTitleValue(title);

        return (
            <div className={b('info')}>
                <div
                    className={b('title', {secondary: title === '' || title === null})}
                    title={hint ?? ((typeof titleValue === 'string' && titleValue) || '')}
                >
                    {titleValue}
                </div>
                {showItemMeta && meta && (
                    <div className={b('meta')} title={meta}>
                        {meta}
                    </div>
                )}
            </div>
        );
    }

    _renderOnlyButton() {
        const {
            item: {value},
            selectedCurrentItem: {value: selectedCurrentItemValue} = {},
            selectType,
            mobile,
            style,
        } = this.props;
        const {deltaX} = this.state;

        if (selectType !== 'multiple') {
            return null;
        }

        const text = selectedCurrentItemValue === value ? trans('item_except') : trans('item_only');

        if (mobile) {
            const mods = {
                mobile: true,
                'with-transition': deltaX === 0,
            };

            return (
                <div
                    ref={this._onlyButtonRef}
                    className={b('only-btn', mods)}
                    style={{
                        top: style.top,
                        height: this.height,
                    }}
                    onClick={this._onOnlyButtonClick}
                >
                    {text}
                </div>
            );
        }

        return (
            <Button
                view="flat-secondary"
                size="s"
                className={b('only-btn')}
                onClick={this._onOnlyButtonClick}
            >
                {text}
            </Button>
        );
    }

    _renderExternalUrl() {
        const {
            item: {url},
            mobile,
            style,
        } = this.props;
        const {deltaX} = this.state;

        if (!url) {
            return null;
        }

        if (mobile) {
            const mods = {
                mobile: true,
                'with-transition': deltaX === 0,
            };

            return (
                <div
                    ref={this._linkButtonRef}
                    className={b('ext-link', mods)}
                    style={{
                        top: style.top,
                        height: this.height,
                    }}
                    onClick={() => window.open(url, '_blank')}
                >
                    <Icon data={ArrowUpRightFromSquare} />
                </div>
            );
        }

        return (
            <Button
                view="flat-secondary"
                size="s"
                href={url}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className={b('ext-link')}
            >
                <Icon data={ArrowUpRightFromSquare} />
            </Button>
        );
    }

    _renderTickIcon() {
        const {mobile} = this.props;
        const tickIconSize = mobile ? MOBILE_TICK_ICON_SIZE : DESKTOP_TICK_ICON_SIZE;

        return (
            <div className={b('tick-wrap')}>
                <Icon
                    data={Check}
                    className={b('tick')}
                    width={tickIconSize}
                    height={tickIconSize}
                />
            </div>
        );
    }

    render() {
        const {
            item: {value, disabled, modifier, meta},
            selectType,
            showItemMeta,
            isSelected,
            mobile,
            style,
        } = this.props;
        const {actionNodes, deltaX} = this.state;

        const isMultiple = selectType === 'multiple';
        const hasTouchHandlers = mobile && actionNodes.length;
        const mods = {
            disabled,
            selected: isSelected,
            multiple: isMultiple,
            [modifier]: Boolean(modifier),
            'show-meta': Boolean(showItemMeta && meta),
            'with-transition': deltaX === 0,
        };

        return (
            <div className={bWrap()}>
                <div
                    ref={this._itemRef}
                    className={b(mods)}
                    style={style}
                    data-value={value}
                    onClick={this._onItemClick}
                    onClickCapture={this._onItemClickCapture}
                    onTouchStart={hasTouchHandlers ? this._onTouchStart : undefined}
                    onTouchMove={hasTouchHandlers ? this._onTouchMove : undefined}
                    onTouchEnd={hasTouchHandlers ? this._onTouchEnd : undefined}
                >
                    {this._renderItemIcon()}
                    {this._renderItemInfo()}
                    {!mobile && this._renderOnlyButton()}
                    {!mobile && this._renderExternalUrl()}
                    {isSelected && isMultiple && this._renderTickIcon()}
                </div>
                {mobile && this._renderOnlyButton()}
                {mobile && this._renderExternalUrl()}
            </div>
        );
    }
}
