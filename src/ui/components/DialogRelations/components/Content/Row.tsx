import React from 'react';

import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {
    Button,
    DropdownMenu,
    Flex,
    Icon,
    Loader,
    Popover,
    Skeleton,
    spacing,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DashCommonQa, DashRelationTypes} from 'shared';
import logger from 'ui/libs/logger';

import {TEXT_LIMIT} from '../../constants';
import {getRelationsIcon} from '../../helpers';
import type {
    AliasClickHandlerData,
    DashkitMetaDataItem,
    OnLoadMetaType,
    RelationType,
} from '../../types';

import {
    getClampedText,
    getConnectionByInfo,
    getLinkIcon,
    getRelationDetailsKey,
    getRelationDetailsText,
    getRelationsText,
    getRowTitle,
    getTextSeparator,
} from './helpers';
import type {
    ConnectionByAliasesProp,
    ConnectionByFieldsProp,
    ConnectionByUsedParamsProp,
    ConnectionIndirectAliasesProp,
} from './types';

import iconInfo from 'assets/icons/info.svg';
import iconAlias from 'assets/icons/relations-alias.svg';

import './Content.scss';

const b = block('dialog-relations-content');
const i18n = I18n.keyset('component.dialog-relations.view');
const ICON_SIZE = 16;

type ChangedRelationType = {
    type: RelationType;
    widgetId: DashkitMetaDataItem['widgetId'];
    itemId: DashkitMetaDataItem['itemId'];
};

type RowParams = {
    data: DashkitMetaDataItem;
    widgetMeta: DashkitMetaDataItem;
    onChange: (props: ChangedRelationType & AliasClickHandlerData) => void;
    onAliasClick?: (props: AliasClickHandlerData) => void;
    showDebugInfo: boolean;
    widgetIcon: React.ReactNode;
    onLoadMeta?: OnLoadMetaType;
    silentFetchingWidgets: Set<string>;
};

export const getTooltipInfo = ({
    widget,
    row,
    relationType,
    byFields,
    byAliases,
    byUsedParams,
    indirectAliases,
    hasDataset,
}: {
    widget: DashkitMetaDataItem;
    row: DashkitMetaDataItem;
    relationType: RelationType;
    byFields: ConnectionByFieldsProp;
    byAliases: ConnectionByAliasesProp;
    byUsedParams: ConnectionByUsedParamsProp;
    indirectAliases: ConnectionIndirectAliasesProp;
    hasDataset: boolean;
}) => {
    const {fieldText, fieldTextWithStrong, showByField} = getConnectionByInfo({
        byFields,
        byAliases,
        relationType,
        byUsedParams,
        indirectAliases,
        hasDataset,
    });

    const widgetLabel = widget?.label && widget?.title !== widget?.label ? `${widget?.label}` : '';
    const rowLabel = row?.label && row?.title !== row?.label ? `${row?.label}` : '';

    const tooltipWidgetTitle = getClampedText(widget.title);
    const tooltipRowTitle = getClampedText(row.title);

    const tooltipWidgetSeparator = getTextSeparator(widgetLabel, tooltipWidgetTitle);
    const tooltipRowSeparator = getTextSeparator(rowLabel, tooltipRowTitle);

    const tooltipContent = (
        <React.Fragment>
            {getRelationDetailsText({
                text: i18n(getRelationDetailsKey(relationType)),
                linkType: relationType as RelationType,
                widget: `${widgetLabel}${tooltipWidgetSeparator}${tooltipWidgetTitle}`,
                row: `${rowLabel}${tooltipRowSeparator}${tooltipRowTitle}`,
                withStrong: true,
            })}
            {showByField && fieldTextWithStrong}
        </React.Fragment>
    );

    const widgetTitle = widget.title;
    const rowTitle = row.title;

    const widgetSeparator = getTextSeparator(widgetLabel, widgetTitle);
    const rowSeparator = getTextSeparator(rowLabel, rowTitle);

    const tooltipTitle =
        widget.title?.length > TEXT_LIMIT || rowTitle?.length > TEXT_LIMIT
            ? getRelationDetailsText({
                  text: i18n(getRelationDetailsKey(relationType)),
                  linkType: relationType as RelationType,
                  widget: `${widgetLabel}${widgetSeparator}${widgetTitle}`,
                  row: `${rowLabel}${rowSeparator}${rowTitle}`,
              }) + (showByField ? fieldText : '')
            : undefined;

    const aliasDetailTitle = (
        <React.Fragment>
            {getRelationDetailsText({
                text: i18n(getRelationDetailsKey(relationType)),
                linkType: relationType as RelationType,
                widget: `${widgetLabel}${widgetSeparator}${widgetTitle}`,
                row: `${rowLabel}${rowSeparator}${rowTitle}`,
                withStrong: true,
            })}
            {showByField ? fieldText : ''}
        </React.Fragment>
    );

    return {
        tooltipContent,
        tooltipTitle,
        aliasDetailTitle,
    };
};

const getDropdownItems = ({
    items,
    currentWidget,
    currentRow,
    onChange,
}: {
    items: Array<RelationType>;
    currentWidget: string;
    currentRow: DashkitMetaDataItem;
    onChange: (props: ChangedRelationType) => void;
}): DropdownMenuItem[] =>
    items.map((item) => ({
        action: () => {
            onChange({type: item, widgetId: currentRow.widgetId, itemId: currentRow.itemId});
        },
        iconStart: (
            <Icon data={getLinkIcon(item)} size={ICON_SIZE} className={b('icon-link', item)} />
        ),
        text: (
            <div className={b('list-link')} data-qa={DashRelationTypes[item as RelationType]}>
                <span>{i18n(`label_${item}`)}</span>
                <div className={b('info-text')}>
                    {getRelationDetailsText({
                        text: i18n(getRelationDetailsKey(item)),
                        linkType: item as RelationType,
                        widget: getClampedText(currentWidget),
                        row: getClampedText(currentRow.title || currentRow.label || ''),
                    })}
                </div>
            </div>
        ),
        className: b('list-row'),
    }));

