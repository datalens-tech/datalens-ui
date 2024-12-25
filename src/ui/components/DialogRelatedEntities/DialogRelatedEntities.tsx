import React from 'react';

import type {CancellablePromise} from '@gravity-ui/sdk';
import {Alert, Button, Dialog, Loader, RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import _ from 'lodash';
import {EDITOR_TYPE, EntryScope} from 'shared';
import type {
    GetEntryResponse,
    GetRelationsEntry,
    GetRelationsResponsePagination,
} from 'shared/schema';
import {EntitiesList} from 'ui/components/EntitiesList/EntitiesList';
import {getSdk} from 'ui/libs/schematic-sdk';
import {registry} from 'ui/registry';

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

const CHILD_SCOPES = [EntryScope.Widget, EntryScope.Dataset, EntryScope.Connection];

const DEFAULT_RELATIONS_PAGE_SIZE = 10;

const getInitialScopeOrder = (topScopes: EntryScope[]) => {
    const scopeOrder = topScopes.reduce(
        (acc, scope) => {
            acc[scope] = [];
            return acc;
        },
        {} as Record<EntryScope, []>,
    );

    CHILD_SCOPES.forEach((scope) => {
        scopeOrder[scope] = [];
    });

    return scopeOrder;
};

export const DialogRelatedEntities = ({onClose, visible, entry}: DialogRelatedEntitiesProps) => {
    const {getTopLevelEntryScopes} = registry.common.functions.getAll();

    const topLevelEntryScopes = getTopLevelEntryScopes();

    const [currentDirection, setCurrentDirection] = React.useState<DirectionValue>(
        topLevelEntryScopes.includes(entry.scope as EntryScope)
            ? Direction.PARENT
            : Direction.CHILD,
    );

    const actualScopes = React.useMemo(() => {
        const topLevelScopes = getTopLevelEntryScopes();

        const allScopes = topLevelScopes.concat(CHILD_SCOPES);
        const entryIndex = allScopes.indexOf(entry.scope as EntryScope);

        return currentDirection === Direction.PARENT
            ? allScopes.slice(entryIndex + 1)
            : allScopes.slice(0, entryIndex);
    }, [currentDirection, entry.scope, getTopLevelEntryScopes]);

    const initialRelations = React.useMemo(() => {
        const topLevelScopes = getTopLevelEntryScopes();

        return getInitialScopeOrder(topLevelScopes);
    }, [getTopLevelEntryScopes]);

    const [isLoading, setIsLoading] = React.useState(true);
    const [relations, setRelations] =
        React.useState<Record<string, GetRelationsEntry[]>>(initialRelations);
    const [relationsCount, setRelationsCount] = React.useState<number>(0);
    const [nextPageTokens, setNextPageTokens] = React.useState<Record<string, string | undefined>>(
        {},
    );
    const [errors, setErrors] = React.useState<string[]>([]);

    const {DialogRelatedEntitiesRadioHint} = registry.common.components.getAll();

    const loadAllScopes = React.useCallback(() => {
        setIsLoading(true);
        setRelationsCount(0);
        setRelations(initialRelations);
        setErrors([]);

        const promises: CancellablePromise<void>[] = [];

        actualScopes.forEach((scope) => {
            promises.push(
                getSdk()
                    .us.getRelations(
                        {
                            entryId: entry.entryId,
                            direction: currentDirection,
                            scope,
                            page: 0,
                            pageSize: DEFAULT_RELATIONS_PAGE_SIZE,
                        },
                        {concurrentId: `${CONCURRENT_ID}-${scope}`},
                    )
                    .then((response) => {
                        // TODO: fix type after improvements
                        const tempResponce =
                            response as unknown as GetRelationsResponsePagination<GetRelationsEntry>;
                        if (tempResponce.relations.length) {
                            setRelationsCount(
                                (currentCount) =>
                                    (currentCount || 0) + tempResponce.relations.length,
                            );
                            setRelations((currentRelations) => ({
                                ...currentRelations,
                                [scope]: tempResponce.relations,
                            }));
                            setNextPageTokens((currentNextPageTokens) => ({
                                ...currentNextPageTokens,
                                [scope]: tempResponce.nextPageToken,
                            }));
                        }
                    })
                    .catch((error) => {
                        if (error.isCancelled) {
                            return;
                        }
                        setErrors((currentErrors) => [...currentErrors, scope]);
                    }),
            );
        });

        Promise.all(promises).then(() => {
            setIsLoading(false);
        });
    }, [actualScopes, currentDirection, entry.entryId, initialRelations]);

    // initial request for all scopes of entries
    React.useEffect(() => {
        loadAllScopes();

        return () => {
            actualScopes.forEach((scope) => {
                getSdk().cancelRequest(`${CONCURRENT_ID}-${scope}`);
            });
        };
    }, [actualScopes, loadAllScopes]);

    const showDirectionControl =
        !topLevelEntryScopes.includes(entry.scope as EntryScope) &&
        entry.scope !== EntryScope.Connection;

    const handleDirectionChange = (value: DirectionValue) => {
        setCurrentDirection(value);
    };

    const handleClose = () => {
        onClose({status: EntryDialogResolveStatus.Close});
    };

    const handleLoadMoreClick = React.useCallback(
        (scope?: string) => {
            if (scope) {
                return getSdk()
                    .us.getRelations(
                        {
                            entryId: entry.entryId,
                            direction: currentDirection,
                            scope: scope as EntryScope,
                            page: Number(nextPageTokens[scope]) || 0,
                            pageSize: DEFAULT_RELATIONS_PAGE_SIZE,
                        },
                        {concurrentId: `${CONCURRENT_ID}-${scope}`},
                    )
                    .then((response) => {
                        // TODO: fix type after improvements
                        const tempResponce =
                            response as unknown as GetRelationsResponsePagination<GetRelationsEntry>;
                        if (tempResponce.relations.length) {
                            setRelationsCount(
                                (currentCount) => currentCount + tempResponce.relations.length,
                            );
                            setRelations((currentRelations) => ({
                                ...currentRelations,
                                [scope]: currentRelations[scope].concat(tempResponce.relations),
                            }));
                        }
                        if (errors.includes(scope)) {
                            setErrors((currentErrors) =>
                                currentErrors.filter((error) => error !== scope),
                            );
                        }
                        setNextPageTokens((currentNextPageTokens) => ({
                            ...currentNextPageTokens,
                            [scope]: tempResponce.nextPageToken,
                        }));
                    })
                    .catch((error) => {
                        if (error.isCancelled) {
                            return;
                        }
                        setErrors((currentErrors) => [...currentErrors, scope]);
                    });
            }

            return null;
        },
        [currentDirection, entry.entryId, errors, nextPageTokens],
    );

    const renderRetryAction = () => {
        return (
            <Button className={b('button-retry')} size="l" view="action" onClick={loadAllScopes}>
                {i18n('button_retry')}
            </Button>
        );
    };

    const renderRelations = () => {
        if (isLoading) {
            return (
                <div className={b('loader')}>
                    <Loader />
                </div>
            );
        }

        if (errors.length === actualScopes.length) {
            return (
                <div className={b('error-state')}>
                    <PlaceholderIllustration
                        direction="column"
                        name="error"
                        title={i18n('label_request-error')}
                        renderAction={renderRetryAction}
                    />
                </div>
            );
        }

        if (relationsCount === 0) {
            if (
                entry.scope === EntryScope.Widget &&
                Object.values(EDITOR_TYPE).includes(entry.type) &&
                currentDirection === Direction.PARENT
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

        return Object.entries(relations)
            .filter(([scope, entries]) => entries.length || errors.includes(scope))
            .map(([scope, entries]) => {
                const hasError = errors.includes(scope);
                const showLoadButton = Boolean(nextPageTokens[scope]) || hasError;

                return (
                    <EntitiesList
                        scope={scope}
                        entities={entries}
                        key={scope}
                        showLoadButton={showLoadButton}
                        onLoadClick={handleLoadMoreClick}
                        error={hasError}
                    />
                );
            });
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
                            onUpdate={handleDirectionChange}
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
