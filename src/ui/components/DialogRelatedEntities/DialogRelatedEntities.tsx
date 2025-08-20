import React from 'react';

import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {
    Button,
    Dialog,
    DropdownMenu,
    Icon,
    Loader,
    SegmentedRadioGroup as RadioButton,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEmpty from 'lodash/isEmpty';
import {EntryScope} from 'shared';
import type {GetEntryResponse, GetRelationsEntry} from 'shared/schema';
import {EntitiesList} from 'ui/components/EntitiesList/EntitiesList';
import {navigateHelper} from 'ui/libs';
import {getSdk} from 'ui/libs/schematic-sdk';
import {registry} from 'ui/registry';
import {copyTextWithToast} from 'ui/utils/copyText';
import {groupEntitiesByScope} from 'ui/utils/helpers';

import type {RightSectionProps} from '../EntitiesList/types';
import {
    CONTEXT_MENU_COPY_ID,
    CONTEXT_MENU_COPY_LINK,
    ENTRY_CONTEXT_MENU_ACTION,
} from '../EntryContextMenu';
import type {WrapperParams} from '../EntryContextMenu/helpers';
import {type EntryDialogProps, EntryDialogResolveStatus} from '../EntryDialogues';
import type {RowEntryData} from '../EntryRow/EntryRow';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';

import {Direction} from './constants';
import type {DirectionValue} from './constants';

import './DialogRelatedEntities.scss';

const i18n = I18n.keyset('component.dialog-related-entities.view');
const contextMenuI18n = I18n.keyset('component.entry-context-menu.view');

const b = block('dialog-related-entities');

type DialogRelatedEntitiesProps = EntryDialogProps & {
    entry: GetEntryResponse;
};

const CONCURRENT_ID = 'list-related-entities';

const MENU_DEFAULT_ACTIONS = [CONTEXT_MENU_COPY_LINK, CONTEXT_MENU_COPY_ID];

const isEntryWithEntryId = (entry: RowEntryData): entry is WrapperParams['entry'] =>
    Boolean(entry.entryId);

const RowActions = ({entry}: RightSectionProps) => {
    if (!isEntryWithEntryId(entry)) {
        return null;
    }

    const items: DropdownMenuItem<{}>[] = MENU_DEFAULT_ACTIONS.map(({text, id, icon}) => {
        let successText;
        let copyText;
        let toastName;
        if (id === ENTRY_CONTEXT_MENU_ACTION.COPY_LINK) {
            successText = contextMenuI18n('toast_copy-link-success');
            copyText = navigateHelper.redirectUrlSwitcher(entry);
            toastName = 'toast-menu-copy-link';
        } else {
            successText = contextMenuI18n('toast_copy-id-success');
            copyText = entry.entryId;
            toastName = 'toast-menu-copy-id';
        }

        const action = () => {
            copyTextWithToast({
                successText,
                errorText: contextMenuI18n('toast_copy-error'),
                toastName,
                copyText,
            });
        };

        return {iconStart: <Icon size={16} data={icon} />, text: contextMenuI18n(text), action};
    });

    return <DropdownMenu switcherWrapperClassName={b('entry-menu')} items={items} />;
};

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

    const fetchRelatedEntries = () => {
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
            .then(async (response) => {
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
    };

    React.useEffect(fetchRelatedEntries, [entry, currentDirection]);

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
            const alert = renderDialogRelatedEntitiesAlertHint?.({
                direction: currentDirection,
                entryType: entry.type,
                entryScope: entry.scope,
            });

            if (alert) {
                return alert;
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
            <EntitiesList
                enableHover={true}
                scope={key}
                entities={value}
                key={key}
                rightSectionSlot={RowActions}
                rowClassName={b('entity-row')}
            />
        ));
    };

    const showRelationsCount = Boolean(relationsCount && !isLoading);

    return (
        <Dialog onClose={handleClose} open={visible} className={b()} disableHeightTransition={true}>
            <Dialog.Header caption={i18n('label_title')} />
            <Dialog.Body className={b('body')}>
                <EntitiesList
                    isCurrent={true}
                    enableHover={true}
                    entities={[entry]}
                    rightSectionSlot={RowActions}
                    className={b('current-row')}
                    rowClassName={b('entity-row')}
                />
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
            {isError && (
                <Dialog.Footer className={b('footer')}>
                    <Button
                        className={b('button-retry')}
                        size="l"
                        view="action"
                        onClick={fetchRelatedEntries}
                    >
                        {i18n('label_button-retry')}
                    </Button>
                </Dialog.Footer>
            )}
        </Dialog>
    );
};
