import React from 'react';

import {Plus} from '@gravity-ui/icons';
import {Alert, Button, Card, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Collapse} from 'components/Collapse/Collapse';
import DialogManager from 'components/DialogManager/DialogManager';
import {I18n} from 'i18n';
import intersection from 'lodash/intersection';
import isEqual from 'lodash/isEqual';
import {useSelector} from 'react-redux';
import {getCurrentTabAliases} from 'ui/units/dash/store/selectors/relations/selectors';

import {DEFAULT_ALIAS_NAMESPACE, RELATION_TYPES} from '../../constants';
import {getNormalizedAliases} from '../../helpers';
import {AliasesContext} from '../../hooks/useRelations';
import {AliasBase, AliasClickHandlerArgs} from '../../types';

import {AddAliases} from './components/AddAliases/AddAliases';
import {AliasesDetail} from './components/AliasesDetail/AliasesDetail';
import {AliasesList, SelectParamArgs} from './components/AliasesList/AliasesList';

import './DialogAliases.scss';

export type DialogAliasesProps = AliasClickHandlerArgs & {
    onClose: NonNullable<AliasBase['onCloseCallback']>;
    changedWidgetsData?: AliasBase['changedWidgetsData'];
    changedWidgetId?: AliasBase['changedWidgetId'];
};

export const DIALOG_ALIASES = Symbol('dash/DIALOG_ALIASES');
export type OpenDialogAliasesArgs = {
    id: typeof DIALOG_ALIASES;
    props: DialogAliasesProps;
};

const b = block('dialog-aliases');
const i18n = I18n.keyset('component.dialog-aliases.view');

