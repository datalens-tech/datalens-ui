/* eslint-disable complexity */
import React from 'react';

import type {Config, DashKit} from '@gravity-ui/dashkit';
import {ChevronDown, TriangleExclamationFill} from '@gravity-ui/icons';
import type {SelectOption} from '@gravity-ui/uikit';
import {Button, Dialog, DropdownMenu, Icon, Popup, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {I18n} from 'i18n';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import {useDispatch, useSelector} from 'react-redux';
import type {DashTab, DashTabAliases, DashTabItem} from 'shared';
import {DashCommonQa, DashTabItemType} from 'shared';
import {selectDebugMode} from 'store/selectors/user';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents/components/SelectOptionWithIcon/SelectOptionWithIcon';

import {openDialogAliases} from '../../units/dash/store/actions/relations/actions';

import {Content} from './components/Content/Content';
import {AliasesInvalidList} from './components/DialogAliases/components/AliasesList/AliasesInvalidList';
import type {FiltersTypes} from './components/Filters/Filters';
import {Filters} from './components/Filters/Filters';
import {DEFAULT_ALIAS_NAMESPACE, RELATION_TYPES} from './constants';
import {
    getPairedRelationType,
    getRelationsForSave,
    getRelationsIcon,
    getUpdatedPreparedRelations,
    getWidgetsOptions,
    hasConnectionsBy,
} from './helpers';
import {useFilteredRelations} from './hooks/useFilteredRelations';
import {useRelations} from './hooks/useRelations';
import type {
    ClickCallbackArgs,
    DashMetaData,
    RelationType,
    RelationTypeChangeProps,
    WidgetsTypes,
} from './types';

import './DialogRelations.scss';

const b = block('dialog-relations');
const i18n = I18n.keyset('component.dialog-relations.view');

const ICON_SIZE = 16;

export const DIALOG_RELATIONS = Symbol('dash/DIALOG_RELATIONS');

export type DialogRelationsProps = {
    onClose: () => void;
    onApply: (item: {aliases?: DashTab['aliases']; connections?: Config['connections']}) => void;
    widget: DashTabItem;
    allWidgets?: DashTabItem[];
    dashKitRef: React.RefObject<DashKit>;
    dashTabAliases: DashTabAliases | null;
    workbookId: string | null;
    widgetsCurrentTab: Record<string, string>;
};

export type OpenDialogRelationsArgs = {
    id: typeof DIALOG_RELATIONS;
    props: DialogRelationsProps;
};

const renderOptions = (option: SelectOption) => <SelectOptionWithIcon option={option} />;

const DialogRelations = (props: DialogRelationsProps) => {
    const [currentWidget, setCurrentWidget] = React.useState<DashTabItem>(props.widget);
    const {
        dashKitRef,
        dashTabAliases,
        workbookId,
        widgetsCurrentTab,
        allWidgets: widgets,
        onClose,
        onApply,
    } = props;
    const dispatch = useDispatch();
    const showDebugInfo = useSelector(selectDebugMode);

    const aliasWarnButtonRef = React.useRef<HTMLElement | null>(null);

    const [aliasWarnPopupOpen, setAliasWarnPopupOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');
    const [typeValues, setTypeValues] = React.useState<Array<FiltersTypes>>([]);

    const [preparedRelations, setPreparedRelations] = React.useState<DashMetaData>([]);
    const [aliases, setAliases] = React.useState(dashTabAliases || {});

    const [itemId, setItemId] = React.useState(
        currentWidget.type === DashTabItemType.GroupControl ? currentWidget.data.group[0].id : null,
    );

    const {isLoading, currentWidgetMeta, relations, datasets, dashWidgetsMeta, invalidAliases} =
        useRelations({
            dashKitRef,
            widget: currentWidget,
            dialogAliases: aliases,
            workbookId,
            itemId,
            widgetsCurrentTab,
        });

    const widgetsIconMap = React.useMemo(() => {
        const iconsMap: Record<string, JSX.Element | null> = {};
        dashWidgetsMeta?.forEach((widgetMeta) => {
            iconsMap[widgetMeta.widgetId] = getRelationsIcon(widgetMeta, b('relations-icon'));
        });

        return iconsMap;
    }, [dashWidgetsMeta]);

    const widgetOptions = React.useMemo(() => {
        return getWidgetsOptions(widgetsIconMap, widgets, showDebugInfo);
    }, [widgets, widgetsIconMap, showDebugInfo]);

    const currentWidgetId = itemId || currentWidgetMeta?.widgetId || '';
    const [changedWidgets, setChangedWidgets] = React.useState<WidgetsTypes>({});

    const [shownInvalidAliases, setShownInvalidAliases] = React.useState<string[] | null>(null);

    const {filteredRelations} = useFilteredRelations({
        relations: preparedRelations,
        searchValue,
        typeValues,
        changedWidgets,
        currentWidgetId,
    });

    const handleItemChange = (value: string[]) => {
        const newWidgetData = widgetOptions.find((item) => item.value === value[0])?.data;
        // if it's tab of widget or item in group control, widgetId is in the option
        // data, for old controls it's value[0]
        const currentId = newWidgetData?.widgetId || value[0];

        const newCurrentWidget = widgets?.find((item) => item.id === currentId) as DashTabItem;

        setCurrentWidget(newCurrentWidget);

        setItemId(newWidgetData?.isItem ? value[0] : null);
        setPreparedRelations([]);

        if (!changedWidgets[currentId]) {
            const updatedChangedWidgets = {...changedWidgets};
            updatedChangedWidgets[currentId] = {};
            setChangedWidgets(updatedChangedWidgets);
        }
    };

    const handleFilterInputChange = React.useCallback((data: string) => {
        setSearchValue(data);
    }, []);

    const handleFilterTypesChange = React.useCallback((data: Array<FiltersTypes>) => {
        setTypeValues(data);
    }, []);

    /**
     * Update local relations when aliases was added or removed
     */
    const handleUpdateRelations = React.useCallback(
        (changedAliases: string[][]) => {
            if (isEmpty(preparedRelations)) {
                return;
            }

            const relationsWithChangedAliases = preparedRelations.map((widgetItem) => {
                const byAliases: Array<Array<string>> = changedAliases.filter((aliasArr) => {
                    if (!widgetItem.usedParams?.length) {
                        return false;
                    }
                    return intersection(widgetItem.usedParams, aliasArr);
                });

                return {
                    ...widgetItem,
                    relations: {
                        ...widgetItem.relations,
                        byAliases,
                    },
                };
            });

            if (DEFAULT_ALIAS_NAMESPACE in aliases) {
                const newAliases = Object.assign({
                    ...aliases,
                    [DEFAULT_ALIAS_NAMESPACE]: changedAliases,
                });
                setAliases(newAliases);
            }
            setPreparedRelations(relationsWithChangedAliases);
        },
        [aliases, preparedRelations],
    );

    /**
     * Update aliases and local relations after apply button click in aliases popup
     */
    const handleUpdateAliases = React.useCallback(
        (newNamespacedAliases) => {
            const newAliases = {
                ...aliases,
                [DEFAULT_ALIAS_NAMESPACE]: newNamespacedAliases,
            };
            setAliases(newAliases);
            handleUpdateRelations(newNamespacedAliases);

            const newPreparedRelations = getUpdatedPreparedRelations({
                aliases: newAliases,
                currentWidgetMeta,
                changedWidgetsData: changedWidgets,
                dashkitData: dashKitRef.current || null,
                dashWidgetsMeta,
                preparedRelations,
                datasets,
                currentWidgetId,
                type: 'aliases',
            });
            if (!newPreparedRelations) {
                return;
            }

            const newChangedWidgets = {...changedWidgets};

            newPreparedRelations.forEach((item) => {
                if (
                    changedWidgets &&
                    changedWidgets[currentWidgetId] &&
                    item.widgetId in changedWidgets[currentWidgetId] &&
                    item.relations.type !== changedWidgets[currentWidgetId][item.widgetId]
                ) {
                    delete newChangedWidgets[item.widgetId];
                }
            });
            setChangedWidgets(newChangedWidgets);
            setPreparedRelations(newPreparedRelations);
        },
        [
            aliases,
            handleUpdateRelations,
            currentWidgetMeta,
            dashKitRef,
            dashWidgetsMeta,
            preparedRelations,
            datasets,
            changedWidgets,
        ],
    );

    /**
     * Callback on close alias popup (triggers on Apply button or Cancel button).
     * If Cancel button was clicked (reset arg), then do nothing.
     * If Apply was clicked (changedWidgetsData, changedWidgetId, aliases, etc), then need to recalculate relations info
     */
    const handleAliasesClosed = React.useCallback((args: ClickCallbackArgs) => {
        if (args?.reset || !args?.changedWidgetsData) {
            return;
        }

        setChangedWidgets(args.changedWidgetsData);
    }, []);

    /**
     * Open aliases dialog (shows list of aliases, detailed info, add alias form)
     */
    const handleAliasesClick = React.useCallback(
        (data) => {
            dispatch(
                openDialogAliases({
                    relations: filteredRelations,
                    currentWidget: currentWidgetMeta,
                    datasets,
                    updateRelations: handleUpdateRelations,
                    updateAliases: handleUpdateAliases,
                    onCloseCallback: handleAliasesClosed,
                    forceAddAlias: false,
                    invalidAliases: shownInvalidAliases,
                    ...data,
                    dialogAliases: aliases,
                }),
            );
        },
        [
            dispatch,
            handleUpdateAliases,
            handleUpdateRelations,
            datasets,
            filteredRelations,
            currentWidgetMeta,
            handleAliasesClosed,
            shownInvalidAliases,
            aliases,
        ],
    );

    /**
     * Triggers when changed relation type on relations list row.
     * Check if we need force opening aliases' dialog, open if needed.
     */
    const handleRelationTypeChange = React.useCallback(
        (changedData: RelationTypeChangeProps) => {
            const {type, widgetId, forceAddAlias, itemId: rowItemId, ...rest} = changedData;

            const newChanged = {...changedWidgets};
            if (!newChanged[currentWidgetId]) {
                newChanged[currentWidgetId] = {};
            }
            let currentRelations;
            if (rowItemId) {
                currentRelations = preparedRelations.find(
                    (item) => item.itemId === rowItemId,
                )?.relations;
            } else {
                currentRelations = preparedRelations.find(
                    (item) => item.widgetId === widgetId,
                )?.relations;
            }

            const relationSubjectId = rowItemId || widgetId;
            const currentRelationType = currentRelations?.type;
            if (currentRelationType === type) {
                if (
                    newChanged[currentWidgetId][relationSubjectId] ||
                    newChanged[relationSubjectId]?.[currentWidgetId]
                ) {
                    setChangedWidgets(newChanged);
                    delete newChanged[currentWidgetId][relationSubjectId];
                    delete newChanged[relationSubjectId][currentWidgetId];
                }
            } else {
                newChanged[currentWidgetId][relationSubjectId] = type;
                const pairedType = getPairedRelationType(type);
                if (pairedType !== RELATION_TYPES.unknown) {
                    newChanged[relationSubjectId] = newChanged[relationSubjectId]
                        ? {...newChanged[relationSubjectId], [currentWidgetId]: pairedType}
                        : {[currentWidgetId]: pairedType};
                }
            }
            const changeFromUnknown = currentRelationType === RELATION_TYPES.unknown;

            const showAddAliasForm =
                type !== RELATION_TYPES.ignore &&
                ((changeFromUnknown && forceAddAlias) ||
                    (!changeFromUnknown &&
                        currentRelationType === RELATION_TYPES.ignore &&
                        type !== RELATION_TYPES.unknown) ||
                    forceAddAlias);

            if (showAddAliasForm) {
                if (!isEmpty(newChanged[currentWidgetId][relationSubjectId])) {
                    const hasRelationBy = hasConnectionsBy(currentRelations);

                    if (hasRelationBy && !forceAddAlias) {
                        setChangedWidgets(newChanged);
                    } else {
                        // if there is no native relation then open aliases popup
                        // except widgets with errors
                        handleAliasesClick({
                            ...rest,
                            forceAddAlias: true,
                            changedWidgetsData: newChanged,
                            changedWidgetId: widgetId,
                            changedItemId: rowItemId,
                        });
                    }
                }
            } else {
                setChangedWidgets(newChanged);
            }
        },
        [changedWidgets, preparedRelations, handleAliasesClick],
    );

    /**
     * Clear invalid aliases, which don't below to any dash tab field
     */
    const handleInvalidAliasesClear = React.useCallback(() => {
        const filteredAliases = aliases[DEFAULT_ALIAS_NAMESPACE].map((aliasRow: string[]) => {
            return aliasRow.filter((item) => !shownInvalidAliases?.includes(item));
        }).filter((item: string[]) => item.length > 1);

        handleUpdateAliases(filteredAliases);
        setShownInvalidAliases([]);
    }, [aliases, handleUpdateAliases, shownInvalidAliases]);

    const handleDisconnectAll = React.useCallback(
        (disconnectType: 'all' | 'charts' | 'selectors') => {
            const newChangedWidgets = {...changedWidgets};
            if (!newChangedWidgets[currentWidgetId]) {
                newChangedWidgets[currentWidgetId] = {};
            }
            const filteredIds = filteredRelations.reduce((res: Record<string, string>, item) => {
                const widgetId = item.itemId || item.widgetId;

                if (!widgetId) {
                    return res;
                }

                const isControl =
                    item.type === DashTabItemType.Control ||
                    item.type === DashTabItemType.GroupControl;

                if (
                    disconnectType === 'all' ||
                    (disconnectType === 'selectors' && isControl) ||
                    (disconnectType === 'charts' && !isControl)
                ) {
                    res[widgetId] = widgetId;

                    if (!newChangedWidgets[widgetId]) {
                        newChangedWidgets[widgetId] = {};
                    }
                }

                return res;
            }, {});

            preparedRelations.forEach((item) => {
                const widgetId = item.itemId || item.widgetId;

                if (filteredIds[widgetId]) {
                    newChangedWidgets[currentWidgetId][widgetId] =
                        RELATION_TYPES.ignore as RelationType;
                    newChangedWidgets[widgetId][currentWidgetId] =
                        RELATION_TYPES.ignore as RelationType;
                }
            });

            setChangedWidgets(newChangedWidgets);
        },
        [preparedRelations, filteredRelations, currentWidgetId],
    );

    /**
     * Triggers when click Apply button in relations dialog (saves in store and closes popup)
     */
    const handleSaveRelations = React.useCallback(() => {
        if (!dashKitRef.current) {
            return;
        }
        if (isLoading) {
            onClose();
        }
        const newData: {aliases?: DashTab['aliases']; connections?: Config['connections']} = {};
        if (changedWidgets) {
            const connections = getRelationsForSave({
                changed: changedWidgets,
                dashkitData: dashKitRef.current || null,
            });
            if (connections) {
                newData.connections = connections;
            }
        }

        if (!isEqual(aliases, dashTabAliases || {})) {
            newData.aliases = isEmpty(aliases?.[DEFAULT_ALIAS_NAMESPACE]) ? {} : aliases;
        }

        if (isEmpty(newData)) {
            onClose();
        } else {
            onApply(newData);
        }
    }, [dashKitRef, aliases, dashTabAliases, changedWidgets, currentWidgetMeta, onClose, onApply]);

    const handleAliasesWarnClick = () => setAliasWarnPopupOpen(!aliasWarnPopupOpen);

    // disable disconnect button when loading
    // when selected only 'none' filter
    const isDisconnectDisabled = Boolean(
        isLoading ||
            (typeValues.length === 1 && typeValues[0] === 'none') ||
            !filteredRelations.length,
    );

    React.useEffect(() => {
        if (!preparedRelations?.length && relations.length) {
            setPreparedRelations(relations);
        }
    }, [relations, preparedRelations]);

    React.useEffect(() => {
        if (!shownInvalidAliases && invalidAliases?.length) {
            setShownInvalidAliases(invalidAliases);
        }
    }, [shownInvalidAliases, invalidAliases]);

    return (
        <Dialog
            onClose={onClose}
            open={true}
            className={b()}
            onEnterKeyDown={handleSaveRelations}
            disableOutsideClick={true}
            disableEscapeKeyDown={true}
        >
            <Dialog.Header caption={i18n('title_links')} />
            <Dialog.Body className={b('container')}>
                <Select
                    className={b('item-select')}
                    popupClassName={b('item-select-popup')}
                    value={[currentWidgetId]}
                    options={widgetOptions}
                    onUpdate={handleItemChange}
                    filterable={true}
                    disabled={isLoading}
                    renderOption={renderOptions}
                    renderSelectedOption={renderOptions}
                    popupWidth="fit"
                />

                <Filters
                    onChangeInput={handleFilterInputChange}
                    onChangeButtons={handleFilterTypesChange}
                />
                <Content
                    relations={filteredRelations}
                    widgetMeta={currentWidgetMeta}
                    isLoading={isLoading}
                    onChange={handleRelationTypeChange}
                    onAliasClick={handleAliasesClick}
                    showDebugInfo={showDebugInfo}
                    widgetIcon={widgetsIconMap[currentWidgetMeta?.widgetId || '']}
                />
            </Dialog.Body>
            <Dialog.Footer
                preset="default"
                showError={false}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_apply')}
                propsButtonCancel={{view: 'outlined', qa: DashCommonQa.RelationsCancelBtn}}
                onClickButtonApply={handleSaveRelations}
                onClickButtonCancel={onClose}
                propsButtonApply={{
                    qa: DashCommonQa.RelationsApplyBtn,
                }}
            >
                <span className={b('disconnect-text')}>{i18n('button_disconnect')}</span>
                <DropdownMenu
                    disabled={isDisconnectDisabled}
                    size="l"
                    items={[
                        {
                            action: () => handleDisconnectAll('all'),
                            text: i18n('label_all'),
                            qa: DashCommonQa.RelationsDisconnectAllWidgets,
                        },
                        {
                            action: () => handleDisconnectAll('charts'),
                            text: i18n('label_charts'),
                            qa: DashCommonQa.RelationsDisconnectAllCharts,
                        },
                        {
                            action: () => handleDisconnectAll('selectors'),
                            text: i18n('label_selectors'),
                            qa: DashCommonQa.RelationsDisconnectAllSelectors,
                        },
                    ]}
                    switcher={
                        <Button
                            className={b('switcher-button')}
                            view="normal"
                            qa={DashCommonQa.RelationsDisconnectAllSwitcher}
                            disabled={isDisconnectDisabled}
                        >
                            <Icon
                                className={b('switcher-button-icon')}
                                data={ChevronDown}
                                size={ICON_SIZE}
                            />
                        </Button>
                    }
                />
                {Boolean(shownInvalidAliases?.length) && (
                    <React.Fragment>
                        <Button
                            ref={aliasWarnButtonRef}
                            className={b('error-button')}
                            onClick={handleAliasesWarnClick}
                            view="flat"
                        >
                            <Icon data={TriangleExclamationFill} className={b('error-icon')} />
                        </Button>
                        <Popup
                            hasArrow={true}
                            anchorRef={aliasWarnButtonRef}
                            open={aliasWarnPopupOpen}
                            placement="right"
                            className={b('invalid-list-popup')}
                        >
                            <div className={b('warn-content')}>
                                <div className={b('warn-title')}>
                                    {i18n('label_invalid-alias-title')}
                                </div>
                                <div className={b('warn-text')}>
                                    {i18n('label_invalid-alias-text')}
                                </div>
                                <AliasesInvalidList
                                    aliases={aliases?.[DEFAULT_ALIAS_NAMESPACE]}
                                    invalidAliases={shownInvalidAliases}
                                    datasets={datasets}
                                    onClose={handleAliasesWarnClick}
                                    onClear={handleInvalidAliasesClear}
                                />
                            </div>
                        </Popup>
                    </React.Fragment>
                )}
            </Dialog.Footer>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_RELATIONS, DialogRelations);
