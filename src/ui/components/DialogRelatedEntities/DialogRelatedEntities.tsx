import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Alert, Dialog, Loader, RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEmpty from 'lodash/isEmpty';
import {EDITOR_TYPE, EntryScope, Feature} from 'shared';
import type {GetEntryResponse, GetRelationsEntry} from 'shared/schema';
import {getSdk} from 'ui/libs/schematic-sdk';
import Utils from 'ui/utils';
import {groupEntitiesByScope} from 'ui/utils/helpers';

import {type EntryDialogProps, EntryDialogResolveStatus} from '../EntryDialogues';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';

import {EntitiesList} from './EntitiesList/EntitiesList';

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

    React.useEffect(() => {
        setIsLoading(true);
        setIsError(false);
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
    }, [entry, currentDirection]);

    const showDirectionControl =
        entry.scope !== EntryScope.Dash && entry.scope !== EntryScope.Connection;

    const handleDirectionParentdate = (value: Direction) => {
        setCurrentDirection(value);
    };

    const handleClose = () => {
        onClose({status: EntryDialogResolveStatus.Close});
    };

    const renderRelations = () => {
        if (isLoading) {
            return (
                <div className={b('loader')}>
                    <Loader />
                </div>
            );
        }

        if (
            isEmpty(relations) &&
            entry.scope === EntryScope.Widget &&
            Object.values(EDITOR_TYPE).includes(entry.type) &&
            currentDirection === Direction.Parent
        ) {
            return <Alert theme="warning" message={i18n('label_editor-hint')} />;
        }

        if (!relations || isEmpty(relations) || isError) {
            const name = isError ? 'error' : 'emptyDirectory';
            const title = isError ? i18n('label_request-error') : i18n('label_no-relatives');
            return (
                <div className={b('empty-state')}>
                    <PlaceholderIllustration direction="column" name={name} title={title} />
                </div>
            );
        }

        return Object.entries(relations).map(([key, value]) => (
            <EntitiesList scope={key} entities={value} key={key} />
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
                {showRelationsCount && (
                    <div
                        className={b('relations-count')}
                    >{`${i18n('label_entities-count')} ${relationsCount}`}</div>
                )}
            </Dialog.Body>
        </Dialog>
    );
};