const DialogAliases = (props: DialogAliasesProps) => {
    const {
        onClose,
        relations,
        currentRow,
        currentWidget,
        showDebugInfo,
        datasets,
        updateAliases,
        relationText,
        relationType,
        widgetIcon,
        rowIcon,
        forceAddAlias,
        changedWidgetsData,
        changedWidgetId,
    } = props;

    const [showDetailedData, setShowDetailedData] = React.useState<boolean>(false);
    const [selectedAliasRowIndex, setSelectedAliasRowIndex] = React.useState<number | null>(null);

    const [showAddAlias, setShowAddAlias] = React.useState<boolean>(
        Boolean(forceAddAlias) || false,
    );
    const [enableAddAlias, setEnableAddAlias] = React.useState<boolean>(true);
    const [aliasAdded, setAliasAdded] = React.useState<string[]>([]);
    const [aliasRequired, setAliasRequired] = React.useState<boolean>(false);

    const [selectedFieldName, setSelectedFieldName] = React.useState<string | null>(null);
    const [selectedParam, setSelectedParam] = React.useState<string | null>(null);
    const [currentAlias, setCurrentAlias] = React.useState<string[] | null>(null);

    const currentTabAliases = useSelector(getCurrentTabAliases) || {};
    const [dashTabAliasesByNamespace, setAliasesByNamespace] = React.useState(
        currentTabAliases?.[DEFAULT_ALIAS_NAMESPACE] || [],
    );
    const [aliases, setAliases] = React.useState<string[][]>(currentRow.relations.byAliases.sort());

    const hasAlias = Boolean(aliases.length);

    const aliasRequiredErrorText = aliasRequired ? i18n('label_required-add-alias') : undefined;

    const caption = i18n('title_add-alias');

    const isIgnored = relationType === RELATION_TYPES.ignore;
    const isBoth = relationType === RELATION_TYPES.both;

    const affectedItems = [currentWidget, ...relations]
        .map((item) => ({
            ...item,
            intersectionParams: intersection(item.usedParams, currentAlias),
        }))
        .filter(
            ({intersectionParams}) =>
                intersectionParams.length &&
                (!selectedParam || intersectionParams.includes(selectedParam)),
        );

    const resetSelectedAliasRow = React.useCallback(() => {
        setSelectedParam(null);
        setSelectedFieldName(null);
        setShowDetailedData(false);
        setSelectedAliasRowIndex(null);
        setCurrentAlias(null);
    }, []);

    /**
     * Click on param button for toggling widgets with its param details
     */
    const handleDetailedAlias = React.useCallback(
        (data: SelectParamArgs) => {
            const {field, fieldName, indexRow, aliasRow, isClickedOnSelected} = data;
            if (isClickedOnSelected) {
                resetSelectedAliasRow();
                return;
            }

            setSelectedParam(field?.guid || fieldName || null);
            setSelectedFieldName(fieldName);
            setShowDetailedData(true);
            setSelectedAliasRowIndex(indexRow);
            setCurrentAlias(aliasRow);
        },
        [resetSelectedAliasRow],
    );

    /**
     * Click on magnify icon for toggling full details
     */
    const handleDetailClick = React.useCallback(
        ({indexRow, aliasRow}) => {
            setSelectedParam(null);
            setSelectedFieldName(null);
            setShowDetailedData(!showDetailedData);
            setSelectedAliasRowIndex(showDetailedData ? null : indexRow);
            setCurrentAlias(showDetailedData ? null : aliasRow);
        },
        [showDetailedData, selectedAliasRowIndex],
    );

    /**
     * Excluding form aliases list row that will be removed
     */
    const handleRemoveAlias = React.useCallback(
        ({
            row: aliasesForRemove,
            rowWithPartlyRemoved,
        }: {
            row: string[];
            rowWithPartlyRemoved?: string[];
        }) => {
            const aliasesForRemoveSorted = [...aliasesForRemove].sort();
            const filteredAliases = dashTabAliasesByNamespace.reduce(
                (list: string[][], item: string[]) => {
                    if (isEqual([...item].sort(), aliasesForRemoveSorted)) {
                        if (rowWithPartlyRemoved?.length) {
                            list.push(rowWithPartlyRemoved);
                        }
                    } else {
                        list.push(item);
                    }
                    return list;
                },
                [],
            );

            let count = 0;

            aliasAdded.forEach((item) => {
                if (aliasesForRemove.includes(item)) {
                    count++;
                }
            });
            if (count === aliasAdded.length) {
                setAliasAdded([]);
            }

            setAliases(filteredAliases.sort());
            setAliasesByNamespace(filteredAliases);

            resetSelectedAliasRow();
        },
        [dashTabAliasesByNamespace, resetSelectedAliasRow, aliasAdded],
    );

    /**
     * Add new alias row to list before save apply
     */
    const handleAddNewAliases = React.useCallback(
        (alias: string[]) => {
            const res = [...dashTabAliasesByNamespace, alias];
            setShowAddAlias(false);
            setAliases(res);
            setAliasesByNamespace(res);
            setAliasAdded(alias);
        },
        [dashTabAliasesByNamespace],
    );

    const handleApplyChanges = React.useCallback(() => {
        if (forceAddAlias && !aliasAdded.length) {
            setAliasRequired(true);
            setShowAddAlias(true);
            return;
        }
        updateAliases(getNormalizedAliases(aliases));
        onClose({
            ...(changedWidgetsData ? {changedWidgetsData} : {}),
            ...(changedWidgetId ? {changedWidgetId} : {}),
            ...(aliases ? {aliases} : {}),
        });
    }, [
        forceAddAlias,
        aliasAdded,
        updateAliases,
        aliases,
        onClose,
        changedWidgetsData,
        changedWidgetId,
    ]);

    const handleAddAlias = React.useCallback(() => {
        setShowAddAlias(true);
    }, []);

    const handleHideAlias = React.useCallback(() => {
        setShowAddAlias(false);
    }, []);

    const handleCancel = React.useCallback(() => {
        onClose({
            reset: true,
        });
    }, [onClose]);

    React.useEffect(() => {
        const widgetDatasetId =
            currentWidget.datasetId ||
            (currentWidget.datasets?.length ? currentWidget.datasets[0].id || '' : '');
        const currentRowDatasetId =
            currentRow.datasetId ||
            (currentRow.datasets?.length ? currentRow.datasets[0].id || '' : '');

        if (widgetDatasetId && currentRowDatasetId && widgetDatasetId === currentRowDatasetId) {
            setEnableAddAlias(false);
        }
    }, [currentWidget, currentRow]);

    React.useEffect(() => {
        setAliasRequired(false);
        if (!forceAddAlias) {
            return;
        }

        if (!aliasAdded.length) {
            setShowAddAlias(true);
            setAliasRequired(true);
        }
    }, [forceAddAlias, aliasAdded]);

    return (
        <Dialog onClose={handleCancel} open={true} className={b()}>
            <Dialog.Header caption={caption} />
            <Dialog.Body className={b('container')}>
                <AliasesContext.Provider
                    value={{
                        datasets,
                        showDebugInfo,
                        relations,
                        selectedAliasRowIndex,
                        selectedParam,
                    }}
                >
                    {relationText && (
                        <div className={b('sub-header')}>
                            <span className={b('label')}>{i18n('label_link-type')}:</span>
                            <span className={b('type-text', {'lower-case': isBoth || isIgnored})}>
                                {relationText}
                            </span>
                        </div>
                    )}
                    <Alert
                        theme="normal"
                        view="filled"
                        className={b('info')}
                        message={
                            <React.Fragment>
                                <p className={b('info-text')}>{i18n('label_info_1')}</p>
                                <p className={b('info-text')}>{i18n('label_info_2')}</p>
                            </React.Fragment>
                        }
                    />
                    {!enableAddAlias && (
                        <Card theme="warning" className={b('card')}>
                            {i18n('label_card')}
                        </Card>
                    )}
                    <div className={b('controls')}>
                        {hasAlias ? (
                            <React.Fragment>
                                <Collapse
                                    arrowPosition="left"
                                    title={i18n('label_collapse-label')}
                                    arrowView="icon"
                                    isSecondary={true}
                                    className={b('collapse-list')}
                                    titleSize="s"
                                    contentClassName={b('collapse-list-content')}
                                >
                                    <AliasesList
                                        widgetId={currentRow.widgetId}
                                        aliases={aliases}
                                        onAliasRowClick={handleDetailedAlias}
                                        onDetailClick={handleDetailClick}
                                        onRemoveClick={handleRemoveAlias}
                                        showDetailedData={showDetailedData}
                                    />
                                </Collapse>
                            </React.Fragment>
                        ) : (
                            <div className={b('empty')}>{i18n('label_empty')}</div>
                        )}
                    </div>
                    {hasAlias && showDetailedData && (
                        <AliasesDetail
                            fieldName={selectedFieldName || ''}
                            items={affectedItems}
                            widget={currentWidget}
                            currentRow={currentRow}
                        />
                    )}
                    {enableAddAlias && (!isIgnored || (isIgnored && forceAddAlias)) && (
                        <React.Fragment>
                            {!showAddAlias && (
                                <Button onClick={handleAddAlias}>
                                    <Icon data={Plus} />
                                    {i18n('button_add-alias')}
                                </Button>
                            )}
                            {showAddAlias && (
                                <AddAliases
                                    widget={currentWidget}
                                    currentRow={currentRow}
                                    onCancel={handleHideAlias}
                                    currentAliases={aliases}
                                    onAdd={handleAddNewAliases}
                                    widgetIcon={widgetIcon}
                                    rowIcon={rowIcon}
                                    error={aliasRequiredErrorText}
                                />
                            )}
                        </React.Fragment>
                    )}
                </AliasesContext.Provider>
            </Dialog.Body>
            <Dialog.Footer
                preset="default"
                showError={false}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={i18n('button_apply')}
                propsButtonCancel={{view: 'outlined'}}
                onClickButtonApply={handleApplyChanges}
                onClickButtonCancel={handleCancel}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_ALIASES, DialogAliases);
