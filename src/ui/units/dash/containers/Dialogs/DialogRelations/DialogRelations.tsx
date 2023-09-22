import React from 'react';

import {Config, DashKit} from '@gravity-ui/dashkit';
import {Button, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {I18n} from 'i18n';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import {useDispatch, useSelector} from 'react-redux';
import {DashTab, DashTabItem, DatasetField} from 'shared';
import {selectDebugMode} from 'store/selectors/user';
import {BetaMark} from 'ui/components/BetaMark/BetaMark';
import {getCurrentTabAliases} from 'ui/units/dash/store/selectors/relations/selectors';

import {updateCurrentTabData} from '../../../store/actions/dash';
import {openDialogAliases} from '../../../store/actions/relations/actions';

import {Content} from './components/Content/Content';
import {DEFAULT_FILTERS, Filters, FiltersTypes} from './components/Filters/Filters';
import {
    DEFAULT_ALIAS_NAMESPACE,
    RELATION_TYPES,
    getDialogCaptionIcon,
    getRelationsForSave,
} from './helpers';
import {useFilteredRelations} from './hooks/useFilteredRelations';
import {useRelations} from './hooks/useRelations';
import {DashMetaData, DashkitMetaDataItem, RelationType} from './types';

import './DialogRelations.scss';

export const DIALOG_RELATIONS = Symbol('DIALOG_RELATIONS');
export type OpenDialogRelationsArgs = {
    id: typeof DIALOG_RELATIONS;
    props: DialogRelationsProps;
};

export type DialogRelationsProps = {
    onClose: () => void;
    onApply: (item: DatasetField) => void;
    widget: DashTabItem;
    dashKitRef: React.RefObject<DashKit>;
};

const b = block('dialog-relations');
const i18n = I18n.keyset('component.dialog-relations.view');

type RelationTypeChangeProps = {
    type: RelationType;
    widgetId: DashkitMetaDataItem['widgetId'];
};

type WidgetsTypes = Record<string, RelationType>;

const DialogRelations = (props: DialogRelationsProps) => {
    const {widget, dashKitRef, onClose} = props;
    const dispatch = useDispatch();
    const showDebugInfo = useSelector(selectDebugMode);
    const dashTabAliases = useSelector(getCurrentTabAliases);

    const [searchValue, setSearchValue] = React.useState('');
    const [typeValues, setTypeValues] = React.useState(DEFAULT_FILTERS);
    const [changedWidgets, setChangedWidgets] = React.useState<WidgetsTypes>();
    const [preparedRelations, setPreparedRelations] = React.useState<DashMetaData>([]);
    const [aliases, setAliases] = React.useState(dashTabAliases || {});

    const {isLoading, currentWidgetMeta, relations, datasets} = useRelations({
        dashKitRef,
        widget,
    });

    const {filteredRelations} = useFilteredRelations({
        relations: preparedRelations,
        searchValue,
        typeValues,
        changedWidgets,
    });

    /**
     * update relations object with connection info when aliases changed
     */
    const handleUpdateRelations = React.useCallback(
        (changedAliases: string[][]) => {
            if (isEmpty(preparedRelations)) {
                return;
            }

            const relationsWithChangedAliases = preparedRelations.map((widgetItem) => {
                let byAliases: Array<Array<string>> = [];
                if (changedAliases.length) {
                    byAliases = changedAliases.filter((aliasArr) => {
                        if (!widgetItem.usedParams?.length) {
                            return false;
                        }
                        return intersection(widgetItem.usedParams, aliasArr);
                    });
                }

                return {
                    ...widgetItem,
                    relations: {
                        ...widgetItem.relations,
                        byAliases,
                    },
                };
            });

            if (DEFAULT_ALIAS_NAMESPACE in aliases) {
                setAliases({
                    ...aliases,
                    [DEFAULT_ALIAS_NAMESPACE]: changedAliases,
                });
            }
            setPreparedRelations(relationsWithChangedAliases);
        },
        [preparedRelations],
    );

    const handleFilterInputChange = React.useCallback((data: string) => {
        setSearchValue(data);
    }, []);

    const handleFilterTypesChange = React.useCallback((data: Array<FiltersTypes>) => {
        setTypeValues(data);
    }, []);

    const handleRelationTypeChange = React.useCallback(
        ({type, widgetId}: RelationTypeChangeProps) => {
            const newChanged = {...changedWidgets};
            const currentRelation = preparedRelations.find((item) => item.widgetId === widgetId)
                ?.relations.type;
            if (currentRelation === type) {
                if (newChanged[widgetId]) {
                    delete newChanged[widgetId];
                }
            } else {
                newChanged[widgetId] = type;
            }

            setChangedWidgets(newChanged);
        },
        [changedWidgets, preparedRelations],
    );

    const handleDisconnectAll = React.useCallback(() => {
        const newChangedWidgets: WidgetsTypes = {};
        preparedRelations.forEach((item) => {
            newChangedWidgets[item.widgetId] = RELATION_TYPES.ignore as RelationType;
        });

        setChangedWidgets(newChangedWidgets);
    }, [preparedRelations]);

    const handleAliasesClick = React.useCallback(
        (data) => {
            dispatch(
                openDialogAliases({
                    relations: filteredRelations,
                    currentWidget: currentWidgetMeta,
                    datasets,
                    updateRelations: handleUpdateRelations,
                    ...data,
                }),
            );
        },
        [dispatch, filteredRelations, currentWidgetMeta],
    );

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
    }, [dashKitRef, aliases, changedWidgets, currentWidgetMeta, dispatch, onClose]);

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
            <BetaMark className={b('beta')} />
        </div>
    );

    const titleIcon =
        isLoading || !currentWidgetMeta ? null : getDialogCaptionIcon(widget, currentWidgetMeta);

    React.useEffect(() => {
        if (!preparedRelations?.length) {
            setPreparedRelations(relations);
        }
    }, [relations, preparedRelations]);

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
                />
            </Dialog.Body>
            <Dialog.Footer
                preset="default"
                showError={false}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_apply')}
                propsButtonCancel={{view: 'outlined'}}
                onClickButtonApply={handleSaveRelations}
                onClickButtonCancel={onClose}
                propsButtonApply={{
                    disabled: isLoading,
                }}
            >
                <Button
                    view="outlined"
                    className={b('button')}
                    size="l"
                    onClick={handleDisconnectAll}
                    disabled={isLoading}
                >
                    {i18n('button_disconnect')}
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_RELATIONS, DialogRelations);
