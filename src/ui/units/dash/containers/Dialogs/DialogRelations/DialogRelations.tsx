import React from 'react';

import {Config, DashKit} from '@gravity-ui/dashkit';
import {TriangleExclamationFill} from '@gravity-ui/icons';
import {Button, Dialog, Icon, Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {I18n} from 'i18n';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import {useDispatch, useSelector} from 'react-redux';
import {DashCommonQa, DashTab, DashTabItem, DatasetField, Feature} from 'shared';
import {selectDebugMode} from 'store/selectors/user';
import {BetaMark} from 'ui/components/BetaMark/BetaMark';
import Utils from 'ui/utils';

import {updateCurrentTabData} from '../../../store/actions/dashTyped';
import {openDialogAliases} from '../../../store/actions/relations/actions';
import {
    selectCurrentTabAliases,
    selectDashWorkbookId,
} from '../../../store/selectors/dashTypedSelectors';

import {Content} from './components/Content/Content';
import {AliasesInvalidList} from './components/DialogAliases/components/AliasesList/AliasesInvalidList';
import {Filters, FiltersTypes} from './components/Filters/Filters';
import {DEFAULT_ALIAS_NAMESPACE, DEFAULT_ICON_SIZE, RELATION_TYPES} from './constants';
import {
    getDialogCaptionIcon,
    getRelationsForSave,
    getUpdatedPreparedRelations,
    hasConnectionsBy,
} from './helpers';
import {useFilteredRelations} from './hooks/useFilteredRelations';
import {useRelations} from './hooks/useRelations';
import {
    ClickCallbackArgs,
    DashMetaData,
    RelationType,
    RelationTypeChangeProps,
    WidgetsTypes,
} from './types';

import './DialogRelations.scss';

const b = block('dialog-relations');
const i18n = I18n.keyset('component.dialog-relations.view');

export const DIALOG_RELATIONS = Symbol('dash/DIALOG_RELATIONS');

export type DialogRelationsProps = {
    onClose: () => void;
    onApply: (item: DatasetField) => void;
    widget: DashTabItem;
    dashKitRef: React.RefObject<DashKit>;
};

export type OpenDialogRelationsArgs = {
    id: typeof DIALOG_RELATIONS;
    props: DialogRelationsProps;
};

const DialogRelations = (props: DialogRelationsProps) => {
    const {widget, dashKitRef, onClose} = props;
    const dispatch = useDispatch();
    const showDebugInfo = useSelector(selectDebugMode);
    const dashTabAliases = useSelector(selectCurrentTabAliases);
    const workbookId = useSelector(selectDashWorkbookId);

    const aliasWarnButtonRef = React.useRef<HTMLElement | null>(null);

    const [aliasWarnPopupOpen, setAliasWarnPopupOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');
    const [typeValues, setTypeValues] = React.useState<Array<FiltersTypes>>([]);
    const [changedWidgets, setChangedWidgets] = React.useState<WidgetsTypes>();
    const [preparedRelations, setPreparedRelations] = React.useState<DashMetaData>([]);
    const [aliases, setAliases] = React.useState(dashTabAliases || {});

    const {isLoading, currentWidgetMeta, relations, datasets, dashWidgetsMeta, invalidAliases} =
        useRelations({
            dashKitRef,
            widget,
            dialogAliases: aliases,
            workbookId,
        });

    const [shownInvalidAliases, setShownInvalidAliases] = React.useState<string[] | null>(null);

    const {filteredRelations} = useFilteredRelations({
        relations: preparedRelations,
        searchValue,
        typeValues,
        changedWidgets,
    });

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
                changedWidgetId: currentWidgetMeta?.widgetId || '',
                preparedRelations,
                datasets,
                type: 'aliases',
            });
            if (!newPreparedRelations) {
                return;
            }

            const newChangedWidgets = {...changedWidgets};
            newPreparedRelations.forEach((item) => {
                if (
                    changedWidgets &&
                    item.widgetId in changedWidgets &&
                    item.relations.type !== changedWidgets[item.widgetId]
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
            const {type, widgetId, ...rest} = changedData;

            const newChanged = {...changedWidgets};
            const currentRelations = preparedRelations.find(
                (item) => item.widgetId === widgetId,
            )?.relations;
            const currentRelationType = currentRelations?.type;
            if (currentRelationType === type) {
                if (newChanged[widgetId]) {
                    delete newChanged[widgetId];
                }
            } else {
                newChanged[widgetId] = type;
            }

            if (currentRelationType === RELATION_TYPES.ignore && type !== RELATION_TYPES.unknown) {
                if (!isEmpty(newChanged[widgetId])) {
                    const hasRelationBy = hasConnectionsBy(currentRelations);

                    if (hasRelationBy) {
                        setChangedWidgets(newChanged);
                    } else {
                        // if there is no native relation then open aliases popup
                        // except widgets with errors
                        handleAliasesClick({
                            ...rest,
                            forceAddAlias: true,
                            changedWidgetsData: newChanged,
                            changedWidgetId: widgetId,
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

    const handleDisconnectAll = React.useCallback(() => {
        const newChangedWidgets: WidgetsTypes = {};

        const filteredIds = filteredRelations.reduce((res: Record<string, string>, item) => {
            if (item.widgetId) {
                res[item.widgetId] = item.widgetId;
            }
            return res;
        }, {});

        preparedRelations.forEach((item) => {
            if (filteredIds[item.widgetId]) {
                newChangedWidgets[item.widgetId] = RELATION_TYPES.ignore as RelationType;
            }
        });

        setChangedWidgets(newChangedWidgets);
    }, [preparedRelations, filteredRelations]);

    /**
     * Triggers when click Apply button in relations dialog (saves in store and closes popup)
     */
    const handleSaveRelations = React.useCallback(() => {
        if (!dashKitRef.current) {
            return;
        }
        const newData: {aliases?: DashTab['aliases']; connections?: Config['connections']} = {};
        if (changedWidgets) {
            const connections = getRelationsForSave({
                currentWidgetId: currentWidgetMeta?.widgetId || '',
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

        if (!isEmpty(newData)) {
            dispatch(updateCurrentTabData(newData));
            onClose();
        }
    }, [dashKitRef, aliases, dashTabAliases, changedWidgets, currentWidgetMeta, dispatch, onClose]);

    const handleAliasesWarnClick = () => setAliasWarnPopupOpen(!aliasWarnPopupOpen);

    const label =
        currentWidgetMeta?.label && currentWidgetMeta?.title !== currentWidgetMeta?.label
            ? `${currentWidgetMeta?.label} — `
            : '';
    const titleName = isLoading ? '' : `: ${label}${currentWidgetMeta?.title}`;
    const title = (
        <div>
            {i18n('title_links') +
                titleName +
                (showDebugInfo && currentWidgetMeta?.widgetId
                    ? ` (${currentWidgetMeta.widgetId})`
                    : '')}
            {Utils.isEnabledFeature(Feature.HideOldRelations) && <BetaMark className={b('beta')} />}
        </div>
    );

    const titleIcon =
        isLoading || !currentWidgetMeta ? null : getDialogCaptionIcon({widget, currentWidgetMeta});

    const widgetIcon =
        isLoading || !currentWidgetMeta
            ? null
            : getDialogCaptionIcon({
                  widget,
                  currentWidgetMeta,
                  iconSize: DEFAULT_ICON_SIZE,
                  className: b('alias-add-icon-type'),
              });

    // disable disconnect button when loading
    // when selected only 'none' filter
    // when selected filter and none of widgets is showed in list
    const isDisconnectDisabled = Boolean(
        isLoading ||
            (typeValues.length === 1 && typeValues[0] === 'none') ||
            !filteredRelations.length ||
            filteredRelations.every(
                (filteredRealtion) => filteredRealtion?.relations.type === 'ignore',
            ),
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
        <Dialog onClose={onClose} open={true} className={b()} onEnterKeyDown={handleSaveRelations}>
            <Dialog.Header caption={title} insertBefore={titleIcon} className={b('caption')} />
            <Dialog.Body className={b('container')}>
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
                    widgetIcon={widgetIcon}
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
                    disabled: isLoading,
                    qa: DashCommonQa.RelationsApplyBtn,
                }}
            >
                <Button
                    view="outlined"
                    className={b('button')}
                    size="l"
                    onClick={handleDisconnectAll}
                    disabled={isDisconnectDisabled}
                    qa={DashCommonQa.RelationsDisconnectAllButton}
                >
                    {i18n('button_disconnect')}
                </Button>
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
