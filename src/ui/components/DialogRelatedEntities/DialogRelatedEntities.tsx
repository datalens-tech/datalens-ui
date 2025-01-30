import React from 'react';

import {Dialog, Loader, RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEmpty from 'lodash/isEmpty';
import {EntryScope} from 'shared';
import type {GetEntryResponse, GetRelationsEntry} from 'shared/schema';
import {EntitiesList} from 'ui/components/EntitiesList/EntitiesList';
import {getSdk} from 'ui/libs/schematic-sdk';
import {registry} from 'ui/registry';
import {groupEntitiesByScope} from 'ui/utils/helpers';

import {type EntryDialogProps, EntryDialogResolveStatus} from '../EntryDialogues';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';

import {Direction} from './constants';
import type {DirectionValue} from './constants';

import './DialogRelatedEntities.scss';

const i18n = I18n.keyset('component.dialog-related-entities.view');

const b = block('dialog-related-entities');

type DialogRelatedEntitiesProps = EntryDialogProps & {
    entry: GetEntryResponse;
};

const CONCURRENT_ID = 'list-related-entities';

export const DialogRelatedEntities = ({onClose, visible, entry}: DialogRelatedEntitiesProps) => {
    const {getTopLevelEntryScopes} = registry.common.functions.getAll();

    const topLevelEntryScopes = getTopLevelEntryScopes();

    const [currentDirection, setCurrentDirection] = React.useState<DirectionValue>(
        topLevelEntryScopes.includes(entry.scope as EntryScope)
            ? Direction.PARENT
            : Direction.CHILD,
    );
    const [isLoading, setIsLoading] = React.useState(true);
    const [isError, setIsError] = React.useState(false);
    const [relations, setRelations] = React.useState<Record<string, GetRelationsEntry[]> | null>(
        null,
    );
    const [relationsCount, setRelationsCount] = React.useState<null | number>(null);
    const {DialogRelatedEntitiesRadioHint} = registry.common.components.getAll();
    const {renderDialogRelatedEntitiesAlertHint} = registry.common.functions.getAll();

    React.useEffect(() => {
        setIsLoading(true);
        setIsError(false);
        getSdk().cancelRequest(CONCURRENT_ID);
        getSdk()
            .sdk.mix.getEntryRelations(
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
        !topLevelEntryScopes.includes(entry.scope as EntryScope) &&
        entry.scope !== EntryScope.Connection;

    const handleDirectionParentdate = (value: DirectionValue) => {
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
            if (renderDialogRelatedEntitiesAlertHint) {
                return renderDialogRelatedEntitiesAlertHint({
                    direction: currentDirection,
                    entryType: entry.type,
                    entryScope: entry.scope,
                });
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
            <EntitiesList scope={key} entities={value} key={key} />
        ));
    };

    const showRelationsCount = Boolean(relationsCount && !isLoading);

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
                            <RadioButton.Option value={Direction.CHILD}>
                                {i18n('value_where-contained')}
                            </RadioButton.Option>
                            <RadioButton.Option value={Direction.PARENT}>
                                {i18n('value_includes')}
                            </RadioButton.Option>
                        </RadioButton>
                        <DialogRelatedEntitiesRadioHint
                            entryScope={entry.scope}
                            direction={currentDirection}
                        />
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
