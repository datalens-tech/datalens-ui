import React from 'react';

import {Dialog, Loader, RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEmpty from 'lodash/isEmpty';
import {EntryScope} from 'shared';
import type {GetEntryResponse, GetRelationsEntry} from 'shared/schema';
import {getSdk} from 'ui/libs/schematic-sdk';
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

export const DialogRelatedEntities = ({onClose, visible, entry}: DialogRelatedEntitiesProps) => {
    const [currentDirection, setCurrentDirection] = React.useState<Direction>(
        entry.scope === EntryScope.Dash ? Direction.Parent : Direction.Child,
    );
    const [isLoading, setIsLoading] = React.useState(true);
    const [isError, setIsError] = React.useState(false);
    const [relations, setRelations] = React.useState<Record<string, GetRelationsEntry[]> | null>(
        null,
    );

    React.useEffect(() => {
        setIsLoading(true);
        setIsError(false);
        getSdk()
            .mix.getEntryRelations({
                entryId: entry.entryId,
                workbookId: entry.workbookId,
                direction: currentDirection,
            })
            .then((response) => {
                setRelations(groupEntitiesByScope(response));
            })
            .catch(() => {
                setIsError(true);
            })
            .finally(() => {
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

    return (
        <Dialog onClose={handleClose} open={visible} className={b()}>
            <Dialog.Header caption={i18n('label_title')} />
            <Dialog.Body className={b('body')}>
                <EntitiesList isCurrent={true} entities={[entry]} />
                {showDirectionControl && (
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
                )}
                {renderRelations()}
            </Dialog.Body>
        </Dialog>
    );
};