export const Row = ({
    data,
    widgetMeta,
    onChange,
    onAliasClick,
    showDebugInfo,
    widgetIcon,
    onLoadMeta,
    silentFetchingWidgets,
}: RowParams) => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    const relations = data?.relations;
    const {
        type: relationType,
        available: availableRelations,
        indirectAliases,
        byFields,
        byAliases,
        byUsedParams,
        hasDataset,
        forceAddAlias,
    } = relations;

    const {tooltipContent, tooltipTitle, aliasDetailTitle} = getTooltipInfo({
        widget: widgetMeta,
        row: data,
        relationType,
        byFields,
        byAliases,
        byUsedParams,
        indirectAliases,
        hasDataset,
    });

    const isLoadingMeta = silentFetchingWidgets.has(data.widgetId);

    const icon = React.useMemo(() => {
        return isLoadingMeta ? <Skeleton className={b('skeleton-icon')} /> : getRelationsIcon(data);
    }, [isLoadingMeta, data]);

    const handleAliasCLick = React.useCallback(() => {
        onAliasClick?.({
            currentRow: data,
            showDebugInfo,
            relationText: aliasDetailTitle || '',
            relationType,
            widgetIcon,
            rowIcon: icon,
        });
    }, [data, showDebugInfo, onAliasClick, relationType, aliasDetailTitle, widgetIcon, icon]);

    const handleChange = React.useCallback(
        (changedData) => {
            onChange({
                ...changedData,
                currentRow: data,
                showDebugInfo,
                relationText: aliasDetailTitle || '',
                relationType,
                widgetIcon,
                rowIcon: icon,
                forceAddAlias,
            });
        },
        [
            aliasDetailTitle,
            data,
            icon,
            onChange,
            relationType,
            showDebugInfo,
            widgetIcon,
            forceAddAlias,
        ],
    );

    const handleDropdownToggle = React.useCallback(
        async (open: boolean) => {
            setIsDropdownOpen(open);

            if (
                open &&
                onLoadMeta &&
                !isLoadingMeta &&
                !data.loaded &&
                !data.loadError &&
                !data.isFetchFinished
            ) {
                try {
                    await onLoadMeta({widget: data, subItemId: data.widgetId});
                } catch (error) {
                    logger.logError('Failed to load widget meta:', error);
                } finally {
                }
            }
        },
        [data, isLoadingMeta, onLoadMeta],
    );

    if (!data || !widgetMeta) {
        return null;
    }

    const relationTypeText = i18n(getRelationsText(relationType));

    const items = getDropdownItems({
        items: availableRelations,
        currentWidget: widgetMeta.title || widgetMeta.label || '',
        currentRow: data,
        onChange: handleChange,
    });

    const showAliasIcon = Boolean(data.loaded);

    const id = data.itemId ? `${data.widgetId} ${data.itemId}` : data.widgetId;

    const debugInfo = showDebugInfo ? <span className={b('info')}> ({id})</span> : null;
    const rowTitle = getRowTitle(data.title, data.label);
    const title = (showDebugInfo ? `(${id}) ` : '') + rowTitle;

    return (
        <div className={b('row')} data-qa={DashCommonQa.RelationsListRow}>
            <div className={b('left')}>
                <div className={b('left-inner')}>
                    <div className={b('icon')}>{icon}</div>
                    <span className={b('text')} title={title}>
                        {debugInfo}
                        {rowTitle}
                    </span>
                    {showAliasIcon && (
                        <Button
                            view="outlined"
                            size="s"
                            title={i18n('label_add-alias')}
                            className={b('button-alias')}
                            onClick={handleAliasCLick}
                            qa={DashCommonQa.AliasShowBtn}
                        >
                            <Icon data={iconAlias} className={b('icon-alias')} />
                        </Button>
                    )}
                </div>
            </div>
            <div className={b('right')}>
                {relationType && (
                    <React.Fragment>
                        <DropdownMenu
                            size="l"
                            items={items}
                            open={isDropdownOpen}
                            onOpenToggle={handleDropdownToggle}
                            renderSwitcher={({onClick, onKeyDown}) => (
                                <Button
                                    view="flat"
                                    className={b('button-link')}
                                    qa={DashCommonQa.RelationTypeButton}
                                    onClick={onClick}
                                    onKeyDown={onKeyDown}
                                >
                                    <span className={b('button-link-icon-wrap')}>
                                        <Icon
                                            data={getLinkIcon(relationType)}
                                            size={ICON_SIZE}
                                            className={b('icon-link', relationType)}
                                        />
                                    </span>
                                    {relationTypeText}
                                </Button>
                            )}
                        >
                            {silentFetchingWidgets.has(data.widgetId) && (
                                <Flex
                                    justifyContent="center"
                                    alignItems="center"
                                    height="50px"
                                    minWidth="160px"
                                    className={spacing({p: 3})}
                                >
                                    <Loader size="s" />
                                </Flex>
                            )}
                        </DropdownMenu>
                        <Popover
                            content={
                                <div className={b('popover-content')} title={tooltipTitle}>
                                    {tooltipContent}
                                </div>
                            }
                            placement="bottom"
                            hasArrow={false}
                        >
                            <Icon
                                qa={DashCommonQa.RelationsRowPopover}
                                data={iconInfo}
                                size={ICON_SIZE}
                                className={b('icon-info')}
                            />
                        </Popover>
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};
