import React from 'react';

import {Gear} from '@gravity-ui/icons';
import type {IconData, IconProps} from '@gravity-ui/uikit';
import {Icon, Popover} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import pick from 'lodash/pick';
import type {ConnectableElement} from 'react-dnd';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {Field} from 'shared';
import {isParameter} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {selectUpdates} from 'units/wizard/selectors/preview';

import {actualizeAndSetUpdates} from '../../../../../actions/preview';
import DNDContainer from '../../../../../components/DND/DNDContainer';
import PlaceholderActionIcon from '../../../../../components/PlaceholderActionIcon/PlaceholderActionIcon';
import {ITEM_TYPES} from '../../../../../constants';
import type {AddableField} from '../../AddField/AddField';
import AddFieldContainer from '../../AddField/AddField';

import defaultPlaceholderTooltipIcon from 'ui/assets/icons/placeholder-tooltip.svg';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = StateProps &
    DispatchProps & {
        id: string;
        qa: string;
        iconProps: IconProps;
        title: (() => React.ReactNode) | string;
        hasSettings: boolean;
        onActionIconClick?: (item?: Field | Field[]) => void;
        actionIconQa?: string;
        items: Field[];
        capacity?: number;
        capacityError?: string;
        capacityErrorQa?: string;
        checkAllowed: (item: AddableField) => boolean;
        onUpdate: (items: Field[], item?: any, action?: string, onUndoInsert?: () => void) => void;
        allowedTypes?: Set<string> | undefined;
        allowedDataTypes?: Set<string> | undefined;
        additionalItemsClassName?: string;
        wrapTo: (props: any) => ConnectableElement;
        disabled: boolean;
        onBeforeRemoveItem?: (item: AddableField) => Promise<void>;
        disabledText?: string;
        noSwap?: boolean;
        noRemove?: boolean;
        onItemClick?: (_e: any, item: Field) => void;
        placeholderTooltipText?: string;
        placeholderTooltipIcon?: IconData;
        transform?: (item: Field, action?: 'replace') => Promise<Field>;
        showHideLabel?: boolean;
        isDashboardPlaceholder?: boolean;
        customPlaceholderActions?: CustomPlaceholderAction[];
        disableAddField?: boolean;
        addFieldItems?: Field[];
        onAfterUpdate?: () => void;
    };

export type CustomPlaceholderAction = {
    id: string;
    icon: React.ElementType;
    onClick?: () => void;
    disabledText?: string;
    hoverText?: string;
    qa?: string;
    hidden?: boolean;
    isFirst?: boolean;

    styles?: React.CSSProperties;
};

const PLACEHOLDER_DEFAULT_ICON_SIZE = 18;

class PlaceholderComponent extends React.PureComponent<Props> {
    render() {
        const {
            additionalItemsClassName,
            qa,
            allowedTypes,
            allowedDataTypes,
            items,
            capacity,
            id,
            wrapTo,
            onBeforeRemoveItem,
            onItemClick,
            noSwap,
            noRemove,
            disabled,
            showHideLabel,
            transform,
            onAfterUpdate,
        } = this.props;
        const itemsClassName = `data-qa-placeholder-item ${additionalItemsClassName || ''}`;
        return (
            <div data-qa={qa} className="subcontainer">
                <DNDContainer
                    title={this.renderPlaceholderTitle()}
                    id={id}
                    capacity={capacity}
                    allowedTypes={allowedTypes}
                    allowedDataTypes={allowedDataTypes}
                    checkAllowed={this.checkAllowed}
                    items={items}
                    itemsClassName={itemsClassName}
                    wrapTo={wrapTo}
                    disabled={disabled}
                    onBeforeRemoveItem={onBeforeRemoveItem}
                    noSwap={noSwap}
                    noRemove={noRemove}
                    onItemClick={onItemClick}
                    showHideLabel={showHideLabel}
                    transform={transform}
                    onRemoveItemClick={this.handleOnRemovePlaceholderItemClick}
                    onAfterUpdate={onAfterUpdate}
                />
            </div>
        );
    }

