import React, { useEffect } from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Alert, Button, Dialog, Loader, RadioButton, Card} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEmpty from 'lodash/isEmpty';
import {EDITOR_TYPE, EntryScope, Feature} from 'shared';
import type {GetEntryResponse, GetRelationsEntry} from 'shared/schema';
import {EntitiesList} from 'ui/components/EntitiesList/EntitiesList';
import {getSdk} from 'ui/libs/schematic-sdk';
import Utils from 'ui/utils';
import {groupEntitiesByScope} from 'ui/utils/helpers';

import {type EntryDialogProps, EntryDialogResolveStatus} from '../EntryDialogues';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';

import './DialogRelatedEntities.scss';

const i18n = I18n.keyset('component.dialog-related-entities.view');

const b = block('dialog-related-entities');

type DialogRelatedEntitiesProps = EntryDialogProps & {
    entry: GetEntryResponse;
};

enum Direction {
    Parent = 'parent',
    Child = 'child',
}

const CONCURRENT_ID = 'list-related-entities';

export const DialogRelatedEntities = ({onClose, visible, entry}: DialogRelatedEntitiesProps) => {
    const [currentDirection, setCurrentDirection] = React.useState<Direction>(
        entry.scope === EntryScope.Dash ? Direction.Parent : Direction.Child,
    );
    const [isLoading, setIsLoading] = React.useState(true);
    const [isError, setIsError] = React.useState(false);
    const [relations, setRelations] = React.useState<Record<string, GetRelationsEntry[]> | null>(
        null,
    );
    const [relationsCount, setRelationsCount] = React.useState<null | number>(null);
    const [updatedEntities, setUpdatedEntities] = React.useState<Record<string, boolean>>({});
    const [accesses, setAccesses] = React.useState<any>([]);

    let selectedRelationCount = 0;
    for (const updatedEntry in updatedEntities) {
        if (updatedEntities[updatedEntry]) {
            selectedRelationCount++;
        }
    }

    useEffect(()=>{
        const _updatedEntities: Record<string, boolean> = {};
        for (const key in relations) {
            for (const relation in relations[key]) {
                if (updatedEntities[relations[key][relation].entryId] === undefined) {
                    _updatedEntities[relations[key][relation].entryId] = false;
                }
            }
        }
        setUpdatedEntities({...updatedEntities, ..._updatedEntities});
    }, [relations]);

    const loadAccesses = async () => {
        const data = await Utils.getAccesses({id: entry.entryId});
        setAccesses(data);
    }

    const loadRelations = () => {
        setIsLoading(true);
        setIsError(false);
        loadAccesses().finally(()=>{
            getSdk().cancelRequest(CONCURRENT_ID);
            getSdk()
                .mix.getEntryRelations(
                    {
                        entryId: entry.entryId,
                        workbookId: entry.workbookId,
                        direction: currentDirection,
                    },
                    {concurrentId: CONCURRENT_ID},
                )
                .then((response) => {
                    setRelationsCount(response.length);
                    setRelations(groupEntitiesByScope(response));
                    setIsLoading(false);
                })
                .catch((error) => {
                    if (error.isCancelled) {
                        return;
                    }
                    setIsError(true);
                    setIsLoading(false);
                });
        });
    }

    React.useEffect(() => {
        loadRelations();
    }, [entry, currentDirection]);

    const showDirectionControl =
        entry.scope !== EntryScope.Dash && entry.scope !== EntryScope.Connection;

    const handleDirectionParentdate = (value: Direction) => {
        setCurrentDirection(value);
    };

    const handleRefresh = () => {
        setUpdatedEntities({});
        loadRelations();
    };

    const handleClose = () => {
        onClose({status: EntryDialogResolveStatus.Close});
    };
    
    const handleApply = () => {
        const fullAccesses = [...accesses];
        setIsLoading(true);
        Utils.getRoles({}).then((roles)=>{
            for (const role in roles) {
                const roleItem = roles[role];
                if (fullAccesses.findIndex(item=>roleItem.role_id == item.role_id) < 0) {
                    fullAccesses.push({
                        role_id: roleItem.role_id, 
                        add: false,
                        delete: false,
                        select: false,
                        update: false,
                    });
                }
            }
            const arr = [];
            for (const entityKey in updatedEntities) {
                for (const accessKey in fullAccesses) {
                    const accessItem = fullAccesses[accessKey];
                    if (updatedEntities[entityKey]) {
                        arr.push({ id: entityKey, ...accessItem });
                    }
                }
            }
            Utils.setAccesses([arr.map(item=>({...item, destroy: true}))]).then(()=>{
                setIsLoading(false);
                onClose({status: EntryDialogResolveStatus.Close});
            }).catch(()=>{
                setIsLoading(false);
                console.error('Error updating accesses of entities', updatedEntities, fullAccesses);
            });
        }).catch(()=>{
            setIsLoading(false);
            console.error('Error loading roles');
        });
    };

    const renderRelations = () => {
        if (isLoading) {
            return (
                <div className={b('loader')}>
                    <Loader />
                </div>
            );
        }

        if (isError) {
            return (
                <div className={b('error-state')}>
                    <PlaceholderIllustration
                        direction="column"
                        name="error"
                        title={i18n('label_request-error')}
                    />
                </div>
            );
        }

        if (isEmpty(relations)) {
            if (
                entry.scope === EntryScope.Widget &&
                Object.values(EDITOR_TYPE).includes(entry.type) &&
                currentDirection === Direction.Parent
            ) {
                return <Alert theme="warning" message={i18n('label_editor-hint')} />;
            }

            return (
                <div className={b('empty-state')}>
                    <PlaceholderIllustration
                        direction="column"
                        name="emptyDirectory"
                        title={i18n('label_no-relatives')}
                    />
                </div>
            );
        }

        return Object.entries(relations || []).map(([key, value]) => (
            <EntitiesList scope={key} entities={value} key={key} updatedEntities={updatedEntities} setUpdatedEntities={setUpdatedEntities} />
        ));
    };

    const showRelationsCount = Boolean(relationsCount && !isLoading);
    const showDatasetHint =
        Utils.isEnabledFeature(Feature.EnableChartEditor) &&
        entry.scope === EntryScope.Dataset &&
        currentDirection === Direction.Child;

    return (
        <Dialog onClose={handleClose} open={visible} className={b()}>
            <Dialog.Header caption={i18n('label_title')} />
            <Dialog.Body className={b('body')}>
                <EntitiesList isCurrent={true} entities={[entry]} />
                {showDirectionControl && (
                    <div className={b('direction-row')}>
                        <RadioButton
                            value={currentDirection}
                            onUpdate={handleDirectionParentdate}
                            width="auto"
                        >
                            <RadioButton.Option value={Direction.Child}>
                                {i18n('value_where-contained')}
                            </RadioButton.Option>
                            <RadioButton.Option value={Direction.Parent}>
                                {i18n('value_includes')}
                            </RadioButton.Option>
                        </RadioButton>
                        {showDatasetHint && <HelpPopover content={i18n('label_dataset-hint')} />}
                    </div>
                )}
                <div className={b('list')}>{renderRelations()}</div>
                {showRelationsCount && (<div>
                    <div
                        className={b('relations-count')}
                        >{`${i18n('label_entities-count')} ${relationsCount}`}</div>
                    <div
                        className={b('relations-count')}
                        >{`${i18n('label_selected-entities-count')} ${selectedRelationCount}`}</div>
                    </div>
                )}

                <Card className={b('warning-card')} theme="warning" size="l">{i18n('selected-entities-assign-description')}</Card>
            </Dialog.Body>
            <Dialog.Footer>
                <Button
                    size="l"
                    view="outlined"
                    className={b('refresh-button')}
                    disabled={isLoading}
                    onClick={handleRefresh}
                >
                    {i18n('refresh')}
                </Button>
                <Button
                    size="l"
                    view="outlined"
                    className={b('apply-button')}
                    disabled={isLoading}
                    onClick={handleClose}
                >
                    {i18n('cancel')}
                </Button>
                <Button
                    size="l"
                    view="action"
                    disabled={isLoading}
                    onClick={handleApply}
                >
                    {i18n('apply')}
                </Button>
            </Dialog.Footer>
                
        </Dialog>
    );
};