    private renderPlaceholderTitle() {
        const {
            addFieldItems,
            id,
            iconProps,
            hasSettings,
            actionIconQa,
            onActionIconClick,
            disabledText,
            allowedTypes,
            items,
            capacity,
            capacityError,
            placeholderTooltipText,
            placeholderTooltipIcon,
            transform,
            customPlaceholderActions,
            disableAddField,
            capacityErrorQa,
        } = this.props;

        const iconSize = iconProps.size || iconProps.width || PLACEHOLDER_DEFAULT_ICON_SIZE;

        return (
            <div className={`subheader${placeholderTooltipText ? ' subheader_with-tooltip' : ''}`}>
                <div className="placeholder-icon">
                    <Icon {...iconProps} size={iconSize} />
                </div>
                {this.renderPlaceholderTitleText()}
                <div className="visualization-container__placeholder-actions">
                    {hasSettings && (
                        <PlaceholderActionIcon
                            className="visualization-container__placeholder-action"
                            icon={Gear}
                            qa={actionIconQa}
                            onClick={onActionIconClick}
                            disabledText={disabledText}
                        />
                    )}
                    {allowedTypes !== ITEM_TYPES.NIL && !disableAddField && (
                        <AddFieldContainer
                            className="visualization-container__placeholder-action"
                            items={items}
                            addableFields={addFieldItems}
                            capacity={capacity}
                            capacityError={capacityError && i18n('wizard', capacityError)}
                            capacityErrorQa={capacityErrorQa}
                            checkAllowed={this.checkAllowed}
                            onUpdate={this.onPlaceholderUpdate}
                            transform={transform}
                        />
                    )}
                    {customPlaceholderActions?.map((action) => {
                        return (
                            <PlaceholderActionIcon
                                styles={action.styles}
                                key={`${id}__${action.id}`}
                                className="visualization-container__placeholder-action"
                                hidden={action.hidden}
                                icon={action.icon}
                                qa={action.qa}
                                isFirstElementInRow={action.isFirst}
                                onClick={action.onClick}
                                hoverText={action.hoverText}
                                disabledText={action.disabledText}
                            />
                        );
                    })}
                </div>
                {placeholderTooltipText && (
                    <Popover
                        content={placeholderTooltipText}
                        placement="right"
                        className={'placeholder-tooltip-icon'}
                    >
                        <Icon
                            data={placeholderTooltipIcon || defaultPlaceholderTooltipIcon}
                            fill="currentColor"
                            stroke="currentColor"
                        />
                    </Popover>
                )}
            </div>
        );
    }

    private renderPlaceholderTitleText() {
        const {title} = this.props;
        if (typeof title === 'string') {
            return <span>{i18n('wizard', title)}</span>;
        } else {
            return title();
        }
    }

    private onPlaceholderUpdate = (
        ...args: [items: Field[], item?: any, action?: string, onUndoInsert?: () => void]
    ) => {
        const items = args[0];

        const onUpdateItemsGuids = items.map((item: Field) => pick(item, 'guid', 'datasetId'));

        this.props.actualizeAndSetUpdates({updates: this.props.updates, onUpdateItemsGuids});
        this.props.onUpdate(...args);
    };

    private checkAllowed = (item: Field) => {
        // We can add the parameter to any section
        if (isParameter(item) && !this.props.isDashboardPlaceholder) {
            return true;
        }

        return this.props.checkAllowed(item);
    };

    private handleOnRemovePlaceholderItemClick = async (removeIndex: number) => {
        if (this.props.noRemove) {
            return;
        }
        const removedItem = this.props.items[removeIndex];
        const currentItems = this.props.items.filter((_, index) => {
            return index !== removeIndex;
        });

        this.onPlaceholderUpdate(currentItems, removedItem, 'remove');

        if (this.props.onBeforeRemoveItem) {
            await this.props.onBeforeRemoveItem(removedItem);
        }
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        updates: selectUpdates(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            actualizeAndSetUpdates,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaceholderComponent);
